import { useMemo } from 'react';

interface WorkpieceProps {
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
  };
  scale: number;
}

const Workpiece = ({ bounds, scale }: WorkpieceProps) => {
  const { size, position } = useMemo(() => {
    const padding = 0.15; // 15% padding
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
    };
  }, [bounds, scale]);

  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color="#2a2d33"
        transparent
        opacity={0.5}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
};

export default Workpiece;
