import { useRef, useMemo } from 'react';
import { Mesh, Group } from 'three';
import { useGCodeStore } from '@/store/gcode-store';

interface ToolPointerProps {
  position: [number, number, number];
  sceneScale: number;
}

const ToolPointer = ({ position, sceneScale }: ToolPointerProps) => {
  const groupRef = useRef<Group>(null);
  const { isColliding, getAdaptivePointerScale, toolDiameter } = useGCodeStore();
  
  // Calculate adaptive scale based on bounding box
  const pointerScale = useMemo(() => {
    const adaptiveScale = getAdaptivePointerScale();
    return adaptiveScale * sceneScale;
  }, [getAdaptivePointerScale, sceneScale]);

  // Tool dimensions based on diameter
  const toolScale = useMemo(() => {
    return (toolDiameter / 6) * pointerScale; // Normalize to 6mm reference
  }, [toolDiameter, pointerScale]);
  
  // Colors based on collision state
  const primaryColor = isColliding ? '#ff4444' : '#4dd0e1';
  const secondaryColor = isColliding ? '#cc0000' : '#26a69a';
  const glowColor = isColliding ? '#ff0000' : '#00ffff';
  
  return (
    <group ref={groupRef} position={position}>
      {/* Main tool body - cone shape */}
      <mesh position={[0, toolScale * 2.5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[toolScale * 0.8, toolScale * 5, 16]} />
        <meshStandardMaterial 
          color={secondaryColor}
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Tool tip - precise point indicator */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[toolScale * 0.15, 16, 16]} />
        <meshStandardMaterial 
          color={primaryColor}
          emissive={glowColor}
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Glow ring around tip */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[toolScale * 0.2, toolScale * 0.4, 32]} />
        <meshBasicMaterial 
          color={glowColor}
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Cross-hair lines for precision */}
      <group>
        {/* X-axis line */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[toolScale * 2, toolScale * 0.02, toolScale * 0.02]} />
          <meshBasicMaterial color={primaryColor} transparent opacity={0.6} />
        </mesh>
        {/* Z-axis line (Y in scene) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[toolScale * 0.02, toolScale * 0.02, toolScale * 2]} />
          <meshBasicMaterial color={primaryColor} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Pulsing outer ring */}
      <mesh position={[0, -toolScale * 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[toolScale * 0.5, toolScale * 0.55, 32]} />
        <meshBasicMaterial 
          color={primaryColor}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};

export default ToolPointer;
