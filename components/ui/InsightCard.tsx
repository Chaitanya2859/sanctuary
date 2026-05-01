'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  insight?: string;
}

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={cn(
        "theme-card p-10 h-full flex flex-col justify-center relative overflow-hidden transition-all duration-700",
        insight ? "border-primary/20 bg-primary/5" : ""
      )}
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary-container rounded-full blur-[80px] opacity-40" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-container rounded-full blur-[80px] opacity-20" />
      
      <div className="relative z-10 space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-background rounded-full text-primary mb-2 border border-outline/10">
          <Lightbulb className={cn("w-8 h-8 transition-all", insight ? "text-primary scale-110" : "text-primary-container/60")} />
        </div>
        
        <h3 className="text-2xl font-serif text-on-surface">
          {insight ? "Daily Analysis" : "Insight Pending"}
        </h3>
        
        <div className="bg-background p-6 rounded-3xl border border-outline/5 italic min-h-[100px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p 
              key={insight || 'default'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-on-surface-variant font-medium leading-relaxed"
            >
              {insight ? `"${insight}"` : "Complete your daily check-in to reveal today's personal insight."}
            </motion.p>
          </AnimatePresence>
        </div>
        
        {insight && (
          <Link href="/insights" className="inline-block mt-4">
            <button className="text-primary text-xs font-bold uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">
              Explore this pattern
            </button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
