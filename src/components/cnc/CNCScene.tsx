import { useEffect, useMemo, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGCodeStore } from '@/store/gcode-store';
import ToolPointer from './ToolPointer';
import ToolPath from './ToolPath';
import CuttingWidth from './CuttingWidth';
import Workpiece from './Workpiece';
import GridFloor from './GridFloor';
import AxisHelper from './AxisHelper';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface SceneContentProps {
  onCameraRef: (ref: OrbitControlsImpl | null) => void;
  onAutoFit: () => void;
}

const SceneContent = ({ onCameraRef, onAutoFit }: SceneContentProps) => {
  const { 
    parsedData, 
    currentLineIndex, 
    isPlaying, 
    playbackSpeed, 
    playbackProgress,
    toolDiameter,
    visibility,
    setCurrentLine,
    setPlaybackProgress,
    setIsColliding,
    getSegmentDuration
  } = useGCodeStore();
  
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const accumulatorRef = useRef(0);
  const { camera } = useThree();

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

  // Auto-fit camera when data changes
  useEffect(() => {
    if (parsedData && controlsRef.current) {
      const { bounds } = parsedData;
      
      const centerX = ((bounds.max[0] + bounds.min[0]) / 2) * scale;
      const centerY = ((bounds.max[2] + bounds.min[2]) / 2) * scale;
      const centerZ = ((bounds.max[1] + bounds.min[1]) / 2) * scale;
      
      const sizeX = (bounds.max[0] - bounds.min[0]) * scale;
      const sizeY = Math.abs(bounds.max[2] - bounds.min[2]) * scale;
      const sizeZ = (bounds.max[1] - bounds.min[1]) * scale;
      const maxSize = Math.max(sizeX, sizeY, sizeZ, 0.5);
      
      controlsRef.current.target.set(centerX, centerY, centerZ);
      
      const distance = maxSize * 2.5;
      camera.position.set(
        centerX + distance,
        centerY + distance,
        centerZ + distance
      );
      
      controlsRef.current.update();
    }
  }, [parsedData, scale, camera]);

  // Current and interpolated tool position
  const toolPosition = useMemo((): [number, number, number] => {
    if (!parsedData || parsedData.toolpath.length === 0) return [0, 0, 0];
    
    const currentPoint = parsedData.toolpath[currentLineIndex] || parsedData.toolpath[0];
    const nextIndex = Math.min(currentLineIndex + 1, parsedData.toolpath.length - 1);
    const nextPoint = parsedData.toolpath[nextIndex];
    
    const x = currentPoint.position[0] + (nextPoint.position[0] - currentPoint.position[0]) * playbackProgress;
    const y = currentPoint.position[1] + (nextPoint.position[1] - currentPoint.position[1]) * playbackProgress;
    const z = currentPoint.position[2] + (nextPoint.position[2] - currentPoint.position[2]) * playbackProgress;
    
    return [
      x * scale,
      z * scale,
      y * scale,
    ];
  }, [parsedData, currentLineIndex, playbackProgress, scale]);

  // Check collision with workpiece
  useEffect(() => {
    if (!parsedData) {
      setIsColliding(false);
      return;
    }
    
    const { bounds } = parsedData;
    const [toolX, toolY, toolZ] = toolPosition;
    
    const cncX = toolX / scale;
    const cncZ = toolY / scale;
    const cncY = toolZ / scale;
    
    const withinX = cncX >= bounds.min[0] && cncX <= bounds.max[0];
    const withinY = cncY >= bounds.min[1] && cncY <= bounds.max[1];
    const belowSurface = cncZ < 0;
    
    setIsColliding(withinX && withinY && belowSurface);
  }, [toolPosition, parsedData, scale, setIsColliding]);

  // Feed-aware playback animation
  useFrame((_, delta) => {
    if (!isPlaying || !parsedData) return;
    
    const maxIndex = parsedData.toolpath.length - 1;
    if (currentLineIndex >= maxIndex) {
      useGCodeStore.getState().pause();
      return;
    }
    
    const segmentDuration = getSegmentDuration(currentLineIndex, currentLineIndex + 1);
    const timeScale = playbackSpeed * 2;
    accumulatorRef.current += (delta * timeScale) / segmentDuration;
    
    if (accumulatorRef.current >= 1) {
      accumulatorRef.current = 0;
      const newIndex = currentLineIndex + 1;
      setCurrentLine(newIndex);
      
      if (newIndex >= maxIndex) {
        useGCodeStore.getState().pause();
      }
    } else {
      setPlaybackProgress(accumulatorRef.current);
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
      />
      
      {/* Scene elements with visibility toggles */}
      {visibility.grid && <GridFloor size={4} />}
      {visibility.axes && <AxisHelper />}
      {visibility.workpiece && <Workpiece bounds={parsedData.bounds} scale={scale} />}
      {visibility.cuttingWidth && (
        <CuttingWidth 
          toolpath={parsedData.toolpath} 
          currentIndex={currentLineIndex} 
          scale={scale}
          toolDiameter={toolDiameter}
        />
      )}
      <ToolPath 
        toolpath={parsedData.toolpath} 
        currentIndex={currentLineIndex} 
        scale={scale}
        showRapidMoves={visibility.rapidMoves}
      />
      {visibility.toolPointer && <ToolPointer position={toolPosition} sceneScale={scale} />}
    </>
  );
};

interface CNCSceneProps {
  onCameraRef: (ref: OrbitControlsImpl | null) => void;
}

const CNCScene = ({ onCameraRef }: CNCSceneProps) => {
  const handleAutoFit = useCallback(() => {
    // Auto-fit is handled in the effect
  }, []);

  return (
    <Canvas
      camera={{ position: [2, 2, 2], fov: 45 }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      style={{ background: '#0f1115' }}
    >
      <color attach="background" args={['#0f1115']} />
      <SceneContent onCameraRef={onCameraRef} onAutoFit={handleAutoFit} />
    </Canvas>
  );
};

export default CNCScene;
