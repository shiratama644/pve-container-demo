'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/auth-context';
import { Guest } from '@/lib/mock-data';
import {
  Play,
  Square,
  RefreshCw,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  ServerCrash,
  X,
  CheckCircle2,
} from 'lucide-react';

export default function GuestsPage() {
  const { guests, startGuest, stopGuest, restartGuest } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'LXC' | 'KVM'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'running' | 'stopped'>('ALL');

  // Loading states for individual guest action simulations
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

  // Dynamic Dialog/Modal states for confirmation
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    guest: Guest | null;
    actionType: 'stop' | 'restart' | null;
  }>({
    isOpen: false,
    guest: null,
    actionType: null,
  });

  const handleAction = async (id: number, action: 'start' | 'stop' | 'restart') => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));

    // Simulate asynchronous SSH cluster queue delay (800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (action === 'start') {
      startGuest(id);
    } else if (action === 'stop') {
      stopGuest(id);
    } else if (action === 'restart') {
      restartGuest(id);
    }

    setActionLoading((prev) => ({ ...prev, [id]: false }));
  };

  const openConfirmModal = (guest: Guest, actionType: 'stop' | 'restart') => {
    setConfirmModal({
      isOpen: true,
      guest,
      actionType,
    });
  };

  const executeConfirmedAction = () => {
    if (confirmModal.guest && confirmModal.actionType) {
      handleAction(confirmModal.guest.id, confirmModal.actionType);
    }
    setConfirmModal({ isOpen: false, guest: null, actionType: null });
  };

  // Filter guests based on search and filters
  const filteredGuests = guests.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.ip.includes(searchQuery) || g.id.toString().includes(searchQuery);
    const matchesType = typeFilter === 'ALL' || g.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || g.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Search and Filters Strip */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by instance name, ID, or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/10 transition-all font-mono"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-slate-950/60 border border-white/10 text-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500/70"
            >
              <option value="ALL">All (LXC / KVM)</option>
              <option value="LXC">LXC Container</option>
              <option value="KVM">KVM Virtual Machine</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950/60 border border-white/10 text-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500/70"
          >
            <option value="ALL">All Statuses</option>
            <option value="running">Running (ONLINE)</option>
            <option value="stopped">Stopped (OFFLINE)</option>
          </select>
        </div>
      </div>

      {/* Guest instances table */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.01] text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                <th className="py-4 px-5">ID</th>
                <th className="py-4 px-4">Name / Type</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">IP Address</th>
                <th className="py-4 px-4">CPU Usage</th>
                <th className="py-4 px-4">Memory</th>
                <th className="py-4 px-4">Disk Space</th>
                <th className="py-4 px-4">Uptime</th>
                <th className="py-4 px-5 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ServerCrash className="w-8 h-8 text-slate-600 animate-pulse" />
                      <span>No virtual instances matched your search queries.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => {
                  const isRunning = guest.status === 'running';
                  const isLoading = actionLoading[guest.id];

                  // CPU Meter colors
                  const cpuColor = guest.cpu > 80 ? 'bg-red-500' : guest.cpu > 50 ? 'bg-yellow-500' : 'bg-cyan-500';
                  // Memory usage ratio
                  const memPercent = guest.memoryMax > 0 ? (guest.memoryUsed / guest.memoryMax) * 100 : 0;
                  const memColor = memPercent > 80 ? 'bg-red-500' : memPercent > 50 ? 'bg-yellow-500' : 'bg-purple-500';
                  // Disk ratio
                  const diskPercent = guest.diskMax > 0 ? (guest.diskUsed / guest.diskMax) * 100 : 0;

                  return (
                    <tr
                      key={guest.id}
                      className="hover:bg-white/[0.01] transition-colors duration-150 group"
                    >
                      {/* ID */}
                      <td className="py-3.5 px-5 font-bold text-slate-400">{guest.id}</td>

                      {/* Name & Type */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{guest.name}</div>
                        <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded mt-1 font-mono uppercase font-bold tracking-wider ${
                          guest.type === 'KVM'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                        }`}>
                          {guest.type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className={`h-2 w-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                          <span className={`font-semibold uppercase tracking-wider text-[10px] ${isRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {isRunning ? 'RUNNING' : 'STOPPED'}
                          </span>
                        </div>
                      </td>

                      {/* IP */}
                      <td className="py-3.5 px-4 text-slate-300 text-[11px]">{guest.ip}</td>

                      {/* CPU Usage Meter */}
                      <td className="py-3.5 px-4 min-w-[120px]">
                        {isRunning ? (
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-300">{guest.cpu}%</div>
                            <div className="w-20 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full ${cpuColor}`} style={{ width: `${guest.cpu}%` }} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Memory Usage Meter */}
                      <td className="py-3.5 px-4 min-w-[120px]">
                        {isRunning ? (
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-300">
                              {guest.memoryUsed.toFixed(1)}GB / {guest.memoryMax.toFixed(1)}GB
                            </div>
                            <div className="w-20 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full ${memColor}`} style={{ width: `${memPercent}%` }} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Disk usage */}
                      <td className="py-3.5 px-4 text-[11px]">
                        <div className="text-slate-300">{guest.diskUsed.toFixed(0)}GB / {guest.diskMax.toFixed(0)}GB</div>
                        <div className="text-[10px] text-slate-500">({diskPercent.toFixed(1)}% used)</div>
                      </td>

                      {/* Uptime */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">{guest.uptime}</td>

                      {/* Controls */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isLoading ? (
                            <div className="p-1 px-3 bg-cyan-500/10 rounded-lg text-cyan-400 font-bold text-[10px] animate-pulse">
                              QUEUEING...
                            </div>
                          ) : isRunning ? (
                            <>
                              <button
                                onClick={() => openConfirmModal(guest, 'restart')}
                                className="p-1.5 bg-slate-800 hover:bg-yellow-500/10 text-slate-400 hover:text-yellow-400 border border-white/5 rounded-lg cursor-pointer transition-all"
                                title="Warm Reboot"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openConfirmModal(guest, 'stop')}
                                className="p-1.5 bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/5 rounded-lg cursor-pointer transition-all"
                                title="ACPI Shutdown"
                              >
                                <Square className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleAction(guest.id, 'start')}
                              className="py-1 px-3 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-lg text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1.5 cursor-pointer transition-all text-[11px]"
                              title="Start Virtual Container"
                            >
                              <Play className="w-3 h-3 fill-emerald-400" />
                              <span>Start</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {confirmModal.isOpen && confirmModal.guest && (
          <>
            {/* Modal overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal({ isOpen: false, guest: null, actionType: null })}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
            />

            {/* Modal card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="fixed inset-0 m-auto w-full max-w-md h-fit bg-slate-900 border border-white/10 p-6 rounded-2xl z-50 shadow-[0_25px_50px_rgba(0,0,0,0.6)] space-y-5"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-xl ${confirmModal.actionType === 'stop' ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
                    <AlertTriangle className={`w-5 h-5 ${confirmModal.actionType === 'stop' ? 'text-red-400' : 'text-yellow-400'}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    {confirmModal.actionType === 'stop' ? 'Confirm ACPI Shutdown' : 'Confirm Warm Reboot'}
                  </h3>
                </div>
                <button
                  onClick={() => setConfirmModal({ isOpen: false, guest: null, actionType: null })}
                  className="text-slate-400 hover:text-slate-100 p-1 border border-white/5 rounded-md bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-400 leading-relaxed space-y-2">
                <p>
                  Target Instance: <strong className="text-slate-200">{confirmModal.guest.name} (ID: {confirmModal.guest.id})</strong>
                </p>
                {confirmModal.actionType === 'stop' ? (
                  <p>
                    Sending a stop signal will immediately terminate running apps and release host shared memory. Please ensure no database updates are pending to prevent corruption.
                  </p>
                ) : (
                  <p>
                    Executing a reboot will restart the guest OS, briefly disconnecting network interfaces. PM2 and startup processes are configured to automatically resume.
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, guest: null, actionType: null })}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeConfirmedAction}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold text-slate-100 transition-all cursor-pointer ${
                    confirmModal.actionType === 'stop'
                      ? 'bg-red-600 hover:bg-red-500'
                      : 'bg-yellow-600 hover:bg-yellow-500'
                  }`}
                >
                  Execute
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
