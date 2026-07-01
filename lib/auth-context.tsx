'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Guest,
  PM2Process,
  AuditLog,
  FirewallBlock,
  PackageUpdate,
  INITIAL_GUESTS,
  INITIAL_PM2_PROCESSES,
  INITIAL_AUDIT_LOGS,
  INITIAL_FIREWALL_BLOCKS,
  INITIAL_PACKAGE_UPDATES,
} from './mock-data';

interface AuthContextType {
  // Authentication
  isGoogleAuthenticated: boolean;
  isPasswordAuthenticated: boolean;
  loginError: string | null;
  authenticateGoogle: () => void;
  authenticatePassword: (password: string) => boolean;
  logout: () => void;

  // PVE Global Mock States
  guests: Guest[];
  pm2Processes: Record<number, PM2Process[]>;
  auditLogs: AuditLog[];
  firewallBlocks: FirewallBlock[];
  packageUpdates: PackageUpdate[];

  // Mutator Actions
  startGuest: (id: number) => void;
  stopGuest: (id: number) => void;
  restartGuest: (id: number) => void;
  restartPM2Process: (guestId: number, processId: number) => void;
  stopPM2Process: (guestId: number, processId: number) => void;
  startPM2Process: (guestId: number, processId: number) => void;
  addFirewallBlock: (ip: string, memo: string) => boolean;
  removeFirewallBlock: (id: string) => void;
  upgradePackages: (target: string) => Promise<string[]>; // Returns log stream
  addCustomAuditLog: (action: string, status: 'Success' | 'Failed', details: string, ip?: string) => void;
  resetAllData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Authentication State
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pve_google_auth') === 'true';
    }
    return false;
  });
  const [isPasswordAuthenticated, setIsPasswordAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pve_password_auth') === 'true';
    }
    return false;
  });
  const [loginError, setLoginError] = useState<string | null>(null);

  // PVE State
  const [guests, setGuests] = useState<Guest[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pve_guests');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (_) {
          return INITIAL_GUESTS;
        }
      }
    }
    return INITIAL_GUESTS;
  });
  const [pm2Processes, setPm2Processes] = useState<Record<number, PM2Process[]>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pve_pm2');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (_) {
          return INITIAL_PM2_PROCESSES;
        }
      }
    }
    return INITIAL_PM2_PROCESSES;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pve_logs');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (_) {
          return INITIAL_AUDIT_LOGS;
        }
      }
    }
    return INITIAL_AUDIT_LOGS;
  });
  const [firewallBlocks, setFirewallBlocks] = useState<FirewallBlock[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pve_fw');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (_) {
          return INITIAL_FIREWALL_BLOCKS;
        }
      }
    }
    return INITIAL_FIREWALL_BLOCKS;
  });
  const [packageUpdates, setPackageUpdates] = useState<PackageUpdate[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pve_pkgs');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (_) {
          return INITIAL_PACKAGE_UPDATES;
        }
      }
    }
    return INITIAL_PACKAGE_UPDATES;
  });

  // Sync state helpers to localStorage
  const saveState = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  // Helper to append a dynamic log helper
  const addCustomAuditLog = (
    action: string,
    status: 'Success' | 'Failed',
    details: string,
    customIp?: string
  ) => {
    const defaultIp = '198.51.100.42'; // Simulated admin workstation
    const newLog: AuditLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      ip: customIp || defaultIp,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: customIp ? 'Blocked Vector 📡' : 'Tokyo, JP 🇯🇵',
      action,
      status,
      details,
    };

    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      saveState('pve_logs', updated);
      return updated;
    });
  };

  // Simulate periodic background resource consumption fluctuation for the "real-time" feeling
  useEffect(() => {
    if (!isPasswordAuthenticated) return;

    const interval = setInterval(() => {
      setGuests((prevGuests) => {
        const updated = prevGuests.map((g) => {
          if (g.status === 'stopped') return g;
          // Randomly fluctuate CPU by up to +/- 5% (clamp 1% to 95%)
          const cpuDelta = (Math.random() - 0.5) * 8;
          const newCpu = Math.max(1, Math.min(95, Number((g.cpu + cpuDelta).toFixed(1))));

          // Memory slightly fluctuates +/- 0.05 GB
          const memDelta = (Math.random() - 0.5) * 0.1;
          const newMem = Math.max(0.1, Math.min(g.memoryMax - 0.1, Number((g.memoryUsed + memDelta).toFixed(2))));

          return {
            ...g,
            cpu: newCpu,
            memoryUsed: newMem,
          };
        });
        saveState('pve_guests', updated);
        return updated;
      });

      // Fluctuate PM2 Processes as well
      setPm2Processes((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          const numKey = Number(key);
          next[numKey] = next[numKey].map((p) => {
            if (p.status !== 'online') return p;
            const cpuDelta = (Math.random() - 0.5) * 2;
            const newCpu = Math.max(0, Math.min(80, Number((p.cpu + cpuDelta).toFixed(1))));
            
            // Fluctuate Memory text
            const currentMemNum = parseFloat(p.memory);
            if (!isNaN(currentMemNum)) {
              const memDelta = (Math.random() - 0.5) * 1.5;
              const newMemNum = Math.max(10, currentMemNum + memDelta);
              return {
                ...p,
                cpu: newCpu,
                memory: `${newMemNum.toFixed(1)} MB`,
              };
            }
            return p;
          });
        });
        saveState('pve_pm2', next);
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPasswordAuthenticated]);

  // Auth Redirection Middleware logic in client router
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const publicRoutes = ['/admin/g-login', '/admin/two-login'];
      const isPublic = publicRoutes.includes(pathname);

      if (!isGoogleAuthenticated && pathname.startsWith('/admin') && !isPublic) {
        router.push('/admin/g-login');
      } else if (isGoogleAuthenticated && !isPasswordAuthenticated && pathname === '/admin/dashboard') {
        router.push('/admin/two-login');
      } else if (isGoogleAuthenticated && !isPasswordAuthenticated && pathname.startsWith('/admin') && !isPublic) {
        router.push('/admin/two-login');
      }
    }
  }, [pathname, isGoogleAuthenticated, isPasswordAuthenticated, router]);

  // Google Authentication Trigger
  const authenticateGoogle = () => {
    setIsGoogleAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pve_google_auth', 'true');
    }
    // Record login step
    addCustomAuditLog('Login (Google Stage 1)', 'Success', 'Google OAuth credentials authorized. Account: test-pve-admin@gmail.com');
    router.push('/admin/two-login');
  };

  // Password Authentication Trigger (demo1234)
  const authenticatePassword = (password: string): boolean => {
    if (password === 'demo1234') {
      setIsPasswordAuthenticated(true);
      setLoginError(null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pve_password_auth', 'true');
      }
      addCustomAuditLog('Login (2FA Password)', 'Success', 'Admin portal authentication succeeded.');
      router.push('/admin/dashboard');
      return true;
    } else {
      setLoginError('Incorrect authorization code or password.');
      addCustomAuditLog(
        'Login (2FA Password)',
        'Failed',
        `Authentication rejected due to incorrect password. Entered code: ${password || '(empty)'}`
      );
      return false;
    }
  };

  // Logout Trigger
  const logout = () => {
    setIsGoogleAuthenticated(false);
    setIsPasswordAuthenticated(false);
    setLoginError(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pve_google_auth', 'false');
      localStorage.setItem('pve_password_auth', 'false');
    }
    addCustomAuditLog('Logout', 'Success', 'Administrator session terminated successfully.');
    router.push('/admin/g-login');
  };

  // Start Guest VM/Container
  const startGuest = (id: number) => {
    const target = guests.find((g) => g.id === id);
    if (!target) return;

    setGuests((prev) => {
      const next = prev.map((g) => {
        if (g.id === id) {
          return {
            ...g,
            status: 'running' as const,
            cpu: 1.5,
            memoryUsed: 0.1,
            uptime: '0d 0h 1m',
          };
        }
        return g;
      });
      saveState('pve_guests', next);
      return next;
    });

    // Handle nested PM2 processes if applicable (start all as online for demo consistency)
    setPm2Processes((prev) => {
      const next = { ...prev };
      if (next[id]) {
        next[id] = next[id].map((p) => ({
          ...p,
          status: p.name.includes('spool') || p.name.includes('cert') ? p.status : 'online',
          cpu: p.name.includes('spool') || p.name.includes('cert') ? 0 : 0.5,
          uptime: '0m',
        }));
        saveState('pve_pm2', next);
      }
      return next;
    });

    addCustomAuditLog('LXC/KVM Boot', 'Success', `Started ${target.type} ID ${id} (${target.name}).`);
  };

  // Stop Guest VM/Container
  const stopGuest = (id: number) => {
    const target = guests.find((g) => g.id === id);
    if (!target) return;

    setGuests((prev) => {
      const next = prev.map((g) => {
        if (g.id === id) {
          return {
            ...g,
            status: 'stopped' as const,
            cpu: 0,
            memoryUsed: 0,
            uptime: 'Stopped',
          };
        }
        return g;
      });
      saveState('pve_guests', next);
      return next;
    });

    // Stopped VM means stopped PM2 processes
    setPm2Processes((prev) => {
      const next = { ...prev };
      if (next[id]) {
        next[id] = next[id].map((p) => ({
          ...p,
          status: 'stopped',
          cpu: 0,
          uptime: 'Stopped',
        }));
        saveState('pve_pm2', next);
      }
      return next;
    });

    addCustomAuditLog('LXC/KVM Shutdown', 'Success', `Sent ACPI shutdown signal to ${target.type} ID ${id} (${target.name}).`);
  };

  // Restart Guest VM/Container
  const restartGuest = (id: number) => {
    const target = guests.find((g) => g.id === id);
    if (!target) return;

    setGuests((prev) => {
      const next = prev.map((g) => {
        if (g.id === id) {
          return {
            ...g,
            status: 'running' as const,
            cpu: 45.0, // spike on restart boot
            memoryUsed: 0.8,
            uptime: '0d 0h 0m',
          };
        }
        return g;
      });
      saveState('pve_guests', next);
      return next;
    });

    addCustomAuditLog('LXC/KVM Reboot', 'Success', `Rebooted (warm-reboot) ${target.type} ID ${id} (${target.name}).`);
  };

  // PM2 Process Control: Restart
  const restartPM2Process = (guestId: number, processId: number) => {
    setPm2Processes((prev) => {
      const next = { ...prev };
      if (next[guestId]) {
        next[guestId] = next[guestId].map((p) => {
          if (p.id === processId) {
            return {
              ...p,
              status: 'online',
              cpu: 12.5, // Spike
              uptime: '0s',
            };
          }
          return p;
        });
        saveState('pve_pm2', next);
      }
      return next;
    });

    const guest = guests.find((g) => g.id === guestId);
    const procName = pm2Processes[guestId]?.find((p) => p.id === processId)?.name || 'unknown process';
    addCustomAuditLog(
      'PM2 Process Restart',
      'Success',
      `Restarted PM2 process [${procName}] inside container ID ${guestId} (${guest?.name || 'LXC'}).`
    );
  };

  // PM2 Process Control: Stop
  const stopPM2Process = (guestId: number, processId: number) => {
    setPm2Processes((prev) => {
      const next = { ...prev };
      if (next[guestId]) {
        next[guestId] = next[guestId].map((p) => {
          if (p.id === processId) {
            return {
              ...p,
              status: 'stopped',
              cpu: 0,
              uptime: 'Stopped',
            };
          }
          return p;
        });
        saveState('pve_pm2', next);
      }
      return next;
    });

    const guest = guests.find((g) => g.id === guestId);
    const procName = pm2Processes[guestId]?.find((p) => p.id === processId)?.name || 'unknown process';
    addCustomAuditLog(
      'PM2 Process Stop',
      'Success',
      `Stopped PM2 process [${procName}] inside container ID ${guestId} (${guest?.name || 'LXC'}).`
    );
  };

  // PM2 Process Control: Start
  const startPM2Process = (guestId: number, processId: number) => {
    setPm2Processes((prev) => {
      const next = { ...prev };
      if (next[guestId]) {
        next[guestId] = next[guestId].map((p) => {
          if (p.id === processId) {
            return {
              ...p,
              status: 'online',
              cpu: 2.1,
              uptime: '0s',
            };
          }
          return p;
        });
        saveState('pve_pm2', next);
      }
      return next;
    });

    const guest = guests.find((g) => g.id === guestId);
    const procName = pm2Processes[guestId]?.find((p) => p.id === processId)?.name || 'unknown process';
    addCustomAuditLog(
      'PM2 Process Start',
      'Success',
      `Started PM2 process [${procName}] inside container ID ${guestId} (${guest?.name || 'LXC'}).`
    );
  };

  // Add Firewall Block
  const addFirewallBlock = (ip: string, memo: string): boolean => {
    // Basic IP check
    const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipPattern.test(ip)) {
      return false;
    }

    const newBlock: FirewallBlock = {
      id: `fw-${Math.random().toString(36).substring(2, 7)}`,
      ip,
      memo: memo || 'Manual block rule registration',
      addedAt: new Date().toISOString(),
    };

    setFirewallBlocks((prev) => {
      const next = [newBlock, ...prev];
      saveState('pve_fw', next);
      return next;
    });

    addCustomAuditLog(
      'Firewall Update',
      'Success',
      `Registered block target IP: ${ip} to firewall configuration. Reason: ${memo || 'None'}`
    );
    return true;
  };

  // Remove Firewall Block
  const removeFirewallBlock = (id: string) => {
    const target = firewallBlocks.find((f) => f.id === id);
    if (!target) return;

    setFirewallBlocks((prev) => {
      const next = prev.filter((f) => f.id !== id);
      saveState('pve_fw', next);
      return next;
    });

    addCustomAuditLog(
      'Firewall Update',
      'Success',
      `Removed firewall restriction for block target IP: ${target.ip}.`
    );
  };

  // Package Upgrade Simulation Stream
  const upgradePackages = (target: string): Promise<string[]> => {
    return new Promise((resolve) => {
      // Create output log statements
      const logsStream = [
        `Reading package lists... Done`,
        `Building dependency tree... Done`,
        `Reading state information... Done`,
        `The following packages will be upgraded:`,
      ];

      const pkgsToUpgrade = packageUpdates.filter(
        (p) => target === 'Host' ? p.target.startsWith('Host') : p.target.includes(`ID: ${target}`)
      );

      if (pkgsToUpgrade.length === 0) {
        logsStream.push(`0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.`);
        logsStream.push(`Done! No package updates required for target.`);
        resolve(logsStream);
        return;
      }

      pkgsToUpgrade.forEach((pkg) => {
        logsStream.push(`  ${pkg.name} (${pkg.currentVersion} => ${pkg.newVersion})`);
      });

      logsStream.push(`Need to get ${pkgsToUpgrade.length * 1.5}MB of archives.`);
      logsStream.push(`After this operation, additional disk space will be used.`);
      logsStream.push(`Retrieving packages...`);

      pkgsToUpgrade.forEach((pkg, index) => {
        logsStream.push(`Get:${index + 1} http://archive.ubuntu.com/ubuntu jammy-updates/main amd64 ${pkg.name} [${pkg.isSecurity ? 'SECURITY' : 'RELEASE'}]`);
      });

      logsStream.push(`Preparing to unpack & configure upgraded packages...`);
      pkgsToUpgrade.forEach((pkg) => {
        logsStream.push(`Unpacking ${pkg.name} (${pkg.newVersion}) over (${pkg.currentVersion})...`);
        logsStream.push(`Setting up ${pkg.name} (${pkg.newVersion})...`);
      });

      logsStream.push(`Processing triggers for libc-bin (2.35-0ubuntu3.6) ...`);
      logsStream.push(`Upgrade process completed successfully.`);

      // Update state: remove packages from update lists
      setPackageUpdates((prev) => {
        const next = prev.filter(
          (p) => !(target === 'Host' ? p.target.startsWith('Host') : p.target.includes(`ID: ${target}`))
        );
        saveState('pve_pkgs', next);
        return next;
      });

      addCustomAuditLog(
        'System Upgrade',
        'Success',
        `Upgraded all (${pkgsToUpgrade.length} packages) on ${target === 'Host' ? 'host node' : `container (ID: ${target})`}.`
      );

      resolve(logsStream);
    });
  };

  // Reset Data to Defaults
  const resetAllData = () => {
    setGuests(INITIAL_GUESTS);
    setPm2Processes(INITIAL_PM2_PROCESSES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setFirewallBlocks(INITIAL_FIREWALL_BLOCKS);
    setPackageUpdates(INITIAL_PACKAGE_UPDATES);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('pve_guests');
      localStorage.removeItem('pve_pm2');
      localStorage.removeItem('pve_logs');
      localStorage.removeItem('pve_fw');
      localStorage.removeItem('pve_pkgs');
    }

    addCustomAuditLog('Demo Data Initialize', 'Success', 'Reset mock demo environment data to default state.');
  };

  return (
    <AuthContext.Provider
      value={{
        isGoogleAuthenticated,
        isPasswordAuthenticated,
        loginError,
        authenticateGoogle,
        authenticatePassword,
        logout,
        guests,
        pm2Processes,
        auditLogs,
        firewallBlocks,
        packageUpdates,
        startGuest,
        stopGuest,
        restartGuest,
        restartPM2Process,
        stopPM2Process,
        startPM2Process,
        addFirewallBlock,
        removeFirewallBlock,
        upgradePackages,
        addCustomAuditLog,
        resetAllData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
