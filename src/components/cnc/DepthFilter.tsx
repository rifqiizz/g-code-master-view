import { useGCodeStore } from '@/store/gcode-store';
import { Slider } from '@/components/ui/slider';
import { Layers, Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const DepthFilter = () => {
  const { 
    parsedData, 
    depthFilter, 
    setDepthFilter, 
    depthColorEnabled, 
    toggleDepthColor 
  } = useGCodeStore();

  if (!parsedData) return null;

  const { bounds } = parsedData;
  const minZ = bounds.min[2];
  const maxZ = bounds.max[2];
  const range = Math.abs(maxZ - minZ);

  if (range === 0) return null;

  const handleFilterChange = (values: number[]) => {
    setDepthFilter({ min: values[0], max: values[1] });
  };

  return (
    <div className="border-t border-border">
      <div className="panel-header flex items-center gap-2">
        <Layers className="w-3.5 h-3.5" />
        <span>Z-Depth Visualization</span>
      </div>
      <div className="p-3 space-y-3">
        {/* Depth coloring toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Color by depth</span>
          <Switch 
            checked={depthColorEnabled} 
            onCheckedChange={toggleDepthColor}
            className="scale-75"
          />
        </div>

        {/* Color legend */}
        {depthColorEnabled && (
          <div className="flex items-center gap-2">
            <div 
              className="flex-1 h-3 rounded"
              style={{
                background: 'linear-gradient(to right, #4dd0e1, #26a69a, #ffeb3b, #ff9800, #f44336)'
              }}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground w-full absolute left-3 right-3">
            </div>
          </div>
        )}

        {depthColorEnabled && (
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{maxZ.toFixed(1)}mm (top)</span>
            <span>{minZ.toFixed(1)}mm (deep)</span>
          </div>
        )}

        {/* Depth filter slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Filter depth range</span>
            <span className="font-mono text-primary">
              {depthFilter.min.toFixed(1)} → {depthFilter.max.toFixed(1)}mm
            </span>
          </div>
          <Slider
            min={minZ}
            max={maxZ}
            step={0.1}
            value={[depthFilter.min, depthFilter.max]}
            onValueChange={handleFilterChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default DepthFilter;
