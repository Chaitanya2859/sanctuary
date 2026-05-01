'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Nav } from '@/components/Nav';
import { 
  Play, 
  Clock, 
  Heart, 
  Zap, 
  Moon, 
  Coffee, 
  Eye, 
  Brain,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { NeomorphicButton } from '@/components/ui/NeomorphicButton';

const ACTIVITIES = [
  {
    id: 'breathwork',
    title: '2-Minute Breathwork',
    desc: 'A quick reset to step out of "doing" mode and into "being" mode.',
    duration: '2 min',
    category: 'Mindfulness',
    icon: WindIcon,
    color: 'bg-[#416465]',
    intensity: 'Gentle',
    href: '/activities/breathwork'
  },
  {
    id: 'bubble-pop',
    title: 'Bubble Pop',
    desc: 'Slow bubbles float up the screen. Pop them gently. Pure distraction.',
    duration: '∞',
    category: 'Resilience',
    icon: Zap,
    color: 'bg-[#d4a373]',
    intensity: 'Calming',
    href: '/activities/bubble-pop'
  },
  {
    id: 'asmr',
    title: 'ASMR Soundboard',
    desc: 'Relaxing ambient noise to ground your senses.',
    duration: '∞',
    category: 'Mindfulness',
    icon: Coffee,
    color: 'bg-[#3a3a2e]',
    intensity: 'Gentle',
    href: '/activities/asmr'
  },
  {
    id: 'urge-surfing',
    title: 'Urge Surfing Deep Dive',
    desc: 'Learn to ride the wave of an impulse without acting on it.',
    duration: '10 min',
    category: 'Resilience',
    icon: Zap,
    color: 'bg-[#d27d56]',
    intensity: 'High Focus',
    href: '/surf'
  },
  {
    id: 'gratitude',
    title: 'Gratitude Scan',
    desc: 'Notice what nourishes you beyond food.',
    duration: '5 min',
    category: 'Gratitude',
    icon: Heart,
    color: 'bg-[#d4a373]',
    intensity: 'Reflective',
    href: '#'
  },
  {
    id: 'body-scan',
    title: 'Hunger & Fullness Scan',
    desc: 'Tune into your body\'s physical signals before you eat.',
    duration: '7 min',
    category: 'Body',
    icon: Eye,
    color: 'bg-[#5a5a40]',
    intensity: 'Deep',
    href: '#'
  }
];

function WindIcon(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12.8 5.2a3 3 0 1 0-2.8 3.8 3 3 0 0 0 3-3"/>
      <path d="M15.8 17.8a3 3 0 1 1-2.8-3.8 3 3 0 0 1 3 3"/>
      <path d="M5 12h14"/>
      <path d="m11 15-3-3 3-3"/>
    </svg>
  );
}

export default function ActivitiesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Mindfulness', 'Resilience', 'Gratitude', 'Body'];

  const filteredActivities = ACTIVITIES.filter(a => 
    filter === 'All' || a.category === filter
  );

  return (
    <div className="min-h-screen bg-[#f5f5f0] pt-32 pb-8 selection:bg-primary/20">
      <Nav />

      <main className="max-w-5xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#5a5a40] opacity-60">
                Resource Library
              </span>
              <h1 className="text-4xl md:text-6xl font-serif text-[#3a3a2e] tracking-tight">
                Recommended for you.
              </h1>
              <p className="text-on-surface-variant/60 font-medium max-w-xl">
                Practices specifically chosen to support your current patterns and strengths. No pressure, just options.
              </p>
            </div>
            <NeomorphicButton 
              variant="secondary"
              onClick={() => router.push('/progress')}
              className="text-xs px-6"
            >
              Back to Progress
            </NeomorphicButton>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                filter === cat 
                  ? "bg-[#3a3a2e] text-white shadow-lg" 
                  : "bg-white text-on-surface-variant/50 hover:bg-[#f5f5f0] border border-outline/5"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white rounded-[32px] overflow-hidden border border-outline/5 shadow-sm hover:shadow-xl transition-all h-full flex flex-col"
            >
              <div className={cn("p-8 flex items-center justify-center text-white relative h-48", activity.color)}>
                <activity.icon className="w-16 h-16 opacity-20 absolute scale-150 rotate-12" />
                <div className="relative z-10 w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                  <activity.icon className="w-10 h-10" />
                </div>
              </div>
              
              <div className="p-8 space-y-6 flex-1 flex flex-col">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">
                      {activity.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest opacity-40">
                      <Clock className="w-3 h-3" />
                      <span>{activity.duration}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-serif text-[#3a3a2e]">{activity.title}</h3>
                  <p className="text-sm text-on-surface-variant/60 leading-relaxed">
                    {activity.desc}
                  </p>
                </div>

                <div className="pt-4 mt-auto">
                  <NeomorphicButton 
                    variant="secondary"
                    onClick={() => activity.href !== '#' && router.push(activity.href)}
                    className="w-full py-4 rounded-2xl group/btn"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      Start Practice
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </span>
                  </NeomorphicButton>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Support Section */}
        <div className="bg-[#d27d56]/5 p-6 md:p-10 rounded-[40px] border border-[#d27d56]/10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <Brain className="w-10 h-10 text-[#d27d56]" />
          </div>
          <div className="space-y-3 text-center md:text-left">
            <h3 className="text-2xl font-serif text-[#3a3a2e]">Need something specific?</h3>
            <p className="text-sm text-on-surface-variant/60 leading-relaxed max-w-xl">
              Our library grows with your needs. If you&apos;re looking for a specific practice or have feedback on these activities, let us know through your daily check-ins.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
