import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGCodeStore } from '@/store/gcode-store';
import { toast } from 'sonner';

interface ScreenshotButtonProps {
  canvasRef?: HTMLCanvasElement | null;
}

const ScreenshotButton = ({ canvasRef }: ScreenshotButtonProps) => {
  const { currentFileName } = useGCodeStore();

  const handleScreenshot = () => {
    // Find the canvas element in the DOM
    const canvas = canvasRef || document.querySelector('canvas');
    
    if (!canvas) {
      toast.error('Could not find canvas element');
      return;
    }

    try {
      // Get the data URL from the canvas
      const dataUrl = canvas.toDataURL('image/png');
      
      // Create a download link
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const baseName = currentFileName.replace(/\.[^/.]+$/, '');
      link.download = `${baseName}_${timestamp}.png`;
      link.href = dataUrl;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Screenshot saved');
    } catch (error) {
      toast.error('Failed to capture screenshot');
      console.error('Screenshot error:', error);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleScreenshot}
      className="h-7 px-2 text-xs gap-1"
    >
      <Camera className="w-3 h-3" />
      Screenshot
    </Button>
  );
};

export default ScreenshotButton;
