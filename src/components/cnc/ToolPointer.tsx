import { useRef, useMemo } from 'react';
import { Group } from 'three';
import { useGCodeStore } from '@/store/gcode-store';

interface ToolPointerProps {
  position: [number, number, number];
  sceneScale: number;
}

const ToolPointer = ({ position, sceneScale }: ToolPointerProps) => {
  const groupRef = useRef<Group>(null);
  const { isColliding, getAdaptivePointerScale, toolDiameter } = useGCodeStore();
  
  // Calculate adaptive scale based on bounding box - increased for better visibility
  const pointerScale = useMemo(() => {
    const adaptiveScale = getAdaptivePointerScale();
    return adaptiveScale * sceneScale * 1.5; // 50% larger
  }, [getAdaptivePointerScale, sceneScale]);

  // Tool dimensions based on diameter
  const toolScale = useMemo(() => {
    return (toolDiameter / 6) * pointerScale;
  }, [toolDiameter, pointerScale]);
  
  // Orange theme colors - collision state uses red
  const primaryColor = isColliding ? '#ff3333' : '#ff8c00'; // Orange / Red
  const secondaryColor = isColliding ? '#cc0000' : '#ff6600'; // Darker orange / Red
  const glowColor = isColliding ? '#ff0000' : '#ffa500'; // Orange glow / Red glow
  const tipColor = isColliding ? '#ff0000' : '#ffcc00'; // Bright yellow-orange tip
  
  return (
    <group ref={groupRef} position={position}>
      {/* Main tool body - cone shape */}
      <mesh position={[0, toolScale * 3, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[toolScale * 1.0, toolScale * 6, 24]} />
        <meshStandardMaterial 
          color={secondaryColor}
          metalness={0.7}
          roughness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>
      
      {/* Collar ring at base of cone */}
      <mesh position={[0, toolScale * 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[toolScale * 0.8, toolScale * 0.15, 16, 32]} />
        <meshStandardMaterial 
          color={primaryColor}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Tool tip - precise point indicator (small for accuracy) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[toolScale * 0.08, 24, 24]} />
        <meshStandardMaterial 
          color={tipColor}
          emissive={tipColor}
          emissiveIntensity={1.2}
        />
      </mesh>
      
      {/* Inner glow ring around tip */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[toolScale * 0.15, toolScale * 0.35, 48]} />
        <meshBasicMaterial 
          color={glowColor}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Outer glow ring */}
      <mesh position={[0, -toolScale * 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[toolScale * 0.4, toolScale * 0.6, 48]} />
        <meshBasicMaterial 
          color={primaryColor}
          transparent
          opacity={0.35}
        />
      </mesh>
      
      {/* Cross-hair lines for precision - larger and more visible */}
      <group>
        {/* X-axis line */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[toolScale * 3, toolScale * 0.04, toolScale * 0.04]} />
          <meshBasicMaterial color={primaryColor} transparent opacity={0.8} />
        </mesh>
        {/* Z-axis line (Y in scene) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[toolScale * 0.04, toolScale * 0.04, toolScale * 3]} />
          <meshBasicMaterial color={primaryColor} transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Vertical indicator line */}
      <mesh position={[0, toolScale * 1.5, 0]}>
        <cylinderGeometry args={[toolScale * 0.03, toolScale * 0.03, toolScale * 3, 12]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.4} />
      </mesh>

      {/* Pulsing outer ring indicator */}
      <mesh position={[0, -toolScale * 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[toolScale * 0.7, toolScale * 0.8, 48]} />
        <meshBasicMaterial 
          color={primaryColor}
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
};

export default ToolPointer;
