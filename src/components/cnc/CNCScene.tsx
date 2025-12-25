import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { useGCodeStore } from '@/store/gcode-store';
import ToolPointer from './ToolPointer';
import ToolPath from './ToolPath';
import Workpiece from './Workpiece';
import GridFloor from './GridFloor';
import AxisHelper from './AxisHelper';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface SceneContentProps {
  onCameraRef: (ref: OrbitControlsImpl | null) => void;
}

const SceneContent = ({ onCameraRef }: SceneContentProps) => {
  const { parsedData, currentLineIndex, isPlaying, playbackSpeed, setCurrentLine } = useGCodeStore();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const lastTimeRef = useRef(0);
  const accumulatorRef = useRef(0);

  useEffect(() => {
    if (controlsRef.current) {
      onCameraRef(controlsRef.current);
    }
  }, [onCameraRef]);

  // Calculate scale to normalize the scene
  const scale = useMemo(() => {
    if (!parsedData) return 0.01;
    const { bounds } = parsedData;
    const maxDim = Math.max(
      bounds.max[0] - bounds.min[0],
      bounds.max[1] - bounds.min[1],
      Math.abs(bounds.max[2] - bounds.min[2])
    );
    return maxDim > 0 ? 1.5 / maxDim : 0.01;
  }, [parsedData]);

  // Current tool position
  const toolPosition = useMemo((): [number, number, number] => {
    if (!parsedData || parsedData.toolpath.length === 0) return [0, 0, 0];
    const point = parsedData.toolpath[currentLineIndex] || parsedData.toolpath[0];
    return [
      point.position[0] * scale,
      point.position[2] * scale, // Z becomes Y
      point.position[1] * scale, // Y becomes Z
    ];
  }, [parsedData, currentLineIndex, scale]);

  // Playback animation
  useFrame((_, delta) => {
    if (!isPlaying || !parsedData) return;
    
    accumulatorRef.current += delta * playbackSpeed * 30; // ~30 steps per second at 1x
    
    if (accumulatorRef.current >= 1) {
      const steps = Math.floor(accumulatorRef.current);
      accumulatorRef.current -= steps;
      
      const newIndex = Math.min(currentLineIndex + steps, parsedData.toolpath.length - 1);
      setCurrentLine(newIndex);
      
      if (newIndex >= parsedData.toolpath.length - 1) {
        useGCodeStore.getState().pause();
      }
    }
  });

  if (!parsedData) return null;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      
      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        minDistance={0.5}
        maxDistance={10}
        target={[0, 0, 0]}
      />
      
      {/* Scene elements */}
      <GridFloor size={4} />
      <AxisHelper />
      <Workpiece bounds={parsedData.bounds} scale={scale} />
      <ToolPath 
        toolpath={parsedData.toolpath} 
        currentIndex={currentLineIndex} 
        scale={scale} 
      />
      <ToolPointer position={toolPosition} />
    </>
  );
};

interface CNCSceneProps {
  onCameraRef: (ref: OrbitControlsImpl | null) => void;
}

const CNCScene = ({ onCameraRef }: CNCSceneProps) => {
  return (
    <Canvas
      camera={{ position: [2, 2, 2], fov: 45 }}
      gl={{ antialias: true }}
      style={{ background: '#0f1115' }}
    >
      <color attach="background" args={['#0f1115']} />
      <SceneContent onCameraRef={onCameraRef} />
    </Canvas>
  );
};

export default CNCScene;
