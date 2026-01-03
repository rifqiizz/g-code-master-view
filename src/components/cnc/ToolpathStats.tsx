import { useMemo } from 'react';
import { useGCodeStore } from '@/store/gcode-store';
import { Clock, Ruler, ArrowRightLeft, Zap, Scissors } from 'lucide-react';

const ToolpathStats = () => {
  const { parsedData } = useGCodeStore();

  const stats = useMemo(() => {
    if (!parsedData || parsedData.toolpath.length === 0) {
      return {
        totalDistance: 0,
        rapidDistance: 0,
        cuttingDistance: 0,
        estimatedTime: 0,
        rapidMoves: 0,
        cuttingMoves: 0,
        arcMoves: 0,
      };
    }

    let totalDistance = 0;
    let rapidDistance = 0;
    let cuttingDistance = 0;
    let rapidMoves = 0;
    let cuttingMoves = 0;
    let arcMoves = 0;
    let estimatedTime = 0;

    const defaultFeedRate = 500; // mm/min
    const rapidFeedRate = 2000; // mm/min

    for (let i = 1; i < parsedData.toolpath.length; i++) {
      const prev = parsedData.toolpath[i - 1];
      const curr = parsedData.toolpath[i];

      const dx = curr.position[0] - prev.position[0];
      const dy = curr.position[1] - prev.position[1];
      const dz = curr.position[2] - prev.position[2];
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      totalDistance += distance;

      // Get feed rate for this segment
      const command = parsedData.commands.find(c => c.line === curr.lineIndex);
      const feedRate = curr.type === 'rapid' ? rapidFeedRate : (command?.f || defaultFeedRate);
      
      // Time in minutes
      estimatedTime += distance / feedRate;

      if (curr.type === 'rapid') {
        rapidDistance += distance;
        rapidMoves++;
      } else {
        cuttingDistance += distance;
        cuttingMoves++;
        
        // Check if arc
        if (command?.type === 'arc-cw' || command?.type === 'arc-ccw') {
          arcMoves++;
        }
      }
    }

    return {
      totalDistance,
      rapidDistance,
      cuttingDistance,
      estimatedTime: estimatedTime * 60, // Convert to seconds
      rapidMoves,
      cuttingMoves,
      arcMoves,
    };
  }, [parsedData]);

  const formatDistance = (mm: number) => {
    if (mm >= 1000) {
      return `${(mm / 1000).toFixed(2)} m`;
    }
    return `${mm.toFixed(1)} mm`;
  };

  const formatTime = (seconds: number) => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${mins}m`;
    }
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}m ${secs}s`;
    }
    return `${seconds.toFixed(1)}s`;
  };

  return (
    <div className="bg-card border-t border-border p-3">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        Toolpath Statistics
      </div>
      
      <div className="space-y-2 text-xs">
        {/* Total Distance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Ruler className="w-3.5 h-3.5" />
            <span>Total Distance</span>
          </div>
          <span className="font-mono text-foreground">{formatDistance(stats.totalDistance)}</span>
        </div>

        {/* Cutting Distance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Scissors className="w-3.5 h-3.5 text-primary" />
            <span>Cutting</span>
          </div>
          <span className="font-mono text-primary">{formatDistance(stats.cuttingDistance)}</span>
        </div>

        {/* Rapid Distance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="w-3.5 h-3.5" />
            <span>Rapid</span>
          </div>
          <span className="font-mono text-muted-foreground">{formatDistance(stats.rapidDistance)}</span>
        </div>

        {/* Estimated Time */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Est. Time</span>
          </div>
          <span className="font-mono text-foreground">{formatTime(stats.estimatedTime)}</span>
        </div>

        {/* Move Counts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Moves</span>
          </div>
          <div className="flex gap-2 font-mono text-xs">
            <span className="text-primary">{stats.cuttingMoves} cut</span>
            <span className="text-muted-foreground">{stats.rapidMoves} rapid</span>
            {stats.arcMoves > 0 && (
              <span className="text-accent">{stats.arcMoves} arc</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolpathStats;
