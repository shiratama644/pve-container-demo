export interface Guest {
  id: number;
  name: string;
  type: 'LXC' | 'KVM';
  status: 'running' | 'stopped';
  ip: string;
  cpu: number; // %
  memoryMax: number; // GB
  memoryUsed: number; // GB
  diskMax: number; // GB
  diskUsed: number; // GB
  uptime: string;
}

export interface PM2Process {
  id: number;
  name: string;
  status: 'online' | 'stopped' | 'errored';
  cpu: number;
  memory: string;
  uptime: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  location: string;
  action: string;
  status: 'Success' | 'Failed';
  details: string;
}

export interface FirewallBlock {
  id: string;
  ip: string;
  memo: string;
  addedAt: string;
}

export interface PackageUpdate {
  id: string;
  name: string;
  currentVersion: string;
  newVersion: string;
  isSecurity: boolean;
  target: string; // 'Host' or Guest ID name
}

export const INITIAL_GUESTS: Guest[] = [
  { id: 100, name: 'web-app-01', type: 'LXC', status: 'running', ip: '192.168.10.100', cpu: 14.2, memoryMax: 4.0, memoryUsed: 2.1, diskMax: 40, diskUsed: 18.5, uptime: '12d 4h' },
  { id: 101, name: 'postgres-db', type: 'KVM', status: 'running', ip: '192.168.10.101', cpu: 28.5, memoryMax: 8.0, memoryUsed: 6.4, diskMax: 100, diskUsed: 52.1, uptime: '24d 18h' },
  { id: 102, name: 'nginx-proxy', type: 'LXC', status: 'running', ip: '192.168.10.102', cpu: 2.4, memoryMax: 2.0, memoryUsed: 0.4, diskMax: 20, diskUsed: 6.8, uptime: '45d 2h' },
  { id: 103, name: 'redis-cache', type: 'LXC', status: 'running', ip: '192.168.10.103', cpu: 5.1, memoryMax: 2.0, memoryUsed: 1.2, diskMax: 15, diskUsed: 4.1, uptime: '8d 11h' },
  { id: 104, name: 'worker-node-01', type: 'KVM', status: 'stopped', ip: '192.168.10.104', cpu: 0, memoryMax: 8.0, memoryUsed: 0, diskMax: 80, diskUsed: 22.0, uptime: 'Stopped' },
  { id: 105, name: 'docker-host-01', type: 'KVM', status: 'running', ip: '192.168.10.105', cpu: 34.8, memoryMax: 12.0, memoryUsed: 8.9, diskMax: 150, diskUsed: 87.4, uptime: '3d 9h' },
  { id: 106, name: 'grafana-metrics', type: 'LXC', status: 'running', ip: '192.168.10.106', cpu: 8.3, memoryMax: 4.0, memoryUsed: 1.8, diskMax: 30, diskUsed: 14.2, uptime: '9d 23h' },
  { id: 107, name: 'backups-s3', type: 'LXC', status: 'stopped', ip: '192.168.10.107', cpu: 0, memoryMax: 2.0, memoryUsed: 0, diskMax: 200, diskUsed: 145.0, uptime: 'Stopped' },
];

export const INITIAL_PM2_PROCESSES: Record<number, PM2Process[]> = {
  100: [
    { id: 0, name: 'next-api-prod', status: 'online', cpu: 4.5, memory: '112.4 MB', uptime: '12d 4h' },
    { id: 1, name: 'auth-service', status: 'online', cpu: 1.2, memory: '68.1 MB', uptime: '12d 4h' },
    { id: 2, name: 'image-worker', status: 'online', cpu: 0.0, memory: '154.2 MB', uptime: '2d 1h' },
    { id: 3, name: 'mail-spool', status: 'stopped', cpu: 0.0, memory: '0 MB', uptime: 'Stopped' },
  ],
  102: [
    { id: 0, name: 'nginx-health-checker', status: 'online', cpu: 0.2, memory: '24.5 MB', uptime: '45d 2h' },
    { id: 1, name: 'certbot-renewer', status: 'stopped', cpu: 0, memory: '0 MB', uptime: 'Stopped' },
  ],
  106: [
    { id: 0, name: 'prometheus-exporter', status: 'online', cpu: 2.3, memory: '72.0 MB', uptime: '9d 23h' },
    { id: 1, name: 'node-exporter', status: 'online', cpu: 1.1, memory: '31.2 MB', uptime: '9d 23h' },
  ],
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: '1', timestamp: '2026-06-30T20:15:32-07:00', ip: '198.51.100.42', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0', location: 'Tokyo, JP 🇯🇵', action: 'Login (2FA Password)', status: 'Success', details: 'Successfully logged in as administrator.' },
  { id: '2', timestamp: '2026-06-30T20:14:55-07:00', ip: '198.51.100.42', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0', location: 'Tokyo, JP 🇯🇵', action: 'Login (2FA Password)', status: 'Failed', details: 'Login failed due to incorrect password. Input: admin1234' },
  { id: '3', timestamp: '2026-06-30T20:12:11-07:00', ip: '198.51.100.42', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0', location: 'Tokyo, JP 🇯🇵', action: 'Login (Google Stage 1)', status: 'Success', details: 'Successfully authenticated via Google OAuth.' },
  { id: '4', timestamp: '2026-06-30T18:44:02-07:00', ip: '203.0.113.88', userAgent: 'Go-http-client/1.1 (BruteForce Scanner)', location: 'Moscow, RU 🇷🇺', action: 'SSH Auth Attempt', status: 'Failed', details: 'Failed password authentication for user root (invalid attempt)' },
  { id: '5', timestamp: '2026-06-30T18:43:59-07:00', ip: '203.0.113.88', userAgent: 'Go-http-client/1.1 (BruteForce Scanner)', location: 'Moscow, RU 🇷🇺', action: 'SSH Auth Attempt', status: 'Failed', details: 'Failed password authentication for user admin (invalid attempt)' },
  { id: '6', timestamp: '2026-06-30T15:22:10-07:00', ip: '198.51.100.42', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2_1)', location: 'Tokyo, JP 🇯🇵', action: 'LXC Boot Operation', status: 'Success', details: 'Started container ID 100 (web-app-01).' },
  { id: '7', timestamp: '2026-06-30T11:05:43-07:00', ip: '45.79.12.134', userAgent: 'curl/7.81.0', location: 'Dallas, US 🇺🇸', action: 'Port Scan Detected', status: 'Failed', details: 'Received suspicious packets on port 22; blocked by firewall.' },
  { id: '8', timestamp: '2026-06-29T23:59:12-07:00', ip: '198.51.100.42', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0', location: 'Tokyo, JP 🇯🇵', action: 'PM2 Process Restart', status: 'Success', details: 'Restarted process next-api-prod inside container ID 100.' },
  { id: '9', timestamp: '2026-06-29T14:30:00-07:00', ip: '12.34.56.78', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)', location: 'New York, US 🇺🇸', action: 'Login (2FA Password)', status: 'Success', details: 'Login successful (session persisted)' },
  { id: '10', timestamp: '2026-06-29T09:15:22-07:00', ip: '88.198.23.45', userAgent: 'Mozilla/5.0 (compatible; CensysInspect/1.1)', location: 'Frankfurt, DE 🇩🇪', action: 'HTTPS Request Scan', status: 'Failed', details: 'Invalid SSL handshake. Dropped request to /phpmyadmin.' },
  { id: '11', timestamp: '2026-06-28T16:40:11-07:00', ip: '198.51.100.42', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0', location: 'Tokyo, JP 🇯🇵', action: 'Firewall Rules Update', status: 'Success', details: 'Permanently blocked IP 203.0.113.88 due to malicious activity suspect.' },
  { id: '12', timestamp: '2026-06-28T12:10:00-07:00', ip: '198.51.100.42', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0', location: 'Tokyo, JP 🇯🇵', action: 'Package Update Check', status: 'Success', details: 'apt-get update completed successfully (Upgradable: 5 packages)' },
];

export const INITIAL_FIREWALL_BLOCKS: FirewallBlock[] = [
  { id: 'fw-1', ip: '203.0.113.88', memo: 'SSH BruteForce attack detected (Moscow, RU)', addedAt: '2026-06-30T18:45:00-07:00' },
  { id: 'fw-2', ip: '45.79.12.134', memo: 'Suspicious port scan detected (Dallas, US)', addedAt: '2026-06-30T11:06:00-07:00' },
  { id: 'fw-3', ip: '88.198.23.45', memo: 'Vulnerability scan targeting /phpmyadmin (Frankfurt, DE)', addedAt: '2026-06-29T09:17:00-07:00' },
  { id: 'fw-4', ip: '185.220.101.5', memo: 'Blocked administrator login attempt from Tor exit node', addedAt: '2026-06-27T04:22:15-07:00' },
];

export const INITIAL_PACKAGE_UPDATES: PackageUpdate[] = [
  { id: 'pkg-1', name: 'openssl', currentVersion: '3.0.2-0ubuntu1.10', newVersion: '3.0.2-0ubuntu1.15', isSecurity: true, target: 'Host (Proxmox-Node)' },
  { id: 'pkg-2', name: 'linux-image-5.15.0-91-generic', currentVersion: '5.15.0-91.101', newVersion: '5.15.0-104.114', isSecurity: true, target: 'Host (Proxmox-Node)' },
  { id: 'pkg-3', name: 'nginx-common', currentVersion: '1.18.0-6ubuntu14.4', newVersion: '1.18.0-6ubuntu14.5', isSecurity: false, target: 'nginx-proxy (ID: 102)' },
  { id: 'pkg-4', name: 'nginx-core', currentVersion: '1.18.0-6ubuntu14.4', newVersion: '1.18.0-6ubuntu14.5', isSecurity: false, target: 'nginx-proxy (ID: 102)' },
  { id: 'pkg-5', name: 'postgresql-14', currentVersion: '14.10-0ubuntu0.22.04.1', newVersion: '14.12-0ubuntu0.22.04.1', isSecurity: true, target: 'postgres-db (ID: 101)' },
  { id: 'pkg-6', name: 'curl', currentVersion: '7.81.0-1ubuntu1.15', newVersion: '7.81.0-1ubuntu1.16', isSecurity: false, target: 'web-app-01 (ID: 100)' },
  { id: 'pkg-7', name: 'systemd', currentVersion: '249.11-0ubuntu3.11', newVersion: '249.11-0ubuntu3.12', isSecurity: true, target: 'worker-node-01 (ID: 104)' },
];
