'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/lib/auth-context';
import LoginBackground from '@/components/login-background';
import { ShieldAlert, KeyRound, ChevronLeft, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TwoLoginPage() {
  const router = useRouter();
  const { authenticatePassword, loginError, logout, isGoogleAuthenticated } = useAuth();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If someone skipped step 1, redirect them back
  React.useEffect(() => {
    if (!isGoogleAuthenticated) {
      router.push('/admin/g-login');
    }
  }, [isGoogleAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate cryptographic validation latency
    setTimeout(() => {
      const success = authenticatePassword(password);
      setIsSubmitting(false);
      if (success) {
        setPassword('');
      }
    }, 800);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <LoginBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        id="two-login-card"
        className="relative w-full max-w-md bg-slate-900/45 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Subtle decorative glowing corner rings */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Back button to Step 1 */}
        <button
          onClick={logout}
          className="absolute top-5 left-5 text-slate-400 hover:text-slate-200 transition-colors flex items-center space-x-1 text-xs cursor-pointer font-mono"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>STEP 1</span>
        </button>

        <div className="relative flex flex-col items-center text-center space-y-6 pt-4">
          {/* Logo */}
          <div className="relative flex items-center justify-center w-16 h-16 bg-slate-800/60 rounded-xl border border-white/10 shadow-inner">
            <Lock className="w-8 h-8 text-purple-400" />
            <div className="absolute -right-1 -top-1 flex h-4 w-4">
              <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500"></span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-medium tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Security Gatekey
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">
              Demo Environment / Security Step 2
            </p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-1" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-2 text-left">
              <label htmlFor="pve-password-field" className="block text-xs font-mono tracking-wider uppercase text-slate-400">
                Security Password / Crypto Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  id="pve-password-field"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/15 transition-all font-mono"
                />
              </div>
            </div>

            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start space-x-2 text-left"
              >
                <ShieldAlert className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-red-300 font-medium">{loginError}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              id="two-login-submit-btn"
              className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-100 text-sm font-medium py-3 px-4 rounded-xl transition-all duration-300 shadow-[0_4px_25px_rgba(6,182,212,0.25)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Validating Key...</span>
                </>
              ) : (
                <span>Complete 2FA Authentication</span>
              )}
            </button>
          </form>

          {/* Quick instructions / Help block for demo */}
          <div className="w-full bg-purple-500/[0.03] border border-purple-500/10 rounded-lg p-3 text-left flex items-start space-x-2.5">
            <Lock className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-400 space-y-0.5">
              <span className="font-semibold text-purple-300">Demo Credentials</span>
              <p>
                The security passcode for evaluating this demo environment is <code className="bg-slate-950 px-1.5 py-0.5 rounded text-cyan-400 font-mono font-bold">demo1234</code>.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-2 left-0 right-0 text-center">
          <p className="text-[10px] text-slate-600 font-mono tracking-wider">
            GOOGLE ENCRYPTED SESSION ID: MOCK_7A3F9B
          </p>
        </div>
      </motion.div>
    </div>
  );
}
