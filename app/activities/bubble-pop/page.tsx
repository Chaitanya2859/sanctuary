'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Nav } from '@/components/Nav';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Bubble {
  id: number;
  x: number;
  y: number; // current y in pixels from bottom
  size: number;
  speed: number;
  drift: number;
  driftOffset: number;
  color: string;
  opacity: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  color: string;
}

const COLORS = [
  'rgba(210, 125, 86, 0.4)',  // #d27d56 (Rust)
  'rgba(65, 100, 101, 0.4)',  // #416465 (Teal)
  'rgba(90, 90, 64, 0.4)',    // #5a5a40 (Olive)
  'rgba(212, 163, 115, 0.4)', // #d4a373 (Sand)
  'rgba(58, 58, 46, 0.4)',    // #3a3a2e (Dark)
];

export default function BubblePopPage() {
  const router = useRouter();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const requestRef = useRef<number>(null);
  const lastSpawnTime = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const createBubble = useCallback(() => {
    const id = Math.random();
    const size = Math.random() * 50 + 40; // 40-90px
    const width = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const x = Math.random() * (width - size - 40) + 20;
    const speed = Math.random() * 0.4 + 0.4; // 0.4 - 0.8px per frame
    const drift = Math.random() * 0.5 + 0.2;
    const driftOffset = Math.random() * Math.PI * 2;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    return { id, x, y: -size, size, speed, drift, driftOffset, color, opacity: 1 };
  }, []);

  const spawnParticles = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
      id: Math.random(),
      x,
      y,
      angle: (i / 8) * Math.PI * 2 + (Math.random() * 0.5),
      speed: Math.random() * 2 + 2,
      color,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    
    // Cleanup particles after 1s
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 8000); // Keep them in state for duration of motion.div exit if we used it, but here we'll just use a timeout or manual cleanup
  };

  const animateRef = useRef<(time: number) => void>(null);

  useEffect(() => {
    animateRef.current = (time: number) => {
      // 1. Spawning Logic
      const spawnInterval = Math.random() * 700 + 800; // 0.8 - 1.5s
      if (time - lastSpawnTime.current > spawnInterval) {
        setBubbles(prev => {
          if (prev.length < 8) {
            return [...prev, createBubble()];
          }
          return prev;
        });
        lastSpawnTime.current = time;
      }

      // 2. Movement Logic
      setBubbles(prev => 
        prev
          .map(b => {
            const newY = b.y + b.speed;
            const driftX = Math.sin(newY * 0.01 + b.driftOffset) * b.drift;
            
            // Fade out near top
            const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;
            let opacity = 1;
            if (newY > windowHeight * 0.8) {
              opacity = Math.max(0, 1 - (newY - windowHeight * 0.8) / (windowHeight * 0.2));
            }

            return { ...b, y: newY, x: b.x + driftX, opacity };
          })
          .filter(b => {
            const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;
            return b.y < windowHeight + b.size && b.opacity > 0;
          })
      );

      // 3. Particle Movement
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          x: p.x + Math.cos(p.angle) * p.speed,
          y: p.y - Math.sin(p.angle) * p.speed,
          speed: p.speed * 0.95 // friction
        }))
      );

      requestRef.current = requestAnimationFrame((t) => animateRef.current?.(t));
    };

    requestRef.current = requestAnimationFrame((t) => animateRef.current?.(t));
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [createBubble]);

  const handlePop = (bubble: Bubble) => {
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
    spawnParticles(bubble.x + bubble.size / 2, bubble.y + bubble.size / 2, bubble.color);
    
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(5);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f5] overflow-hidden relative touch-none select-none" ref={containerRef}>
      <Nav />
      
      {/* Background Zen Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[150px] opacity-20" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-100 rounded-full blur-[150px] opacity-20" />
      </div>

      {/* Header Info */}
      <div className="fixed top-24 left-0 right-0 z-50 flex items-center justify-between px-8 pointer-events-none">
        <button 
          onClick={() => router.push('/activities')}
          className="p-4 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-outline/5 pointer-events-auto hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 opacity-40" />
        </button>
        
        <div className="text-center px-8 py-4 rounded-full bg-white/40 backdrop-blur-md border border-white/20">
          <h1 className="text-lg font-serif text-[#3a3a2e]">Bubble Pop</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 italic">Tap gently. Breathe.</p>
        </div>

        <div className="w-12" />
      </div>

      {/* Bubbles Layer */}
      <div className="absolute inset-0 pt-20">
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            onPointerDown={() => handlePop(bubble)}
            style={{
              width: bubble.size,
              height: bubble.size,
              left: bubble.x,
              bottom: bubble.y,
              backgroundColor: bubble.color,
              opacity: bubble.opacity,
            }}
            className="absolute rounded-full border border-white/40 shadow-[inset_0_4px_12px_rgba(255,255,255,0.4)] backdrop-blur-[1px] cursor-pointer"
          >
             {/* Gloss Effect */}
             <div className="absolute top-[15%] left-[20%] w-[20%] h-[20%] bg-white/40 rounded-full blur-[1px]" />
          </motion.div>
        ))}

        {/* Particles Layer */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 4,
              height: 4,
              left: p.x,
              bottom: p.y,
              backgroundColor: p.color,
              filter: 'blur(0.5px)',
              transition: 'opacity 0.8s ease-out'
            }}
          />
        ))}
      </div>

      {/* Hidden Instructions */}
      <div className="fixed bottom-12 left-0 right-0 text-center pointer-events-none">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#3a3a2e] opacity-10">No score. No limits. Just presence.</p>
      </div>
    </div>
  );
}
