import { useGCodeStore } from '@/store/gcode-store';
import { AlertTriangle } from 'lucide-react';

const StatusBar = () => {
  const { parsedData, currentLineIndex, isColliding } = useGCodeStore();

  if (!parsedData) return null;

  const currentPoint = parsedData.toolpath[currentLineIndex];
  const currentCommand = currentPoint 
    ? parsedData.commands.find(c => c.line === currentPoint.lineIndex) 
    : null;

  const x = currentPoint?.position[0]?.toFixed(3) || '0.000';
  const y = currentPoint?.position[1]?.toFixed(3) || '0.000';
  const z = currentPoint?.position[2]?.toFixed(3) || '0.000';
  
  const moveType = currentPoint?.type === 'rapid' ? 'RAPID' : 'CUT';

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-t border-border text-xs font-mono">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-cnc-axis-x font-semibold">X</span>
          <span className="text-foreground w-16">{x}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-cnc-axis-y font-semibold">Y</span>
          <span className="text-foreground w-16">{y}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-cnc-axis-z font-semibold">Z</span>
          <span className="text-foreground w-16">{z}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {isColliding && (
          <div className="flex items-center gap-1 text-destructive animate-pulse">
            <AlertTriangle size={14} />
            <span>CUTTING</span>
          </div>
        )}
        
        <span className={`px-2 py-0.5 rounded text-xs ${
          moveType === 'RAPID' ? 'bg-cnc-rapid/30 text-muted-foreground' : 'bg-primary/20 text-primary'
        }`}>
          {moveType}
        </span>
        
        {currentCommand && (
          <span className="text-muted-foreground max-w-xs truncate">{currentCommand.raw}</span>
        )}
      </div>
    </div>
  );
};

export default StatusBar;
