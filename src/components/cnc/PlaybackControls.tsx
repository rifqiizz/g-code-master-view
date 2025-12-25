import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward,
  Rewind,
  FastForward
} from 'lucide-react';
import { useGCodeStore } from '@/store/gcode-store';

const PlaybackControls = () => {
  const { 
    isPlaying, 
    play, 
    pause, 
    stop, 
    stepForward, 
    stepBackward,
    playbackSpeed,
    setPlaybackSpeed,
    currentLineIndex,
    parsedData
  } = useGCodeStore();

  const totalSteps = parsedData?.toolpath.length || 0;
  const progress = totalSteps > 0 ? (currentLineIndex / (totalSteps - 1)) * 100 : 0;

  const speedOptions = [0.25, 0.5, 1, 2, 4];

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!parsedData) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.floor(percentage * (totalSteps - 1));
    useGCodeStore.getState().setCurrentLine(Math.max(0, Math.min(newIndex, totalSteps - 1)));
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-mono w-16">
          {currentLineIndex + 1} / {totalSteps}
        </span>
        <div 
          className="flex-1 h-1.5 bg-secondary rounded-full cursor-pointer overflow-hidden"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-primary transition-all duration-75 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono w-12 text-right">
          {progress.toFixed(0)}%
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Step backward */}
        <button 
          className="control-button"
          onClick={stepBackward}
          disabled={currentLineIndex === 0}
        >
          <SkipBack size={16} />
        </button>

        {/* Stop */}
        <button 
          className="control-button"
          onClick={stop}
        >
          <Square size={16} />
        </button>

        {/* Play/Pause */}
        <button 
          className="control-button control-button-primary w-12 h-10"
          onClick={isPlaying ? pause : play}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        {/* Step forward */}
        <button 
          className="control-button"
          onClick={stepForward}
          disabled={currentLineIndex >= totalSteps - 1}
        >
          <SkipForward size={16} />
        </button>

        {/* Speed control */}
        <div className="flex items-center gap-1 ml-4">
          <Rewind size={12} className="text-muted-foreground" />
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="bg-secondary text-secondary-foreground text-xs px-2 py-1.5 rounded 
                       border-0 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {speedOptions.map((speed) => (
              <option key={speed} value={speed}>
                {speed}x
              </option>
            ))}
          </select>
          <FastForward size={12} className="text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

export default PlaybackControls;
