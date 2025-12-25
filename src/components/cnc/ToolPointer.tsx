import { useRef, useMemo } from 'react';
import { Mesh } from 'three';
import { useGCodeStore } from '@/store/gcode-store';

interface ToolPointerProps {
  position: [number, number, number];
  sceneScale: number;
}

const ToolPointer = ({ position, sceneScale }: ToolPointerProps) => {
  const meshRef = useRef<Mesh>(null);
  const { isColliding, getAdaptivePointerScale } = useGCodeStore();
  
  // Calculate adaptive scale based on bounding box
  const pointerScale = useMemo(() => {
    const adaptiveScale = getAdaptivePointerScale();
    // Apply scene scale to keep it proportional
    return adaptiveScale * sceneScale;
  }, [getAdaptivePointerScale, sceneScale]);
  
  // Color based on collision state
  const color = isColliding ? '#ff4444' : '#7dd3dd';
  const emissive = isColliding ? '#cc0000' : '#4db6c4';
  
  return (
    <mesh ref={meshRef} position={position} scale={pointerScale}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        color={color}
        emissive={emissive}
        emissiveIntensity={isColliding ? 0.5 : 0.3}
      />
    </mesh>
  );
};

export default ToolPointer;
