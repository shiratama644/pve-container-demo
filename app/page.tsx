'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function RootPage() {
  const router = useRouter();
  const { isGoogleAuthenticated, isPasswordAuthenticated } = useAuth();

  useEffect(() => {
    if (isGoogleAuthenticated && isPasswordAuthenticated) {
      router.push('/admin/dashboard');
    } else if (isGoogleAuthenticated) {
      router.push('/admin/two-login');
    } else {
      router.push('/admin/g-login');
    }
  }, [isGoogleAuthenticated, isPasswordAuthenticated, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4">
        {/* Modern glowing loading ring */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20"></div>
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin"></div>
        </div>
        <p className="text-slate-400 font-mono text-sm tracking-widest animate-pulse">
          INITIALIZING SECURE SESSION...
        </p>
      </div>
    </div>
  );
}
