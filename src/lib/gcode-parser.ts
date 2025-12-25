export interface GCodeCommand {
  line: number;
  raw: string;
  type: 'rapid' | 'linear' | 'arc-cw' | 'arc-ccw' | 'other';
  g?: number;
  x?: number;
  y?: number;
  z?: number;
  f?: number;
  i?: number;
  j?: number;
  k?: number;
  comment?: string;
}

export interface ToolpathPoint {
  position: [number, number, number];
  type: 'rapid' | 'cutting';
  lineIndex: number;
}

export interface ParsedGCode {
  commands: GCodeCommand[];
  toolpath: ToolpathPoint[];
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
  };
}

function parseValue(str: string, prefix: string): number | undefined {
  const regex = new RegExp(`${prefix}([\\-\\d.]+)`, 'i');
  const match = str.match(regex);
  return match ? parseFloat(match[1]) : undefined;
}

export function parseGCode(gcode: string): ParsedGCode {
  const lines = gcode.split('\n');
  const commands: GCodeCommand[] = [];
  const toolpath: ToolpathPoint[] = [];
  
  let currentX = 0;
  let currentY = 0;
  let currentZ = 0;
  let currentMode: 'rapid' | 'linear' | 'arc-cw' | 'arc-ccw' = 'rapid';
  
  const bounds = {
    min: [Infinity, Infinity, Infinity] as [number, number, number],
    max: [-Infinity, -Infinity, -Infinity] as [number, number, number],
  };

  // Add initial position
  toolpath.push({
    position: [0, 0, 0],
    type: 'rapid',
    lineIndex: 0,
  });

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Extract comment
    const commentMatch = trimmed.match(/\(([^)]*)\)|;(.*)$/);
    const comment = commentMatch ? (commentMatch[1] || commentMatch[2]) : undefined;
    
    // Remove comments for parsing
    const codePart = trimmed.replace(/\([^)]*\)/g, '').replace(/;.*$/, '').trim();
    if (!codePart) {
      commands.push({
        line: index,
        raw: trimmed,
        type: 'other',
        comment,
      });
      return;
    }

    // Parse G command
    const gMatch = codePart.match(/G(\d+)/i);
    const g = gMatch ? parseInt(gMatch[1]) : undefined;

    // Update mode based on G command
    if (g === 0) currentMode = 'rapid';
    else if (g === 1) currentMode = 'linear';
    else if (g === 2) currentMode = 'arc-cw';
    else if (g === 3) currentMode = 'arc-ccw';

    // Parse coordinates
    const x = parseValue(codePart, 'X');
    const y = parseValue(codePart, 'Y');
    const z = parseValue(codePart, 'Z');
    const f = parseValue(codePart, 'F');
    const i = parseValue(codePart, 'I');
    const j = parseValue(codePart, 'J');
    const k = parseValue(codePart, 'K');

    // Determine command type
    let type: GCodeCommand['type'] = 'other';
    if (g === 0) type = 'rapid';
    else if (g === 1) type = 'linear';
    else if (g === 2) type = 'arc-cw';
    else if (g === 3) type = 'arc-ccw';
    else if (x !== undefined || y !== undefined || z !== undefined) {
      type = currentMode;
    }

    commands.push({
      line: index,
      raw: trimmed,
      type,
      g,
      x,
      y,
      z,
      f,
      i,
      j,
      k,
      comment,
    });

    // Update position and add to toolpath if movement
    if (x !== undefined || y !== undefined || z !== undefined) {
      if (x !== undefined) currentX = x;
      if (y !== undefined) currentY = y;
      if (z !== undefined) currentZ = z;

      // For arc commands, generate intermediate points
      if ((type === 'arc-cw' || type === 'arc-ccw') && (i !== undefined || j !== undefined)) {
        const arcPoints = generateArcPoints(
          toolpath[toolpath.length - 1].position,
          [currentX, currentY, currentZ],
          i || 0,
          j || 0,
          type === 'arc-cw',
          index
        );
        toolpath.push(...arcPoints);
      } else {
        toolpath.push({
          position: [currentX, currentY, currentZ],
          type: type === 'rapid' ? 'rapid' : 'cutting',
          lineIndex: index,
        });
      }

      // Update bounds
      bounds.min[0] = Math.min(bounds.min[0], currentX);
      bounds.min[1] = Math.min(bounds.min[1], currentY);
      bounds.min[2] = Math.min(bounds.min[2], currentZ);
      bounds.max[0] = Math.max(bounds.max[0], currentX);
      bounds.max[1] = Math.max(bounds.max[1], currentY);
      bounds.max[2] = Math.max(bounds.max[2], currentZ);
    }
  });

  // Handle case where no movement was found
  if (bounds.min[0] === Infinity) {
    bounds.min = [0, 0, 0];
    bounds.max = [1, 1, 1];
  }

  return { commands, toolpath, bounds };
}

function generateArcPoints(
  start: [number, number, number],
  end: [number, number, number],
  i: number,
  j: number,
  clockwise: boolean,
  lineIndex: number
): ToolpathPoint[] {
  const points: ToolpathPoint[] = [];
  const centerX = start[0] + i;
  const centerY = start[1] + j;
  
  const startAngle = Math.atan2(start[1] - centerY, start[0] - centerX);
  let endAngle = Math.atan2(end[1] - centerY, end[0] - centerX);
  
  const radius = Math.sqrt(i * i + j * j);
  
  // Adjust angles for direction
  if (clockwise) {
    if (endAngle >= startAngle) endAngle -= 2 * Math.PI;
  } else {
    if (endAngle <= startAngle) endAngle += 2 * Math.PI;
  }
  
  const angleSpan = Math.abs(endAngle - startAngle);
  const segments = Math.max(8, Math.ceil(angleSpan / (Math.PI / 16)));
  
  for (let s = 1; s <= segments; s++) {
    const t = s / segments;
    const angle = startAngle + (endAngle - startAngle) * t;
    const z = start[2] + (end[2] - start[2]) * t;
    
    points.push({
      position: [
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle),
        z,
      ],
      type: 'cutting',
      lineIndex,
    });
  }
  
  return points;
}

export const SAMPLE_GCODE = `; Sample CNC Program - Square Pocket
; Units: mm
G21 ; Set to millimeters
G90 ; Absolute positioning
G17 ; XY plane selection

; Initialize
G0 Z5.0 ; Rapid to safe height
G0 X0 Y0 ; Rapid to origin

; Start cutting
M3 S12000 ; Spindle on
G0 X10 Y10 ; Move to start position
G1 Z-2.0 F100 ; Plunge

; Cut square pocket - Layer 1
G1 X50 Y10 F500
G1 X50 Y50
G1 X10 Y50
G1 X10 Y10

; Inner pass
G1 X20 Y20
G1 X40 Y20
G1 X40 Y40
G1 X20 Y40
G1 X20 Y20

; Circular pocket
G0 Z2.0
G0 X70 Y30
G1 Z-2.0 F100
G2 X70 Y30 I10 J0 F400

; Retract
G0 Z5.0
G0 X0 Y0

M5 ; Spindle off
M30 ; Program end
`;
