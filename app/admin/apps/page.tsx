'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/auth-context';
import { PM2Process } from '@/lib/mock-data';
import {
  FileCode,
  Play,
  Square,
  RefreshCw,
  Terminal,
  Activity,
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function AppsPage() {
  const { guests, pm2Processes, startPM2Process, stopPM2Process, restartPM2Process } = useAuth();

  // Pick containers that have PM2 configs
  const pm2Containers = guests.filter((g) => g.type === 'LXC' && g.status === 'running');
  const [selectedContainerIdState, setSelectedContainerIdState] = useState<number | null>(null);

  // Derive selected container ID dynamically to avoid useEffect state triggers
  const selectedContainerId = (selectedContainerIdState !== null && pm2Containers.some((c) => c.id === selectedContainerIdState))
    ? selectedContainerIdState
    : (pm2Containers[0]?.id ?? 100);

  const activeProcesses = pm2Processes[selectedContainerId] || [];

  // Logs stream viewer modal states
  const [logModal, setLogModal] = useState<{
    isOpen: boolean;
    proc: PM2Process | null;
  }>({
    isOpen: false,
    proc: null,
  });

  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const logTerminalScrollRef = useRef<HTMLDivElement | null>(null);

  // Sync log terminal scroll
  useEffect(() => {
    if (logTerminalScrollRef.current) {
      logTerminalScrollRef.current.scrollTo({
        top: logTerminalScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [activeLogs]);

  // Simulate PM2 live logs append when modal is active
  useEffect(() => {
    if (!logModal.isOpen || !logModal.proc) {
      const timer = setTimeout(() => {
        setActiveLogs([]);
      }, 0);
      return () => clearTimeout(timer);
    }

    const procName = logModal.proc.name;
    const initialLogs = [
      `[PM2] Spawning logs console stream for process: ${procName} (id: ${logModal.proc.id})`,
      `[PM2] [TAIL] Connected to instance buffer. Reading stdout/stderr...`,
      `2026-06-30 20:41:00 [info] Starting next.js telemetry reporter...`,
      `2026-06-30 20:41:02 [info] DB pool initialized successfully (10 connections max)`,
      `2026-06-30 20:41:04 [debug] GET /api/v1/auth/session - 200 OK - 14.5ms`,
    ];
    
    const initTimer = setTimeout(() => {
      setActiveLogs(initialLogs);
    }, 0);


    const logPhrases = [
      () => `2026-06-30 ${new Date().toLocaleTimeString('ja-JP')} [debug] GET /api/v1/nodes/metrics - 200 OK - ${Math.floor(Math.random() * 20 + 5)}ms`,
      () => `2026-06-30 ${new Date().toLocaleTimeString('ja-JP')} [info] GC sweep completed. Recovered ${Math.floor(Math.random() * 40 + 10)}MB heap space.`,
      () => `2026-06-30 ${new Date().toLocaleTimeString('ja-JP')} [debug] POST /api/v1/auth/refresh - 204 No Content - ${Math.floor(Math.random() * 10 + 2)}ms`,
      () => `2026-06-30 ${new Date().toLocaleTimeString('ja-JP')} [warn] Connection pool usage spikes to ${Math.floor(Math.random() * 5 + 5)} active instances.`,
      () => `2026-06-30 ${new Date().toLocaleTimeString('ja-JP')} [debug] Socket event "heartbeat" broadcast to 12.34.56.78 - 0.4ms`,
    ];

    const interval = setInterval(() => {
      const phrase = logPhrases[Math.floor(Math.random() * logPhrases.length)]();
      setActiveLogs((prev) => [...prev, phrase]);
    }, 1200);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [logModal.isOpen, logModal.proc]);

  const handleProcessAction = (procId: number, action: 'start' | 'stop' | 'restart') => {
    if (action === 'start') {
      startPM2Process(selectedContainerId, procId);
    } else if (action === 'stop') {
      stopPM2Process(selectedContainerId, procId);
    } else if (action === 'restart') {
      restartPM2Process(selectedContainerId, procId);
    }
  };

  const getContainerName = (id: number) => {
    return guests.find((g) => g.id === id)?.name || `LXC-${id}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* 1. Header selection banner */}
      <div
        style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' }}
        className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
      >
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">PM2 RUNTIME PROCESSES</span>
          <h2 className="text-lg font-semibold text-slate-200 mt-1">Application Process Manager</h2>
        </div>

        {/* Dropdown Selector wrapped inside a styled container to prevent horizontal overflow */}
        <div className="flex items-center space-x-2.5 bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 w-full md:w-auto min-w-0">
          <Database className="w-4.5 h-4.5 text-cyan-400 shrink-0" />
          <select
            value={selectedContainerId}
            onChange={(e) => setSelectedContainerIdState(Number(e.target.value))}
            className="bg-transparent border-0 text-slate-300 text-xs focus:outline-none cursor-pointer font-bold font-mono w-full md:w-auto max-w-full min-w-0 truncate"
          >
            {pm2Containers.length === 0 ? (
              <option value="">(No online LXC containers)</option>
            ) : (
              pm2Containers.map((container) => (
                <option key={container.id} value={container.id}>
                  {container.name} (ID: {container.id})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* 2. Process list grid */}
      <div
        style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' }}
        className="bg-slate-900/40 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden"
      >
        {pm2Containers.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-mono flex flex-col items-center justify-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-yellow-500/80 animate-bounce" />
            <p className="font-semibold text-slate-300">No active LXC containers are running</p>
            <p className="text-xs max-w-sm leading-relaxed text-slate-400">
              To simulate PM2 process monitoring, please start one of the guest instances (e.g., <code className="bg-slate-950 text-cyan-400 px-1 py-0.5 rounded">web-app-01</code>, <code className="bg-slate-950 text-cyan-400 px-1 py-0.5 rounded">nginx-proxy</code>, or <code className="bg-slate-950 text-cyan-400 px-1 py-0.5 rounded">grafana-metrics</code>) from the Guests page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01] text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-4 px-5">ID</th>
                  <th className="py-4 px-4">Process Name</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">CPU Usage</th>
                  <th className="py-4 px-4">Memory Used</th>
                  <th className="py-4 px-4">Uptime</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {activeProcesses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No active PM2 processes defined inside this container.
                    </td>
                  </tr>
                ) : (
                  activeProcesses.map((proc) => {
                    const isOnline = proc.status === 'online';
                    const isStopped = proc.status === 'stopped';

                    return (
                      <tr key={proc.id} className="hover:bg-white/[0.01] transition-colors">
                        {/* ID */}
                        <td className="py-4 px-5 font-bold text-slate-500">#{proc.id}</td>

                        {/* Name */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <FileCode className="w-4 h-4 text-cyan-400/80" />
                            <span className="font-semibold text-slate-200">{proc.name}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span className={`inline-block font-bold tracking-wider text-[9px] px-2 py-0.5 rounded-full ${
                            isOnline
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {proc.status.toUpperCase()}
                          </span>
                        </td>

                        {/* CPU */}
                        <td className="py-4 px-4 text-slate-300">
                          {isOnline ? (
                            <div className="flex items-center space-x-1.5">
                              <Activity className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
                              <span>{proc.cpu}%</span>
                            </div>
                          ) : (
                            <span>-</span>
                          )}
                        </td>

                        {/* Memory */}
                        <td className="py-4 px-4 text-slate-300">
                          {isOnline ? proc.memory : '-'}
                        </td>

                        {/* Uptime */}
                        <td className="py-4 px-4 text-slate-400">
                          {proc.uptime}
                        </td>

                        {/* Controls */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {isOnline ? (
                              <>
                                <button
                                  onClick={() => handleProcessAction(proc.id, 'restart')}
                                  className="p-1.5 bg-slate-800 hover:bg-yellow-500/15 text-slate-400 hover:text-yellow-400 border border-white/5 rounded-lg cursor-pointer transition-all"
                                  title="Restart"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleProcessAction(proc.id, 'stop')}
                                  className="p-1.5 bg-slate-800 hover:bg-red-500/15 text-slate-400 hover:text-red-400 border border-white/5 rounded-lg cursor-pointer transition-all"
                                  title="Stop"
                                >
                                  <Square className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleProcessAction(proc.id, 'start')}
                                className="p-1.5 bg-slate-800 hover:bg-emerald-500/15 text-slate-400 hover:text-emerald-400 border border-white/5 rounded-lg cursor-pointer transition-all"
                                title="Start"
                              >
                                <Play className="w-3.5 h-3.5 fill-slate-400 hover:fill-emerald-400" />
                              </button>
                            )}

                            <button
                              onClick={() => setLogModal({ isOpen: true, proc })}
                              disabled={isStopped}
                              className="py-1 px-2.5 bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 rounded-lg font-bold text-[10px] uppercase flex items-center space-x-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <Terminal className="w-3 h-3" />
                              <span>View Logs</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TERMINAL TAIL LOGS STREAMING MODAL */}
      <AnimatePresence>
        {logModal.isOpen && logModal.proc && (
          <>
            {/* Modal background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogModal({ isOpen: false, proc: null })}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50"
            />

            {/* Modal code viewport */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 m-auto w-full max-w-2xl h-[420px] bg-slate-950 border border-white/10 rounded-2xl z-50 shadow-[0_30px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-slate-900 border-b border-white/5 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200">
                      PM2 Log Stream: {logModal.proc.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      Container: {getContainerName(selectedContainerId)} (ID: {selectedContainerId})
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[9px] font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>TAILING ACTIVE</span>
                  </div>
                  <button
                    onClick={() => setLogModal({ isOpen: false, proc: null })}
                    className="p-1 text-slate-400 hover:text-slate-100 border border-white/5 rounded bg-slate-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Console logs box */}
              <div
                ref={logTerminalScrollRef}
                className="flex-1 p-5 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-2 bg-black/40"
              >
                {activeLogs.map((log, index) => {
                  let logColor = 'text-slate-300';
                  if (log.includes('[debug]')) logColor = 'text-slate-500';
                  if (log.includes('[info]')) logColor = 'text-cyan-400';
                  if (log.includes('[warn]')) logColor = 'text-yellow-400';
                  if (log.includes('[PM2]')) logColor = 'text-purple-400 font-bold';

                  return (
                    <div key={index} className={`${logColor} whitespace-pre-wrap leading-relaxed`}>
                      {log}
                    </div>
                  );
                })}
              </div>

              {/* Info footer */}
              <div className="bg-slate-900 border-t border-white/5 px-5 py-2 flex items-center justify-between text-[9px] font-mono text-slate-500">
                <span>BUFFER SIZE: 100 LINES MAX</span>
                <span>ESC to Close / Click backdrop</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
