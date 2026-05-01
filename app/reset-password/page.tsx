'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { NeomorphicButton } from '@/components/ui/NeomorphicButton';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-6 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-10"
      >
        <div className="text-center space-y-4">
          <Link href="/" className="text-3xl font-serif text-[#3a3a2e] block">Sanctuary</Link>
          <h1 className="text-2xl font-serif text-[#5a5a40]/60">Reset your password.</h1>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-2xl space-y-8 border border-[#5a5a40]/5">
          {sent ? (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-xl">Check your email</h3>
                <p className="text-sm opacity-50">We&apos;ve sent reset instructions to {email}</p>
              </div>
              <Link href="/login" className="block">
                <NeomorphicButton className="w-full">Back to Login</NeomorphicButton>
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest rounded-2xl text-center">
                  {error}
                </div>
              )}

              <p className="text-sm text-on-surface-variant/60 text-center px-4 leading-relaxed">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-4">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 pl-14 pr-6 bg-[#f5f5f0] rounded-2xl outline-none focus:ring-4 focus:ring-[#5a5a40]/5 transition-all text-sm"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                <NeomorphicButton 
                  type="submit" 
                  variant="primary" 
                  className="w-full h-16 bg-[#3a3a2e] text-white"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                </NeomorphicButton>
              </form>
            </>
          )}
        </div>

        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
            <ArrowLeft className="w-3 h-3" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
