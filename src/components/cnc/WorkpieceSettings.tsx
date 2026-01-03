import { Box } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGCodeStore } from '@/store/gcode-store';

const MATERIAL_PRESETS = [
  { id: 'aluminum', name: 'Aluminum', color: '#a8a9ad' },
  { id: 'steel', name: 'Steel', color: '#71797E' },
  { id: 'wood', name: 'Wood', color: '#8B4513' },
  { id: 'plastic', name: 'Plastic', color: '#f5f5dc' },
  { id: 'custom', name: 'Custom', color: '#2a2d33' },
];

const WorkpieceSettings = () => {
  const { 
    workpieceConfig, 
    setWorkpieceConfig,
    setWorkpieceMaterial,
    setWorkpieceManualMode
  } = useGCodeStore();

  return (
    <div className="border-t border-border">
      <div className="panel-header text-xs flex items-center gap-2">
        <Box className="w-3 h-3" />
        Workpiece
      </div>
      <div className="p-2 space-y-3">
        {/* Manual Mode Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Manual Size</Label>
          <Switch
            checked={workpieceConfig.manualMode}
            onCheckedChange={setWorkpieceManualMode}
            className="scale-75"
          />
        </div>

        {/* Material Preset */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Material</Label>
          <Select
            value={workpieceConfig.material}
            onValueChange={setWorkpieceMaterial}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MATERIAL_PRESETS.map(preset => (
                <SelectItem key={preset.id} value={preset.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm border border-border"
                      style={{ backgroundColor: preset.color }}
                    />
                    {preset.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Manual Dimensions */}
        {workpieceConfig.manualMode && (
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">X (mm)</Label>
              <Input
                type="number"
                value={workpieceConfig.dimensions.x}
                onChange={(e) => setWorkpieceConfig({
                  dimensions: { ...workpieceConfig.dimensions, x: parseFloat(e.target.value) || 0 }
                })}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Y (mm)</Label>
              <Input
                type="number"
                value={workpieceConfig.dimensions.y}
                onChange={(e) => setWorkpieceConfig({
                  dimensions: { ...workpieceConfig.dimensions, y: parseFloat(e.target.value) || 0 }
                })}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Z (mm)</Label>
              <Input
                type="number"
                value={workpieceConfig.dimensions.z}
                onChange={(e) => setWorkpieceConfig({
                  dimensions: { ...workpieceConfig.dimensions, z: parseFloat(e.target.value) || 0 }
                })}
                className="h-7 text-xs"
              />
            </div>
          </div>
        )}

        {/* Origin Offset */}
        {workpieceConfig.manualMode && (
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Offset X</Label>
              <Input
                type="number"
                value={workpieceConfig.origin.x}
                onChange={(e) => setWorkpieceConfig({
                  origin: { ...workpieceConfig.origin, x: parseFloat(e.target.value) || 0 }
                })}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Offset Y</Label>
              <Input
                type="number"
                value={workpieceConfig.origin.y}
                onChange={(e) => setWorkpieceConfig({
                  origin: { ...workpieceConfig.origin, y: parseFloat(e.target.value) || 0 }
                })}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Offset Z</Label>
              <Input
                type="number"
                value={workpieceConfig.origin.z}
                onChange={(e) => setWorkpieceConfig({
                  origin: { ...workpieceConfig.origin, z: parseFloat(e.target.value) || 0 }
                })}
                className="h-7 text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkpieceSettings;
