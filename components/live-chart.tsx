'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface LiveChartProps {
  label: string;
  unit: string;
  color: 'cyan' | 'purple' | 'emerald';
  minVal?: number;
  maxVal?: number;
  initialVal: number;
}

export default function LiveChart({
  label,
  unit,
  color,
  minVal = 0,
  maxVal = 100,
  initialVal,
}: LiveChartProps) {
  const pointsToKeep = 20;
  const [history, setHistory] = useState<number[]>(() => {
    return Array.from({ length: pointsToKeep }, () => {
      // Fluctuate around initialVal
      const delta = (Math.random() - 0.5) * (initialVal * 0.2);
      return Math.max(minVal, Math.min(maxVal, initialVal + delta));
    });
  });

  // Push new points
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory((prev) => {
        const lastVal = prev[prev.length - 1] ?? initialVal;
        // Fluctuate
        const maxStep = (maxVal - minVal) * 0.05; // 5% max leap
        const step = (Math.random() - 0.5) * maxStep;
        const newVal = Math.max(minVal, Math.min(maxVal, lastVal + step));

        const next = [...prev.slice(1), Number(newVal.toFixed(1))];
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [initialVal, minVal, maxVal]);

  const currentVal = history[history.length - 1] ?? initialVal;

  // Theme color variables
  const colorMap = {
    cyan: {
      stroke: 'rgb(6, 182, 212)',
      fill: 'rgba(6, 182, 212, 0.05)',
      glow: 'rgba(6, 182, 212, 0.3)',
      text: 'text-cyan-400',
      bgGlow: 'bg-cyan-500/10',
    },
    purple: {
      stroke: 'rgb(168, 85, 247)',
      fill: 'rgba(168, 85, 247, 0.05)',
      glow: 'rgba(168, 85, 247, 0.3)',
      text: 'text-purple-400',
      bgGlow: 'bg-purple-500/10',
    },
    emerald: {
      stroke: 'rgb(16, 185, 129)',
      fill: 'rgba(16, 185, 129, 0.05)',
      glow: 'rgba(16, 185, 129, 0.3)',
      text: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/10',
    },
  };

  const selectedColor = colorMap[color];

  // SVG dimensions
  const width = 300;
  const height = 100;
  const padding = 5;

  // Map values to SVG coordinates
  const svgPath = useMemo(() => {
    if (history.length === 0) return '';
    const points = history.map((val, idx) => {
      const x = padding + (idx / (pointsToKeep - 1)) * (width - padding * 2);
      // Invert Y because SVG coordinates start from top-left
      const ratio = (val - minVal) / (maxVal - minVal);
      const y = height - padding - ratio * (height - padding * 2);
      return { x, y };
    });

    // Create cubic bezier curve paths for smoothness
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  }, [history, minVal, maxVal]);

  const svgAreaPath = useMemo(() => {
    if (svgPath === '') return '';
    // Append lines to the bottom corners of the chart to close the fill area
    return `${svgPath} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;
  }, [svgPath]);

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:border-white/15 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{label}</span>
          <h3 className="text-2xl font-bold font-mono text-slate-100 tracking-tight mt-1">
            {currentVal.toFixed(1)}
            <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>
          </h3>
        </div>
        <div className={`p-1.5 rounded-lg ${selectedColor.bgGlow} border border-white/5`}>
          <div className={`h-2 w-2 rounded-full ${selectedColor.text} bg-current animate-pulse`} />
        </div>
      </div>

      {/* Embedded Chart */}
      <div className="w-full h-24 relative overflow-hidden rounded-xl bg-slate-950/40 border border-white/5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Smooth glowing shadow filter */}
            <filter id={`glow-${label.replace(/\s+/g, '')}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Gradient background under the curve */}
            <linearGradient id={`grad-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={selectedColor.stroke} stopOpacity="0.2" />
              <stop offset="100%" stopColor={selectedColor.stroke} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255, 255, 255, 0.03)" strokeDasharray="3,3" />
          <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="rgba(255, 255, 255, 0.02)" strokeDasharray="3,3" />
          <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="rgba(255, 255, 255, 0.02)" strokeDasharray="3,3" />

          {/* Glowing area under path */}
          {svgAreaPath && (
            <path d={svgAreaPath} fill={`url(#grad-${label.replace(/\s+/g, '')})`} className="transition-all duration-300" />
          )}

          {/* Stroke Line */}
          {svgPath && (
            <path
              d={svgPath}
              fill="none"
              stroke={selectedColor.stroke}
              strokeWidth="1.8"
              filter={`url(#glow-${label.replace(/\s+/g, '')})`}
              className="transition-all duration-300"
            />
          )}
        </svg>
      </div>

      {/* Mini details strip */}
      <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-slate-500">
        <span>MIN: {minVal}{unit}</span>
        <span className="text-slate-600">|</span>
        <span>PEAK (MAX): {maxVal}{unit}</span>
      </div>
    </div>
  );
}
