'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { NeomorphicButton } from './ui/NeomorphicButton';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, Smile, Frown, Meh } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFallbackResponse } from '@/lib/fallbackResponses';
import { getAIResponse } from '@/lib/ai';
import Link from 'next/link';

const EMOTIONS = ['Joy', 'Trust', 'Fear', 'Surprise', 'Sadness', 'Disgust', 'Anger', 'Anticipation', 'Calm', 'Guilty', 'Regretful', 'Comforted'];

interface PostEatLogFlowProps {
  onClose: () => void;
  onComplete: () => void;
}

export function PostEatLogFlow({ onClose, onComplete }: PostEatLogFlowProps) {
  const [step, setStep] = useState(1);
  const [satisfied, setSatisfied] = useState<'yes' | 'no' | 'neutral' | null>(null);
  const [wasNeeded, setWasNeeded] = useState<'yes' | 'no' | 'unsure' | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [completeInsight, setCompleteInsight] = useState<string | null>(null);

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]
    );
  };

  const handleSave = async () => {
    if (!auth.currentUser || !satisfied) return;

    setIsSaving(true);
    try {
      let aiResponse = wasNeeded === 'no' 
        ? "You've identified this as emotional eating. That's a huge step in awareness." 
        : "Nourishing yourself when hungry is a fundamental act of care.";
      
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      const prompt = `You are Sanctuary, a mindful eating coach.
      The user just finished a meal and logged these details:
      - Satisfaction: ${satisfied}
      - Was it physically needed: ${wasNeeded}
      - Emotions felt after: ${selectedEmotions.join(', ') || 'None mentioned'}
      - User's reflection: ${comment || 'No comment provided'}

      Provide a single, short (2 sentences), compassionate reflection that validates their experience and encourages continued awareness.
      Tone: Gentle, non-judgmental.
      Do NOT mention weight or calories.`;

      const aiResponseResult = await getAIResponse(prompt);
      if (aiResponseResult) {
        aiResponse = aiResponseResult;
      } else {
        aiResponse = getFallbackResponse({
          mood: selectedEmotions[0] as any
        });
      }

      await addDoc(collection(db, 'logs'), {
        userId: auth.currentUser.uid,
        type: 'log',
        satisfied,
        wasNeeded,
        emotions: selectedEmotions,
        comment: comment,
        aiResponse: aiResponse,
        timestamp: serverTimestamp(),
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error("Failed to save log:", error);
      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-[#f5f5f0]/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={cn(
          "w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden relative border border-outline/5",
          (completeInsight || isSuccess) ? "max-w-xl" : "max-w-lg"
        )}
      >
        {!completeInsight && !isSuccess && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-outline/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              className="h-full bg-primary"
            />
          </div>
        )}

        <div className="p-8 md:p-12 space-y-8">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-[#3a3a2e]">Response Recorded</h2>
                  <p className="text-sm text-on-surface-variant/60">Your awareness grows with every entry.</p>
                </div>
              </motion.div>
            ) : completeInsight ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Post-Meal Insight</span>
                  <p className="text-xl font-serif text-on-surface leading-relaxed italic">
                    &quot;{completeInsight}&quot;
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <NeomorphicButton variant="primary" onClick={onComplete} className="w-full">
                    Back to overview
                  </NeomorphicButton>
                  <Link href="/journal" className="w-full" onClick={onComplete}>
                    <NeomorphicButton className="w-full bg-white">
                      View Journal
                    </NeomorphicButton>
                  </Link>
                </div>
              </motion.div>
            ) : step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-on-surface">How do you feel after eating?</h2>
                  <p className="text-sm text-on-surface-variant/60">Be honest with yourself. There are no wrong answers here.</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'yes', label: 'Satisfied', icon: Smile, color: 'text-green-600' },
                    { id: 'neutral', label: 'Neutral', icon: Meh, color: 'text-amber-600' },
                    { id: 'no', label: 'Unsatisfied', icon: Frown, color: 'text-red-600' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSatisfied(option.id as any)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all",
                        satisfied === option.id 
                          ? "bg-primary/5 border-primary shadow-inner" 
                          : "bg-surface border-outline/10 hover:border-primary/30"
                      )}
                    >
                      <option.icon className={cn("w-8 h-8", satisfied === option.id ? "text-primary" : "text-on-surface-variant/40")} />
                      <span className="text-xs font-bold uppercase tracking-widest">{option.label}</span>
                    </button>
                  ))}
                </div>

                 <div className="flex justify-between pt-4">
                  <button onClick={onClose} className="text-sm font-bold opacity-40 hover:opacity-100 transition-opacity uppercase tracking-widest">Cancel</button>
                  <NeomorphicButton 
                    disabled={!satisfied}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </NeomorphicButton>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-on-surface">Was this meal needed?</h2>
                  <p className="text-sm text-on-surface-variant/60">Reflecting on physical hunger vs emotional response.</p>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    { id: 'yes', label: 'Yes, I was physically hungry' },
                    { id: 'unsure', label: 'I was partially hungry' },
                    { id: 'no', label: 'No, it was emotional/habitual' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setWasNeeded(option.id as any)}
                      className={cn(
                        "w-full p-6 rounded-3xl border text-left transition-all",
                        wasNeeded === option.id 
                          ? "bg-primary/5 border-primary" 
                          : "bg-surface border-outline/10 hover:border-primary/30"
                      )}
                    >
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-bold opacity-40 hover:opacity-100 transition-opacity uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <NeomorphicButton 
                    disabled={!wasNeeded}
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </NeomorphicButton>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-on-surface">Any emotions present?</h2>
                  <p className="text-sm text-on-surface-variant/60">Select what rings true for you right now.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {EMOTIONS.map((emotion) => (
                    <button
                      key={emotion}
                      onClick={() => toggleEmotion(emotion)}
                      className={cn(
                        "px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all border",
                        selectedEmotions.includes(emotion)
                          ? "bg-[#3a3a2e] text-white border-[#3a3a2e] shadow-md"
                          : "bg-white text-on-surface-variant/60 border-outline/10 hover:border-primary/30"
                      )}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm font-bold opacity-40 hover:opacity-100 transition-opacity uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <NeomorphicButton 
                    onClick={() => setStep(4)}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </NeomorphicButton>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-on-surface">Final reflection</h2>
                  <p className="text-sm text-on-surface-variant/60">Anything else you&apos;d like to note about this experience?</p>
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Capture any thoughts or nuances here..."
                  className="w-full h-32 p-6 rounded-3xl bg-[#f5f5f0] border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none placeholder:opacity-30"
                />

                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(3)} className="flex items-center gap-2 text-sm font-bold opacity-40 hover:opacity-100 transition-opacity uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <NeomorphicButton 
                    onClick={handleSave}
                    disabled={isSaving}
                    variant="primary"
                    className="flex items-center gap-2 min-w-[120px] justify-center"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Complete Log
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </NeomorphicButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
