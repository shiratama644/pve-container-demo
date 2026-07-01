'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/lib/auth-context';
import {
  Logs,
  Play,
  Pause,
  ArrowRight,
  Database,
  Trash2,
  Download,
  Terminal,
} from 'lucide-react';

type LogType = 'DDNS' | 'NGINX_ACCESS' | 'NGINX_ERROR';

const INITIAL_DDNS = [
  `[2026-06-30 00:00:00] [SYSTEM] Scheduled dynamic IP health-check triggered...`,
  `[2026-06-30 00:00:01] [RESOLVER] Current WAN IP resolved as: 198.51.100.42 (Location: Tokyo, JP)`,
  `[2026-06-30 00:00:01] [RESOLVER] DNS record 'pve.domain-main.net' points to: 198.51.100.42`,
  `[2026-06-30 00:00:02] [DDNS] IP has not changed. No DNS write query necessary. Sync code: 304.`,
  `[2026-06-30 06:00:00] [SYSTEM] Scheduled dynamic IP health-check triggered...`,
  `[2026-06-30 06:00:01] [RESOLVER] Current WAN IP resolved as: 198.51.100.42`,
  `[2026-06-30 06:00:02] [DDNS] Sync code: 304 (NO_CHANGE). TTL remains 120s.`,
  `[2026-06-30 12:00:00] [SYSTEM] Scheduled dynamic IP health-check triggered...`,
  `[2026-06-30 12:00:01] [RESOLVER] WARNING: WAN IP change detected! Old: 198.51.100.41 => New: 198.51.100.42`,
  `[2026-06-30 12:00:02] [CLOUDFLARE] Initiating DNS API update payload... Target: A 'pve.domain-main.net'`,
  `[2026-06-30 12:00:03] [CLOUDFLARE] API Response: {"success":true,"result":{"id":"cf_12948a","name":"pve.domain-main.net","content":"198.51.100.42"}}`,
  `[2026-06-30 12:00:03] [DDNS] Update complete! DNS cached successfully across CDN edges.`,
];

const INITIAL_NGINX_ACCESS = [
  `198.51.100.42 - - [30/Jun/2026:20:12:11 +0900] "POST /api/auth/google/callback HTTP/2.0" 200 125 "https://pve-portal.net/"`,
  `198.51.100.42 - - [30/Jun/2026:20:12:14 +0900] "GET /admin/two-login HTTP/2.0" 200 4522 "https://pve-portal.net/"`,
  `198.51.100.42 - - [30/Jun/2026:20:15:32 +0900] "POST /api/auth/two-factor HTTP/2.0" 200 89 "https://pve-portal.net/admin/two-login"`,
  `198.51.100.42 - - [30/Jun/2026:20:15:34 +0900] "GET /admin/dashboard HTTP/2.0" 200 11452 "https://pve-portal.net/"`,
  `198.51.100.42 - - [30/Jun/2026:20:15:35 +0900] "GET /_next/static/chunks/main-app.js HTTP/2.0" 200 248911`,
  `198.51.100.42 - - [30/Jun/2026:20:15:36 +0900] "GET /api/v1/cluster/metrics HTTP/2.0" 200 1845 "https://pve-portal.net/admin/dashboard"`,
  `198.51.100.42 - - [30/Jun/2026:20:15:40 +0900] "GET /api/v1/guests/list HTTP/2.0" 200 3982 "https://pve-portal.net/admin/guests"`,
];

const INITIAL_NGINX_ERROR = [
  `2026/06/30 15:02:44 [error] 819#819: *882 open() "/usr/share/nginx/html/favicon.ico" failed (2: No such file or directory), client: 198.51.100.42`,
  `2026/06/30 18:43:59 [error] 820#820: *1204 SSL_do_handshake() failed (SSL: error:0A000102:SSL routines::unsupported protocol) while SSL handshaking, client: 203.0.113.88`,
  `2026/06/30 18:44:02 [error] 820#820: *1205 "/var/www/html/phpmyadmin/index.php" is not found (2: No such file or directory), client: 203.0.113.88`,
  `2026/06/30 19:10:15 [error] 820#820: *1311 Directory index of "/var/www/html/uploads/" is forbidden, client: 88.198.23.45`,
];

export default function LogsPage() {
  const [logType, setLogType] = useState<LogType>('NGINX_ACCESS');
  const [isTailing, setIsTailing] = useState<boolean>(true);
  const [logsList, setLogsList] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize buffers based on dropdown selection
  useEffect(() => {
    const timer = setTimeout(() => {
      if (logType === 'DDNS') {
        setLogsList(INITIAL_DDNS);
      } else if (logType === 'NGINX_ACCESS') {
        setLogsList(INITIAL_NGINX_ACCESS);
      } else if (logType === 'NGINX_ERROR') {
        setLogsList(INITIAL_NGINX_ERROR);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [logType]);

  // Synchronize scroll on new appends
  useEffect(() => {
    if (isTailing && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [logsList, isTailing]);

  // Handle active real-time log append simulation
  useEffect(() => {
    if (!isTailing) return;

    const interval = setInterval(() => {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

      if (logType === 'DDNS') {
        const ddnsLines = [
          `[${timestamp}] [RESOLVER] Dynamic query resolved WAN IP: 198.51.100.42 (Success)`,
          `[${timestamp}] [DDNS] Sync code: 304 (OK). DNS up-to-date.`,
        ];
        setLogsList((prev) => [...prev, ddnsLines[Math.floor(Math.random() * ddnsLines.length)]]);
      } else if (logType === 'NGINX_ACCESS') {
        const referrers = ['/admin/dashboard', '/admin/guests', '/admin/security', '/admin/apps'];
        const randomRef = referrers[Math.floor(Math.random() * referrers.length)];
        const accessLine = `198.51.100.42 - - [30/Jun/2026:${new Date().toLocaleTimeString('ja-JP')} +0900] "GET /api/v1/cluster/metrics HTTP/2.0" 200 1120 "https://pve-portal.net${randomRef}"`;
        setLogsList((prev) => [...prev, accessLine]);
      } else if (logType === 'NGINX_ERROR') {
        const scanIps = ['203.0.113.88', '88.198.23.45', '45.79.12.134'];
        const targetPaths = ['/wp-login.php', '/admin-portal', '/config.json', '/.git/config'];
        const scanIp = scanIps[Math.floor(Math.random() * scanIps.length)];
        const path = targetPaths[Math.floor(Math.random() * targetPaths.length)];
        const errorLine = `${timestamp.replace(/-/g, '/')} [error] 820#820: *1450 "${path}" is not found (2: No such file or directory), client: ${scanIp}`;
        setLogsList((prev) => [...prev, errorLine]);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isTailing, logType]);

  const handleClearLogs = () => {
    setLogsList([`[${new Date().toLocaleTimeString('ja-JP')}] Console buffer cleared by administrator.`]);
  };

  const handleDownloadLogs = () => {
    const text = logsList.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pve_${logType.toLowerCase()}_log.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* 1. Log Toolbar options */}
      <div
        style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' }}
        className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
      >
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">SYSTEM & TRAFFIC LOGS</span>
          <h2 className="text-lg font-semibold text-slate-200 mt-1">System Log Analyzer</h2>
        </div>

        {/* Controls container */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Dropdown Selector wrapped inside a styled container to prevent horizontal overflow */}
          <div className="flex items-center space-x-2.5 bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 flex-1 sm:flex-initial min-w-0">
            <Database className="w-4.5 h-4.5 text-cyan-400 shrink-0" />
            <select
              value={logType}
              onChange={(e) => setLogType(e.target.value as LogType)}
              className="bg-transparent border-0 text-slate-300 text-xs focus:outline-none cursor-pointer font-bold font-mono w-full sm:w-auto max-w-full sm:max-w-[240px] md:max-w-xs min-w-0 truncate"
              id="log-type-selector"
            >
              <option value="NGINX_ACCESS">Nginx Access Log (Web Traffic)</option>
              <option value="NGINX_ERROR">Nginx Error Log (Vulnerability Scan / Errors)</option>
              <option value="DDNS">DDNS Server Update Log (Cloudflare Sync)</option>
            </select>
          </div>

          {/* Console action buttons */}
          <div className="flex items-center justify-end space-x-2 shrink-0">
            {/* Tailing toggle button */}
            <button
              onClick={() => setIsTailing(!isTailing)}
              id="log-tail-toggle-btn"
              className={`py-2 px-3.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border flex items-center space-x-1.5 ${
                isTailing
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-white/5'
              }`}
            >
              {isTailing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isTailing ? 'Tailing Active' : 'Tailing Paused'}</span>
            </button>

            {/* Download logs */}
            <button
              onClick={handleDownloadLogs}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Export & Download Logs"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Clear console log buffer */}
            <button
              onClick={handleClearLogs}
              className="p-2 bg-slate-800 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 rounded-xl text-slate-400 hover:text-red-400 transition-all cursor-pointer"
              title="Clear Console Buffer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Log View Window */}
      <div
        style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' }}
        className="bg-slate-900/40 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
      >
        {/* Terminal Header */}
        <div className="bg-slate-950/80 px-5 py-3 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
              pve-node-main:/var/log/nginx/
              {logType === 'NGINX_ACCESS' ? 'access.log' : logType === 'NGINX_ERROR' ? 'error.log' : 'ddns_updater.log'}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-mono text-slate-500">BUF: 5000 lines</span>
          </div>
        </div>

        {/* Terminal logs box */}
        <div
          ref={scrollContainerRef}
          className="p-5 h-[480px] overflow-y-auto bg-black/40 font-mono text-[11px] text-slate-300 space-y-2 leading-relaxed"
        >
          {logsList.map((log, index) => {
            let logColor = 'text-slate-300';
            if (log.includes('[RESOLVER]') || log.includes('GET /api/v1/')) {
              logColor = 'text-slate-500';
            }
            if (log.includes('[DDNS]') || log.includes(' 200 ') || log.includes('success":true')) {
              logColor = 'text-cyan-400';
            }
            if (log.includes('WARNING') || log.includes('[error]') || log.includes('failed') || log.includes('forbidden')) {
              logColor = 'text-red-400 font-medium';
            }

            return (
              <div key={index} className="flex items-start space-x-2 select-text">
                <span className="text-slate-600 select-none min-w-[20px] text-right">{index + 1}</span>
                <span className={`${logColor} whitespace-pre-wrap`}>{log}</span>
              </div>
            );
          })}
        </div>

        {/* Console footer Status */}
        <div className="bg-slate-950/40 px-5 py-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center space-x-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>TAIL MODE: {isTailing ? 'ON (PENDING REFRESH)' : 'OFF (MUTED)'}</span>
          </div>
          <span>UTF-8 ENCODING</span>
        </div>
      </div>
    </motion.div>
  );
}
