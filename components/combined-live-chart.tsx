'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface CombinedLiveChartProps {
  label: string;
  unit: string;
  initialCpu: number;
  initialMem: number;
}

export default function CombinedLiveChart({
  label,
  unit,
  initialCpu,
  initialMem,
}: CombinedLiveChartProps) {
  const pointsToKeep = 20;

  const [cpuHistory, setCpuHistory] = useState<number[]>(() => {
    return Array.from({ length: pointsToKeep }, () => {
      const delta = (Math.random() - 0.5) * (initialCpu * 0.2);
      return Math.max(0, Math.min(100, initialCpu + delta));
    });
  });

  const [memHistory, setMemHistory] = useState<number[]>(() => {
    return Array.from({ length: pointsToKeep }, () => {
      const delta = (Math.random() - 0.5) * (initialMem * 0.2);
      return Math.max(0, Math.min(100, initialMem + delta));
    });
  });

  // Push new points
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuHistory((prev) => {
        const lastVal = prev[prev.length - 1] ?? initialCpu;
        const step = (Math.random() - 0.5) * 5; // 5% max step
        const newVal = Math.max(5, Math.min(95, lastVal + step));
        return [...prev.slice(1), Number(newVal.toFixed(1))];
      });

      setMemHistory((prev) => {
        const lastVal = prev[prev.length - 1] ?? initialMem;
        const step = (Math.random() - 0.5) * 3; // 3% max step
        const newVal = Math.max(5, Math.min(95, lastVal + step));
        return [...prev.slice(1), Number(newVal.toFixed(1))];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [initialCpu, initialMem]);

  const currentCpu = cpuHistory[cpuHistory.length - 1] ?? initialCpu;
  const currentMem = memHistory[memHistory.length - 1] ?? initialMem;

  // SVG dimensions
  const width = 300;
  const height = 100;
  const padding = 5;

  // Map values to SVG coordinates helper
  const getSvgPaths = (history: number[]) => {
    if (history.length === 0) return { stroke: '', area: '' };
    const points = history.map((val, idx) => {
      const x = padding + (idx / (pointsToKeep - 1)) * (width - padding * 2);
      const ratio = val / 100;
      const y = height - padding - ratio * (height - padding * 2);
      return { x, y };
    });

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

    const area = `${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;
    return { stroke: path, area };
  };

  const cpuPaths = useMemo(() => getSvgPaths(cpuHistory), [cpuHistory]);
  const memPaths = useMemo(() => getSvgPaths(memHistory), [memHistory]);

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:border-white/15 transition-all lg:col-span-2 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{label}</span>
          <h3 className="text-base font-semibold text-slate-200 mt-1">
            Host CPU & Memory Integrated Monitoring
          </h3>
        </div>

        {/* Legend metrics */}
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-1.5 bg-cyan-500/5 border border-cyan-500/10 px-2.5 py-1 rounded-xl">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400">CPU:</span>
            <span className="text-xs font-bold font-mono text-cyan-400">{currentCpu.toFixed(1)}%</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-purple-500/5 border border-purple-500/10 px-2.5 py-1 rounded-xl">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400">MEM:</span>
            <span className="text-xs font-bold font-mono text-purple-400">{currentMem.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Shared Embedded Graph Canvas */}
      <div className="w-full h-28 relative overflow-hidden rounded-xl bg-slate-950/40 border border-white/5 my-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="combined-glow-cpu" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="combined-glow-mem" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="combined-grad-cpu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="combined-grad-mem" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255, 255, 255, 0.03)" strokeDasharray="3,3" />
          <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="rgba(255, 255, 255, 0.02)" strokeDasharray="3,3" />
          <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="rgba(255, 255, 255, 0.02)" strokeDasharray="3,3" />

          {/* Area fills */}
          {cpuPaths.area && (
            <path d={cpuPaths.area} fill="url(#combined-grad-cpu)" className="transition-all duration-300" />
          )}
          {memPaths.area && (
            <path d={memPaths.area} fill="url(#combined-grad-mem)" className="transition-all duration-300" />
          )}

          {/* Stroke Lines */}
          {cpuPaths.stroke && (
            <path
              d={cpuPaths.stroke}
              fill="none"
              stroke="rgb(6, 182, 212)"
              strokeWidth="1.8"
              filter="url(#combined-glow-cpu)"
              className="transition-all duration-300"
            />
          )}
          {memPaths.stroke && (
            <path
              d={memPaths.stroke}
              fill="none"
              stroke="rgb(168, 85, 247)"
              strokeWidth="1.8"
              filter="url(#combined-glow-mem)"
              className="transition-all duration-300"
            />
          )}
        </svg>
      </div>

      <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-slate-500">
        <span>MIN: 0%</span>
        <span className="text-slate-600">|</span>
        <span>PEAK (MAX): 100%</span>
      </div>
    </div>
  );
}
