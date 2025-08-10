import { createCanvas, registerFont } from 'canvas';
import { NextRequest } from 'next/server';

//register font Arial from public/fonts/Arial.ttf
registerFont('public/fonts/arial.ttf', { family: 'Arial' });

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const option = await req.json();

  const width = 1200;
  const height = 1200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // === Helper Functions ===

  const formatValue = (value: any, isCurrency = false, isDate = false) => {
    if (value === null || value === undefined || value === '') return '-';
    if (isCurrency) return `$${Number(value).toFixed(2)}`;
    if (isDate) return value;
    return Number(value).toFixed(2);
  };

  const drawDataRow = (
    label: string,
    value: any,
    y: number,
    isLeftColumn: boolean,
    labelColor = '#374151',
    valueColor = '#111827',
    isCurrency = false,
    isBold = false,
    labelFontSize = 30,
    valueFontSize = 34,
    isDate = false
  ) => {
    const x = isLeftColumn ? contentPadding : rightColX;
    const maxWidth = columnWidth;

    ctx.fillStyle = labelColor;
    ctx.font = `${isBold ? '600' : '500'} ${labelFontSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(label, x, y);

    const valueText = formatValue(value, isCurrency, isDate);
    ctx.fillStyle = valueColor;
    ctx.font = `600 ${valueFontSize}px Arial`;
    ctx.textAlign = 'right';
    ctx.fillText(valueText, x + maxWidth, y);

    if (y < contentStartY + lineHeight * 5) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + 20);
      ctx.lineTo(x + maxWidth, y + 20);
      ctx.stroke();
    }
  };

  // === Layout ===

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Header
  const headerHeight = 270;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, headerHeight);
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, headerHeight);
  ctx.lineTo(width, headerHeight);
  ctx.stroke();

  // Title
  ctx.fillStyle = '#000000';
  ctx.font = '600 72px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${option.symbol} $${option.strike} ${option.type === 'call' ? 'Call' : 'Put'}`, width / 2, 150);

  // Expiration
  ctx.fillStyle = '#6b7280';
  ctx.font = '36px Arial';
  const expirationDate = new Date(option.expiration).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.fillText(`Expires ${expirationDate}`, width / 2, 210);

  // === Content Section ===

  const contentStartY = 350;
  const contentPadding = 70;
  const columnWidth = (width - contentPadding * 3) / 2;
  const leftColX = contentPadding;
  const rightColX = leftColX + columnWidth + contentPadding;
  const lineHeight = 110;

  // Left column
  drawDataRow('Strike', option.strike, contentStartY, true, '#374151', '#111827', true);
  drawDataRow('Bid', option.bidPrice, contentStartY + lineHeight, true, '#374151', '#111827', true);
  drawDataRow('Delta', option.delta, contentStartY + lineHeight * 2, true, '#374151', '#6b7280');
  drawDataRow('PE Ratio', option.peRatio, contentStartY + lineHeight * 3, true, '#374151', '#6b7280');
  drawDataRow('Probability of Profit', option.probability, contentStartY + lineHeight * 4, true, '#374151', '#111827');
  drawDataRow('Open Interest', option.openInterest, contentStartY + lineHeight * 5, true, '#374151', '#111827');

  // Right column
  drawDataRow('Current Stock Price', option.stockPrice, contentStartY, false, '#374151', '#16a34a', true);
  drawDataRow('Ask', option.askPrice, contentStartY + lineHeight, false, '#374151', '#111827', true);
  drawDataRow('IV', option.impliedVolatility, contentStartY + lineHeight * 2, false, '#374151', '#2563eb');
  drawDataRow('Annualized Return', option.annualizedReturn, contentStartY + lineHeight * 3, false, '#374151', '#16a34a');
  drawDataRow('Volume', option.volume, contentStartY + lineHeight * 4, false, '#374151', '#111827');
  drawDataRow('Earnings Date', option.earningsDate, contentStartY + lineHeight * 5, false, '#374151', '#111827', false, false, 30, 34, true);

  // === Footer ===
  // const footerHeight = 150;
  // ctx.fillStyle = '#f3f4f6';
  // ctx.fillRect(0, height - footerHeight, width, footerHeight);
  // ctx.strokeStyle = '#d1d5db';
  // ctx.lineWidth = 2;
  // ctx.beginPath();
  // ctx.moveTo(0, height - footerHeight);
  // ctx.lineTo(width, height - footerHeight);
  // ctx.stroke();

  // ctx.fillStyle = '#3b82f6';
  // ctx.textAlign = 'center';
  // ctx.font = '32px Arial';
  // ctx.fillText('wheelstrategyoptions.com', width / 2, height - 80);

  // === Send PNG Response ===
  const buffer = canvas.toBuffer('image/png');
  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="${option.symbol}-${option.strike}.png"`,
    },
  });
}