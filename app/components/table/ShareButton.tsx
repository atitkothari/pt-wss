"use client";

import { useState } from 'react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareButtonProps {
  elementToCapture: () => HTMLElement | null;
  className?: string;
}

export function ShareButton({ elementToCapture, className }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const element = elementToCapture();
      if (!element) {
        toast.error('Could not find the element to share.');
        setIsSharing(false);
        return;
      }

      const canvas = await html2canvas(element, {
          useCORS: true,
          scale: 2,
      });

      const newCanvas = document.createElement('canvas');
      newCanvas.width = canvas.width;
      newCanvas.height = canvas.height + 40;
      const ctx = newCanvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#182539';
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
        ctx.drawImage(canvas, 0, 0);

        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.font = '14px Arial';
        ctx.fillText('wheelstrategyoptions.com', newCanvas.width / 2, newCanvas.height - 15);
      }

      newCanvas.toBlob(async (blob) => {
        if (blob) {
          try {
            if (navigator.share) {
              const file = new File([blob], 'option-trade.png', { type: 'image/png' });
              await navigator.share({
                title: 'Check out this option trade!',
                text: 'I found this interesting option trade on wheelstrategyoptions.com',
                files: [file],
              });
            } else {
              saveAs(blob, 'option-trade.png');
            }
          } catch (error) {
            console.error('Error sharing:', error);
            saveAs(blob, 'option-trade.png');
          }
        }
        setIsSharing(false);
      }, 'image/png');

    } catch (error) {
      console.error('Error creating image:', error);
      toast.error('Could not create image for sharing.');
      setIsSharing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={handleShare}
      disabled={isSharing}
    >
      {isSharing ? 'Sharing...' : <Share2 className="h-4 w-4" />}
    </Button>
  );
}
