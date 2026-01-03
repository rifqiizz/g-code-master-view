import { useMemo } from 'react';
import { useGCodeStore } from '@/store/gcode-store';

const MATERIAL_COLORS: Record<string, string> = {
  aluminum: '#a8a9ad',
  steel: '#71797E',
  wood: '#8B4513',
  plastic: '#f5f5dc',
  custom: '#2a2d33',
};

interface WorkpieceProps {
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
  };
  scale: number;
}

const Workpiece = ({ bounds, scale }: WorkpieceProps) => {
  const { workpieceConfig } = useGCodeStore();
  
  const { size, position, color } = useMemo(() => {
    const materialColor = MATERIAL_COLORS[workpieceConfig.material] || MATERIAL_COLORS.custom;
    
    if (workpieceConfig.manualMode) {
      // Use manual dimensions
      const { dimensions, origin } = workpieceConfig;
      const width = dimensions.x * scale;
      const depth = dimensions.y * scale;
      const height = dimensions.z * scale;
      
      return {
        size: [width, height, depth] as [number, number, number],
        position: [
          origin.x * scale,
          -height / 2 + origin.z * scale,
          origin.y * scale
        ] as [number, number, number],
        color: materialColor,
      };
    }
    
    // Auto mode - calculate from bounds
    const padding = 0.15;
    const width = (bounds.max[0] - bounds.min[0]) * (1 + padding) * scale;
    const depth = (bounds.max[1] - bounds.min[1]) * (1 + padding) * scale;
    const height = Math.max(0.08, Math.abs(bounds.min[2]) * 1.5 * scale);
    
    const centerX = ((bounds.max[0] + bounds.min[0]) / 2) * scale;
    const centerY = ((bounds.max[1] + bounds.min[1]) / 2) * scale;
    
    return {
      size: [
        Math.max(width, 0.8),
        height,
        Math.max(depth, 0.8),
      ] as [number, number, number],
      position: [centerX, -height / 2 - 0.01, centerY] as [number, number, number],
      color: materialColor,
    };
  }, [bounds, scale, workpieceConfig]);

  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color={color}
        transparent
        opacity={0.5}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
};

export default Workpiece;
