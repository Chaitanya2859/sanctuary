'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Nav } from '@/components/Nav';
import { NeomorphicButton } from '@/components/ui/NeomorphicButton';
import { cn } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import Link from 'next/link';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getFallbackResponse } from '@/lib/fallbackResponses';
import { 
  ArrowRight, 
  Clock, 
  Leaf, 
  Tag, 
  CheckCircle2, 
  AlertCircle,
  Wind,
  Coffee,
  Plus,
  Sparkles,
  Loader2
} from 'lucide-react';

interface JournalEntry {
  id: string;
  type: string;
  time: string;
  dateStr: string;
  tags: string[];
  trigger: string;
  hunger: number;
  reflection: string;
  aiReflection: string;
  usedUrgeSurfing?: boolean;
  afterEmotion?: string;
  wasNeeded?: 'Yes' | 'No' | 'Sort of';
  timestamp: Date;
}

const FILTERS = ['All', 'Today', 'Stressed', 'Bored', 'Lonely', 'Paused', "Didn't pause"];

export default function JournalPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [checkins, setCheckins] = useState<JournalEntry[]>([]);
  const [logs, setLogs] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const qCheckins = query(
          collection(db, 'checkins'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        
        const qLogs = query(
          collection(db, 'logs'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );

        const unsubCheckins = onSnapshot(qCheckins, (snapshot) => {
          const fetched = snapshot.docs.map(doc => {
            const data = doc.data();
            const date = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date();
            let aiRef = data.aiResponse || '';
            
            // Fallback for old checkins
            if (!aiRef) {
              aiRef = getFallbackResponse({
                mood: (data.emotions?.[0]) as any,
                hunger: data.hungerScale
              });
            }

            return {
              id: doc.id,
              type: data.type || (data.usedUrgeSurfing ? 'surge' : 'checkin'),
              time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              dateStr: date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase(),
              tags: data.emotions || [],
              trigger: data.trigger || 'Manual',
              hunger: data.hungerScale || 1,
              reflection: data.reflection || '',
              aiReflection: aiRef,
              usedUrgeSurfing: data.usedUrgeSurfing || false,
              timestamp: date
            };
          });
          setCheckins(fetched as JournalEntry[]);
          setLoading(false);
        });

        const unsubLogs = onSnapshot(qLogs, (snapshot) => {
          const fetched = snapshot.docs.map(doc => {
            const data = doc.data();
            const date = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date();
            
            let aiRef = data.aiResponse;
            if (!aiRef) {
              aiRef = data.wasNeeded === 'no' ? "You've identified this as emotional eating. That's a huge step in awareness." : "Nourishing yourself when hungry is a fundamental act of care.";
            }

            return {
              id: doc.id,
              type: 'log',
              time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              dateStr: date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase(),
              tags: data.emotions || [],
              trigger: 'Post-Meal',
              hunger: 0, 
              reflection: data.satisfied ? `Felt ${data.satisfied} after eating.` : '',
              aiReflection: aiRef,
              afterEmotion: Array.isArray(data.emotions) ? data.emotions[0] : undefined,
              wasNeeded: data.wasNeeded === 'yes' ? 'Yes' : data.wasNeeded === 'no' ? 'No' : 'Sort of',
              timestamp: date
            };
          });
          setLogs(fetched as JournalEntry[]);
        });

        return () => {
          unsubCheckins();
          unsubLogs();
        };
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const entries = [...checkins, ...logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Filter and group entries by date
  const filteredEntries = entries.filter(entry => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Today') {
      const today = new Date();
      return entry.timestamp.toDateString() === today.toDateString();
    }
    if (activeFilter === 'Paused') return entry.usedUrgeSurfing;
    if (activeFilter === "Didn't pause") return !entry.usedUrgeSurfing;
    return entry.tags.includes(activeFilter);
  });

  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    if (!acc[entry.dateStr]) acc[entry.dateStr] = [];
    acc[entry.dateStr].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  const dates = Object.keys(groupedEntries);

  return (
    <div className="min-h-screen bg-[#f5f5f0] pt-32 pb-20 selection:bg-[#5a5a40]/10">
      <Nav />
      
      <main className="max-w-4xl mx-auto px-6 space-y-12">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#5a5a40]/5 pb-12">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5a5a40]/40">Your Journal</span>
            <h1 className="text-4xl md:text-6xl font-serif text-[#3a3a2e] tracking-tight">
              Every check-in, remembered.
            </h1>
          </div>
          <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-40 pb-2">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </section>

        {/* Right Now CTA */}
        <section>
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-[#3a3a2e] text-white p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden group"
          >
            {/* Organic Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-white/10 transition-colors" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Right Now</span>
                <h2 className="text-3xl font-serif leading-tight">How are you feeling before your next meal?</h2>
                <p className="text-sm opacity-50 max-w-sm">A 60-second pause can change what happens next.</p>
              </div>
              <NeomorphicButton 
                variant="primary" 
                className="bg-white text-[#3a3a2e] hover:bg-white/90 px-8 py-4 h-auto w-full md:w-auto"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} // Placeholder
              >
                <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
                  Start check-in
                  <ArrowRight className="w-4 h-4" />
                </div>
              </NeomorphicButton>
            </div>
          </motion.div>
        </section>

        {/* Filters */}
        <section className="flex flex-wrap gap-2 pt-4">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                activeFilter === filter 
                  ? "bg-[#5a5a40] text-white shadow-md scale-105" 
                  : "bg-white text-[#5a5a40]/60 hover:bg-white/80 border border-[#5a5a40]/5"
              )}
            >
              {filter}
            </button>
          ))}
        </section>

        {/* Timeline */}
        <section className="space-y-16">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-8 h-8 text-[#5a5a40]/20 animate-spin" />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Attuning to your history...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-32 space-y-8 bg-white rounded-[40px] border border-[#5a5a40]/5 shadow-sm">
              <div className="w-24 h-24 bg-[#f5f5f0] rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110">
                <Leaf className="w-10 h-10 text-[#5a5a40]/30" />
              </div>
              <div className="space-y-4 max-w-sm mx-auto">
                <h3 className="font-serif text-3xl text-[#3a3a2e]">Your sanctuary awaits.</h3>
                <p className="text-sm opacity-50 px-4">
                  This journal is where your patterns become visible. Start with a single breath and a single check-in.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/#checkin-section">
                  <NeomorphicButton variant="primary" className="px-10">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                      Your First Entry
                      <Plus className="w-4 h-4" />
                    </div>
                  </NeomorphicButton>
                </Link>
              </div>
            </div>
          ) : (
            dates.map((date) => (
              <div key={date} className="space-y-8">
              <div className="flex items-center gap-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5a5a40]/30 whitespace-nowrap">
                  {date}
                </h3>
                <div className="h-[1px] w-full bg-[#5a5a40]/5" />
              </div>

              <div className="space-y-8">
                {groupedEntries[date].map((entry) => (
                  <motion.div 
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-[#5a5a40]/5 space-y-10"
                  >
                    {/* Entry Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#5a5a40]/40 font-mono tracking-tighter">
                          {entry.time}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {entry.tags.map(tag => (
                          <span key={tag} className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            tag === 'Stressed' ? "bg-red-50 text-red-600/70" : 
                            tag === 'Lonely' ? "bg-purple-50 text-purple-600/70" :
                            tag === 'Anxious' ? "bg-blue-50 text-blue-600/70" :
                            "bg-green-50 text-emerald-600/70"
                          )}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Entry Content */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest opacity-40">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#d27d56]" />
                          Trigger: {entry.trigger}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                              <div key={i} className={cn(
                                "w-1.5 h-1.5 rounded-sm",
                                i <= entry.hunger ? "bg-[#d27d56]" : "bg-[#5a5a40]/10"
                              )} />
                            ))}
                          </div>
                          Hunger {entry.hunger}/10
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#d27d56]/20 rounded-full" />
                        <blockquote className="pl-6 text-lg md:text-xl font-serif italic text-[#3a3a2e] leading-relaxed">
                          &quot;{entry.reflection}&quot;
                        </blockquote>
                      </div>
                    </div>

                    {/* AI Reflection */}
                    {entry.aiReflection && (
                      <div className="bg-primary/5 rounded-[32px] p-6 md:p-8 space-y-4 border border-primary/10">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Sanctuary Reflection</span>
                        </div>
                        <p className="text-sm md:text-base text-on-surface leading-relaxed max-w-3xl font-medium italic">
                          &quot;{entry.aiReflection}&quot;
                        </p>
                      </div>
                    )}

                    {/* Status Triggers & Actions */}
                    <div className="flex flex-wrap items-center gap-4 md:gap-8 border-t border-[#5a5a40]/5 pt-8">
                      {entry.usedUrgeSurfing && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#5a5a40]/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#5a5a40]/60">
                          <Clock className="w-3 h-3" />
                          Used urge surfing · Waited 5 min
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-6">
                        {entry.afterEmotion && (
                          <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                            <span className="opacity-30">After:</span>
                            <span className="bg-emerald-50 text-emerald-600/70 px-4 py-1.5 rounded-full">{entry.afterEmotion}</span>
                          </div>
                        )}
                        
                        {entry.wasNeeded && (
                          <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                            <span className="opacity-30">Was it needed?</span>
                            <span className={cn(
                              "font-bold",
                              entry.wasNeeded === 'Yes' ? "text-emerald-600" : 
                              entry.wasNeeded === 'No' ? "text-red-500" : 
                              "text-amber-600"
                            )}>{entry.wasNeeded}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

        {/* Load More */}
        <section className="flex justify-center pt-12">
          <NeomorphicButton className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity bg-transparent border-none shadow-none">
            Load earlier entries
          </NeomorphicButton>
        </section>
      </main>
    </div>
  );
}
