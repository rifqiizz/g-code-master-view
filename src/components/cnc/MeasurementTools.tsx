import { useState } from 'react';
import { useGCodeStore } from '@/store/gcode-store';
import { Crosshair, MousePointer2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface MeasurementPoint {
  x: number;
  y: number;
  z: number;
  label: string;
}

const MeasurementTools = () => {
  const { 
    parsedData, 
    currentLineIndex, 
    measurementMode, 
    setMeasurementMode,
    measurementPoints,
    addMeasurementPoint,
    clearMeasurementPoints 
  } = useGCodeStore();

  if (!parsedData) return null;

  const currentPoint = parsedData.toolpath[currentLineIndex];
  
  const calculateDistance = () => {
    if (measurementPoints.length < 2) return null;
    const p1 = measurementPoints[measurementPoints.length - 2];
    const p2 = measurementPoints[measurementPoints.length - 1];
    
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    
    return {
      total: Math.sqrt(dx * dx + dy * dy + dz * dz),
      dx: Math.abs(dx),
      dy: Math.abs(dy),
      dz: Math.abs(dz),
    };
  };

  const handleMarkPoint = () => {
    if (!currentPoint) return;
    addMeasurementPoint({
      x: currentPoint.position[0],
      y: currentPoint.position[1],
      z: currentPoint.position[2],
      label: `P${measurementPoints.length + 1}`,
    });
  };

  const distance = calculateDistance();

  return (
    <div className="border-t border-border">
      <div className="panel-header flex items-center gap-2">
        <Crosshair className="w-3.5 h-3.5" />
        <span>Measurement Tools</span>
      </div>
      <div className="p-3 space-y-3">
        {/* Current position display */}
        <div className="bg-muted/50 rounded p-2">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer2 className="w-3 h-3 text-primary" />
            <span className="text-xs text-muted-foreground">Current Position</span>
          </div>
          {currentPoint ? (
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div>
                <span className="text-muted-foreground">X:</span>{' '}
                <span className="text-foreground">{currentPoint.position[0].toFixed(3)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Y:</span>{' '}
                <span className="text-foreground">{currentPoint.position[1].toFixed(3)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Z:</span>{' '}
                <span className="text-foreground">{currentPoint.position[2].toFixed(3)}</span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No position data</span>
          )}
        </div>

        {/* Measurement mode toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Measurement mode</span>
          <Switch 
            checked={measurementMode} 
            onCheckedChange={setMeasurementMode}
            className="scale-75"
          />
        </div>

        {measurementMode && (
          <>
            {/* Mark point button */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleMarkPoint}
                className="flex-1 h-7 text-xs"
                disabled={!currentPoint}
              >
                <Crosshair className="w-3 h-3 mr-1" />
                Mark Point ({measurementPoints.length}/2)
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={clearMeasurementPoints}
                className="h-7 px-2"
                disabled={measurementPoints.length === 0}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            {/* Marked points */}
            {measurementPoints.length > 0 && (
              <div className="space-y-1">
                {measurementPoints.map((point, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-muted/30 rounded px-2 py-1">
                    <span className="text-primary font-medium">{point.label}</span>
                    <span className="font-mono text-muted-foreground">
                      ({point.x.toFixed(2)}, {point.y.toFixed(2)}, {point.z.toFixed(2)})
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Distance result */}
            {distance && (
              <div className="bg-primary/10 border border-primary/20 rounded p-2">
                <div className="text-xs text-primary font-medium mb-1">Distance</div>
                <div className="text-lg font-mono text-primary">
                  {distance.total.toFixed(3)} mm
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] text-muted-foreground font-mono mt-1">
                  <span>ΔX: {distance.dx.toFixed(2)}</span>
                  <span>ΔY: {distance.dy.toFixed(2)}</span>
                  <span>ΔZ: {distance.dz.toFixed(2)}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MeasurementTools;
