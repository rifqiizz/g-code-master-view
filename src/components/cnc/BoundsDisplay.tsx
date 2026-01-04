import { useGCodeStore } from '@/store/gcode-store';
import { Box, Ruler } from 'lucide-react';

const BoundsDisplay = () => {
  const { parsedData } = useGCodeStore();

  if (!parsedData) return null;

  const { bounds } = parsedData;
  const dims = {
    x: (bounds.max[0] - bounds.min[0]).toFixed(2),
    y: (bounds.max[1] - bounds.min[1]).toFixed(2),
    z: Math.abs(bounds.max[2] - bounds.min[2]).toFixed(2),
  };

  const ranges = {
    x: `${bounds.min[0].toFixed(1)} → ${bounds.max[0].toFixed(1)}`,
    y: `${bounds.min[1].toFixed(1)} → ${bounds.max[1].toFixed(1)}`,
    z: `${bounds.min[2].toFixed(1)} → ${bounds.max[2].toFixed(1)}`,
  };

  return (
    <div className="border-t border-border">
      <div className="panel-header flex items-center gap-2">
        <Box className="w-3.5 h-3.5" />
        <span>Bounding Box</span>
      </div>
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-3 gap-2 text-xs">
          {(['x', 'y', 'z'] as const).map((axis) => (
            <div key={axis} className="bg-muted/50 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground uppercase font-medium">{axis}</span>
                <span className="font-mono text-primary">{dims[axis]}mm</span>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {ranges[axis]}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          <Ruler className="w-3 h-3" />
          <span>
            Volume: {(parseFloat(dims.x) * parseFloat(dims.y) * parseFloat(dims.z)).toFixed(0)} mm³
          </span>
        </div>
      </div>
    </div>
  );
};

export default BoundsDisplay;
