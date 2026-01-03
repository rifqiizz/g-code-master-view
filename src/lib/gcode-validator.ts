export interface ValidationIssue {
  line: number;
  type: 'error' | 'warning';
  message: string;
  code: string;
}

export interface ValidationResult {
  issues: ValidationIssue[];
  errorCount: number;
  warningCount: number;
}

const SUPPORTED_GCODES = ['G0', 'G00', 'G1', 'G01', 'G2', 'G02', 'G3', 'G03', 'G17', 'G20', 'G21', 'G90', 'G91'];
const SUPPORTED_MCODES = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M8', 'M9', 'M30'];

export function validateGCode(gcodeText: string): ValidationResult {
  const lines = gcodeText.split('\n');
  const issues: ValidationIssue[] = [];
  
  let currentFeedRate: number | null = null;
  let lastZ: number | null = null;
  let inCuttingMode = false;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('(') || line.startsWith(';') || line.startsWith('%')) {
      continue;
    }

    // Remove inline comments
    const code = line.replace(/\([^)]*\)/g, '').replace(/;.*$/, '').trim();
    if (!code) continue;

    // Check for unsupported G-codes
    const gcodeMatches = code.match(/G\d+/gi) || [];
    for (const gcode of gcodeMatches) {
      const upperGcode = gcode.toUpperCase();
      if (!SUPPORTED_GCODES.includes(upperGcode)) {
        issues.push({
          line: lineNum,
          type: 'warning',
          message: `Unsupported G-code: ${upperGcode}`,
          code: upperGcode
        });
      }
      
      // Track cutting mode
      if (['G1', 'G01', 'G2', 'G02', 'G3', 'G03'].includes(upperGcode)) {
        inCuttingMode = true;
      } else if (['G0', 'G00'].includes(upperGcode)) {
        inCuttingMode = false;
      }
    }

    // Check for unsupported M-codes
    const mcodeMatches = code.match(/M\d+/gi) || [];
    for (const mcode of mcodeMatches) {
      const upperMcode = mcode.toUpperCase();
      if (!SUPPORTED_MCODES.includes(upperMcode)) {
        issues.push({
          line: lineNum,
          type: 'warning',
          message: `Unsupported M-code: ${upperMcode}`,
          code: upperMcode
        });
      }
    }

    // Extract feed rate
    const feedMatch = code.match(/F([\d.]+)/i);
    if (feedMatch) {
      currentFeedRate = parseFloat(feedMatch[1]);
    }

    // Check for missing feed rate on cutting moves
    if (inCuttingMode && currentFeedRate === null) {
      const hasMovement = /[XYZ][\-\d.]+/i.test(code);
      if (hasMovement) {
        issues.push({
          line: lineNum,
          type: 'warning',
          message: 'Cutting move without feed rate specified',
          code: 'MISSING_FEED'
        });
      }
    }

    // Check for rapid plunge (G0 with -Z movement)
    const isRapid = /G0?0?\s/i.test(code) || (!gcodeMatches.length && !inCuttingMode);
    const zMatch = code.match(/Z([\-\d.]+)/i);
    if (zMatch) {
      const newZ = parseFloat(zMatch[1]);
      if (isRapid && lastZ !== null && newZ < lastZ && newZ < 0) {
        issues.push({
          line: lineNum,
          type: 'warning',
          message: `Rapid plunge detected: Z${newZ} (consider using G1)`,
          code: 'RAPID_PLUNGE'
        });
      }
      lastZ = newZ;
    }

    // Check for syntax errors (malformed commands)
    const hasValidCommand = /^[GMXYZIJKFSPRT%\d\s.\-]+$/i.test(code);
    if (!hasValidCommand) {
      issues.push({
        line: lineNum,
        type: 'error',
        message: 'Malformed command syntax',
        code: 'SYNTAX_ERROR'
      });
    }
  }

  return {
    issues,
    errorCount: issues.filter(i => i.type === 'error').length,
    warningCount: issues.filter(i => i.type === 'warning').length
  };
}
