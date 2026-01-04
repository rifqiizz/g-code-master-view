import { create } from 'zustand';
import { parseGCode, ParsedGCode } from '@/lib/gcode-parser';
import { GCODE_TEMPLATES } from '@/lib/gcode-templates';

// Visibility settings interface
interface VisibilityState {
  grid: boolean;
  axes: boolean;
  rapidMoves: boolean;
  cuttingWidth: boolean;
  workpiece: boolean;
  toolPointer: boolean;
}

// Workpiece configuration interface
interface WorkpieceConfig {
  manualMode: boolean;
  material: string;
  dimensions: { x: number; y: number; z: number };
  origin: { x: number; y: number; z: number };
}

// Measurement point interface
interface MeasurementPoint {
  x: number;
  y: number;
  z: number;
  label: string;
}

// Depth filter interface
interface DepthFilter {
  min: number;
  max: number;
}

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
  playbackProgress: number;
  
  // Camera state
  cameraPreset: string;
  setCameraPreset: (preset: string) => void;
  
  // Collision state
  isColliding: boolean;
  setIsColliding: (colliding: boolean) => void;
  
  // Tool settings
  toolDiameter: number;
  setToolDiameter: (diameter: number) => void;
  
  // Visibility settings
  visibility: VisibilityState;
  toggleVisibility: (key: keyof VisibilityState) => void;
  
  // Workpiece configuration
  workpieceConfig: WorkpieceConfig;
  setWorkpieceConfig: (config: Partial<WorkpieceConfig>) => void;
  setWorkpieceMaterial: (material: string) => void;
  setWorkpieceManualMode: (manual: boolean) => void;
  
  // Measurement tools
  measurementMode: boolean;
  setMeasurementMode: (enabled: boolean) => void;
  measurementPoints: MeasurementPoint[];
  addMeasurementPoint: (point: MeasurementPoint) => void;
  clearMeasurementPoints: () => void;
  
  // Depth visualization
  depthColorEnabled: boolean;
  toggleDepthColor: () => void;
  depthFilter: DepthFilter;
  setDepthFilter: (filter: DepthFilter) => void;
  
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

const DEFAULT_VISIBILITY: VisibilityState = {
  grid: true,
  axes: true,
  rapidMoves: true,
  cuttingWidth: true,
  workpiece: true,
  toolPointer: true,
};

const DEFAULT_WORKPIECE_CONFIG: WorkpieceConfig = {
  manualMode: false,
  material: 'aluminum',
  dimensions: { x: 100, y: 100, z: 20 },
  origin: { x: 0, y: 0, z: 0 },
};

const DEFAULT_DEPTH_FILTER: DepthFilter = {
  min: -100,
  max: 10,
};

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
        visibility: { ...DEFAULT_VISIBILITY, ...parsed.visibility },
        workpieceConfig: { ...DEFAULT_WORKPIECE_CONFIG, ...parsed.workpieceConfig },
        depthColorEnabled: parsed.depthColorEnabled || false,
        depthFilter: parsed.depthFilter || DEFAULT_DEPTH_FILTER,
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
    visibility: DEFAULT_VISIBILITY,
    workpieceConfig: DEFAULT_WORKPIECE_CONFIG,
    depthColorEnabled: false,
    depthFilter: DEFAULT_DEPTH_FILTER,
  };
};

const persistState = (state: Partial<GCodeState>) => {
  try {
    const current = localStorage.getItem('cnc-viewer-state');
    const parsed = current ? JSON.parse(current) : {};
    localStorage.setItem('cnc-viewer-state', JSON.stringify({ ...parsed, ...state }));
  } catch (e) {
    console.warn('Failed to persist state');
  }
};

const persistedState = loadPersistedState();

export const useGCodeStore = create<GCodeState>((set, get) => ({
  gcodeText: persistedState.gcodeText,
  parsedData: parseGCode(persistedState.gcodeText),
  currentFileName: persistedState.currentFileName,
  
  setGcodeText: (text) => {
    const parsed = parseGCode(text);
    set({ gcodeText: text, parsedData: parsed, currentLineIndex: 0, playbackProgress: 0 });
    persistState({ gcodeText: text });
  },
  
  setCurrentFileName: (name) => {
    set({ currentFileName: name });
    persistState({ currentFileName: name });
  },
  
  isPlaying: false,
  currentLineIndex: 0,
  playbackSpeed: persistedState.playbackSpeed,
  playbackProgress: 0,
  
  cameraPreset: persistedState.cameraPreset,
  setCameraPreset: (preset) => {
    set({ cameraPreset: preset });
    persistState({ cameraPreset: preset });
  },
  
  isColliding: false,
  setIsColliding: (colliding) => set({ isColliding: colliding }),
  
  toolDiameter: persistedState.toolDiameter,
  setToolDiameter: (diameter) => {
    set({ toolDiameter: diameter });
    persistState({ toolDiameter: diameter });
  },
  
  // Visibility
  visibility: persistedState.visibility,
  toggleVisibility: (key) => {
    const newVisibility = { ...get().visibility, [key]: !get().visibility[key] };
    set({ visibility: newVisibility });
    persistState({ visibility: newVisibility });
  },
  
  // Workpiece config
  workpieceConfig: persistedState.workpieceConfig,
  setWorkpieceConfig: (config) => {
    const newConfig = { ...get().workpieceConfig, ...config };
    set({ workpieceConfig: newConfig });
    persistState({ workpieceConfig: newConfig });
  },
  setWorkpieceMaterial: (material) => {
    const newConfig = { ...get().workpieceConfig, material };
    set({ workpieceConfig: newConfig });
    persistState({ workpieceConfig: newConfig });
  },
  setWorkpieceManualMode: (manual) => {
    const newConfig = { ...get().workpieceConfig, manualMode: manual };
    set({ workpieceConfig: newConfig });
    persistState({ workpieceConfig: newConfig });
  },
  
  // Measurement tools
  measurementMode: false,
  setMeasurementMode: (enabled) => set({ measurementMode: enabled }),
  measurementPoints: [],
  addMeasurementPoint: (point) => {
    const points = get().measurementPoints;
    // Keep only last 2 points for distance calculation
    const newPoints = points.length >= 2 ? [points[1], point] : [...points, point];
    set({ measurementPoints: newPoints });
  },
  clearMeasurementPoints: () => set({ measurementPoints: [] }),
  
  // Depth visualization
  depthColorEnabled: persistedState.depthColorEnabled,
  toggleDepthColor: () => {
    const newValue = !get().depthColorEnabled;
    set({ depthColorEnabled: newValue });
    persistState({ depthColorEnabled: newValue });
  },
  depthFilter: persistedState.depthFilter,
  setDepthFilter: (filter) => {
    set({ depthFilter: filter });
    persistState({ depthFilter: filter });
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
    persistState({ playbackSpeed: speed });
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
  
  getAdaptivePointerScale: () => {
    const { parsedData } = get();
    if (!parsedData) return 0.02;
    
    const { bounds } = parsedData;
    const maxDim = Math.max(
      bounds.max[0] - bounds.min[0],
      bounds.max[1] - bounds.min[1],
      Math.abs(bounds.max[2] - bounds.min[2])
    );
    
    const scale = Math.max(0.01, Math.min(0.05, maxDim * 0.02));
    return scale;
  },
  
  getSegmentDuration: (fromIndex, toIndex) => {
    const { parsedData } = get();
    if (!parsedData || fromIndex >= parsedData.toolpath.length || toIndex >= parsedData.toolpath.length) {
      return 0.1;
    }
    
    const from = parsedData.toolpath[fromIndex];
    const to = parsedData.toolpath[toIndex];
    
    const dx = to.position[0] - from.position[0];
    const dy = to.position[1] - from.position[1];
    const dz = to.position[2] - from.position[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    const command = parsedData.commands.find(c => c.line === to.lineIndex);
    let feedRate = command?.f || 500;
    
    if (to.type === 'rapid') {
      feedRate = 2000;
    }
    
    const feedRateMmSec = feedRate / 60;
    const duration = Math.max(0.01, distance / feedRateMmSec);
    
    return duration;
  },
}));
