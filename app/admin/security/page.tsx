'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/auth-context';
import { AuditLog, FirewallBlock, PackageUpdate } from '@/lib/mock-data';
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  Trash2,
  Lock,
  Globe,
  Terminal,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertOctagon,
  ChevronRight,
} from 'lucide-react';

type SecurityTab = 'ACCESS_LOG' | 'FIREWALL' | 'UPDATES';

export default function SecurityPage() {
  const {
    auditLogs,
    firewallBlocks,
    packageUpdates,
    addFirewallBlock,
    removeFirewallBlock,
    upgradePackages,
    addCustomAuditLog,
    guests,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<SecurityTab>('ACCESS_LOG');

  // ACCESS LOG STATES
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'ALL' | 'Success' | 'Failed'>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.ip.includes(logSearch) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase());
    const matchesFilter = logFilter === 'ALL' || log.status === logFilter;
    return matchesSearch && matchesFilter;
  });

  // FIREWALL FORM STATES
  const [fwIp, setFwIp] = useState('');
  const [fwMemo, setFwMemo] = useState('');
  const [fwError, setFwError] = useState('');
  const [fwSuccess, setFwSuccess] = useState(false);

  const handleAddFwRule = (e: React.FormEvent) => {
    e.preventDefault();
    setFwError('');
    setFwSuccess(false);

    const success = addFirewallBlock(fwIp, fwMemo);
    if (success) {
      setFwIp('');
      setFwMemo('');
      setFwSuccess(true);
      setTimeout(() => setFwSuccess(false), 3000);
    } else {
      setFwError('Please enter a valid IPv4 address (e.g., 203.0.113.88)');
    }
  };

  const handleBlockIpFromLogs = (ip: string, actionName: string) => {
    const memo = `Emergency Block: Detected Access Log Action "${actionName}"`;
    const success = addFirewallBlock(ip, memo);
    if (success) {
      alert(`IP ${ip} has been registered to the firewall restriction list.`);
    } else {
      alert(`IP ${ip} is already added or has an invalid format.`);
    }
  };

  // PACKAGE UPDATES STATES
  const [updateTarget, setUpdateTarget] = useState<string>('Host');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updateLogs, setUpdateLogs] = useState<string[]>([]);

  const filteredPackages = packageUpdates.filter((pkg) => {
    if (updateTarget === 'Host') {
      return pkg.target.startsWith('Host');
    } else {
      return pkg.target.includes(`ID: ${updateTarget}`);
    }
  });

  const handleRefreshUpdates = () => {
    setIsRefreshing(true);
    addCustomAuditLog('Fetch Package Updates (apt-get update)', 'Success', 'Repository synchronization started for host and LXC containers.');

    setTimeout(() => {
      setIsRefreshing(false);
      alert('Repository synchronization completed. Package update index is already up-to-date.');
    }, 1200);
  };

  const handleUpgradeTarget = async () => {
    setIsUpdating(true);
    setUpdateLogs([`Connecting to package server...`]);

    const targetLabel = updateTarget === 'Host' ? 'Host' : updateTarget;

    // Simulate apt terminal logs output over small timespans
    const finalLogs = await upgradePackages(targetLabel);

    // Stream lines onto terminal container
    for (let i = 0; i < finalLogs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setUpdateLogs((prev) => [...prev, finalLogs[i]]);
    }

    setIsUpdating(false);
  };

  const tabs: { id: SecurityTab; name: string; icon: any }[] = [
    { id: 'ACCESS_LOG', name: 'Access Logs', icon: Globe },
    { id: 'FIREWALL', name: 'Firewall (UFW)', icon: ShieldAlert },
    { id: 'UPDATES', name: 'Package Updates', icon: RefreshCw },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Tab bar selector */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setUpdateLogs([]);
              }}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold cursor-pointer border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-cyan-500 text-cyan-300 bg-white/[0.01]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.005]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* --- TAB VIEW AREA --- */}
      <AnimatePresence mode="wait">
        {activeTab === 'ACCESS_LOG' && (
          <motion.div
            key="access-log-tab"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="space-y-4"
          >
            {/* Search and filter toolbar */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative flex-1 w-full max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by IP, action, or log details..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as any)}
                className="bg-slate-950 border border-white/10 text-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
              >
                <option value="ALL">All Events</option>
                <option value="Success">Success Events Only</option>
                <option value="Failed">Failed & Warning Events Only</option>
              </select>
            </div>

            {/* Access logs list table */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.01] text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-4">Timestamp</th>
                      <th className="py-4 px-4">Source IP / Location</th>
                      <th className="py-4 px-4">Action</th>
                      <th className="py-4 px-4">Log Details</th>
                      <th className="py-4 px-5 text-right">Security Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          No matching access logs found.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => {
                        const isFailed = log.status === 'Failed';
                        return (
                          <tr
                            key={log.id}
                            className={`transition-colors duration-150 ${
                              isFailed ? 'bg-red-500/[0.02] hover:bg-red-500/[0.04]' : 'hover:bg-white/[0.01]'
                            }`}
                          >
                            {/* Status */}
                            <td className="py-3 px-5">
                              <span className={`inline-block font-bold tracking-wider text-[9px] px-2 py-0.5 rounded-full ${
                                isFailed
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/15 animate-pulse'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                              }`}>
                                {log.status.toUpperCase()}
                              </span>
                            </td>

                            {/* Timestamp */}
                            <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString('en-US')}
                            </td>

                            {/* IP / Location */}
                            <td className="py-3 px-4">
                              <a
                                href={`https://ipinfo.io/${log.ip}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:underline flex items-center space-x-1"
                                title="Lookup Geo-IP Information"
                              >
                                <span>{log.ip}</span>
                              </a>
                              <span className="text-[10px] text-slate-500 block">{log.location}</span>
                            </td>

                            {/* Action */}
                            <td className="py-3 px-4 font-semibold text-slate-200">{log.action}</td>

                            {/* Details */}
                            <td className="py-3 px-4 text-slate-400 text-[11px] max-w-sm whitespace-pre-wrap">{log.details}</td>

                            {/* Control button */}
                            <td className="py-3 px-5 text-right">
                              {isFailed ? (
                                <button
                                  onClick={() => handleBlockIpFromLogs(log.ip, log.action)}
                                  className="py-1 px-2.5 border border-red-500/20 hover:border-red-500/40 bg-red-500/10 hover:bg-red-500/15 text-red-300 hover:text-red-200 rounded-lg font-bold text-[10px] tracking-wider uppercase cursor-pointer transition-all"
                                >
                                  Block this IP
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-600 font-semibold uppercase">SECURE PASS</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'FIREWALL' && (
          <motion.div
            key="firewall-tab"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-6"
          >
            {/* Left side: Add Block Rule form */}
            <div className="xl:col-span-4 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-fit shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="flex items-center space-x-2.5 mb-5">
                <Lock className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-semibold text-slate-200">Register New Block Rule (UFW)</h3>
              </div>

              <form onSubmit={handleAddFwRule} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Target IPv4 Address</label>
                  <input
                    type="text"
                    required
                    value={fwIp}
                    onChange={(e) => setFwIp(e.target.value)}
                    placeholder="e.g., 198.51.100.42"
                    className="w-full pl-3 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500/50 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Reason / Memo</label>
                  <input
                    type="text"
                    required
                    value={fwMemo}
                    onChange={(e) => setFwMemo(e.target.value)}
                    placeholder="e.g., Brute force attack mitigation"
                    className="w-full pl-3 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500/50"
                  />
                </div>

                {fwError && <p className="text-[11px] text-red-400 font-mono font-medium">{fwError}</p>}
                {fwSuccess && (
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Firewall rule successfully registered.</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-xl text-xs font-bold text-slate-100 bg-red-600 hover:bg-red-500 transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-[0_4px_15px_rgba(220,38,38,0.2)]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Block</span>
                </button>
              </form>
            </div>

            {/* Right side: firewall blocked rules table */}
            <div className="xl:col-span-8 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Active Firewall Block Rules</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">UFW FIREWALL STATUS: ACTIVE</p>
                </div>
                <div className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.01] text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-3">IP Address</th>
                      <th className="py-3 px-3">Block Reason / Memo</th>
                      <th className="py-3 px-3">Registered At</th>
                      <th className="py-3 px-3 text-right">Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {firewallBlocks.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-500">
                          No firewall block rules currently configured.
                        </td>
                      </tr>
                    ) : (
                      firewallBlocks.map((block) => (
                        <tr key={block.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-200">{block.ip}</td>
                          <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate">{block.memo}</td>
                          <td className="py-3 px-3 text-slate-500 text-[10px]">
                            {new Date(block.addedAt).toLocaleString('en-US')}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => removeFirewallBlock(block.id)}
                              className="p-1.5 bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/5 rounded-lg transition-all cursor-pointer"
                              title="Remove Block Rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'UPDATES' && (
          <motion.div
            key="updates-tab"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-6"
          >
            {/* Left Column: Target Selector & update action controls */}
            <div className="xl:col-span-4 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-fit shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Target Node / Guest</label>
                <select
                  value={updateTarget}
                  disabled={isUpdating}
                  onChange={(e) => {
                    setUpdateTarget(e.target.value);
                    setUpdateLogs([]);
                  }}
                  className="w-full bg-slate-950 border border-white/10 text-slate-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer font-bold font-mono"
                >
                  <option value="Host">Host (Proxmox-Node)</option>
                  {guests.filter((g) => g.status === 'running').map((guest) => (
                    <option key={guest.id} value={guest.id}>
                      {guest.name} (ID: {guest.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="h-px bg-white/5" />

              <div className="space-y-3">
                <button
                  onClick={handleRefreshUpdates}
                  disabled={isRefreshing || isUpdating}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-white/15 bg-white/[0.01] hover:bg-white/[0.04] text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-30"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Fetching...' : 'Fetch Latest Updates'}</span>
                </button>

                <button
                  onClick={handleUpgradeTarget}
                  disabled={isUpdating || isRefreshing || filteredPackages.length === 0}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-100 bg-cyan-600 hover:bg-cyan-500 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(6,182,212,0.15)]"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Upgrade All Packages</span>
                </button>
              </div>
            </div>

            {/* Right Column: Packages lists + simulated command progress line */}
            <div className="xl:col-span-8 space-y-6">
              {/* If we are actively upgrading, display CLI logs stream container */}
              {updateLogs.length > 0 && (
                <div className="bg-slate-950 border border-white/10 p-5 rounded-2xl font-mono text-[10px] text-slate-300 space-y-1.5 h-[200px] overflow-y-auto shadow-inner flex flex-col">
                  <div className="flex items-center space-x-1.5 pb-2 border-b border-white/5 mb-2 text-slate-500">
                    <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>root@pve-node-main: apt-get dist-upgrade -y</span>
                  </div>
                  <div className="flex-1 space-y-1 overflow-y-auto">
                    {updateLogs.map((logLine, idx) => (
                      <div key={idx} className={`${logLine.startsWith('  ') ? 'text-slate-400' : 'text-cyan-400'}`}>
                        {logLine}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Package update lists */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-200">Upgradable Packages</h3>
                  <span className="text-[10px] font-mono text-slate-500">Total: {filteredPackages.length} packages</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.01] text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-2">Package Name</th>
                        <th className="py-3 px-2">Current Version</th>
                        <th className="py-3 px-2">New Version</th>
                        <th className="py-3 px-2 text-right">Attribute</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {filteredPackages.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-500">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <ShieldCheck className="w-8 h-8 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">All packages on this node are completely up-to-date.</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredPackages.map((pkg) => (
                          <tr key={pkg.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3 px-2 font-semibold text-slate-200 flex items-center space-x-1.5">
                              {pkg.isSecurity && <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-pulse" />}
                              <span>{pkg.name}</span>
                            </td>
                            <td className="py-3 px-2 text-slate-500 text-[11px]">{pkg.currentVersion}</td>
                            <td className="py-3 px-2 text-slate-300 text-[11px]">{pkg.newVersion}</td>
                            <td className="py-3 px-2 text-right">
                              <span className={`inline-block text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded ${
                                pkg.isSecurity
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/15'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}>
                                {pkg.isSecurity ? 'SECURITY' : 'RELEASE'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
