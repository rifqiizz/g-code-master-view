import { Box, Layers, RotateCcw, Eye } from 'lucide-react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Vector3 } from 'three';

interface CameraPresetsProps {
  controlsRef: OrbitControlsImpl | null;
}

const CameraPresets = ({ controlsRef }: CameraPresetsProps) => {
  const presets = [
    { 
      name: 'Top', 
      icon: Layers, 
      position: new Vector3(0, 3, 0.01),
      target: new Vector3(0, 0, 0)
    },
    { 
      name: 'Front', 
      icon: Box, 
      position: new Vector3(0, 0.5, 3),
      target: new Vector3(0, 0, 0)
    },
    { 
      name: 'Iso', 
      icon: Eye, 
      position: new Vector3(2, 2, 2),
      target: new Vector3(0, 0, 0)
    },
    { 
      name: 'Reset', 
      icon: RotateCcw, 
      position: new Vector3(2, 2, 2),
      target: new Vector3(0, 0, 0)
    },
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
    if (!controlsRef) return;
    
    // Animate to position
    const camera = controlsRef.object;
    camera.position.copy(preset.position);
    controlsRef.target.copy(preset.target);
    controlsRef.update();
  };

  return (
    <div className="flex items-center gap-1">
      {presets.map((preset) => (
        <button
          key={preset.name}
          onClick={() => handlePresetClick(preset)}
          className="control-button text-xs gap-1.5 px-2"
          title={preset.name}
        >
          <preset.icon size={14} />
          <span className="hidden sm:inline">{preset.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CameraPresets;
