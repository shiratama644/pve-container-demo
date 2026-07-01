'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Cpu,
  Terminal,
  ShieldCheck,
  FileCode,
  Logs,
  LogOut,
  Menu,
  X,
  RefreshCw,
  Server,
  Activity,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Guests (LXC/KVM)', path: '/admin/guests', icon: Cpu },
  { name: 'PM2 Apps', path: '/admin/apps', icon: FileCode },
  { name: 'Log Viewer', path: '/admin/logs', icon: Logs },
  { name: 'Remote Terminal', path: '/admin/terminal', icon: Terminal },
  { name: 'Security & FW', path: '/admin/security', icon: ShieldCheck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isPasswordAuthenticated, resetAllData, guests } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prefetch all routes immediately on render to make transitions instant
  React.useEffect(() => {
    if (isPasswordAuthenticated) {
      NAV_ITEMS.forEach((item) => {
        router.prefetch(item.path);
      });
    }
  }, [isPasswordAuthenticated, router]);

  // Quick count of active guests
  const runningGuestsCount = guests.filter((g) => g.status === 'running').length;
  const totalGuestsCount = guests.length;

  // If we are on login screen, just render the child directly (no sidebar)
  const isLoginPage = pathname === '/admin/g-login' || pathname === '/admin/two-login';

  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-950">{children}</div>;
  }

  // Prevent flash of admin layout when unauthenticated
  if (!isPasswordAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/20"></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-purple-400 animate-spin"></div>
          </div>
          <p className="text-slate-400 font-mono text-xs tracking-widest animate-pulse">SECURE LOCK ACTIVE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-slate-950 flex overflow-hidden">
      {/* Dynamic ambient background glow */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* --- DESKTOP SIDEBAR --- */}
      <aside
        style={{ WebkitBackdropFilter: 'blur(24px)', backdropFilter: 'blur(24px)' }}
        className="hidden lg:flex flex-col w-64 bg-slate-900/40 border-r border-white/10 p-5 flex-shrink-0 relative"
      >
        {/* Core title */}
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="flex items-center justify-center w-10 h-10 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Server className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100 text-sm tracking-wide">PVE-PORTAL</h2>
            <div className="flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">CLUSTER LIVE</span>
            </div>
          </div>
        </div>

        {/* Quick status mini-widget */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 mb-6 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-slate-500">LXC/KVM STATUS:</span>
            <span className="text-emerald-400 font-semibold">{runningGuestsCount} / {totalGuestsCount} RUNNING</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
            <div
              className="bg-cyan-500 h-full transition-all duration-500"
              style={{ width: `${totalGuestsCount > 0 ? (runningGuestsCount / totalGuestsCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5">
          <span className="block px-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">SYSTEM CONSOLES</span>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                prefetch={true}
                id={`nav-link-${item.path.split('/').pop()}`}
              >
                <div
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Control buttons & metadata footer */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset the demo environment data to defaults?')) {
                resetAllData();
              }
            }}
            id="reset-demo-btn"
            className="w-full text-left px-3 py-2 rounded-xl text-slate-400 hover:text-yellow-300 hover:bg-yellow-500/5 border border-transparent hover:border-yellow-500/10 transition-all text-xs flex items-center space-x-3 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo Environment</span>
          </button>

          <button
            onClick={logout}
            id="sidebar-logout-btn"
            className="w-full text-left px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all text-xs flex items-center space-x-3 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>

          <div className="text-center pt-2">
            <span className="text-[10px] font-mono text-slate-600 block">PROXMOX SECURE AGENT</span>
          </div>
        </div>
      </aside>

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* TOP SYSTEM BAR */}
        <header
          style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' }}
          className="bg-slate-950/80 border-b border-white/10 px-4 lg:px-8 py-4 flex items-center justify-between z-10 shrink-0"
        >
          <div className="flex items-center space-x-3">
            {/* Current route title breadcrumb */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">PVE-CLUSTER</span>
              <span className="text-xs font-mono text-slate-500 hidden sm:inline">/</span>
              <span className="text-sm font-medium text-slate-200">
                {NAV_ITEMS.find((n) => n.path === pathname)?.name || 'System Settings'}
              </span>
            </div>
          </div>

          {/* Quick cluster status widgets */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4 bg-white/[0.02] border border-white/5 py-1.5 px-3 rounded-xl">
              <div className="flex items-center space-x-1.5 text-xs font-mono">
                <span className="text-slate-500">CLUSTER COMPL:</span>
                <span className="text-cyan-400">100% HEALTH</span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center space-x-1.5 text-xs font-mono">
                <span className="text-slate-500">UPTIME:</span>
                <span className="text-slate-300">45d 2h</span>
              </div>
            </div>

            {/* User credentials profile banner */}
            <div className="flex items-center space-x-2.5">
              <div className="text-right hidden xs:block">
                <span className="text-xs font-medium text-slate-300 block">PVE Admin</span>
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Root-Privileged</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border border-white/20 flex items-center justify-center text-xs font-bold text-slate-100 shadow-md">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA WITH GLASS BLOCKS */}
        <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8 overflow-y-auto relative">
          {children}
        </main>
      </div>

      {/* --- MOBILE BOTTOM ACTION BAR --- */}
      <nav
        style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' }}
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 border-t border-white/10 grid grid-cols-6 items-center justify-items-center z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          const shortName = item.name === 'Dashboard' ? 'Dash'
                          : item.name === 'Guests (LXC/KVM)' ? 'Guests'
                          : item.name === 'PM2 Apps' ? 'Apps'
                          : item.name === 'Log Viewer' ? 'Logs'
                          : item.name === 'Remote Terminal' ? 'Terminal'
                          : 'Security';
          return (
            <Link
              key={item.path}
              href={item.path}
              prefetch={true}
              className={`w-full h-full flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200 hover:text-cyan-400 ${
                isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 active:text-cyan-300'
              }`}
              id={`mobile-nav-link-${item.path.split('/').pop()}`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-sans tracking-tight font-medium whitespace-nowrap">{shortName}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
