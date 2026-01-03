import { useMemo } from 'react';
import { TubeGeometry, CatmullRomCurve3, Vector3, DoubleSide } from 'three';
import { ToolpathPoint } from '@/lib/gcode-parser';

interface CuttingWidthProps {
  toolpath: ToolpathPoint[];
  currentIndex: number;
  scale: number;
  toolDiameter: number;
}

const CuttingWidth = ({ toolpath, currentIndex, scale, toolDiameter }: CuttingWidthProps) => {
  const geometry = useMemo(() => {
    if (currentIndex < 1) return null;

    // Only show completed cutting paths
    const cuttingPoints: Vector3[] = [];
    
    for (let i = 0; i <= currentIndex && i < toolpath.length; i++) {
      const point = toolpath[i];
      if (point.type === 'cutting' || (i > 0 && toolpath[i - 1]?.type === 'cutting')) {
        cuttingPoints.push(
          new Vector3(
            point.position[0] * scale,
            point.position[2] * scale, // Z becomes Y in Three.js
            point.position[1] * scale  // Y becomes Z in Three.js
          )
        );
      }
    }

    if (cuttingPoints.length < 2) return null;

    // Create segments for each cutting move
    const segments: Vector3[][] = [];
    let currentSegment: Vector3[] = [];
    
    for (let i = 1; i <= currentIndex && i < toolpath.length; i++) {
      const prev = toolpath[i - 1];
      const curr = toolpath[i];
      
      if (curr.type === 'cutting') {
        if (currentSegment.length === 0) {
          currentSegment.push(
            new Vector3(
              prev.position[0] * scale,
              prev.position[2] * scale,
              prev.position[1] * scale
            )
          );
        }
        currentSegment.push(
          new Vector3(
            curr.position[0] * scale,
            curr.position[2] * scale,
            curr.position[1] * scale
          )
        );
      } else if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = [];
      }
    }
    
    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }

    return segments;
  }, [toolpath, currentIndex, scale]);

  if (!geometry || geometry.length === 0) return null;

  // Tool radius in scene units (diameter / 2, scaled)
  const toolRadius = (toolDiameter / 2) * scale;

  return (
    <group>
      {geometry.map((segment, segIndex) => {
        if (segment.length < 2) return null;
        
        // Create a curve from the segment points
        const curve = new CatmullRomCurve3(segment, false, 'centripetal', 0);
        const tubeGeo = new TubeGeometry(curve, segment.length * 4, toolRadius, 8, false);
        
        return (
          <mesh key={segIndex} geometry={tubeGeo}>
            <meshStandardMaterial 
              color="#2a8a99"
              transparent
              opacity={0.25}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default CuttingWidth;
