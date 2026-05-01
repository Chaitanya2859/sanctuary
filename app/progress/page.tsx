'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { Nav } from '@/components/Nav';
import { Check, Trophy, Flag, Star, Lock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { NeomorphicButton } from '@/components/ui/NeomorphicButton';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp, 
  orderBy 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProgressPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any[]>([]);
  const [days, setDays] = useState<any[]>([]);
  const [pauseTrend, setPauseTrend] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [streak, setStreak] = useState(0);
  const [stability, setStability] = useState(0);
  const [dailyMovement, setDailyMovement] = useState(0);
  const [pauseRate, setPauseRate] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pausesCount, setPausesCount] = useState(0);

  const [viewDate, setViewDate] = useState(new Date());

  const fetchRealStats = useCallback(async (uid: string, targetDate: Date) => {
    setLoading(true);
    try {
      const now = new Date();
      // For general stats like streak and stability, we look at the last 30/60 days relative to today
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // For heatmap, we need the specific month
      const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

      // We'll fetch from whichever is earlier: 30 days ago or start of the viewed month
      const rangeStart = startOfMonth < thirtyDaysAgo ? startOfMonth : thirtyDaysAgo;
      const startTimestamp = Timestamp.fromDate(rangeStart);

      // Fetch Checkins and Logs
      const qCheckins = query(
        collection(db, 'checkins'),
        where('userId', '==', uid),
        where('timestamp', '>=', startTimestamp),
        orderBy('timestamp', 'desc')
      );
      
      const qLogs = query(
        collection(db, 'logs'),
        where('userId', '==', uid),
        where('timestamp', '>=', startTimestamp),
        orderBy('timestamp', 'desc')
      );

      const [checkinsSnap, logsSnap] = await Promise.all([
        getDocs(qCheckins),
        getDocs(qLogs)
      ]);

      const checkins = checkinsSnap.docs
        .map(d => ({ ...d.data(), type: 'checkin' } as { timestamp: Timestamp; type: string; usedUrgeSurfing?: boolean; emotions?: string[] }))
        .filter(e => e.timestamp);
      const logs = logsSnap.docs
        .map(d => ({ ...d.data(), type: 'log' } as { timestamp: Timestamp; type: string; satisfied?: string; emotions?: string[] }))
        .filter(e => e.timestamp);
      
      const allEntries = [...checkins, ...logs].sort((a, b) => 
        (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0)
      );

      if (allEntries.length === 0) {
        setHasData(false);
        setLoading(false);
        return;
      }

      const uniqueDates = new Set(allEntries.map(e => e.timestamp?.toDate().toDateString()).filter(Boolean));
      const dailyCounts: Record<number, number> = {};
      
      allEntries.forEach(entry => {
        const date = entry.timestamp.toDate();
        if (date.getMonth() === targetDate.getMonth() && date.getFullYear() === targetDate.getFullYear()) {
          const d = date.getDate();
          dailyCounts[d] = (dailyCounts[d] || 0) + 1;
        }
      });

      const heatmap = Array.from({ length: daysInMonthLabel }, (_, i) => {
        const d = i + 1;
        const count = dailyCounts[d] || 0;
        const level = Math.min(4, count);
        return { day: d, level };
      });
      setDays(heatmap);

      // 2. Calculate Streak
      const uniqueDates = new Set(allEntries.map(e => e.timestamp.toDate().toDateString()));
      let currentStreak = 0;
      const checkDate = new Date();
      
      // If today is empty, we check if there's a streak ending yesterday
      if (!uniqueDates.has(checkDate.toDateString())) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      // Count backwards as long as we find consecutive days
      while (uniqueDates.has(checkDate.toDateString())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        // Safety break to prevent infinite loops (e.g. 10 years max)
        if (currentStreak > 3650) break;
      }
      setStreak(currentStreak);

      // 3. Stability Score (Consistency over last 14 days)
      // Percentage of days active in last 14 days * 10
      const activeLast14 = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return uniqueDates.has(d.toDateString()) ? 1 : 0;
      }).reduce((a: number, b: number) => a + b, 0);
      const stabilityValue = Math.floor((activeLast14 / 14) * 10);
      setStability(stabilityValue);

      // 4. Daily Movement (Today's activity count)
      const todayCount = allEntries.filter(e => 
        e.timestamp.toDate().toDateString() === new Date().toDateString()
      ).length;
      setDailyMovement(todayCount);

      // 5. General Stats
      const totalCount = checkins.length;
      const pausesCount = checkins.filter((c: any) => c.usedUrgeSurfing).length;
      const pauseRateValue = totalCount > 0 ? Math.round((pausesCount / totalCount) * 100) : 0;
      
      setTotalCount(totalCount);
      setPausesCount(pausesCount);
      setPauseRate(pauseRateValue);

      const newStats = [
        { value: todayCount.toString(), label: 'Your Daily Movement', sub: 'entries today', color: 'text-[#5a5a40]' },
        { value: currentStreak.toString(), label: 'Days Streak', sub: 'consecutive days', color: 'text-[#d27d56]' },
        { value: stabilityValue.toString(), label: 'Stability', sub: 'of 10 points', color: 'text-[#5a5a40]' },
        { value: Math.floor(totalCount / 10).toString(), label: 'Insights', sub: 'milestones met', color: 'text-[#d4a373]' },
      ];
      setStats(newStats);
      setHasData(allEntries.length > 0);

      // 6. Pause Trend
      const weeklyPauses = [0, 0, 0, 0];
      for (let i = 0; i < 4; i++) {
        const end = new Date();
        end.setDate(end.getDate() - (i * 7));
        const start = new Date();
        start.setDate(start.getDate() - ((i + 1) * 7));
        
        const weekCheckins = checkins.filter((c: any) => {
          const d = c.timestamp.toDate();
          return d >= start && d < end;
        });
        
        if (weekCheckins.length > 0) {
          const weekPauseRate = weekCheckins.filter((c: any) => c.usedUrgeSurfing).length / weekCheckins.length;
          weeklyPauses[3 - i] = weekPauseRate;
        } else {
          weeklyPauses[3 - i] = 0;
        }
      }
      setPauseTrend(weeklyPauses);

    } catch (err) {
      console.error("Failed to fetch real stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchRealStats(user.uid, viewDate);
      } else {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [fetchRealStats, viewDate, router]);

  const changeMonth = (offset: number) => {
    setViewDate(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + offset);
      return next;
    });
  };

  const dailyThought = useMemo(() => {
    const thoughts = [
      "The smallest action is better than the greatest intention. Your pause today is a testament to your growing strength.",
      "Awareness is not about being present. Each check-in is a success in itself.",
      "Gratitude turns what we have into enough. Notice one small thing you're grateful for in this moment.",
      "Resilience is like a muscle. Each time you notice an urge and choose awareness, you're getting stronger.",
      "You don't have to see the whole staircase, just take the first step. Today's awareness is that step.",
      "Your relationship with food is a journey, not a destination. Be patient and kind with yourself today."
    ];
    const day = new Date().getDate();
    return thoughts[day % thoughts.length];
  }, []);

  const milestones = [
    { 
      title: 'First awareness', 
      desc: 'You completed your first check-in. That single moment of awareness is where everything starts.', 
      date: totalCount > 0 ? 'Unlocked' : 'Coming soon', 
      icon: Check, 
      unlocked: totalCount > 0 
    },
    { 
      title: 'Active habit', 
      desc: 'You\'ve built a habit of showing up. You have a streak of 3+ days.', 
      date: streak >= 3 ? 'Unlocked' : 'Not yet', 
      icon: Star, 
      unlocked: streak >= 3 
    },
    { 
      title: 'Pattern observer', 
      desc: 'You are starting to see the why behind the what. Logged 10+ entries to see patterns.', 
      date: totalCount >= 10 ? 'Unlocked' : 'Keep going', 
      icon: Flag, 
      unlocked: totalCount >= 10 
    },
    { 
      title: 'Master of the Pause', 
      desc: 'High rate of mindful pauses. You reached a 50% pause rate.', 
      date: pauseRate >= 50 ? 'Unlocked' : 'Locked', 
      icon: Trophy, 
      unlocked: pauseRate >= 50 
    },
  ];

  const timeline = [
    { date: 'Step 1', content: 'You start noticing. Every check-in adds a layer of awareness.', color: 'bg-[#d27d56]' },
    { date: 'Step 2', content: 'Pausing becomes possible. The space between impulse and action grows.', color: 'bg-[#d4a373]' },
    { date: 'Step 3', content: 'Patterns reveal themselves. You see the stress or boredom for what it is.', color: 'bg-[#5a5a40]' },
    { date: 'Today', content: `Current progress: ${totalCount} check-ins and growing momentum.`, color: 'bg-[#d27d56]', current: true },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f0] pt-32 pb-8 selection:bg-primary/20">
      <Nav />

      <main className="max-w-5xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#5a5a40] opacity-60">
            Your Growth
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-[#3a3a2e] tracking-tight">
            Every check-in is progress.
          </h1>
          <p className="text-on-surface-variant/60 font-medium">
            Not streaks. Not perfection. Just you showing up, one pause at a time.
          </p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={i} 
                className="bg-white p-6 md:p-8 rounded-[32px] border border-outline/5 shadow-sm text-center space-y-4 animate-pulse"
              >
                <div className="h-12 w-16 bg-[#f0f0eb] rounded-2xl mx-auto" />
                <div className="space-y-2">
                  <div className="h-2 w-24 bg-[#f0f0eb] rounded-full mx-auto" />
                  <div className="h-2 w-16 bg-[#f0f0eb] rounded-full mx-auto opacity-40" />
                </div>
              </div>
            ))
          ) : (
            (stats.length > 0 ? stats : [
              { value: '0', label: 'Your Daily Movement', sub: 'entries today', color: 'text-[#3a3a2e]/20' },
              { value: '0', label: 'Days Streak', sub: 'consecutive days', color: 'text-[#3a3a2e]/20' },
              { value: '0', label: 'Stability', sub: 'of 10 points', color: 'text-[#3a3a2e]/20' },
              { value: '0', label: 'Insights', sub: 'milestones met', color: 'text-[#3a3a2e]/20' },
            ]).map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 md:p-8 rounded-[32px] border border-outline/5 shadow-sm text-center space-y-2"
              >
                <span className={cn("text-4xl md:text-5xl font-bold", stat.color)}>{stat.value}</span>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#3a3a2e] opacity-60">
                    {stat.label}
                  </p>
                  <p className={cn("text-[10px] font-bold", stat.sub.includes('+') || stat.sub.includes('up') ? 'text-primary' : 'text-on-surface-variant/40')}>
                    {stat.sub}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {!hasData && !loading ? (
          <div className="space-y-12">
            {/* Onboarding State for Progress */}
            <section className="bg-white p-8 md:p-12 rounded-[40px] border border-outline/5 shadow-sm text-center space-y-8">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-[#f5f5f0] rounded-full flex items-center justify-center mx-auto border-2 border-white shadow-inner">
                  <Trophy className="w-12 h-12 text-[#d4a373] opacity-30" />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary border-4 border-white shadow-lg"
                >
                  <Star className="w-5 h-5 fill-current" />
                </motion.div>
              </div>

              <div className="space-y-4 max-w-xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-serif text-[#3a3a2e]">Your growth story begins soon.</h2>
                <p className="text-on-surface-variant/70 leading-relaxed">
                  As you record check-ins and mindful pauses, this space will transform into a visual map of your awareness, highlighting your resilience and growth.
                </p>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <NeomorphicButton 
                  variant="primary" 
                  onClick={() => router.push('/')}
                  className="px-8 flex items-center gap-2"
                >
                  Record your first check-in
                  <Plus className="w-4 h-4" />
                </NeomorphicButton>
              </div>
            </section>
          </div>
        ) : !loading && (
          <>



        {/* Today's Focus Section */}
        <div className="bg-[#416465]/5 p-8 md:p-12 rounded-[40px] border border-[#416465]/10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#416465]">Today&apos;s Focus</span>
              <h3 className="text-2xl font-serif">Gratitude & Resilience</h3>
            </div>
            <NeomorphicButton 
              variant="secondary"
              onClick={() => router.push('/activities')}
              className="text-xs px-6"
            >
              Recommended Activities
            </NeomorphicButton>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Star className="w-24 h-24 rotate-12" />
            </div>
            <div className="relative z-10 space-y-4">
              <p className="text-xl font-serif italic text-[#3a3a2e] leading-relaxed">
                &quot;{dailyThought}&quot;
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#416465] opacity-60">
                <Star className="w-3 h-3 fill-current" />
                <span>Resilience Practice</span>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Section */}
          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-outline/5 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#d27d56]">Activity</span>
              <h3 className="text-2xl font-serif">
                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => changeMonth(-1)}
                className="w-10 h-10 rounded-full bg-[#f5f5f0] flex items-center justify-center text-[#3a3a2e] hover:bg-primary/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewDate(new Date())}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 hover:text-primary transition-colors"
              >
                Today
              </button>
              <button 
                onClick={() => changeMonth(1)}
                className="w-10 h-10 rounded-full bg-[#f5f5f0] flex items-center justify-center text-[#3a3a2e] hover:bg-primary/10 transition-colors"
                disabled={viewDate.getMonth() === new Date().getMonth() && viewDate.getFullYear() === new Date().getFullYear()}
              >
                <ChevronRight className={cn("w-5 h-5", viewDate.getMonth() === new Date().getMonth() && viewDate.getFullYear() === new Date().getFullYear() && "opacity-20")} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-3 sm:gap-4 max-w-3xl">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-[10px] font-bold uppercase tracking-widest text-center opacity-30 pb-2">{day}</div>
            ))}
            {/* Empty cells for Monday start offset if needed, for simplicity starting on 1 */}
            {days.map((d) => (
              <motion.div 
                key={d.day}
                whileHover={{ scale: 1.1 }}
                className={cn(
                  "aspect-square rounded-xl md:rounded-2xl flex items-center justify-center text-xs font-bold transition-all border border-outline/5",
                  d.level === 0 && "bg-background text-on-surface-variant/20",
                  d.level === 1 && "bg-[#5a5a40]/20 text-[#5a5a40]",
                  d.level === 2 && "bg-[#5a5a40]/40 text-on-primary",
                  d.level === 3 && "bg-[#5a5a40]/60 text-on-primary",
                  d.level === 4 && "bg-[#5a5a40] text-on-primary"
                )}
              >
                {d.day}
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-40">
            <span>Less</span>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map(l => (
                <div key={l} className={cn("w-3 h-3 rounded-[2px]", 
                  l === 0 && "bg-background",
                  l === 1 && "bg-[#5a5a40]/20",
                  l === 2 && "bg-[#5a5a40]/40",
                  l === 3 && "bg-[#5a5a40]/60",
                  l === 4 && "bg-[#5a5a40]"
                )} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chart 1: Mindful pauses */}
          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-outline/5 shadow-sm space-y-8 h-full flex flex-col">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#d27d56]">Trend</span>
              <h3 className="text-2xl font-serif">Mindful pauses over time</h3>
            </div>
            
            <div className="flex-1 flex items-end gap-4 pb-6 min-h-[160px]">
              {pauseTrend.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col gap-2">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h * 140}px` }}
                    className={cn(
                      "w-full rounded-2xl transition-all",
                      i === (pauseTrend.length - 1) ? "bg-[#5a5a40]" : "bg-[#3a3a2e]/30"
                    )}
                  />
                  <span className="text-[10px] font-bold uppercase text-center opacity-30">Week {i+1}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-50 pb-4">
              <span>Started: {Math.round((pauseTrend[0] || 0) * 100)}%</span>
              <span>Now: {Math.round((pauseTrend[pauseTrend.length - 1] || 0) * 100)}%</span>
            </div>

            <div className="bg-[#5a5a40]/5 p-6 rounded-2xl border border-primary/5">
              <p className="text-sm font-medium text-primary">
                {pauseTrend[pauseTrend.length - 1] > (pauseTrend[0] || 0) 
                  ? "Your mindful pause rate is showing an upward trend. Every pause is a victory."
                  : "Every check-in builds awareness, even on days without a pause."}
              </p>
            </div>
          </div>

          {/* Chart 2: Recent Days */}
          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-outline/5 shadow-sm space-y-8 h-full flex flex-col">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#d27d56]">Recent Days</span>
              <h3 className="text-2xl font-serif">This week at a glance</h3>
            </div>

            <div className="flex gap-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold uppercase",
                    i === 2 || i === 5 ? "bg-background text-on-surface-variant/30" : "bg-[#3a3a2e] text-white",
                    i === 6 && "bg-[#d27d56] text-white"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            <p className="text-sm text-on-surface-variant/60 leading-relaxed">
              Consistency is better than perfection. You&apos;ve logged multiple check-ins this month, each adding to your awareness.
            </p>

            <div className="bg-[#d27d56]/5 p-6 rounded-2xl border border-[#d27d56]/5 space-y-2 mt-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#d27d56] opacity-60">No Guilt Framing</span>
              <p className="text-sm font-medium text-secondary leading-relaxed">
                Missing a day isn&apos;t failure. Every check-in you do is one more moment of awareness.
              </p>
            </div>
          </div>
        </div>

        {/* Milestones Section */}
        <div className="bg-white p-8 md:p-12 rounded-[40px] border border-outline/5 shadow-sm space-y-10">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#d27d56]">Milestones</span>
            <h3 className="text-2xl md:text-3xl font-serif">Moments worth recognising</h3>
          </div>

          <div className="space-y-8">
            {milestones.map((m, i) => (
              <div key={i} className={cn("flex gap-6", !m.unlocked && "opacity-40")}>
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-outline/10", m.unlocked ? "bg-[#5a5a40]/5 text-primary" : "bg-background text-outline")}>
                  {m.unlocked ? <m.icon className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div className="space-y-2 pb-8 border-b border-outline/5 flex-1">
                  <h4 className="text-xl font-serif">{m.title}</h4>
                  <p className="text-sm text-on-surface-variant/70 leading-relaxed">{m.desc}</p>
                  {m.date && <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{m.date}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="bg-white p-8 md:p-12 rounded-[40px] border border-outline/5 shadow-sm space-y-8">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#d27d56]">Your Story</span>
            <h3 className="text-2xl md:text-3xl font-serif">How you&apos;ve grown</h3>
          </div>

          <div className="relative ml-2 md:ml-4 space-y-12">
            <div className="absolute left-[11px] md:left-[15px] top-4 bottom-4 w-px bg-outline/10" />
            
            {timeline.map((item, i) => (
              <div key={i} className="relative pl-10 md:pl-14">
                <div className={cn(
                  "absolute left-0 w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-white shadow-sm z-10 translate-y-0.5",
                  item.color,
                  item.current && "ring-4 ring-primary/10"
                )} />
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">{item.date}</span>
                  <p className={cn("text-lg font-serif leading-relaxed", item.current ? "text-on-surface" : "text-on-surface-variant/80")}>
                    {item.content.split('"').map((text, j) => (
                      j % 2 === 1 ? <span key={j} className="italic opacity-70"> &quot;{text}&quot;</span> : text
                    ))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )}
  </main>
</div>
);
}
