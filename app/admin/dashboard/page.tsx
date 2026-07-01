'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/lib/auth-context';
import LiveChart from '@/components/live-chart';
import CombinedLiveChart from '@/components/combined-live-chart';
import NetworkTrafficChart from '@/components/network-traffic-chart';
import {
  Server,
  HardDrive,
  Cpu,
  ShieldCheck,
  Zap,
  Power,
  RefreshCcw,
  Volume2,
  Lock,
  ArrowRightLeft,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { guests, auditLogs, firewallBlocks, packageUpdates, addCustomAuditLog } = useAuth();

  // Storage local state to allow manual mock disk optimization (trim)
  const [diskUsed, setDiskUsed] = useState(685.4); // GB
  const [isOptimizing, setIsOptimizing] = useState(false);
  const diskTotal = 1000.0; // GB
  const diskPercent = (diskUsed / diskTotal) * 100;

  // Guest stats
  const totalGuests = guests.length;
  const runningGuestsCount = guests.filter((g) => g.status === 'running').length;
  const stoppedGuestsCount = totalGuests - runningGuestsCount;

  // Security stats
  const activeBlockCount = firewallBlocks.length;
  const pendingUpdatesCount = packageUpdates.length;
  const securityAlertsCount = auditLogs.filter((log) => log.status === 'Failed').length;

  const handleOptimizeDisk = () => {
    setIsOptimizing(true);
    addCustomAuditLog('Storage Optimization (fstrim)', 'Success', 'fstrim trigger initiated on host SSD disk (pve-local).');

    setTimeout(() => {
      setDiskUsed(512.8); // Trimmed!
      setIsOptimizing(false);
      addCustomAuditLog('Storage Optimization (fstrim)', 'Success', 'Host SSD disk (pve-local) optimization completed. Reclaimed 172.6 GB blocks.');
    }, 1800);
  };

  const handleHostReboot = () => {
    if (confirm('Warning: Rebooting the Proxmox VE physical host will ACPI shutdown all active LXC and KVM guests. Proceed?')) {
      addCustomAuditLog('Host Physical Server Reboot', 'Failed', 'Reboot signal received but actual physical reboot was intercepted for demo safety. Cluster configuration remains protected.');
      alert('Physical server shutdown signal verified. Due to demo constraints, server uptime has been maintained.');
    }
  };

  // Animated circular progress configuration
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (diskPercent / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="space-y-6 lg:space-y-8"
      id="dashboard-content"
    >
      {/* 1. TOP METRIC STRIP (Bento style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total VMs/LXC status */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">GUESTS INSTANCES</span>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-3xl font-bold text-slate-100 font-mono">{totalGuests}</h2>
              <span className="text-xs text-emerald-400 font-mono font-medium">({runningGuestsCount} ONLINE)</span>
            </div>
            <p className="text-[11px] text-slate-400">LXC/KVM Guest Environments</p>
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/10 rounded-xl">
            <Server className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        {/* Security Alert counters */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">FIREWALL BLOCK</span>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-3xl font-bold text-slate-100 font-mono">{activeBlockCount}</h2>
              <span className="text-xs text-red-400 font-mono font-medium">({securityAlertsCount} ALERTS)</span>
            </div>
            <p className="text-[11px] text-slate-400">Active UFW Block Rules</p>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/10 rounded-xl">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
        </div>

        {/* Pending updates */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">PACKAGE UPDATES</span>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-3xl font-bold text-slate-100 font-mono">{pendingUpdatesCount}</h2>
              {pendingUpdatesCount > 0 && (
                <span className="text-xs text-yellow-400 font-mono font-medium">({packageUpdates.filter(p=>p.isSecurity).length} SECURITY)</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Pending Update Packages</p>
          </div>
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/10 rounded-xl">
            <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Host Node Name */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">PVE PHYSICAL HOST</span>
            <h2 className="text-xl font-bold text-slate-100 font-mono">pve-node-main</h2>
            <p className="text-[11px] text-slate-400">AMD EPYC 32-Core @ 3.4GHz</p>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/10 rounded-xl">
            <Cpu className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* 2. LIVE METRICS MONITORING GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CombinedLiveChart label="Host CPU / Memory Status" unit="%" initialCpu={24.5} initialMem={58.2} />
        <NetworkTrafficChart />
      </div>

      {/* 3. HARDDRIVE SSD AND CLUSTER ADMIN CONTROLS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* SSD Circular Gauge */}
        <div className="xl:col-span-4 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">STORAGE GAUGE</span>
            <h3 className="text-base font-semibold text-slate-200 mt-1">Local SSD (pve-local)</h3>
          </div>

          <div className="flex flex-row items-center justify-between gap-4 my-6 py-2">
            {/* Left side: Doughnut Chart */}
            <div className="flex items-center justify-center relative flex-shrink-0">
              <svg className="w-28 h-28">
                {/* Underlay */}
                <circle
                  cx="56"
                  cy="56"
                  r="42"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Accent colored progress ring */}
                <circle
                  cx="56"
                  cy="56"
                  r="42"
                  className="stroke-cyan-500 transition-all duration-1000"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 - (diskPercent / 100) * (2 * Math.PI * 42)}
                  strokeLinecap="round"
                  transform="rotate(-90 56 56)"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-base font-bold font-mono text-slate-100">{diskPercent.toFixed(1)}%</span>
                <span className="text-[9px] font-mono text-slate-500 block leading-none">USED</span>
              </div>
            </div>

            {/* Right side: Usage and free capacity text stacked vertically */}
            <div className="flex-1 flex flex-col justify-center space-y-3 font-mono">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-cyan-500 block" />
                  <span>Disk Space Used</span>
                </div>
                <div className="text-sm font-bold text-slate-100 pl-3.5">
                  {diskUsed.toFixed(1)} GB
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-slate-800 border border-slate-600 block" />
                  <span>Free Space Available</span>
                </div>
                <div className="text-sm font-bold text-emerald-400 pl-3.5">
                  {(diskTotal - diskUsed).toFixed(1)} GB
                </div>
              </div>

              <div className="text-[10px] text-slate-500 pl-3.5 leading-tight">
                Total Capacity: {diskTotal.toFixed(0)} GB
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleOptimizeDisk}
              disabled={isOptimizing}
              className="w-full py-2 px-4 rounded-xl text-xs font-medium border border-white/10 hover:border-cyan-500/30 bg-white/[0.02] hover:bg-cyan-500/5 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              {isOptimizing ? (
                <>
                  <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>TRIM Optimizing...</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Execute SSD fstrim</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Host Power Console */}
        <div className="xl:col-span-4 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">HOST POWER CONTROL</span>
            <h3 className="text-base font-semibold text-slate-200 mt-1">Host Power Control System</h3>
          </div>

          <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 my-4 flex-1 flex flex-col justify-center space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs text-slate-300 font-mono uppercase font-semibold">ACPI: MASTER ALIVE</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Physical server power state, fan cooling speeds, and KVM kernel module stability are well within nominal operational thresholds.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => alert('Physical shutdown is restricted in demo mode. Please manage individual LXC/KVM power states in "Guests" menu.')}
              className="py-2.5 px-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-300 hover:text-red-200 transition-all text-xs font-medium cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Power Off</span>
            </button>
            <button
              onClick={handleHostReboot}
              className="py-2.5 px-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-300 hover:text-yellow-200 transition-all text-xs font-medium cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Reboot Host</span>
            </button>
          </div>
        </div>

        {/* Quick Audits List */}
        <div className="xl:col-span-4 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">SECURITY WATCH</span>
              <h3 className="text-base font-semibold text-slate-200 mt-1">Latest Security Audit Logs</h3>
            </div>
            <Link href="/admin/security">
              <span className="text-[10px] text-cyan-400 font-mono hover:underline cursor-pointer">View All</span>
            </Link>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[190px] pr-1">
            {auditLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="bg-slate-950/40 border border-white/5 rounded-lg p-2.5 text-xs flex flex-col space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className={`font-semibold font-mono px-1.5 py-0.5 rounded text-[9px] ${
                    log.status === 'Success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                      : 'bg-red-500/10 text-red-400 border border-red-500/10'
                  }`}>
                    {log.status.toUpperCase()}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString('en-US')}
                  </span>
                </div>
                <div className="text-slate-300 font-medium truncate">{log.action}</div>
                <p className="text-[10px] text-slate-400 line-clamp-1">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
