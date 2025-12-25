import { useCallback } from 'react';
import { Box, Eye, RotateCcw, Grid3X3 } from 'lucide-react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useGCodeStore } from '@/store/gcode-store';

interface CameraPresetsProps {
  controlsRef: OrbitControlsImpl | null;
}

const CameraPresets = ({ controlsRef }: CameraPresetsProps) => {
  const { parsedData, setCameraPreset } = useGCodeStore();
  
  const getCenterAndDistance = useCallback(() => {
    if (!parsedData) {
      return { center: [0, 0, 0] as [number, number, number], distance: 3 };
    }
    
    const { bounds } = parsedData;
    const maxDim = Math.max(
      bounds.max[0] - bounds.min[0],
      bounds.max[1] - bounds.min[1],
      Math.abs(bounds.max[2] - bounds.min[2])
    );
    const scale = maxDim > 0 ? 1.5 / maxDim : 0.01;
    
    const centerX = ((bounds.max[0] + bounds.min[0]) / 2) * scale;
    const centerY = ((bounds.max[2] + bounds.min[2]) / 2) * scale;
    const centerZ = ((bounds.max[1] + bounds.min[1]) / 2) * scale;
    
    const maxSize = Math.max(
      (bounds.max[0] - bounds.min[0]) * scale,
      Math.abs(bounds.max[2] - bounds.min[2]) * scale,
      (bounds.max[1] - bounds.min[1]) * scale,
      0.5
    );
    
    return { center: [centerX, centerY, centerZ] as [number, number, number], distance: maxSize * 2.5 };
  }, [parsedData]);

  const setPreset = useCallback((preset: 'top' | 'front' | 'isometric' | 'reset') => {
    if (!controlsRef) return;
    
    const { center, distance } = getCenterAndDistance();
    const [cx, cy, cz] = center;
    
    controlsRef.target.set(cx, cy, cz);
    
    switch (preset) {
      case 'top':
        controlsRef.object.position.set(cx, cy + distance, cz + 0.01);
        break;
      case 'front':
        controlsRef.object.position.set(cx, cy + 0.5, cz + distance);
        break;
      case 'isometric':
      case 'reset':
        controlsRef.object.position.set(cx + distance * 0.7, cy + distance * 0.7, cz + distance * 0.7);
        break;
    }
    
    controlsRef.update();
    setCameraPreset(preset);
  }, [controlsRef, getCenterAndDistance, setCameraPreset]);

  return (
    <div className="flex items-center gap-1">
      <button onClick={() => setPreset('top')} className="control-button text-xs" title="Top View">
        <Grid3X3 size={14} />
        <span className="hidden sm:inline ml-1">Top</span>
      </button>
      <button onClick={() => setPreset('front')} className="control-button text-xs" title="Front View">
        <Box size={14} />
        <span className="hidden sm:inline ml-1">Front</span>
      </button>
      <button onClick={() => setPreset('isometric')} className="control-button text-xs" title="Isometric View">
        <Eye size={14} />
        <span className="hidden sm:inline ml-1">Iso</span>
      </button>
      <button onClick={() => setPreset('reset')} className="control-button text-xs" title="Reset Camera">
        <RotateCcw size={14} />
        <span className="hidden sm:inline ml-1">Reset</span>
      </button>
    </div>
  );
};

export default CameraPresets;
