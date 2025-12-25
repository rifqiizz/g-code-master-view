import { useState, useCallback } from 'react';
import CNCScene from '@/components/cnc/CNCScene';
import GCodeEditor from '@/components/cnc/GCodeEditor';
import PlaybackControls from '@/components/cnc/PlaybackControls';
import CameraPresets from '@/components/cnc/CameraPresets';
import StatusBar from '@/components/cnc/StatusBar';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const Index = () => {
  const [cameraControls, setCameraControls] = useState<OrbitControlsImpl | null>(null);

  const handleCameraRef = useCallback((ref: OrbitControlsImpl | null) => {
    setCameraControls(ref);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Panel - G-Code Editor */}
      <div className="w-80 flex-shrink-0 border-r border-border flex flex-col bg-card">
        <GCodeEditor />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
              <h1 className="text-sm font-semibold text-foreground">CNC G-Code Viewer</h1>
            </div>
            <span className="text-xs text-muted-foreground">v1.0</span>
          </div>
          
          <CameraPresets controlsRef={cameraControls} />
        </header>

        {/* 3D Viewer */}
        <div className="flex-1 relative">
          <CNCScene onCameraRef={handleCameraRef} />
          
          {/* Overlay info */}
          <div className="absolute top-4 right-4 text-xs text-muted-foreground bg-card/80 backdrop-blur px-3 py-2 rounded-md border border-border">
            <p>Drag to rotate • Scroll to zoom</p>
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar />

        {/* Playback Controls */}
        <div className="border-t border-border bg-card">
          <PlaybackControls />
        </div>
      </div>
    </div>
  );
};

export default Index;
