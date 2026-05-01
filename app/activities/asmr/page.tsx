'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Nav } from '@/components/Nav';
import { 
  ArrowLeft, 
  CloudRain, 
  Waves, 
  Wind, 
  Trees, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  Coffee
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NeomorphicButton } from '@/components/ui/NeomorphicButton';

const SOUNDS = [
  { 
    id: 'rain', 
    name: 'Soft Rain', 
    icon: CloudRain, 
    color: 'bg-blue-50', 
    textColor: 'text-blue-500',
    url: '/sounds/rain.mp3'
  },
  { 
    id: 'waves', 
    name: 'Ocean Waves', 
    icon: Waves, 
    color: 'bg-indigo-50', 
    textColor: 'text-indigo-500',
    url: '/sounds/waves.mp3'
  },
  { 
    id: 'forest', 
    name: 'Deep Forest', 
    icon: Trees, 
    color: 'bg-emerald-50', 
    textColor: 'text-emerald-500',
    url: '/sounds/forest.mp3'
  },
  { 
    id: 'wind', 
    name: 'High Wind', 
    icon: Wind, 
    color: 'bg-slate-50', 
    textColor: 'text-slate-400',
    url: '/sounds/wind.mp3'
  },
  { 
    id: 'lofi', 
    name: 'Lofi', 
    icon: Coffee, 
    color: 'bg-amber-50', 
    textColor: 'text-amber-600',
    url: '/sounds/lofi.mp3'
  }
];

export default function ASMRPage() {
  const router = useRouter();
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleSound = (soundId: string) => {
    if (activeSound === soundId) {
      setActiveSound(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    } else {
      // Stop previous if exists
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const sound = SOUNDS.find(s => s.id === soundId);
      if (sound) {
        const audio = new Audio(sound.url);
        audio.loop = true;
        audio.volume = volume;
        audio.play().catch(err => console.error("Audio playback failed:", err));
        audioRef.current = audio;
        setActiveSound(soundId);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f0] pt-32 pb-20 selection:bg-primary/20">
      <Nav />
      
      <main className="max-w-4xl mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
          <div className="space-y-4">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to home
            </button>
            <h1 className="text-4xl md:text-5xl font-serif text-[#3a3a2e] tracking-tight">ASMR Soundboard</h1>
            <p className="text-on-surface-variant/60 font-medium max-w-md">
              Create your own sanctuary of sound. Mix and match loopable textures to ground your senses.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-outline/5 shadow-sm">
            {volume === 0 ? <VolumeX className="w-5 h-5 opacity-20" /> : <Volume2 className="w-5 h-5 opacity-20" />}
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-32 accent-[#5a5a40]"
            />
          </div>
        </div>

        {/* Sound Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {SOUNDS.map((sound) => (
            <motion.div
              key={sound.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleSound(sound.id)}
              className={cn(
                "p-8 rounded-[40px] border cursor-pointer transition-all flex flex-col items-center gap-6 relative overflow-hidden",
                activeSound === sound.id 
                  ? "bg-white border-primary shadow-xl ring-4 ring-primary/5" 
                  : "bg-white border-outline/5 hover:border-outline/20 shadow-sm"
              )}
            >
              <div className={cn(
                "w-16 h-16 rounded-3xl flex items-center justify-center transition-transform",
                sound.color,
                activeSound === sound.id && "scale-110"
              )}>
                <sound.icon className={cn("w-8 h-8", sound.textColor)} />
              </div>
              
              <div className="text-center space-y-1">
                <h3 className="font-bold text-[#3a3a2e]">{sound.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">
                  {activeSound === sound.id ? 'Playing' : 'Tap to play'}
                </p>
              </div>

              {activeSound === sound.id && (
                <motion.div 
                  layoutId="active-indicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary" 
                />
              )}

              {/* Animated pulses when playing */}
              {activeSound === sound.id && (
                <div className="absolute inset-0 pointer-events-none">
                  <motion.div 
                    animate={{ scale: [1, 2], opacity: [0.1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={cn("absolute inset-0 rounded-[40px]", sound.color)}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Focus Mode Card */}
        <div className="bg-[#3a3a2e] text-white p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-20 -mt-20" />
          
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <Play className="w-10 h-10 opacity-20" />
            </div>
            <div className="space-y-4 flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-serif">Ambient Integration</h2>
              <p className="opacity-60 leading-relaxed">
                Use these sounds during your mindful meals or stressful moments. Sound can act as a powerful anchor to the present moment, helping you stay grounded in your body.
              </p>
              <button 
                onClick={() => router.push('/')}
                className="text-xs font-bold uppercase tracking-widest text-[#d4a373] hover:text-[#d27d56] transition-colors"
              >
                Return to sanctuary dashboard &rarr;
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
