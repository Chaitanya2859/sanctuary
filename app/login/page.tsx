'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Lock, Mail, Loader2 } from 'lucide-react';
import { NeomorphicButton } from '@/components/ui/NeomorphicButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Google login failed');
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
          <h1 className="text-2xl font-serif text-[#5a5a40]/60">Welcome back.</h1>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-2xl space-y-8 border border-[#5a5a40]/5">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest rounded-2xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
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

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-4">Password</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-14 pr-6 bg-[#f5f5f0] rounded-2xl outline-none focus:ring-4 focus:ring-[#5a5a40]/5 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex justify-end pr-2">
                <Link href="/reset-password" className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Forgot Password?</Link>
              </div>
            </div>

            <NeomorphicButton 
              type="submit" 
              variant="primary" 
              className="w-full h-16 bg-[#3a3a2e] text-white"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </NeomorphicButton>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#5a5a40]/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white px-4 opacity-30">or</span></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-14 border border-[#5a5a40]/10 rounded-2xl flex items-center justify-center gap-4 hover:bg-[#f5f5f0] transition-colors"
          >
            <Image 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              width={20} 
              height={20} 
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-bold uppercase tracking-widest text-[#3a3a2e]">Continue with Google</span>
          </button>
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-widest opacity-40">
          Don&apos;t have an account? <Link href="/signup" className="text-[#3a3a2e] hover:underline decoration-2 underline-offset-4">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
