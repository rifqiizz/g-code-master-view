import { useMemo } from 'react';
import { Vector3, BufferGeometry, Float32BufferAttribute, Color } from 'three';
import { ToolpathPoint } from '@/lib/gcode-parser';
import { useGCodeStore } from '@/store/gcode-store';

interface ToolPathProps {
  toolpath: ToolpathPoint[];
  currentIndex: number;
  scale: number;
  showRapidMoves?: boolean;
}

// Get color based on Z depth (normalized 0-1)
const getDepthColor = (normalizedZ: number): Color => {
  // Color gradient: cyan (top) -> green -> yellow -> orange -> red (deep)
  const colors = [
    new Color('#4dd0e1'), // 0.0 - cyan (top)
    new Color('#26a69a'), // 0.25 - teal
    new Color('#ffeb3b'), // 0.5 - yellow
    new Color('#ff9800'), // 0.75 - orange
    new Color('#f44336'), // 1.0 - red (deep)
  ];
  
  const t = Math.max(0, Math.min(1, normalizedZ));
  const idx = t * (colors.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.min(lower + 1, colors.length - 1);
  const frac = idx - lower;
  
  return colors[lower].clone().lerp(colors[upper], frac);
};

const ToolPath = ({ toolpath, currentIndex, scale, showRapidMoves = true }: ToolPathProps) => {
  const { depthColorEnabled, depthFilter } = useGCodeStore();
  
  // Calculate Z bounds for normalization
  const zBounds = useMemo(() => {
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const point of toolpath) {
      minZ = Math.min(minZ, point.position[2]);
      maxZ = Math.max(maxZ, point.position[2]);
    }
    return { min: minZ, max: maxZ, range: maxZ - minZ };
  }, [toolpath]);

  const { 
    rapidGeometry, 
    cuttingGeometry, 
    completedGeometry, 
    rapidDashedGeometry,
    depthColoredGeometry,
    depthColors
  } = useMemo(() => {
    const rapidPoints: Vector3[] = [];
    const cuttingPoints: Vector3[] = [];
    const completedPoints: Vector3[] = [];
    const depthColoredPoints: Vector3[] = [];
    const colorArray: number[] = [];
    
    for (let i = 1; i < toolpath.length; i++) {
      const prev = toolpath[i - 1];
      const curr = toolpath[i];
      
      // Apply depth filter
      const avgZ = (prev.position[2] + curr.position[2]) / 2;
      if (avgZ < depthFilter.min || avgZ > depthFilter.max) {
        continue;
      }
      
      const start = new Vector3(
        prev.position[0] * scale,
        prev.position[2] * scale,
        prev.position[1] * scale
      );
      const end = new Vector3(
        curr.position[0] * scale,
        curr.position[2] * scale,
        curr.position[1] * scale
      );
      
      if (i <= currentIndex) {
        completedPoints.push(start, end);
      } else if (curr.type === 'rapid') {
        rapidPoints.push(start, end);
      } else {
        cuttingPoints.push(start, end);
        
        // Add depth-colored points for cutting moves
        if (depthColorEnabled && zBounds.range > 0) {
          depthColoredPoints.push(start, end);
          // Normalize Z (invert so deeper = higher value)
          const normalizedZ = 1 - (avgZ - zBounds.min) / zBounds.range;
          const color = getDepthColor(normalizedZ);
          // Push color for both start and end
          colorArray.push(color.r, color.g, color.b);
          colorArray.push(color.r, color.g, color.b);
        }
      }
    }
    
    const rapidGeo = new BufferGeometry().setFromPoints(rapidPoints);
    const cuttingGeo = new BufferGeometry().setFromPoints(cuttingPoints);
    const completedGeo = new BufferGeometry().setFromPoints(completedPoints);
    const rapidDashedGeo = createDashedGeometry(rapidPoints, 0.03, 0.02);
    
    // Depth-colored geometry
    const depthGeo = new BufferGeometry().setFromPoints(depthColoredPoints);
    if (colorArray.length > 0) {
      depthGeo.setAttribute('color', new Float32BufferAttribute(colorArray, 3));
    }
    
    return {
      rapidGeometry: rapidGeo,
      cuttingGeometry: cuttingGeo,
      completedGeometry: completedGeo,
      rapidDashedGeometry: rapidDashedGeo,
      depthColoredGeometry: depthGeo,
      depthColors: colorArray,
    };
  }, [toolpath, currentIndex, scale, depthColorEnabled, depthFilter, zBounds]);

  return (
    <group>
      {/* Completed path - highlighted */}
      <lineSegments geometry={completedGeometry}>
        <lineBasicMaterial color="#4dd0e1" linewidth={1} />
      </lineSegments>
      
      {/* Remaining cutting moves - either depth-colored or solid */}
      {depthColorEnabled && depthColors.length > 0 ? (
        <lineSegments geometry={depthColoredGeometry}>
          <lineBasicMaterial vertexColors linewidth={1} />
        </lineSegments>
      ) : (
        <lineSegments geometry={cuttingGeometry}>
          <lineBasicMaterial color="#1a5a63" linewidth={1} />
        </lineSegments>
      )}
      
      {/* Remaining rapid moves - dashed effect via separate segments */}
      {showRapidMoves && (
        <lineSegments geometry={rapidDashedGeometry}>
          <lineBasicMaterial color="#5a5a6a" linewidth={1} transparent opacity={0.6} />
        </lineSegments>
      )}
    </group>
  );
};

// Create a dashed line geometry by breaking segments into dash/gap pairs
function createDashedGeometry(
  points: Vector3[], 
  dashLength: number, 
  gapLength: number
): BufferGeometry {
  const dashedPoints: Vector3[] = [];
  
  for (let i = 0; i < points.length; i += 2) {
    if (i + 1 >= points.length) break;
    
    const start = points[i];
    const end = points[i + 1];
    const direction = new Vector3().subVectors(end, start);
    const length = direction.length();
    direction.normalize();
    
    let currentPos = 0;
    let isDash = true;
    
    while (currentPos < length) {
      const segmentLength = isDash ? dashLength : gapLength;
      const segmentEnd = Math.min(currentPos + segmentLength, length);
      
      if (isDash) {
        const dashStart = new Vector3().copy(start).addScaledVector(direction, currentPos);
        const dashEnd = new Vector3().copy(start).addScaledVector(direction, segmentEnd);
        dashedPoints.push(dashStart, dashEnd);
      }
      
      currentPos = segmentEnd;
      isDash = !isDash;
    }
  }
  
  return new BufferGeometry().setFromPoints(dashedPoints);
}

export default ToolPath;
