import { Eye, EyeOff, Grid3X3, Move, Maximize, Box, Pointer, Layers } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useGCodeStore } from '@/store/gcode-store';

const VisibilityPanel = () => {
  const { visibility, toggleVisibility } = useGCodeStore();

  const items = [
    { key: 'grid' as const, label: 'Grid', icon: Grid3X3 },
    { key: 'axes' as const, label: 'Axes', icon: Move },
    { key: 'rapidMoves' as const, label: 'Rapid Moves', icon: Maximize },
    { key: 'cuttingWidth' as const, label: 'Cutting Width', icon: Layers },
    { key: 'workpiece' as const, label: 'Workpiece', icon: Box },
    { key: 'toolPointer' as const, label: 'Tool Pointer', icon: Pointer },
  ];

  return (
    <div className="border-t border-border">
      <div className="panel-header text-xs flex items-center gap-2">
        <Eye className="w-3 h-3" />
        Visibility
      </div>
      <div className="p-2 space-y-1">
        {items.map(({ key, label, icon: Icon }) => (
          <div 
            key={key}
            className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </div>
            <Switch
              checked={visibility[key]}
              onCheckedChange={() => toggleVisibility(key)}
              className="scale-75"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisibilityPanel;
