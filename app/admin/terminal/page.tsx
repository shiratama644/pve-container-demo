'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/lib/auth-context';
import {
  Terminal as TerminalIcon,
  Play,
  Monitor,
  HelpCircle,
  Cpu,
  RefreshCw,
} from 'lucide-react';

interface CommandLine {
  prompt: string;
  command: string;
  response: string;
}

export default function TerminalPage() {
  const { guests } = useAuth();

  // Selected connection target
  const [target, setTarget] = useState<string>('Host');
  const [commandHistory, setCommandHistory] = useState<CommandLine[]>([
    {
      prompt: 'pve-node-main:~#',
      command: '',
      response: 'Welcome to Proxmox VE SSH Console. Type "help" to list available admin commands.',
    },
  ]);

  const [currentBuffer, setCurrentBuffer] = useState<string>('');
  const [pastCommands, setPastCommands] = useState<string[]>([]);
  const [pastCommandIndex, setPastCommandIndex] = useState<number>(-1);
  const [isFocused, setIsFocused] = useState<boolean>(true);

  const terminalScrollRef = useRef<HTMLDivElement | null>(null);
  const terminalInputRef = useRef<HTMLInputElement | null>(null);

  // Sync scroll on command output additions
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTo({
        top: terminalScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [commandHistory]);

  // Focus terminal input when clicking the terminal container
  const handleTerminalClick = () => {
    if (terminalInputRef.current) {
      terminalInputRef.current.focus();
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmdClean = currentBuffer.trim();

    if (!cmdClean) {
      // Empty enter
      setCommandHistory((prev) => [
        ...prev,
        {
          prompt: getPromptSymbol(),
          command: '',
          response: '',
        },
      ]);
      return;
    }

    // Process command response
    const response = processCommand(cmdClean);

    setCommandHistory((prev) => [
      ...prev,
      {
        prompt: getPromptSymbol(),
        command: cmdClean,
        response,
      },
    ]);

    // Save to command history list
    const updatedPast = [...pastCommands, cmdClean];
    setPastCommands(updatedPast);
    setPastCommandIndex(-1); // Reset index
    setCurrentBuffer('');
  };

  const getPromptSymbol = () => {
    if (target === 'Host') {
      return 'root@pve-node-main:~#';
    } else {
      const gName = guests.find((g) => g.id.toString() === target)?.name || 'guest';
      return `root@${gName}:~#`;
    }
  };

  // Up/Down arrows command retrieval key handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (pastCommands.length === 0) return;

      const nextIndex = pastCommandIndex === -1 ? pastCommands.length - 1 : Math.max(0, pastCommandIndex - 1);
      setPastCommandIndex(nextIndex);
      setCurrentBuffer(pastCommands[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (pastCommands.length === 0 || pastCommandIndex === -1) return;

      const nextIndex = pastCommandIndex + 1;
      if (nextIndex >= pastCommands.length) {
        setPastCommandIndex(-1);
        setCurrentBuffer('');
      } else {
        setPastCommandIndex(nextIndex);
        setCurrentBuffer(pastCommands[nextIndex]);
      }
    }
  };

  const processCommand = (cmd: string): string => {
    const parts = cmd.toLowerCase().split(' ');
    const baseCmd = parts[0];

    switch (baseCmd) {
      case 'help':
        return `Available system commands:
  help        - This command panel
  ls          - List directory content
  pwd         - Print working directory
  uptime      - Show host node runtime uptime
  pveversion  - Display Proxmox cluster manager version
  pct list    - List LXC virtual containers status
  qm list     - List KVM virtual machines status
  neofetch    - Show gorgeous hardware & OS diagnostic metrics
  clear       - Clear active terminal buffer`;

      case 'ls':
        return `total 24K
drwx------ 2 root root 4.0K Jun 30 20:41 .
drwxr-xr-x 3 root root 4.0K Jun 30 18:00 ..
-rw-r--r-- 1 root root  245 Jun 30 15:20 .bashrc
-rw-r--r-- 1 root root  120 Jun 30 12:15 pve-storage.cfg
drwxr-xr-x 2 root root 4.0K Jun 30 12:10 backups
drwxr-xr-x 4 root root 4.0K Jun 29 09:15 templates`;

      case 'pwd':
        return `/root`;

      case 'clear':
        setTimeout(() => {
          setCommandHistory([]);
        }, 10);
        return '';

      case 'pveversion':
        return `pve-manager/8.1.3/b43aac28 (running kernel: 6.5.11-7-pve)`;

      case 'uptime':
        return ` ${new Date().toLocaleTimeString('ja-JP')} up 45 days,  2:12,  1 user,  load average: 0.14, 0.42, 0.38`;

      case 'pct':
        if (parts[1] === 'list') {
          return `VMID      Status     Type      IP               Name
100       running    lxc       192.168.10.100   web-app-01
102       running    lxc       192.168.10.102   nginx-proxy
103       running    lxc       192.168.10.103   redis-cache
106       running    lxc       192.168.10.106   grafana-metrics
107       stopped    lxc       192.168.10.107   backups-s3`;
        }
        return `pct - Proxmox Container Tool. Usage: pct list`;

      case 'qm':
        if (parts[1] === 'list') {
          return `VMID      Name                 Status     MEM(MB)    BOOTDISK(GB) PID
101       postgres-db          running    8192       100.00       23120
104       worker-node-01       stopped    8192       80.00        0
105       docker-host-01       running    12288      150.00       23199`;
        }
        return `qm - Qemu Server Virtual Machine Tool. Usage: qm list`;

      case 'neofetch':
        return `       _.._        root@pve-node-main
     .' .-'  \`.     ------------------
    / .'       \\    OS: Proxmox Virtual Environment 8.1
   | /          |   Kernel: 6.5.11-7-pve
   | |          |   Uptime: 45 days, 2 hours
   | \\          |   Shell: bash 5.2.15
    \\ \`.       /    CPU: AMD EPYC 7502 (32) @ 3.35GHz
     \`. \`-._.-'     Memory: 18.62 GiB / 32.00 GiB (58%)
       \`--\`         Disk: 685.4 GB / 1000.0 GB (68.5%)
                    LAN: Intel X520 Dual Port 10GbE
                    GPU: ASPEED Technology AST2500`;

      default:
        return `-bash: ${parts[0]}: command not found. Type "help" for a list of valid operations.`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Target Selector toolbar */}
      <div
        style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' }}
        className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
      >
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">REMOTE SECURITY ACCESS</span>
          <h2 className="text-lg font-semibold text-slate-200 mt-1">Remote Console (SSH)</h2>
        </div>

        {/* Dropdown Selector wrapped inside a styled container to prevent horizontal overflow */}
        <div className="flex items-center space-x-2.5 bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 w-full md:w-auto min-w-0">
          <Monitor className="w-4.5 h-4.5 text-cyan-400 shrink-0" />
          <select
            value={target}
            onChange={(e) => {
              setTarget(e.target.value);
              setCommandHistory([
                {
                  prompt: e.target.value === 'Host' ? 'pve-node-main:~#' : `root@${guests.find(g => g.id.toString() === e.target.value)?.name}:~#`,
                  command: '',
                  response: `Connection initialized. Connected to target: ${e.target.value === 'Host' ? 'Proxmox Host' : `Virtual Container (${e.target.value})`}.`,
                },
              ]);
            }}
            className="bg-transparent border-0 text-slate-300 text-xs focus:outline-none cursor-pointer font-bold font-mono w-full md:w-auto max-w-full min-w-0 truncate"
            id="terminal-target-selector"
          >
            <option value="Host">Proxmox VE Physical Host (pve-node-main)</option>
            {guests.filter(g=>g.status === 'running').map((guest) => (
              <option key={guest.id} value={guest.id}>
                {guest.name} LXC/KVM (ID: {guest.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive terminal frame */}
      <div
        onClick={handleTerminalClick}
        className="bg-slate-950 border border-white/10 rounded-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] cursor-text flex flex-col h-[520px] font-mono text-[11px] text-emerald-400 overflow-hidden"
      >
        {/* Top Control strip */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4 text-slate-500 select-none">
          <div className="flex items-center space-x-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[10px] pl-2 font-semibold">secure-session@{target === 'Host' ? 'pve' : `vm-${target}`}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[10px]">
            <TerminalIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>9600-8N1 ENCRYPTED</span>
          </div>
        </div>

        {/* Scrollable outputs */}
        <div
          ref={terminalScrollRef}
          className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-slate-100 selection:bg-cyan-500/30"
        >
          {commandHistory.map((block, idx) => (
            <div key={idx} className="space-y-1.5">
              {block.command !== '' && (
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">{block.prompt}</span>
                  <span className="text-slate-100 font-semibold">{block.command}</span>
                </div>
              )}
              {block.response && (
                <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {block.response}
                </pre>
              )}
            </div>
          ))}
        </div>

        {/* Active command line */}
        <form onSubmit={handleCommandSubmit} className="flex items-center space-x-2 pt-2 border-t border-white/5 mt-4">
          <span className="text-emerald-400 font-bold select-none">{getPromptSymbol()}</span>
          <div className="flex-1 relative flex items-center">
            <input
              ref={terminalInputRef}
              type="text"
              autoFocus
              id="terminal-input"
              value={currentBuffer}
              onChange={(e) => setCurrentBuffer(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full bg-transparent border-none text-slate-100 focus:outline-none caret-transparent font-semibold"
              autoComplete="off"
            />
            {/* Custom blinking visual caret */}
            <div
              className="absolute pointer-events-none h-3.5 w-2 bg-emerald-400 animate-pulse"
              style={{
                left: `${currentBuffer.length * 6.5 + 2}px`,
                display: isFocused ? 'block' : 'none',
              }}
            />
          </div>
        </form>
      </div>

      {/* Helpful command tips row */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-start space-x-3 text-xs text-slate-400 leading-relaxed">
        <HelpCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-300">Useful Commands for Verification & Demo</span>
          <p>
            Full keyboard input is supported. Click inside the terminal and type <code className="bg-slate-950 px-1 py-0.5 text-cyan-400 font-mono rounded">neofetch</code>, <code className="bg-slate-950 px-1 py-0.5 text-cyan-400 font-mono rounded">pct list</code>, <code className="bg-slate-950 px-1 py-0.5 text-cyan-400 font-mono rounded">qm list</code>, or <code className="bg-slate-950 px-1 py-0.5 text-cyan-400 font-mono rounded">help</code>, then press Enter.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
