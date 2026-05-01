'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Nav } from '@/components/Nav';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-6 selection:bg-primary/20">
      <Nav />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center mx-auto">
            <Compass className="w-10 h-10 text-primary opacity-20" />
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full"
          />
        </div>

        <div className="space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl text-[#3a3a2e]">Is this a quiet place?</h1>
          <p className="text-on-surface-variant font-medium">It seems you&apos;ve wandered into an uncharted corner of the Sanctuary. Let&apos;s guide you back to the path.</p>
        </div>

        <div className="pt-4">
          <Link href="/">
            <button className="px-10 py-4 bg-primary text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:opacity-90 transition-all active:scale-95">
              Return Home
            </button>
          </Link>
        </div>

        <div className="pt-12 opacity-20 text-[8px] font-bold uppercase tracking-widest">
          Error 404 — Not Found
        </div>
      </motion.div>
    </div>
  );
}
