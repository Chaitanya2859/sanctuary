'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { NeomorphicButton } from './NeomorphicButton';

const FEELINGS = ['Calm', 'Stressed', 'Sad', 'Bored', 'Overwhelmed'];

export function CheckInCard() {
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [hunger, setHunger] = useState(33);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="theme-card p-8 md:p-12 w-full max-w-2xl text-center space-y-10"
    >
      <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-on-surface">
        How are you feeling right now?
      </h2>

      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {FEELINGS.map((feeling) => (
          <button
            key={feeling}
            onClick={() => setSelectedFeeling(feeling)}
            className={cn(
              'px-6 py-3 rounded-full font-medium transition-all duration-200 border',
              selectedFeeling === feeling
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-background text-on-surface-variant border-outline/20 hover:border-primary/40'
            )}
          >
            {feeling}
          </button>
        ))}
      </div>

      <div className="pt-6 border-t border-outline/10 space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/70">
          How hungry are you?
        </h3>
        
        <div className="relative flex flex-col gap-2">
          <div className="bg-background h-12 rounded-full relative flex items-center px-4 overflow-hidden border border-outline/5">
            {/* Custom Track Background */}
            <div 
              className="absolute left-0 top-0 h-full bg-primary/10 transition-all duration-300"
              style={{ width: `${hunger}%` }}
            />
            
            {/* Labels */}
            <div className="w-full flex justify-between text-[10px] text-on-surface-variant/50 font-bold tracking-widest uppercase relative z-10 pointer-events-none">
              <span>Not at all</span>
              <span>Ravenous</span>
            </div>

            {/* Slider Input - Hidden visually but functional */}
            <input
              type="range"
              min="0"
              max="100"
              value={hunger}
              onChange={(e) => setHunger(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            
            {/* Custom Thumb */}
            <motion.div
              animate={{ left: `calc(${hunger}% - 16px)` }}
              className="w-8 h-8 bg-white rounded-full absolute top-2 flex items-center justify-center pointer-events-none shadow-sm border border-outline/10"
            >
              <div className="w-2 h-2 bg-primary rounded-full" />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <NeomorphicButton variant="primary" className="w-full md:w-auto px-12 h-14">
          Save Check-in
        </NeomorphicButton>
      </div>
    </motion.div>
  );
}
