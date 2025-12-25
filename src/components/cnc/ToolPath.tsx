import { useMemo } from 'react';
import { Vector3, BufferGeometry, Float32BufferAttribute } from 'three';
import { ToolpathPoint } from '@/lib/gcode-parser';

interface ToolPathProps {
  toolpath: ToolpathPoint[];
  currentIndex: number;
  scale: number;
}

const ToolPath = ({ toolpath, currentIndex, scale }: ToolPathProps) => {
  const { rapidGeometry, cuttingGeometry, completedGeometry, rapidDashedGeometry } = useMemo(() => {
    const rapidPoints: Vector3[] = [];
    const cuttingPoints: Vector3[] = [];
    const completedPoints: Vector3[] = [];
    
    for (let i = 1; i < toolpath.length; i++) {
      const prev = toolpath[i - 1];
      const curr = toolpath[i];
      
      const start = new Vector3(
        prev.position[0] * scale,
        prev.position[2] * scale, // Z becomes Y in Three.js
        prev.position[1] * scale  // Y becomes Z in Three.js
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
      }
    }
    
    const rapidGeo = new BufferGeometry().setFromPoints(rapidPoints);
    const cuttingGeo = new BufferGeometry().setFromPoints(cuttingPoints);
    const completedGeo = new BufferGeometry().setFromPoints(completedPoints);
    
    // Create dashed line segments for rapid moves
    const rapidDashedGeo = createDashedGeometry(rapidPoints, 0.03, 0.02);
    
    return {
      rapidGeometry: rapidGeo,
      cuttingGeometry: cuttingGeo,
      completedGeometry: completedGeo,
      rapidDashedGeometry: rapidDashedGeo,
    };
  }, [toolpath, currentIndex, scale]);

  return (
    <group>
      {/* Completed path - highlighted */}
      <lineSegments geometry={completedGeometry}>
        <lineBasicMaterial color="#4dd0e1" linewidth={1} />
      </lineSegments>
      
      {/* Remaining cutting moves */}
      <lineSegments geometry={cuttingGeometry}>
        <lineBasicMaterial color="#1a5a63" linewidth={1} />
      </lineSegments>
      
      {/* Remaining rapid moves - dashed effect via separate segments */}
      <lineSegments geometry={rapidDashedGeometry}>
        <lineBasicMaterial color="#5a5a6a" linewidth={1} transparent opacity={0.6} />
      </lineSegments>
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
