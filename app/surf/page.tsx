'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Nav } from '@/components/Nav';
import { NeomorphicButton } from '@/components/ui/NeomorphicButton';
import { ArrowLeft, Play, Pause, RotateCcw, CheckCircle2, ChevronRight, Wind, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const PROMPTS = [
  "Take a deep breath. Notice the urge without acting on it.",
  "Where do you feel this urge in your body? Shoulders? Stomach?",
  "The urge is just a physical sensation. It has a beginning and an end.",
  "Imagine the urge as a wave. You are the surfer, riding it out.",
  "Acknowledge the feeling. Give it a name: 'Boredom', 'Stress', 'Anxiety'.",
  "You are not your cravings. You are the observer of your cravings.",
  "This sensation will peak and then it will subside. Just breathe.",
  "Five minutes of stillness is a radical act of self-care.",
];

export default function UrgeSurfingPage() {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [journalNote, setJournalNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Timer logic
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Rotate prompts every 20 seconds
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setCurrentPromptIndex((prev) => (prev + 1) % PROMPTS.length);
      }, 20000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(180);
    setIsCompleted(false);
    setCurrentPromptIndex(0);
    setJournalNote('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveAndReturn = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'checkins'), {
        userId: auth.currentUser.uid,
        type: 'surge',
        usedUrgeSurfing: true,
        reflection: journalNote || "Rode the wave.",
        trigger: 'Urge Surfing',
        aiResponse: "Taking three minutes to sit with an urge takes immense strength. You are building a new relationship with your impulses, one breath at a time.",
        timestamp: serverTimestamp(),
        duration: 180,
      });
      router.push('/');
    } catch (error) {
      console.error("Failed to save session:", error);
      router.push('/');
    } finally {
      setIsSaving(false);
    }
  };

  const progress = ((180 - timeLeft) / 180) * 100;

  return (
    <div className="min-h-screen bg-[#f5f5f0] pt-32 pb-12 px-6 flex flex-col items-center">
      <Nav />
      
      <div className="w-full max-w-2xl mx-auto space-y-12 flex flex-col items-center">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity mb-4">
            <ArrowLeft className="w-3 h-3" />
            Back to Sanctuary
          </Link>
          <h1 className="text-4xl md:text-6xl font-serif text-[#5a5a40]">Urge Surfing</h1>
          <p className="text-on-surface-variant/60 max-w-md mx-auto">
            A 3-minute guided pause to observe cravings safely until they subside.
          </p>
        </div>

        {/* Visualizer & Timer */}
        <div className="relative w-full aspect-square max-w-[400px] flex items-center justify-center">
          {/* Wave Background */}
          <motion.div 
            animate={{ 
              scale: isActive ? [1, 1.2, 1] : 1,
              opacity: isActive ? [0.1, 0.2, 0.1] : 0.05
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute inset-0 bg-[#5a5a40] rounded-full blur-[60px]"
          />

          {/* Main Visualizer */}
          <div className="relative z-10 w-full h-full rounded-full border border-[#5a5a40]/10 flex items-center justify-center overflow-hidden bg-white/40 backdrop-blur-sm shadow-xl">
            <AnimatePresence mode="wait">
              {isCompleted ? (
                <motion.div 
                  key="completed"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4 p-8 w-full"
                >
                  <div className="w-16 h-16 bg-[#5a5a40] rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-serif">You rode the wave.</h2>
                  <p className="text-xs opacity-60">How did that feel? Note your experience below.</p>
                  
                  <textarea 
                    value={journalNote}
                    onChange={(e) => setJournalNote(e.target.value)}
                    placeholder="The urge was intense, but it's passing..."
                    className="w-full h-24 bg-[#f5f5f0] p-4 rounded-2xl border border-outline/10 text-xs outline-none focus:ring-4 focus:ring-[#5a5a40]/5 resize-none mb-4"
                  />

                  <NeomorphicButton 
                    className="w-full" 
                    onClick={handleSaveAndReturn}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete & Save Reflection"}
                  </NeomorphicButton>
                </motion.div>
              ) : (
                <motion.div 
                  key="timer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-6 p-8"
                >
                  <motion.div
                    animate={isActive ? { 
                      scale: [1, 1.05, 1],
                    } : {}}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="text-7xl md:text-8xl font-serif font-light text-[#5a5a40] tracking-tighter"
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  
                  <div className="h-[2px] w-48 bg-[#5a5a40]/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-[#5a5a40]"
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={currentPromptIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center italic text-on-surface-variant font-medium leading-relaxed px-4 min-h-[60px]"
                    >
                      &quot;{PROMPTS[currentPromptIndex]}&quot;
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        {!isCompleted && (
          <div className="flex items-center gap-8">
            <button 
              onClick={resetTimer}
              className="p-4 rounded-full bg-white border border-outline/5 shadow-sm text-on-surface-variant hover:text-primary transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            <button 
              onClick={toggleTimer}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95",
                isActive ? "bg-white text-[#5a5a40] border border-[#5a5a40]/10" : "bg-[#5a5a40] text-white"
              )}
            >
              {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>

            <Link href="/">
              <button 
                className="p-4 rounded-full bg-white border border-outline/5 shadow-sm text-on-surface-variant hover:text-red-500 transition-colors"
                title="End Session"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </Link>
          </div>
        )}

        {/* Instructions */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-12 border-t border-[#5a5a40]/5"
        >
          <div className="bg-white/50 p-6 rounded-3xl space-y-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary border border-outline/5">
              <Wind className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm">Notice the breath</h4>
            <p className="text-xs opacity-60 leading-relaxed">Don&apos;t try to change it. Just observe how your body moves with each inhale.</p>
          </div>
          <div className="bg-white/50 p-6 rounded-3xl space-y-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary border border-outline/5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm">Label the urge</h4>
            <p className="text-xs opacity-60 leading-relaxed">Give the physical sensation a name. This creates space between you and the impulse.</p>
          </div>
          <div className="bg-white/50 p-6 rounded-3xl space-y-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary border border-outline/5">
              <ChevronRight className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm">Ride the peak</h4>
            <p className="text-xs opacity-60 leading-relaxed">Cravings peak around 10-15 minutes but often subside much faster when observed.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
