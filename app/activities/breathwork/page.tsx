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
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isComplete, setIsComplete] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseRef = useRef<NodeJS.Timeout | null>(null);

  const startExercise = () => {
    setIsActive(true);
    setIsComplete(false);
    setTimeLeft(120);
    managePhases();
  };

  const managePhases = () => {
    const cycle = () => {
      setPhase('inhale');
      phaseRef.current = setTimeout(() => {
        setPhase('hold');
        phaseRef.current = setTimeout(() => {
          setPhase('exhale');
          phaseRef.current = setTimeout(cycle, 8000);
        }, 7000);
      }, 4000);
    };
    cycle();
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            setIsComplete(true);
            if (phaseRef.current) clearTimeout(phaseRef.current);
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
      if (phaseRef.current) clearTimeout(phaseRef.current);
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
            onClick={() => router.push('/activities')}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to activities
          </button>
          <h1 className="text-3xl font-serif text-[#3a3a2e]">2-Minute Breathwork</h1>
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
                  animate={{
                    scale: phase === 'inhale' ? 1.5 : phase === 'exhale' ? 0.8 : phase === 'small-hold' ? 1.5 : 0.8,
                  }}
                  transition={{
                    duration: phase === 'inhale' || phase === 'exhale' ? 4 : 1.5,
                    ease: "easeInOut"
                  }}
                  className="absolute w-40 h-40 bg-primary/10 rounded-full border border-primary/20"
                />
                <motion.div
                  animate={{
                    scale: phase === 'inhale' ? 1.2 : phase === 'exhale' ? 1 : phase === 'small-hold' ? 1.2 : 1,
                  }}
                  transition={{
                    duration: phase === 'inhale' || phase === 'exhale' ? 4 : 1.5,
                    ease: "easeInOut"
                  }}
                  className="absolute w-60 h-60 bg-primary/5 rounded-full blur-2xl"
                />
                
                {/* Labels */}
                <div className="relative z-10 text-center space-y-1">
                  <motion.p 
                    key={phase}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-serif text-[#3a3a2e]"
                  >
                    {phase === 'inhale' && 'Inhale (Nose)...'}
                    {phase === 'hold' && 'Hold...'}
                    {phase === 'exhale' && 'Exhale (Mouth)...'}
                  </motion.p>
                  <p className="text-sm opacity-40 italic pb-2">
                    {phase === 'inhale' && 'Expand your chest'}
                    {phase === 'hold' && 'Lungs full, body still'}
                    {phase === 'exhale' && 'Let it all out'}
                  </p>
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-30">
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Phase Indicators */}
        {isActive && (
          <div className="flex gap-2">
            {(['inhale', 'hold', 'exhale'] as Phase[]).map((p) => (
              <div 
                key={p} 
                className={cn(
                  "h-1 w-12 rounded-full transition-all duration-500",
                  phase === p ? "bg-primary w-20" : "bg-primary/10"
                )} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
