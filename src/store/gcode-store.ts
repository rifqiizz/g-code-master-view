import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseGCode, ParsedGCode } from '@/lib/gcode-parser';
import { GCODE_TEMPLATES } from '@/lib/gcode-templates';

interface GCodeState {
  // Raw G-code text
  gcodeText: string;
  setGcodeText: (text: string) => void;
  
  // File management
  currentFileName: string;
  setCurrentFileName: (name: string) => void;
  
  // Parsed data
  parsedData: ParsedGCode | null;
  
  // Playback state
  isPlaying: boolean;
  currentLineIndex: number;
  playbackSpeed: number;
  playbackProgress: number; // 0-1 within current segment
  
  // Camera state
  cameraPreset: string;
  setCameraPreset: (preset: string) => void;
  
  // Collision state
  isColliding: boolean;
  setIsColliding: (colliding: boolean) => void;
  
  // Tool settings
  toolDiameter: number;
  setToolDiameter: (diameter: number) => void;
  
  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  setCurrentLine: (line: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setPlaybackProgress: (progress: number) => void;
  
  // Initialize with sample
  loadSampleGCode: () => void;
  loadTemplate: (templateId: string) => void;
  
  // Computed helpers
  getAdaptivePointerScale: () => number;
  getSegmentDuration: (fromIndex: number, toIndex: number) => number;
}

const DEFAULT_GCODE = GCODE_TEMPLATES.find(t => t.id === 'sample')?.gcode || '';

// Load persisted state
const loadPersistedState = () => {
  try {
    const stored = localStorage.getItem('cnc-viewer-state');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        gcodeText: parsed.gcodeText || DEFAULT_GCODE,
        currentFileName: parsed.currentFileName || 'sample.nc',
        playbackSpeed: parsed.playbackSpeed || 1,
        cameraPreset: parsed.cameraPreset || 'isometric',
        toolDiameter: parsed.toolDiameter || 3,
      };
    }
  } catch (e) {
    console.warn('Failed to load persisted state');
  }
  return {
    gcodeText: DEFAULT_GCODE,
    currentFileName: 'sample.nc',
    playbackSpeed: 1,
    cameraPreset: 'isometric',
    toolDiameter: 3,
  };
};

const persistedState = loadPersistedState();

export const useGCodeStore = create<GCodeState>((set, get) => ({
  gcodeText: persistedState.gcodeText,
  parsedData: parseGCode(persistedState.gcodeText),
  currentFileName: persistedState.currentFileName,
  
  setGcodeText: (text) => {
    const parsed = parseGCode(text);
    set({ gcodeText: text, parsedData: parsed, currentLineIndex: 0, playbackProgress: 0 });
    // Persist
    localStorage.setItem('cnc-viewer-state', JSON.stringify({
      gcodeText: text,
      currentFileName: get().currentFileName,
      playbackSpeed: get().playbackSpeed,
      cameraPreset: get().cameraPreset,
      toolDiameter: get().toolDiameter,
    }));
  },
  
  setCurrentFileName: (name) => {
    set({ currentFileName: name });
    localStorage.setItem('cnc-viewer-state', JSON.stringify({
      gcodeText: get().gcodeText,
      currentFileName: name,
      playbackSpeed: get().playbackSpeed,
      cameraPreset: get().cameraPreset,
      toolDiameter: get().toolDiameter,
    }));
  },
  
  isPlaying: false,
  currentLineIndex: 0,
  playbackSpeed: persistedState.playbackSpeed,
  playbackProgress: 0,
  
  cameraPreset: persistedState.cameraPreset,
  setCameraPreset: (preset) => {
    set({ cameraPreset: preset });
    localStorage.setItem('cnc-viewer-state', JSON.stringify({
      gcodeText: get().gcodeText,
      currentFileName: get().currentFileName,
      playbackSpeed: get().playbackSpeed,
      cameraPreset: preset,
      toolDiameter: get().toolDiameter,
    }));
  },
  
  isColliding: false,
  setIsColliding: (colliding) => set({ isColliding: colliding }),
  
  toolDiameter: persistedState.toolDiameter,
  setToolDiameter: (diameter) => {
    set({ toolDiameter: diameter });
    localStorage.setItem('cnc-viewer-state', JSON.stringify({
      gcodeText: get().gcodeText,
      currentFileName: get().currentFileName,
      playbackSpeed: get().playbackSpeed,
      cameraPreset: get().cameraPreset,
      toolDiameter: diameter,
    }));
  },
  
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  
  stop: () => set({ isPlaying: false, currentLineIndex: 0, playbackProgress: 0 }),
  
  stepForward: () => {
    const { parsedData, currentLineIndex } = get();
    if (!parsedData) return;
    const maxIndex = parsedData.toolpath.length - 1;
    set({ currentLineIndex: Math.min(currentLineIndex + 1, maxIndex), playbackProgress: 0 });
  },
  
  stepBackward: () => {
    const { currentLineIndex } = get();
    set({ currentLineIndex: Math.max(currentLineIndex - 1, 0), playbackProgress: 0 });
  },
  
  setCurrentLine: (line) => set({ currentLineIndex: line, playbackProgress: 0 }),
  
  setPlaybackSpeed: (speed) => {
    set({ playbackSpeed: speed });
    localStorage.setItem('cnc-viewer-state', JSON.stringify({
      gcodeText: get().gcodeText,
      currentFileName: get().currentFileName,
      playbackSpeed: speed,
      cameraPreset: get().cameraPreset,
      toolDiameter: get().toolDiameter,
    }));
  },
  
  setPlaybackProgress: (progress) => set({ playbackProgress: progress }),
  
  loadSampleGCode: () => {
    const template = GCODE_TEMPLATES.find(t => t.id === 'sample');
    if (template) {
      const parsed = parseGCode(template.gcode);
      set({ 
        gcodeText: template.gcode, 
        parsedData: parsed, 
        currentLineIndex: 0, 
        playbackProgress: 0,
        currentFileName: 'sample.nc' 
      });
    }
  },
  
  loadTemplate: (templateId) => {
    const template = GCODE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      const parsed = parseGCode(template.gcode);
      set({ 
        gcodeText: template.gcode, 
        parsedData: parsed, 
        currentLineIndex: 0,
        playbackProgress: 0,
        currentFileName: `${template.id}.nc`
      });
    }
  },
  
  // Compute adaptive pointer scale based on bounding box
  getAdaptivePointerScale: () => {
    const { parsedData } = get();
    if (!parsedData) return 0.02;
    
    const { bounds } = parsedData;
    const maxDim = Math.max(
      bounds.max[0] - bounds.min[0],
      bounds.max[1] - bounds.min[1],
      Math.abs(bounds.max[2] - bounds.min[2])
    );
    
    // 2% of longest axis, clamped between 0.01 and 0.05
    const scale = Math.max(0.01, Math.min(0.05, maxDim * 0.02));
    return scale;
  },
  
  // Calculate segment duration based on distance and feed rate
  getSegmentDuration: (fromIndex, toIndex) => {
    const { parsedData } = get();
    if (!parsedData || fromIndex >= parsedData.toolpath.length || toIndex >= parsedData.toolpath.length) {
      return 0.1; // Default duration
    }
    
    const from = parsedData.toolpath[fromIndex];
    const to = parsedData.toolpath[toIndex];
    
    // Calculate distance
    const dx = to.position[0] - from.position[0];
    const dy = to.position[1] - from.position[1];
    const dz = to.position[2] - from.position[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Get feed rate from the command at this line
    const command = parsedData.commands.find(c => c.line === to.lineIndex);
    let feedRate = command?.f || 500; // Default feed rate mm/min
    
    // Rapid moves are faster
    if (to.type === 'rapid') {
      feedRate = 2000; // Rapid traverse speed
    }
    
    // Convert feed rate from mm/min to mm/sec
    const feedRateMmSec = feedRate / 60;
    
    // Duration in seconds (minimum 0.01s to prevent instant jumps)
    const duration = Math.max(0.01, distance / feedRateMmSec);
    
    return duration;
  },
}));
