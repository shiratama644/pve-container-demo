'use client';

import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function NetworkTrafficChart() {
  const [rxVal, setRxVal] = useState(12.4);
  const [txVal, setTxVal] = useState(5.8);

  const maxTraffic = 50.0; // scale in MB/s

  useEffect(() => {
    const interval = setInterval(() => {
      setRxVal((prev) => {
        const step = (Math.random() - 0.5) * 4;
        const next = Math.max(1.0, Math.min(maxTraffic, prev + step));
        return Number(next.toFixed(1));
      });
      setTxVal((prev) => {
        const step = (Math.random() - 0.5) * 2;
        const next = Math.max(0.5, Math.min(maxTraffic, prev + step));
        return Number(next.toFixed(1));
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const rxPercent = (rxVal / maxTraffic) * 100;
  const txPercent = (txVal / maxTraffic) * 100;

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:border-white/15 transition-all flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">NETWORK INTERFACE</span>
          <h3 className="text-base font-semibold text-slate-200 mt-1">
            Network Bandwidth (RX / TX)
          </h3>
        </div>
        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-white/5">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      <div className="space-y-4 my-2 flex-1 flex flex-col justify-center">
        {/* RX (Received) horizontal bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-1 text-emerald-400 font-medium">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Received (RX)</span>
            </div>
            <span className="font-mono text-slate-300 font-bold">{rxVal.toFixed(1)} MB/s</span>
          </div>
          <div className="w-full bg-slate-950/80 h-3 rounded-full overflow-hidden border border-white/5 relative">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.25)]"
              style={{ width: `${Math.min(100, rxPercent)}%` }}
            />
          </div>
        </div>

        {/* TX (Transmitted) horizontal bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-1 text-cyan-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Transmitted (TX)</span>
            </div>
            <span className="font-mono text-slate-300 font-bold">{txVal.toFixed(1)} MB/s</span>
          </div>
          <div className="w-full bg-slate-950/80 h-3 rounded-full overflow-hidden border border-white/5 relative">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full transition-all duration-1000 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.25)]"
              style={{ width: `${Math.min(100, txPercent)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500">
        <span>MAX SCALE: {maxTraffic} MB/s</span>
        <span className="text-slate-600">|</span>
        <span>NIC: vmbr0 (10GbE)</span>
      </div>
    </div>
  );
}
