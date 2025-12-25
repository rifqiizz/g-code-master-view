import { useRef, useState, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  FolderOpen,
  ChevronDown,
  FileCode
} from 'lucide-react';
import { useGCodeStore } from '@/store/gcode-store';
import { GCODE_TEMPLATES, GCodeTemplate } from '@/lib/gcode-templates';

const FileManager = () => {
  const { gcodeText, setGcodeText, currentFileName, setCurrentFileName } = useGCodeStore();
  const [showTemplates, setShowTemplates] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setGcodeText(content);
      setCurrentFileName(file.name);
    };
    reader.readAsText(file);
  }, [setGcodeText, setCurrentFileName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.nc') || file.name.endsWith('.gcode') || file.name.endsWith('.tap') || file.name.endsWith('.txt'))) {
      handleFileUpload(file);
    }
  };

  const handleSave = () => {
    const blob = new Blob([gcodeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName || 'program.nc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveAs = () => {
    const name = prompt('Enter filename:', currentFileName || 'program.nc');
    if (name) {
      setCurrentFileName(name);
      const blob = new Blob([gcodeText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleTemplateSelect = (template: GCodeTemplate) => {
    setGcodeText(template.gcode);
    setCurrentFileName(`${template.id}.nc`);
    setShowTemplates(false);
  };

  return (
    <div 
      className={`flex flex-col gap-2 p-2 border-b border-border ${isDragging ? 'bg-primary/10' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Current file indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <FileCode size={14} />
        <span className="truncate flex-1">{currentFileName || 'Untitled'}</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {/* Load file */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".nc,.gcode,.tap,.txt"
          onChange={handleInputChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="control-button flex-1 text-xs gap-1"
          title="Load G-Code file"
        >
          <FolderOpen size={14} />
          <span>Load</span>
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          className="control-button flex-1 text-xs gap-1"
          title="Save file"
        >
          <Download size={14} />
          <span>Save</span>
        </button>

        {/* Templates dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="control-button text-xs gap-1 px-2"
            title="Load template"
          >
            <FileText size={14} />
            <ChevronDown size={12} />
          </button>
          
          {showTemplates && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-md shadow-lg z-50">
              <div className="p-2 border-b border-border">
                <span className="text-xs font-medium text-foreground">Templates</span>
              </div>
              {GCODE_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full text-left px-3 py-2 hover:bg-secondary transition-colors"
                >
                  <div className="text-sm text-foreground">{template.name}</div>
                  <div className="text-xs text-muted-foreground">{template.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drag & drop hint */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 border-2 border-dashed border-primary rounded-md z-50">
          <div className="flex flex-col items-center gap-2 text-primary">
            <Upload size={24} />
            <span className="text-sm">Drop G-Code file here</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
