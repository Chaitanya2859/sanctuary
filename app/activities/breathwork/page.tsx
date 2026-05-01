'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Nav } from '@/components/Nav';
import { ArrowLeft, RefreshCw, CheckCircle2, Wind } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NeomorphicButton } from '@/components/ui/NeomorphicButton';

type Phase = 'inhale' | 'hold' | 'exhale';

export default function BreathworkPage() {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [timeLeft, setTimeLeft] = useState(76); // 4 cycles of 19s = 76s
  const [isComplete, setIsComplete] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startExercise = () => {
    setIsActive(true);
    setIsComplete(false);
    setTimeLeft(76);
    setPhase('inhale');
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      // Calculate phase based on time elapsed
      // Total cycle = 19s (4 inhale, 7 hold, 8 exhale)
      // We start at 76 and go down to 0.
      const elapsedInCycle = (76 - timeLeft) % 19;
      
      if (elapsedInCycle < 4) {
        setPhase('inhale');
      } else if (elapsedInCycle < 11) {
        setPhase('hold');
      } else {
        setPhase('exhale');
      }

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            setIsComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col pt-32 pb-8">
      <Nav />
      
      <main className="flex-1 max-w-2xl mx-auto px-6 w-full flex flex-col items-center justify-center space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 absolute top-32 left-0 right-0">
          <button 
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to home
          </button>
          <h1 className="text-3xl font-serif text-[#3a3a2e]">4-7-8 Breathing</h1>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-terra/60">2 Minutes • 4 Cycles Recommended</p>
        </div>

        {/* Breathing Circle */}
        <div className="relative flex items-center justify-center w-full max-w-[400px] aspect-square">
          <AnimatePresence mode="wait">
            {!isActive && !isComplete ? (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center space-y-8"
              >
                <div className="w-48 h-48 rounded-full border-2 border-primary/20 flex items-center justify-center">
                  <Wind className="w-12 h-12 text-primary opacity-20" />
                </div>
                <div className="text-center space-y-4">
                  <p className="text-sm text-on-surface-variant/60 font-medium">Ready for a quick grounding reset?</p>
                  <NeomorphicButton onClick={startExercise} variant="primary" className="px-10">
                    Start Exercise
                  </NeomorphicButton>
                </div>
              </motion.div>
            ) : isComplete ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center space-y-6"
              >
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-serif text-[#3a3a2e]">You feel lighter.</h2>
                <p className="text-sm text-on-surface-variant/60">Good job acknowledging your needs.</p>
                <div className="flex gap-4 pt-4">
                  <NeomorphicButton onClick={startExercise} className="text-xs">
                    Repeat
                  </NeomorphicButton>
                  <NeomorphicButton onClick={() => router.push('/')} variant="primary" className="text-xs">
                    Return to Home
                  </NeomorphicButton>
                </div>
              </motion.div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Visual Circle */}
                <motion.div
                  variants={{
                    inhale: { scale: 1.2 },
                    hold: { scale: 1.2 },
                    exhale: { scale: 0.8 }
                  }}
                  animate={phase}
                  transition={{
                    duration: phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8,
                    ease: "linear"
                  }}
                  className="absolute w-72 h-72 bg-primary/20 rounded-full border-2 border-primary/30"
                />
                <motion.div
                  variants={{
                    inhale: { scale: 1.1 },
                    hold: { scale: 1.1 },
                    exhale: { scale: 0.9 }
                  }}
                  animate={phase}
                  transition={{
                    duration: phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8,
                    ease: "linear"
                  }}
                  className="absolute w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl"
                />
                
                {/* Labels */}
                <div className="relative z-10 text-center space-y-4 max-w-[200px]">
                  <motion.div
                    key={phase}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h2 className="text-3xl font-serif text-[#3a3a2e] tracking-tight">
                      {phase === 'inhale' && 'Inhale'}
                      {phase === 'hold' && 'Hold'}
                      {phase === 'exhale' && 'Exhale'}
                    </h2>
                    <p className="text-[10px] text-[#3a3a2e]/50 font-bold uppercase tracking-[0.2em] leading-relaxed mt-1">
                      {phase === 'inhale' && 'Nose, slow and steady'}
                      {phase === 'hold' && 'Lungs full, body still'}
                      {phase === 'exhale' && 'Mouth, slow release'}
                    </p>
                  </motion.div>
                  
                  <div className="pt-2">
                    <span className="text-[9px] font-bold tracking-[0.4em] uppercase opacity-40 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full border border-black/5">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
