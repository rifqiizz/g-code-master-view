import { useGCodeStore } from '@/store/gcode-store';
import { useMemo } from 'react';

const StatusBar = () => {
  const { parsedData, currentLineIndex } = useGCodeStore();

  const currentPosition = useMemo(() => {
    if (!parsedData || parsedData.toolpath.length === 0) return { x: 0, y: 0, z: 0 };
    const point = parsedData.toolpath[currentLineIndex] || parsedData.toolpath[0];
    return {
      x: point.position[0].toFixed(3),
      y: point.position[1].toFixed(3),
      z: point.position[2].toFixed(3),
    };
  }, [parsedData, currentLineIndex]);

  const currentCommand = useMemo(() => {
    if (!parsedData || parsedData.toolpath.length === 0) return null;
    const point = parsedData.toolpath[currentLineIndex];
    if (!point) return null;
    return parsedData.commands.find(cmd => cmd.line === point.lineIndex);
  }, [parsedData, currentLineIndex]);

  const moveType = useMemo(() => {
    if (!parsedData || parsedData.toolpath.length === 0) return 'N/A';
    const point = parsedData.toolpath[currentLineIndex];
    return point?.type === 'rapid' ? 'RAPID' : 'CUT';
  }, [parsedData, currentLineIndex]);

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-t border-border text-xs font-mono">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-cnc-axis-x">X</span>
          <span className="text-foreground">{currentPosition.x}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-cnc-axis-y">Y</span>
          <span className="text-foreground">{currentPosition.y}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-cnc-axis-z">Z</span>
          <span className="text-foreground">{currentPosition.z}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span className={`px-2 py-0.5 rounded text-xs ${
          moveType === 'RAPID' 
            ? 'bg-cnc-rapid/30 text-muted-foreground' 
            : 'bg-primary/20 text-primary'
        }`}>
          {moveType}
        </span>
        
        {currentCommand && (
          <span className="text-muted-foreground max-w-xs truncate">
            {currentCommand.raw}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatusBar;
