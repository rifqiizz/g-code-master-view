import { create } from 'zustand';
import { parseGCode, ParsedGCode, SAMPLE_GCODE } from '@/lib/gcode-parser';

interface GCodeState {
  // Raw G-code text
  gcodeText: string;
  setGcodeText: (text: string) => void;
  
  // Parsed data
  parsedData: ParsedGCode | null;
  
  // Playback state
  isPlaying: boolean;
  currentLineIndex: number;
  playbackSpeed: number;
  
  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  setCurrentLine: (line: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  
  // Initialize with sample
  loadSampleGCode: () => void;
}

export const useGCodeStore = create<GCodeState>((set, get) => ({
  gcodeText: SAMPLE_GCODE,
  parsedData: parseGCode(SAMPLE_GCODE),
  
  setGcodeText: (text) => {
    const parsed = parseGCode(text);
    set({ gcodeText: text, parsedData: parsed, currentLineIndex: 0 });
  },
  
  isPlaying: false,
  currentLineIndex: 0,
  playbackSpeed: 1,
  
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  
  stop: () => set({ isPlaying: false, currentLineIndex: 0 }),
  
  stepForward: () => {
    const { parsedData, currentLineIndex } = get();
    if (!parsedData) return;
    const maxIndex = parsedData.toolpath.length - 1;
    set({ currentLineIndex: Math.min(currentLineIndex + 1, maxIndex) });
  },
  
  stepBackward: () => {
    const { currentLineIndex } = get();
    set({ currentLineIndex: Math.max(currentLineIndex - 1, 0) });
  },
  
  setCurrentLine: (line) => set({ currentLineIndex: line }),
  
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  
  loadSampleGCode: () => {
    const parsed = parseGCode(SAMPLE_GCODE);
    set({ gcodeText: SAMPLE_GCODE, parsedData: parsed, currentLineIndex: 0 });
  },
}));
