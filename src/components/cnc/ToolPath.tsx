import { useMemo } from 'react';
import { Vector3, BufferGeometry, LineBasicMaterial, LineDashedMaterial } from 'three';
import { ToolpathPoint } from '@/lib/gcode-parser';

interface ToolPathProps {
  toolpath: ToolpathPoint[];
  currentIndex: number;
  scale: number;
}

const ToolPath = ({ toolpath, currentIndex, scale }: ToolPathProps) => {
  const { rapidGeometry, cuttingGeometry, completedGeometry } = useMemo(() => {
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
    
    // Compute line distances for dashed lines
    rapidGeo.computeBoundingSphere();
    
    return {
      rapidGeometry: rapidGeo,
      cuttingGeometry: cuttingGeo,
      completedGeometry: completedGeo,
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
      
      {/* Remaining rapid moves */}
      <lineSegments geometry={rapidGeometry}>
        <lineBasicMaterial color="#3d444d" linewidth={1} />
      </lineSegments>
    </group>
  );
};

export default ToolPath;
