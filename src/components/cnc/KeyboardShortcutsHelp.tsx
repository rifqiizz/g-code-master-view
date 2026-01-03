import { Keyboard } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const shortcuts = [
  { key: 'Space', action: 'Play / Pause' },
  { key: '←', action: 'Step backward' },
  { key: '→', action: 'Step forward' },
  { key: 'Home', action: 'Jump to start' },
  { key: 'End', action: 'Jump to end' },
  { key: '+ / -', action: 'Speed up / down' },
  { key: 'Esc', action: 'Stop playback' },
  { key: '1', action: 'Top view' },
  { key: '2', action: 'Front view' },
  { key: '3', action: 'Isometric view' },
  { key: '4', action: 'Reset camera' },
];

const KeyboardShortcutsHelp = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Keyboard className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="end">
        <div className="p-2 border-b border-border">
          <h4 className="text-xs font-medium">Keyboard Shortcuts</h4>
        </div>
        <div className="p-2 space-y-1">
          {shortcuts.map(({ key, action }) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{action}</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default KeyboardShortcutsHelp;
