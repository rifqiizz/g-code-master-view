import { useRef } from 'react';
import { Mesh } from 'three';

interface ToolPointerProps {
  position: [number, number, number];
}

const ToolPointer = ({ position }: ToolPointerProps) => {
  const meshRef = useRef<Mesh>(null);
  
  return (
    <mesh ref={meshRef} position={position} scale={0.02}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        color="#7dd3dd"
        emissive="#4db6c4"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};

export default ToolPointer;
