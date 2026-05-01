'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Nav } from '@/components/Nav';
import { NeomorphicButton } from '@/components/ui/NeomorphicButton';
import { CheckinFlow } from '@/components/CheckinFlow';
import { PostEatLogFlow } from '@/components/PostEatLogFlow';
import { InsightCard } from '@/components/ui/InsightCard';
import { StatCircle } from '@/components/ui/StatCircle';
import { ArrowRight, Sparkles, Brain, Leaf, Quote, Plus, Heart, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { LandingView } from '@/components/LandingView';
import { useEffect } from 'react';

export default function SanctuaryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentInsight, setCurrentInsight] = useState<string>('');
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [dailyThought, setDailyThought] = useState('');

  const [topEmotionsDashboard, setTopEmotionsDashboard] = useState<string[]>([]);
  const [hasNoData, setHasNoData] = useState(false);
  const [stats, setStats] = useState({
    streak: 0,
    stability: 0,
    dailyMovement: 0,
    insights: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Fetch stats
        const fetchStats = async () => {
          const now = new Date();
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const qAll = query(
            collection(db, 'checkins'),
            where('userId', '==', u.uid),
            where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
            orderBy('timestamp', 'desc')
          );
          
          const qLogs = query(
            collection(db, 'logs'),
            where('userId', '==', u.uid),
            where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
            orderBy('timestamp', 'desc')
          );

          const [checkinsSnap, logsSnap] = await Promise.all([
            getDocs(qAll),
            getDocs(qLogs)
          ]);

          const checkins = checkinsSnap.docs.map(d => ({ ...d.data(), type: 'checkin' }));
          const logs = logsSnap.docs.map(d => ({ ...d.data(), type: 'log' }));
          const allEntries = [...checkins, ...logs].sort((a, b) => 
            (b.timestamp as Timestamp).toMillis() - (a.timestamp as Timestamp).toMillis()
          );

          if (allEntries.length === 0) {
            setHasNoData(true);
            return;
          }

          const uniqueDates = new Set(allEntries.map(e => (e.timestamp as Timestamp).toDate().toDateString()));
          
          // Streak
          let streakCount = 0;
          const checkDate = new Date();
          while (true) {
            if (uniqueDates.has(checkDate.toDateString())) {
              streakCount++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              if (streakCount === 0) {
                checkDate.setDate(checkDate.getDate() - 1);
                if (uniqueDates.has(checkDate.toDateString())) continue;
              }
              break;
            }
          }

          // Stability
          const activeLast14 = Array.from({ length: 14 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return uniqueDates.has(d.toDateString()) ? 1 : 0;
          }).reduce((a, b) => a + b, 0);

          // Daily Movement
          const todayCount = allEntries.filter(e => 
            (e.timestamp as Timestamp).toDate().toDateString() === new Date().toDateString()
          ).length;

          setStats({
            streak: streakCount,
            stability: Math.floor((activeLast14 / 14) * 10),
            dailyMovement: todayCount,
            insights: Math.floor(checkins.filter(c => c.aiResponse).length / 5) || 0
          });

          // Dynamic thought
          const thoughts = [
            "The smallest action is better than the greatest intention.",
            "Awareness is the first step toward transformation.",
            "Each pause is a victory for your resilience.",
            "Be patient and kind with your progress today.",
            "Your strength grows with every mindful moment."
          ];
          setDailyThought(thoughts[new Date().getDate() % thoughts.length]);

          const counts: Record<string, number> = {};
          checkins.forEach(c => {
            (c.emotions || []).forEach((e: string) => {
              counts[e] = (counts[e] || 0) + 1;
            });
          });
          setTopEmotionsDashboard(Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 3).map(([n]) => n));
          
          if (!checkinsSnap.empty) {
            const lastWithAi = checkins.find(c => c.aiResponse);
            if (lastWithAi) setCurrentInsight(lastWithAi.aiResponse as string);
          }
        };

        fetchStats();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bone">
        <Loader2 className="w-8 h-8 text-moss animate-spin opacity-20" />
      </div>
    );
  }

  if (!user) {
    return <LandingView />;
  }

  return (
    <div className="min-h-screen pt-24 pb-8 selection:bg-primary-container selection:text-on-primary-container">
      <Nav />
      {isLogOpen && <PostEatLogFlow onClose={() => setIsLogOpen(false)} onComplete={() => setIsLogOpen(false)} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 space-y-8 md:space-y-16 overflow-x-hidden">
        {/* Onboarding Banner for New Users */}
        {hasNoData && (
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-6"
          >
            <div className="bg-[#5a5a40]/5 border border-[#5a5a40]/10 rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-[#d4a373] animate-pulse" />
              </div>
              <div className="space-y-4 text-center md:text-left flex-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d27d56]">Welcome to Sanctuary</span>
                <h2 className="text-3xl md:text-4xl font-serif text-[#3a3a2e] leading-tight">Your first check-in transforms your awareness.</h2>
                <p className="text-on-surface-variant/60 leading-relaxed max-w-2xl font-medium">
                  We noticed your sanctuary is quiet. Begin by simply checking in with your physical hunger. 
                  It takes 60 seconds and builds the foundation of your journey.
                </p>
                <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                  <NeomorphicButton 
                    variant="primary" 
                    onClick={() => {
                      const el = document.getElementById('checkin-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-8 text-xs flex items-center gap-2"
                  >
                    Start Guided Entry
                    <ArrowRight className="w-4 h-4" />
                  </NeomorphicButton>
                  <Link href="/surf">
                    <button className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                      Learn about Urge Surfing
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center min-h-[400px] md:min-h-[500px] pt-8 md:pt-0">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 md:space-y-8 text-center lg:text-left order-2 lg:order-1"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif leading-[1.1] tracking-tight text-on-surface">
              Nurture your <br />
              <span className="text-primary/80">inner landscape.</span>
            </h1>
            <p className="text-base md:text-xl text-on-surface-variant leading-relaxed max-w-lg mx-auto lg:mx-0 font-sans opacity-80">
              Welcome back to your daily ritual. Take five minutes to breathe, ground, and align your intentions for the day ahead.
            </p>
            <div className="pt-2 md:pt-4 flex flex-col sm:flex-row gap-4">
              <NeomorphicButton 
                variant="primary" 
                icon={Plus} 
                onClick={() => setIsLogOpen(true)}
                className="h-14 md:h-16 px-8 md:px-10 text-base md:text-lg w-full sm:w-auto"
              >
                Record Post-Meal Log
              </NeomorphicButton>
              <NeomorphicButton 
                onClick={() => {
                  const el = document.getElementById('checkin-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-14 md:h-16 px-8 md:px-10 text-base md:text-lg w-full sm:w-auto bg-white"
              >
                Start Check-in
              </NeomorphicButton>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-[300px] sm:h-[400px] md:h-[550px] w-full rounded-[32px] md:rounded-[40px] shadow-[0_20px_50px_rgba(90,90,64,0.1)] bg-white p-2 md:p-3 order-1 lg:order-2"
          >
            <div className="relative w-full h-full rounded-[24px] md:rounded-[32px] overflow-hidden">
              <div className="organic-glow top-[-50px] right-[-50px] opacity-30 md:opacity-100" />
              <Image 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPiAVde33mG-JbfhMI3M9GtlTX3xPRezg5O9mSVuKK5EUPEiVbTaZBkaeNKsBwKe_8aNWppE3Ad1d5iOANnbx6U5Kdh-f9GIhnyHvZWdz_eKtfdVaoaAsWhClvMgNB-QMjcdxMu3JXE8Wsnu6crpnbBC-o_PD5hi7Dx2TnkWjbg-xIt19O3JNhPY0Ckr9nbcXE1dPl1o19h1HgXvy1bVXZ9lWkCMHc-fKewyTAnw2VWp0UZx8IVeIQ8ODEf84uZY8Cu7TfJNc1oVLD"
                alt="Serene abstract landscape"
                fill
                className="object-cover opacity-95 grayscale-[0.2] contrast-[1.1] relative z-10"
                referrerPolicy="no-referrer"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-6 md:bottom-10 -left-2 md:-left-12 bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-2xl max-w-[220px] md:max-w-[280px] border border-white/50 z-20"
            >
              <Quote className="w-6 h-6 md:w-8 md:h-8 text-primary mb-2 md:mb-3 opacity-30" />
              <p className="font-serif text-base md:text-lg text-on-surface-variant italic leading-relaxed">
                Awareness is the first step to change.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Check-in Section */}
        <section id="checkin-section" className="flex justify-center py-4 md:py-8">
          <CheckinFlow onComplete={(insight) => setCurrentInsight(insight)} />
        </section>

        {/* Sessions Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch py-8">
          <div className="space-y-4 flex flex-col justify-center">
            <h2 className="text-3xl md:text-5xl font-serif text-on-surface tracking-tight mb-4 text-center lg:text-left">
              Recommended for you
            </h2>
            <div className="space-y-4">
              {[
                { 
                  icon: Leaf, 
                  title: "Breathwork", 
                  desc: "2 min • Beginner",
                  color: "bg-surface-dim",
                  href: "/activities/breathwork"
                },
                { 
                  icon: Sparkles, 
                  title: "Bubble Pop", 
                  desc: "Pure distraction • No timer",
                  color: "bg-tertiary-container",
                  href: "/activities/bubble-pop"
                },
                { 
                  icon: Leaf, 
                  title: "ASMR Board", 
                  desc: "Relaxing noise • Soundboard",
                  color: "bg-surface-dim",
                  href: "/activities/asmr"
                }
              ].map((feature, i) => (
                <Link href={feature.href || "#"} key={i} className="block">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ x: 10 }}
                    className={`flex items-center justify-between p-6 md:p-8 rounded-[28px] md:rounded-[32px] cursor-pointer transition-all ${feature.color}`}
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/50 rounded-full flex items-center justify-center">
                        <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-on-surface-variant" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-on-surface">{feature.title}</h3>
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">{feature.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 opacity-30" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="h-full min-h-[400px] md:min-h-[500px]">
            <InsightCard insight={currentInsight} />
          </div>
        </section>

        {/* Journey Stats */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 py-8 items-start">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-serif text-on-surface tracking-tight text-center lg:text-left">
              Your Daily Movement
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <StatCircle value={stats.dailyMovement} label="Daily Movement" color="#5a5a40" progress={Math.min(1, stats.dailyMovement / 5)} />
              <StatCircle value={stats.streak} label="Days Streak" color="#d27d56" progress={Math.min(1, stats.streak / 30)} />
              <StatCircle value={stats.stability} label="Stability" color="#d4a373" progress={stats.stability / 10} />
              <StatCircle value={stats.insights} label="Insights" color="#416465" progress={Math.min(1, stats.insights / 10)} />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="p-6 md:p-8 theme-card bg-secondary-container/30 border-none space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Today&apos;s Focus</span>
              <p className="text-2xl font-serif leading-tight">{dailyThought || 'Gratitude & Resilience'}</p>
              <div className="h-2 opacity-20 bg-gradient-to-r from-secondary-container to-transparent rounded-full" />
            </div>
            
            {topEmotionsDashboard.length > 0 && (
              <div className="p-6 md:p-8 theme-card bg-[#5a5a40]/5 border-none space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5a5a40]/60">Top Drivers</span>
                <div className="flex flex-wrap gap-2">
                  {topEmotionsDashboard.map((e) => (
                    <span key={e} className="bg-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#5a5a40]">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </section>
      </main>

      {/* Support Section */}
      <section id="support" className="max-w-4xl mx-auto px-6 py-6 md:py-12">
        <div className="bg-white rounded-[40px] p-10 md:p-16 shadow-2xl border border-red-100 space-y-8">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-3xl md:text-5xl font-serif text-[#3a3a2e]">You are not alone.</h2>
            <p className="text-on-surface-variant/60 max-w-xl leading-relaxed">
              Mindful eating is a journey, and some days are harder than others. If you are struggling with disordered eating or need someone to talk to right now, help is available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-[#f5f5f0] rounded-3xl space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-[#3a3a2e]/60">NIMHANS Helpline</h4>
              <p className="font-serif text-xl">080-46110007</p>
              <p className="text-xs opacity-50">National Institute of Mental Health (India)</p>
            </div>
            <div className="p-8 bg-[#f5f5f0] rounded-3xl space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-[#3a3a2e]/60">Vandrevala Foundation</h4>
              <p className="font-serif text-xl">9999-666-555</p>
              <p className="text-xs opacity-50">24/7 Psychological Support (Free & Anonymous)</p>
            </div>
          </div>

          <div className="pt-6 border-t border-[#5a5a40]/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">
              Sanctuary is a support tool, not a clinical diagnosis. Always seek professional help for medical conditions.
            </p>
          </div>
        </div>
      </section>

      <footer className="w-full py-4 border-t border-outline/5 bg-white/50 mt-8 md:mt-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="font-serif text-3xl font-bold tracking-tighter opacity-20">Sanctuary.</div>
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/20 italic">
              &quot;Mindful awareness in every breath.&quot;
            </div>
          </div>
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/40">
            Sanctuary
          </div>
        </div>
      </footer>
    </div>
  );
}
