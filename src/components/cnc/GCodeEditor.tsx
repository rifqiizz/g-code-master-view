import { useRef, useEffect } from 'react';
import { useGCodeStore } from '@/store/gcode-store';
import FileManager from './FileManager';
import ToolpathStats from './ToolpathStats';
import ToolSettings from './ToolSettings';
import VisibilityPanel from './VisibilityPanel';
import ValidationPanel from './ValidationPanel';
import WorkpieceSettings from './WorkpieceSettings';
import MeasurementTools from './MeasurementTools';
import BoundsDisplay from './BoundsDisplay';
import DepthFilter from './DepthFilter';

const GCodeEditor = () => {
  const { gcodeText, setGcodeText, parsedData, currentLineIndex } = useGCodeStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = gcodeText.split('\n');

  // Auto-scroll to current line
  useEffect(() => {
    if (editorRef.current && parsedData) {
      const currentPoint = parsedData.toolpath[currentLineIndex];
      if (currentPoint) {
        const lineElement = editorRef.current.querySelector(`[data-line="${currentPoint.lineIndex}"]`);
        if (lineElement) {
          lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentLineIndex, parsedData]);

  const getLineClass = (index: number) => {
    if (!parsedData) return 'gcode-line';
    const currentPoint = parsedData.toolpath[currentLineIndex];
    if (currentPoint && currentPoint.lineIndex === index) {
      return 'gcode-line gcode-line-active';
    }
    return 'gcode-line';
  };

  const formatLine = (line: string) => {
    // Highlight comments
    const commentMatch = line.match(/(\([^)]*\)|;.*)$/);
    if (commentMatch) {
      const beforeComment = line.slice(0, commentMatch.index);
      const comment = commentMatch[0];
      return (
        <>
          {formatCode(beforeComment)}
          <span className="gcode-comment">{comment}</span>
        </>
      );
    }
    return formatCode(line);
  };

  const formatCode = (code: string) => {
    // Highlight G and M commands
    return code.split(/\b/).map((part, i) => {
      if (/^[GM]\d+$/i.test(part)) {
        return <span key={i} className="gcode-command">{part}</span>;
      }
      if (/^[XYZIJKF][\-\d.]+$/i.test(part)) {
        return <span key={i} className="gcode-coordinate">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGcodeText(e.target.value);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="panel-header flex items-center justify-between">
        <span>G-Code Editor</span>
        <span className="text-xs text-muted-foreground">
          {lines.length} lines
        </span>
      </div>
      
      {/* File Manager */}
      <FileManager />
      
      {/* Read-only display with highlighting */}
      <div 
        ref={editorRef}
        className="flex-1 overflow-y-auto scrollbar-thin select-text min-h-0"
      >
        {lines.map((line, index) => (
          <div
            key={index}
            data-line={index}
            className={getLineClass(index)}
          >
            <span className="inline-block w-8 text-right mr-3 text-muted-foreground text-xs">
              {index + 1}
            </span>
            {formatLine(line)}
          </div>
        ))}
      </div>
      
      {/* Panels - scrollable section */}
      <div className="flex-shrink-0 overflow-y-auto scrollbar-thin max-h-[50%]">
        {/* Measurement Tools */}
        <MeasurementTools />
        
        {/* Bounding Box Display */}
        <BoundsDisplay />
        
        {/* Depth Visualization */}
        <DepthFilter />
        
        {/* Tool Settings */}
        <ToolSettings />
        
        {/* Workpiece Settings */}
        <WorkpieceSettings />
        
        {/* Visibility Panel */}
        <VisibilityPanel />
        
        {/* Validation Panel */}
        <ValidationPanel />
        
        {/* Toolpath Statistics */}
        <ToolpathStats />
      </div>
      
      {/* Editable textarea */}
      <div className="border-t border-border flex-shrink-0">
        <div className="panel-header text-xs">Edit Code</div>
        <textarea
          ref={textareaRef}
          value={gcodeText}
          onChange={handleTextChange}
          className="w-full h-24 p-2 bg-background font-mono text-sm resize-none 
                     focus:outline-none focus:ring-1 focus:ring-primary scrollbar-thin"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default GCodeEditor;
