"use client";

import { useState } from 'react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { Option } from '@/app/types/option';

interface ShareButtonProps {
  elementToCapture: () => HTMLElement | null;
  className?: string;
  option: Option;
}

export function ShareButton({ elementToCapture, className, option }: ShareButtonProps) {
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

      const padding = 40;
      const headerHeight = 80;
      const footerHeight = 40;

      const newCanvas = document.createElement('canvas');
      newCanvas.width = (headerHeight + footerHeight + padding * 2 + 6 * 25) * 2;
      newCanvas.height = headerHeight + footerHeight + padding * 2 + 6 * 25; // Adjusted height for variables
      const ctx = newCanvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.font = 'bold 24px Arial';
        const title = `${option.symbol} $${option.strike} ${option.type === 'call' ? 'Call' : 'Put'}`;
        
        ctx.fillText(title, newCanvas.width / 2, headerHeight / 2 + 10);

        const expirationDate = new Date(option.expiration).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Expires ${expirationDate}`, newCanvas.width / 2, headerHeight / 2 + 40);

        // Draw horizontal line after header
        ctx.beginPath();
        ctx.moveTo(padding, headerHeight + padding/2);
        ctx.lineTo(newCanvas.width - padding, headerHeight + padding/2);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Render variables in two columns
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.font = '18px Arial';

        const col1X = padding * 2;
        const col2X = newCanvas.width / 2 +  (padding * 2);
        let startY = headerHeight + padding;
        const lineHeight = 25;

        const variables = [
          `Strike : $${option.strike}`,
          `Current Stock Price : $${option.stockPrice}`,
          `Bid : $${option.bidPrice}`,
          `Ask : $${option.askPrice}`,
          `Delta : ${option.delta}`,
          `IV : ${option.impliedVolatility}`,
          `PE Ratio : ${option.peRatio}`,
          `Annualized Return : ${option.annualizedReturn}`,
          `Probability of Profit : ${option.probability}`,
          `Volume : ${option.volume}`,
          `Open Interest : ${option.openInterest}`,
          `Earnings Date : ${option.earningsDate}`,
        ];

        variables.forEach((variable, index) => {
          const x = index % 2 === 0 ? col1X : col2X;
          const y = startY + Math.floor(index / 2) * lineHeight;
          ctx.fillText(variable, x, y);
        });

        // ctx.drawImage(canvas, padding, headerHeight + padding); // Removed this line

        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.font = '20px Arial';
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
