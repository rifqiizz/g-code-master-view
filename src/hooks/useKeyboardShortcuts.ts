import { useEffect } from 'react';
import { useGCodeStore } from '@/store/gcode-store';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface UseKeyboardShortcutsProps {
  controlsRef: OrbitControlsImpl | null;
  onCameraPreset?: (preset: string) => void;
}

export const useKeyboardShortcuts = ({ controlsRef, onCameraPreset }: UseKeyboardShortcutsProps) => {
  const { 
    isPlaying, 
    play, 
    pause, 
    stop, 
    stepForward, 
    stepBackward, 
    playbackSpeed,
    setPlaybackSpeed,
    parsedData,
    setCurrentLine
  } = useGCodeStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlaying) {
            pause();
          } else {
            play();
          }
          break;
          
        case 'ArrowLeft':
          e.preventDefault();
          stepBackward();
          break;
          
        case 'ArrowRight':
          e.preventDefault();
          stepForward();
          break;
          
        case 'Home':
          e.preventDefault();
          setCurrentLine(0);
          break;
          
        case 'End':
          e.preventDefault();
          if (parsedData) {
            setCurrentLine(parsedData.toolpath.length - 1);
          }
          break;
          
        case 'Equal':
        case 'NumpadAdd':
          e.preventDefault();
          setPlaybackSpeed(Math.min(playbackSpeed * 2, 4));
          break;
          
        case 'Minus':
        case 'NumpadSubtract':
          e.preventDefault();
          setPlaybackSpeed(Math.max(playbackSpeed / 2, 0.25));
          break;
          
        case 'Escape':
          e.preventDefault();
          stop();
          break;
          
        case 'Digit1':
          e.preventDefault();
          onCameraPreset?.('top');
          break;
          
        case 'Digit2':
          e.preventDefault();
          onCameraPreset?.('front');
          break;
          
        case 'Digit3':
          e.preventDefault();
          onCameraPreset?.('isometric');
          break;
          
        case 'Digit4':
          e.preventDefault();
          onCameraPreset?.('reset');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, play, pause, stop, stepForward, stepBackward, playbackSpeed, setPlaybackSpeed, parsedData, setCurrentLine, onCameraPreset]);
};
