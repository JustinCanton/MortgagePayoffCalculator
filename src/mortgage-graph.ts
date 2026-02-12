import type { AmortizationEntry, PaymentFrequency } from './types';
import { getPaymentsPerYear } from './mortgage-calculations';

export function drawMortgageGraph(
  canvas: HTMLCanvasElement,
  schedule: AmortizationEntry[],
  loanAmount: number,
  paymentFrequency: PaymentFrequency
): void {
  if (!canvas || schedule.length === 0) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas size with device pixel ratio for crisp rendering
  const container = canvas.parentElement;
  if (container) {
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);
  }

  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const padding = { top: 50, right: 60, bottom: 80, left: 100 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Clear canvas with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Get data - sample every nth point if too many
  const maxPoints = 150;
  const step = Math.max(1, Math.floor(schedule.length / maxPoints));
  const data = schedule.filter((_, i) => i % step === 0 || i === schedule.length - 1);
  
  // Find max values for scaling with nice round numbers
  const maxBalance = loanAmount;
  const maxInterest = Math.max(...data.map(d => d.cumulativeInterest));
  const rawMax = Math.max(maxBalance, maxInterest);
  const maxValue = Math.ceil(rawMax / 50000) * 50000; // Round up to nearest 50k

  // Draw grid lines first (behind everything)
  ctx.strokeStyle = '#e8e8e8';
  ctx.lineWidth = 1;
  const ySteps = 8;
  for (let i = 0; i <= ySteps; i++) {
    const y = padding.top + (graphHeight / ySteps) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  const xSteps = 10;
  for (let i = 0; i <= xSteps; i++) {
    const x = padding.left + (graphWidth / xSteps) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, height - padding.bottom);
    ctx.stroke();
  }

  // Draw axes
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();

  // Draw y-axis labels
  ctx.fillStyle = '#555';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= ySteps; i++) {
    const value = maxValue - (maxValue / ySteps) * i;
    const y = padding.top + (graphHeight / ySteps) * i;
    const label = value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`;
    ctx.fillText(label, padding.left - 12, y);
  }

  // Draw x-axis labels
  ctx.fillStyle = '#555';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const totalMonths = schedule.length * (12 / getPaymentsPerYear(paymentFrequency));
  const totalYears = Math.ceil(totalMonths / 12);
  const yearStep = Math.max(1, Math.ceil(totalYears / xSteps));
  
  for (let i = 0; i <= Math.floor(totalYears / yearStep); i++) {
    const year = i * yearStep;
    const x = padding.left + (graphWidth * year) / totalYears;
    if (x <= width - padding.right) {
      ctx.fillText(`${year}`, x, height - padding.bottom + 12);
    }
  }

  // Helper function to draw a smooth line with gradient
  const drawLine = (
    data: AmortizationEntry[], 
    getValue: (d: AmortizationEntry) => number, 
    color: string,
    lineWidth: number = 3
  ) => {
    if (data.length === 0) return;

    // Create gradient for line
    const gradient = ctx.createLinearGradient(padding.left, 0, width - padding.right, 0);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color);
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    data.forEach((entry, i) => {
      const progress = i / (data.length - 1);
      const x = padding.left + graphWidth * progress;
      const y = padding.top + graphHeight * (1 - getValue(entry) / maxValue);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  };

  // Draw balance line with shadow
  ctx.shadowColor = 'rgba(30, 64, 175, 0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  drawLine(data, d => d.balance, '#1e40af', 3);
  
  // Draw cumulative interest line with shadow
  ctx.shadowColor = 'rgba(14, 165, 233, 0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  drawLine(data, d => d.cumulativeInterest, '#0ea5e9', 3);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Draw axis labels
  ctx.fillStyle = '#333';
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  
  // Y-axis label
  ctx.save();
  ctx.translate(25, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Amount', 0, 0);
  ctx.restore();
  
  // X-axis label
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Years', width / 2, height - 15);
}
