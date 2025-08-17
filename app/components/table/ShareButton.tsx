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

      const newCanvas = document.createElement('canvas');
      newCanvas.width = 1200;
      newCanvas.height = 1200;
      const ctx = newCanvas.getContext('2d');

      if (ctx) {
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

        // Header Section
        const headerHeight = 270;
        // ctx.fillStyle = '#f3f4f6'; // Light gray background for header
        ctx.fillRect(0, 0, newCanvas.width, headerHeight);
        
        // Header border
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, headerHeight);
        ctx.lineTo(newCanvas.width, headerHeight);
        ctx.stroke();

        // Title
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        //move this down from top        
        ctx.font = '600 72px Arial';
        const title = `${option.symbol} $${option.strike} ${option.type === 'call' ? 'Call' : 'Put'}`;
        ctx.fillText(title, newCanvas.width / 2, 150);

        // Expiration date
        const expirationDate = new Date(option.expiration);
        expirationDate.setDate(expirationDate.getDate()+1);
        const expirationDateStr = expirationDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        ctx.font = '36px Arial';
        ctx.fillStyle = '#6b7280'; // Medium gray
        ctx.fillText(`Expires ${expirationDateStr}`, newCanvas.width / 2, 210);

        // Main content area
        const contentStartY = 350;
        const contentPadding = 70;
        const columnWidth = (newCanvas.width - contentPadding * 3) / 2;
        const leftColX = contentPadding;
        const rightColX = leftColX + columnWidth + contentPadding;
        const lineHeight = 110;

        // Helper function to format values
        const formatValue = (value: any, isCurrency = false, isDate = false) => {
          if (value === null || value === undefined || value === '') return '-';
          if (isCurrency) return `$${Number(value).toFixed(2)}`;
          else if (isDate)return value;
          return Number(value).toFixed(2);
        };

        // Helper function to draw a data row with border
        const drawDataRow = (label: string, value: any, y: number, isLeftColumn: boolean, 
                           labelColor = '#374151', valueColor = '#111827', isCurrency = false, 
                           isBold = false, labelFontSize = 30, valueFontSize = 34, isDate = false) => {
          const x = isLeftColumn ? leftColX : rightColX;
          const maxWidth = columnWidth;
          
          // Draw label
          ctx.fillStyle = labelColor;
          ctx.font = `${isBold ? '600' : '500'} ${labelFontSize}px Arial`;
          ctx.textAlign = 'left';
          ctx.fillText(label, x, y);
          
          // Draw value
          const valueText = formatValue(value, isCurrency, isDate);
          ctx.fillStyle = valueColor;
          ctx.font = `600 ${valueFontSize}px Arial`;          
          ctx.textAlign = 'right';
          ctx.fillText(valueText, x + maxWidth, y);
          
          // Draw border line (except for last row)
          if (y < contentStartY + lineHeight * 5) {
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y + 20);
            ctx.lineTo(x + maxWidth, y + 20);
            ctx.stroke();
          }
        };

        // Left column
        drawDataRow('Strike', option.strike, contentStartY, true, '#374151', '#111827', true, false);
        drawDataRow('Bid', option.bidPrice, contentStartY + lineHeight, true, '#374151', '#111827', true, false);
        drawDataRow('Delta', option.delta, contentStartY + lineHeight * 2, true, '#374151', '#6b7280');
        drawDataRow('PE Ratio', option.peRatio, contentStartY + lineHeight * 3, true, '#374151', '#6b7280');
        drawDataRow('Probability of Profit', option.probability, contentStartY + lineHeight * 4, true, '#374151', '#111827', false, false);
        drawDataRow('Open Interest', option.openInterest, contentStartY + lineHeight * 5, true, '#374151', '#111827', false, false);

        // Right column
        drawDataRow('Current Stock Price', option.stockPrice, contentStartY, false, '#374151', '#16a34a', true, false); // Green
        drawDataRow('Ask', option.askPrice, contentStartY + lineHeight, false, '#374151', '#111827', true, false);
        drawDataRow('IV', option.impliedVolatility, contentStartY + lineHeight * 2, false, '#374151', '#2563eb'); // Blue
        drawDataRow('Annualized Return', option.annualizedReturn, contentStartY + lineHeight * 3, false, '#374151', '#16a34a', false, false); // Green
        drawDataRow('Volume', option.volume, contentStartY + lineHeight * 4, false, '#374151', '#111827', false, false);
        drawDataRow('Earnings Date', option.earningsDate, contentStartY + lineHeight * 5, false, '#374151', '#111827', false, false, undefined, undefined, true);

        // Footer
        // const footerHeight = 150;
        // ctx.fillStyle = '#f3f4f6';
        // ctx.fillRect(0, newCanvas.height - footerHeight, newCanvas.width, footerHeight);
        
        // // Footer border
        // ctx.strokeStyle = '#d1d5db';
        // ctx.lineWidth = 2;
        // ctx.beginPath();
        // ctx.moveTo(0, newCanvas.height - footerHeight);
        // ctx.lineTo(newCanvas.width, newCanvas.height - footerHeight);
        // ctx.stroke();

        // // Website URL
        // ctx.fillStyle = '#3b82f6'; // Blue
        // ctx.textAlign = 'center';
        // ctx.font = '32px Arial';
        // ctx.fillText('wheelstrategyoptions.com', newCanvas.width / 2, newCanvas.height - 80);
      }

      newCanvas.toBlob(async (blob) => {
        if (blob) {
          try {
            // Check if mobile device
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (isMobile) {
              // On mobile, use Web Share API as primary method
              if (navigator.share) {
                const file = new File([blob], `${option.optionKey}.png`, { type: 'image/png' });
                await navigator.share({
                  title: 'Check out this option trade!',
                  text: 'I found this interesting option trade on wheelstrategyoptions.com',
                  files: [file],
                });
              } else if (navigator.clipboard && navigator.clipboard.write) {
                // Fallback to clipboard if Web Share API not available
                await navigator.clipboard.write([
                  new ClipboardItem({
                    'image/png': blob,
                  }),
                ]);
                toast.success('Image copied to clipboard!');
              } else {
                // Final fallback - download the file
                const filename = `${option.optionKey}.png`;
                saveAs(blob, filename);
                toast.success(`Image saved as ${filename}`);
              }
            } else {
              // On desktop, download the image with option key as filename
              const filename = `${option.optionKey}.png`;
              saveAs(blob, filename);
              toast.success(`Image saved as ${filename}`);
              
              // Also attempt to copy to clipboard
              if (navigator.clipboard && navigator.clipboard.write) {
                await navigator.clipboard.write([
                  new ClipboardItem({
                    'image/png': blob,
                  }),
                ]);
                toast.success('Image also copied to clipboard!');
              }
            }
          } catch (error) {
            console.error('Error sharing or copying image:', error);
            toast.error('Could not share or copy image.');
            // Fallback to saving the file if clipboard copy failed (desktop only)
            if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
              try {
                saveAs(blob, `${option.optionKey}.png`);
                toast.success(`Image saved as ${option.optionKey}.png`);
              } catch (saveError) {
                console.error('Error saving image as fallback:', saveError);
                toast.error('Could not save image.');
              }
            }
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
