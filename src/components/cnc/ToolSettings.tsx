import { Circle } from 'lucide-react';
import { useGCodeStore } from '@/store/gcode-store';

const TOOL_DIAMETERS = [1, 2, 3, 4, 5, 6, 8, 10, 12];

const ToolSettings = () => {
  const { toolDiameter, setToolDiameter } = useGCodeStore();

  return (
    <div className="bg-card border-t border-border p-3">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        Tool Settings
      </div>
      
      <div className="flex items-center gap-2">
        <Circle className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Diameter</span>
        <select
          value={toolDiameter}
          onChange={(e) => setToolDiameter(parseFloat(e.target.value))}
          className="flex-1 bg-secondary border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {TOOL_DIAMETERS.map((d) => (
            <option key={d} value={d}>
              Ø{d} mm
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ToolSettings;
