import { useMemo } from 'react';
import { useGCodeStore } from '@/store/gcode-store';

const MiniMap = () => {
  const { parsedData, currentLineIndex, playbackProgress } = useGCodeStore();

  // Calculate current interpolated position
  const currentPosition = useMemo(() => {
    if (!parsedData || parsedData.toolpath.length === 0) return null;
    
    const currentPoint = parsedData.toolpath[currentLineIndex];
    if (!currentPoint) return null;
    
    // Interpolate between current and next point based on progress
    if (currentLineIndex < parsedData.toolpath.length - 1 && playbackProgress > 0) {
      const nextPoint = parsedData.toolpath[currentLineIndex + 1];
      return {
        x: currentPoint.position[0] + (nextPoint.position[0] - currentPoint.position[0]) * playbackProgress,
        y: currentPoint.position[1] + (nextPoint.position[1] - currentPoint.position[1]) * playbackProgress,
      };
    }
    
    return { x: currentPoint.position[0], y: currentPoint.position[1] };
  }, [parsedData, currentLineIndex, playbackProgress]);

  // Generate SVG path for toolpath
  const { pathData, rapidPathData, bounds, viewBox } = useMemo(() => {
    if (!parsedData || parsedData.toolpath.length === 0) {
      return { pathData: '', rapidPathData: '', bounds: null, viewBox: '0 0 100 100' };
    }

    const { bounds: b } = parsedData;
    const padding = 5;
    const width = Math.max(b.max[0] - b.min[0], 1);
    const height = Math.max(b.max[1] - b.min[1], 1);
    
    // Create viewBox with padding
    const vb = `${b.min[0] - padding} ${-(b.max[1] + padding)} ${width + padding * 2} ${height + padding * 2}`;

    let cuttingPath = '';
    let rapidPath = '';
    
    parsedData.toolpath.forEach((point, index) => {
      const x = point.position[0];
      const y = -point.position[1]; // Flip Y for SVG coordinates
      
      if (index === 0) {
        cuttingPath += `M ${x} ${y} `;
        rapidPath += `M ${x} ${y} `;
      } else {
        if (point.type === 'rapid') {
          rapidPath += `L ${x} ${y} `;
          cuttingPath += `M ${x} ${y} `;
        } else {
          cuttingPath += `L ${x} ${y} `;
          rapidPath += `M ${x} ${y} `;
        }
      }
    });

    return { 
      pathData: cuttingPath, 
      rapidPathData: rapidPath,
      bounds: b, 
      viewBox: vb 
    };
  }, [parsedData]);

  if (!parsedData || !bounds) {
    return (
      <div className="absolute bottom-20 right-4 w-40 h-40 bg-card/90 backdrop-blur border border-border rounded-lg flex items-center justify-center">
        <span className="text-xs text-muted-foreground">No toolpath</span>
      </div>
    );
  }

  // Convert current position to SVG coordinates
  const indicatorX = currentPosition?.x || 0;
  const indicatorY = currentPosition ? -currentPosition.y : 0;

  return (
    <div className="absolute bottom-20 right-4 w-40 h-40 bg-card/90 backdrop-blur border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-2 py-1 bg-secondary/50 border-b border-border">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Top View</span>
      </div>
      
      {/* SVG Map */}
      <svg
        viewBox={viewBox}
        className="w-full h-[calc(100%-24px)]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background grid pattern */}
        <defs>
          <pattern id="minimap-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="hsl(var(--border))" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect x={bounds.min[0] - 100} y={-(bounds.max[1] + 100)} width={bounds.max[0] - bounds.min[0] + 200} height={bounds.max[1] - bounds.min[1] + 200} fill="url(#minimap-grid)" />

        {/* Workpiece outline */}
        <rect
          x={bounds.min[0]}
          y={-bounds.max[1]}
          width={bounds.max[0] - bounds.min[0]}
          height={bounds.max[1] - bounds.min[1]}
          fill="hsl(var(--cnc-workpiece))"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Rapid moves - dashed */}
        <path
          d={rapidPathData}
          fill="none"
          stroke="hsl(var(--cnc-rapid))"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          opacity="0.6"
        />

        {/* Cutting path */}
        <path
          d={pathData}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current position indicator */}
        {currentPosition && (
          <g>
            {/* Outer glow */}
            <circle
              cx={indicatorX}
              cy={indicatorY}
              r="3"
              fill="none"
              stroke="#ff8c00"
              strokeWidth="1"
              opacity="0.5"
            />
            {/* Inner dot */}
            <circle
              cx={indicatorX}
              cy={indicatorY}
              r="1.5"
              fill="#ff8c00"
              stroke="#fff"
              strokeWidth="0.5"
            />
          </g>
        )}

        {/* Origin marker */}
        <g>
          <line x1="-3" y1="0" x2="3" y2="0" stroke="hsl(var(--cnc-axis-x))" strokeWidth="0.5" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="hsl(var(--cnc-axis-y))" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
};

export default MiniMap;