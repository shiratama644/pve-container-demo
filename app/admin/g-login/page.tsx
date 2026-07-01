'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/lib/auth-context';
import LoginBackground from '@/components/login-background';
import { ShieldCheck, Server, AlertTriangle } from 'lucide-react';

export default function GoogleLoginPage() {
  const { authenticateGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate a brief OAuth redirection / handshake latency
    setTimeout(() => {
      authenticateGoogle();
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <LoginBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        id="login-card-container"
        className="relative w-full max-w-md bg-slate-900/45 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Subtle decorative glowing corner rings */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative flex flex-col items-center text-center space-y-6">
          {/* Logo */}
          <div className="relative flex items-center justify-center w-16 h-16 bg-slate-800/60 rounded-xl border border-white/10 shadow-inner">
            <Server className="w-8 h-8 text-cyan-400" />
            <div className="absolute -right-1 -top-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-medium tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Proxmox VE Unified Portal
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">
              Demo Environment / Security Step 1
            </p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

          {/* Instruction */}
          <p className="text-sm text-slate-300 leading-relaxed">
            This system is restricted to authorized administrators.<br />
            Please complete Step 1: Google SSO Authentication.
          </p>

          {/* Interactive Google Sign-In Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            id="google-login-btn"
            className="w-full relative group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-300 py-3.5 px-4 flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-slate-300 font-mono tracking-wider uppercase">Connecting to OAuth...</span>
              </div>
            ) : (
              <>
                {/* Standard flat Google logo SVG */}
                <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-sm font-medium text-slate-100 group-hover:text-cyan-300 transition-colors">
                  Sign in with Google
                </span>
              </>
            )}
          </button>

          {/* Security Alert notice */}
          <div className="w-full bg-cyan-500/[0.03] border border-cyan-500/10 rounded-lg p-3 text-left flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-400 space-y-0.5">
              <span className="font-semibold text-slate-300">Secure Encrypted Tunnel</span>
              <p>
                This demo system securely stores virtual sessions in-memory. No personal data is transmitted externally.
              </p>
            </div>
          </div>
        </div>

        {/* Outer details/footer */}
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <p className="text-[10px] text-slate-600 font-mono tracking-wider">
            SYSTEM VERSION: 2.4.1-STABLE
          </p>
        </div>
      </motion.div>
    </div>
  );
}
