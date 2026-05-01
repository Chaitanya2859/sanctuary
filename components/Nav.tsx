'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, LogIn, LogOut, Menu, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { SafetyModal } from './SafetyModal';

export function Nav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const links = [
    { name: 'Insights', href: '/insights' },
    { name: 'Progress', href: '/progress' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[1100px] z-50"
    >
      <div className="bg-[#f5f5f0]/80 backdrop-blur-xl border border-[#ddd8ce] rounded-full px-6 md:px-8 py-2.5 md:py-3 flex items-center justify-between shadow-[0_4px_24px_rgba(61,44,30,0.06)]">
        <div className="flex items-center gap-12">
          <Link 
            href="/" 
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="text-xl md:text-2xl font-serif tracking-tight text-[#3a3a2e] hover:opacity-70 transition-opacity"
          >
            Sanctuary
          </Link>
          
          {user ? (
            <div className="hidden md:flex gap-10 text-[10px] font-bold uppercase tracking-widest items-center">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "transition-all relative py-1",
                    pathname === link.href 
                      ? "text-[#3a3a2e]" 
                      : "text-[#3a3a2e]/40 hover:text-[#3a3a2e]"
                  )}
                >
                  {link.name}
                  {pathname === link.href && (
                    <motion.div 
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#3a3a2e]"
                    />
                  )}
                </Link>
              ))}
            </div>
          ) : pathname === '/' && (
            <div className="hidden md:flex gap-10 text-[13px] text-[#8c6e5a]">
              <button 
                onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
                className="hover:text-[#5a5a40] transition-colors"
              >
                Method
              </button>
              <button 
                onClick={() => document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' })}
                className="hover:text-[#5a5a40] transition-colors"
              >
                Safety
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">

          {user ? (
            <div className="hidden md:flex items-center gap-6">
              <Link href="/journal">
                <button className="flex items-center gap-3 px-6 py-3 bg-[#3a3a2e] text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:opacity-90 transition-all group">
                  Your Log
                  <ArrowRight className="w-3.5 h-3.5 opacity-30 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                </button>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-6">
              <Link href="/login">
                <button className="bg-[#5a5a40] text-[#f5f5f0] border-none rounded-full px-6 py-2.5 text-[13px] font-medium cursor-pointer tracking-[0.01em] transition-all hover:bg-[#3d2c1e] hover:-translate-y-[1px]">
                  Login
                </button>
              </Link>
            </div>
          )}

          {user ? (
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full bg-white border border-[#5a5a40]/10 text-[#3a3a2e] hover:bg-white/50 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          ) : (
            <Link href="/login" className="md:hidden">
              <button className="bg-[#5a5a40] text-[#f5f5f0] border-none rounded-full px-5 py-2 text-[12px] font-medium cursor-pointer tracking-[0.01em] transition-all">
                Login
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl shadow-2xl border border-[#5a5a40]/10 p-8 flex flex-col gap-8 md:hidden z-40 rounded-[32px]"
            >
              <div className="flex flex-col gap-6">
                {user && links.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "text-xl font-serif",
                      pathname === link.href ? "text-[#3a3a2e]" : "text-[#3a3a2e]/40"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="h-[1px] w-full bg-[#5a5a40]/5" />

              <div className="flex flex-col gap-4">
                
                {user ? (
                  <Link href="/journal" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full py-4 text-xs font-bold uppercase tracking-widest text-[#3a3a2e] bg-[#f5f5f0] border border-[#5a5a40]/10 rounded-2xl">
                      Go to Journal
                    </button>
                  </Link>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-4 text-xs font-bold uppercase tracking-widest text-center bg-[#5a5a40] text-white rounded-2xl">Login</Link>
                    <div className="text-center text-[10px] text-mocha uppercase tracking-widest mt-2">
                      New here? <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-terra hover:underline">Start your journey</Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SafetyModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />
    </motion.nav>
  );
}
