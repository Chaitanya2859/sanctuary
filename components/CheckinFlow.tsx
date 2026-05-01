'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { NeomorphicButton } from './ui/NeomorphicButton';
import { ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";

import { checkSafety } from '@/lib/safety';
import { SafetyModal } from './SafetyModal';

import { getFallbackResponse } from '@/lib/fallbackResponses';

const FEELINGS = [
  'Joy', 'Trust', 'Fear', 'Surprise', 'Sadness', 'Disgust', 'Anger', 'Anticipation',
  'Calm', 'Bored', 'Lonely', 'Stressed'
];

const HUNGER_LABELS: Record<number, string> = {
  1: "Not at all",
  2: "Lingering",
  3: "Gentle",
  4: "Noticeable",
  5: "Real Hunger",
  6: "Hungry",
  7: "Very Hungry",
  8: "Uncomfortable",
  9: "Weak/Shaky",
  10: "Ravenous"
};

interface CheckinFlowProps {
  onComplete: (insight: string) => void;
}

export function CheckinFlow({ onComplete }: CheckinFlowProps) {
  const [step, setStep] = useState<'emotions' | 'hunger' | 'reflection'>('emotions');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [hunger, setHunger] = useState(5);
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [completeInsight, setCompleteInsight] = useState<string | null>(null);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion) 
        : [...prev, emotion]
    );
  };

  const handleReflectionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setReflection(val);
    if (checkSafety(val)) {
      setIsSafetyModalOpen(true);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      alert("Please sign in to save your check-in.");
      return;
    }

    try {
      setIsSaving(true);
      
      let aiResponse = "Every mindful moment is progress.";
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (apiKey) {
        try {
          const { GoogleGenAI } = await import("@google/genai");
          const ai = new GoogleGenAI({ apiKey });
          
          const prompt = `You are Sanctuary, a mindful eating coach. 
          The user just checked in with these details:
          - Emotions: ${selectedEmotions.join(', ')}
          - Hunger level: ${hunger}/10
          - Personal Note: ${reflection || 'None provided'}
          
          Provide a single, short (2-3 sentences), empathetic reflection or insight that helps the user feel seen and offers a small moment of mindfulness. 
          Avoid generic advice. Focus on the connection between their current feeling and the hunger level.
          Tone: Grounding, non-judgmental, and kind.
          Do NOT mention diet, weight, or calories.`;

          const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt
          });
          aiResponse = result.text || aiResponse;
        } catch (genError) {
          console.error("Gemini context generation failed, using fallback:", genError);
          aiResponse = getFallbackResponse({
            mood: selectedEmotions[0] as any,
            hunger: hunger
          });
        }
      } else {
        console.warn("Gemini API key not found, using pre-written guidance.");
        aiResponse = getFallbackResponse({
          mood: selectedEmotions[0] as any,
          hunger: hunger
        });
      }

      // 2. Save to Firestore
      await addDoc(collection(db, 'checkins'), {
        userId: auth.currentUser.uid,
        type: 'checkin',
        emotions: selectedEmotions,
        hungerScale: hunger,
        reflection: reflection,
        aiResponse: aiResponse,
        timestamp: serverTimestamp(),
      });

      setCompleteInsight(aiResponse);
      onComplete(aiResponse);
    } catch (error) {
      console.error("Check-in failed:", error);
      const fallback = getFallbackResponse({
        mood: selectedEmotions[0] as any,
        hunger: hunger
      });
      setCompleteInsight(fallback);
      onComplete(fallback);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="theme-card p-6 md:p-12 w-full max-w-2xl mx-auto min-h-[450px] flex flex-col justify-between"
    >
      <AnimatePresence mode="wait">
        {completeInsight ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-8"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Your Sanctuary Reflection</span>
              <h2 className="text-2xl md:text-3xl font-serif text-on-surface leading-tight">
                &quot;{completeInsight}&quot;
              </h2>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <NeomorphicButton 
                variant="primary" 
                onClick={() => {
                  setStep('emotions');
                  setSelectedEmotions([]);
                  setHunger(5);
                  setReflection('');
                  setCompleteInsight(null);
                }}
                className="px-8"
              >
                Log another moment
              </NeomorphicButton>
              <Link href="/journal">
                <NeomorphicButton className="px-8 bg-white w-full sm:w-auto">
                  View Journal
                </NeomorphicButton>
              </Link>
            </div>
          </motion.div>
        ) : step === 'emotions' ? (
          <motion.div
            key="emotions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Step 1 of 3</span>
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-on-surface">
                How are you feeling right now?
              </h2>
              <p className="text-on-surface-variant/60 text-sm">Select all that apply.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {FEELINGS.map((feeling) => (
                <button
                  key={feeling}
                  onClick={() => toggleEmotion(feeling)}
                  className={cn(
                    'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border',
                    selectedEmotions.includes(feeling)
                      ? 'bg-primary text-on-primary border-primary shadow-md'
                      : 'bg-background text-on-surface-variant border-outline/10 hover:border-primary/30'
                  )}
                >
                  {feeling}
                </button>
              ))}
            </div>

            <div className="pt-6 flex justify-end">
              <button 
                onClick={() => setStep('hunger')}
                disabled={selectedEmotions.length === 0}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-full font-bold uppercase text-[10px] tracking-widest disabled:opacity-30 transition-all hover:gap-3"
              >
                Next Step
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ) : step === 'hunger' ? (
          <motion.div
            key="hunger"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Step 2 of 3</span>
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-on-surface">
                Check your hunger levels.
              </h2>
              <p className="text-on-surface-variant/60 text-sm">Where are you on the scale?</p>
            </div>

            <div className="space-y-8">
              <div className="relative group">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={hunger}
                  onChange={(e) => setHunger(parseInt(e.target.value))}
                  className="w-full h-3 bg-background rounded-full appearance-none cursor-pointer accent-primary border border-outline/10"
                />
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-40 pt-4">
                  <span>Mindful</span>
                  <span>Physical</span>
                  <span>Urgent</span>
                </div>
              </div>

              <div className="bg-primary/5 p-8 rounded-[40px] border border-primary/10 text-center space-y-2">
                <span className="text-6xl font-serif text-primary">{hunger}</span>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary/60">
                  {HUNGER_LABELS[hunger]}
                </p>
              </div>
            </div>

            <div className="pt-6 flex justify-between items-center">
              <button 
                onClick={() => setStep('emotions')}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 hover:text-on-surface transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </button>
              <button 
                onClick={() => setStep('reflection')}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-full font-bold uppercase text-[10px] tracking-widest hover:gap-3 transition-all"
              >
                Next Step
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reflection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Step 3 of 3</span>
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-on-surface">
                Quick reflection.
              </h2>
              <p className="text-on-surface-variant/60 text-sm">Anything on your mind? (Optional)</p>
            </div>

            <textarea
              value={reflection}
              onChange={handleReflectionChange}
              placeholder="I'm feeling a bit restless because..."
              className="w-full min-h-[160px] bg-background p-6 rounded-3xl border border-outline/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all resize-none text-on-surface"
            />

            <div className="pt-6 flex justify-between items-center">
              <button 
                onClick={() => setStep('hunger')}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 hover:text-on-surface transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </button>
              <NeomorphicButton 
                variant="primary" 
                onClick={handleSave}
                disabled={isSaving}
                className="px-10 h-14"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Complete Check-in
                  </div>
                )}
              </NeomorphicButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SafetyModal 
        isOpen={isSafetyModalOpen} 
        onClose={() => setIsSafetyModalOpen(false)} 
      />
    </motion.div>
  );
}
