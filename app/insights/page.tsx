'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Nav } from '@/components/Nav';
import Link from 'next/link';
import { ArrowRight, Info, Loader2, Sparkles, TrendingUp, Calendar, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  Timestamp,
  limit 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts';
import { Frown, Zap, Moon, Coffee, User, Smile, Ghost, Activity } from 'lucide-react';
import { SafetyModal } from '@/components/SafetyModal';
import { getAIResponse } from '@/lib/ai';

const emotionIcons: Record<string, any> = {
  'Stressed': Zap,
  'Bored': Coffee,
  'Lonely': User,
  'Anxious': Activity,
  'Tired': Moon,
  'Angry': Frown,
  'Sad': Ghost,
  'Happy': Smile
};

interface Pattern {
  id: string;
  title: string;
  description: string;
  strength: number;
}

interface EmotionStat {
  name: string;
  value: number;
  progress: number;
  fill: string;
}

interface HungerDataPoint {
  day: string;
  avgHunger: number;
  count: number;
}

export default function InsightsPage() {
  const tabs = ['This week', 'Last 30 days', 'All time'];
  const [activeTab, setActiveTab] = useState('This week');
  const [loading, setLoading] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  
  // Real Data State
  const [hungerTrend, setHungerTrend] = useState<HungerDataPoint[]>([]);
  const [topEmotions, setTopEmotions] = useState<EmotionStat[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [totalCheckins, setTotalCheckins] = useState(0);
  const [mindfulPauseRate, setMindfulPauseRate] = useState(0);
  const [activeDays, setActiveDays] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const generateAISummary = async (checkins: any[], logs: any[], topEmotions: EmotionStat[]) => {
    setGeneratingSummary(true);
    const prompt = `
        You are Sanctuary, an empathetic emotional eating coach. 
        Generate a "Weekly Reflection" for the user based on their data.
        
        DATA:
        - Total Check-ins: ${checkins.length}
        - Top emotions: ${topEmotions.map(e => `${e.name} (${e.value})`).join(', ')}
        - Mindful Pause Rate: ${Math.round(mindfulPauseRate * 100)}%
        - Post-meal Satisfaction instances listed in logs: ${logs.filter(l => l.satisfied).length}

        INSTRUCTIONS:
        - Write in the first person ("I noticed...", "You've been...").
        - Tone: Empathetic, non-judgmental, observant, and grounding.
        - Length: Approx 100 words.
        - Do NOT use: diet, calories, fat, weight loss, success, failure.
        - End with a gentle, mindful invitation.
      `;

    try {
      const aiResponseResult = await getAIResponse(prompt);
      if (aiResponseResult) {
        setSummary(aiResponseResult);
      } else {
        setSummary("You're building awareness day by day. Every mindful moment is progress.");
      }
    } finally {
      setGeneratingSummary(false);
    }
  };

  const fetchRealInsights = async (uid: string) => {
    setLoading(true);
    try {
      // 1. Calculate time range
      const now = new Date();
      let daysToLookBack = 7;
      if (activeTab === 'Last 30 days') daysToLookBack = 30;
      if (activeTab === 'All time') daysToLookBack = 365;

      const startDate = new Date();
      startDate.setDate(now.getDate() - daysToLookBack);
      const startTimestamp = Timestamp.fromDate(startDate);

      // 2. Fetch Checkins
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

      const checkins = checkinsSnap.docs.map(d => d.data());
      const logs = logsSnap.docs.map(d => d.data());

      // 3. Process Hunger Trend
      const pointsByTimestamp: Record<number, { total: number; count: number; label: string }> = {};
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Initialize time slots depending on activeTab for "This week" to show all days
      if (activeTab === 'This week') {
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(now.getDate() - i);
          d.setHours(0, 0, 0, 0);
          const name = dayNames[d.getDay()];
          pointsByTimestamp[d.getTime()] = { total: 0, count: 0, label: name };
        }
      }

      checkins.forEach(c => {
        const date = (c.timestamp as Timestamp).toDate();
        let timestampKey: number;
        let dayLabel: string;
        
        if (activeTab === 'This week') {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          timestampKey = d.getTime();
          dayLabel = dayNames[date.getDay()];
        } else if (activeTab === 'Last 30 days') {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          timestampKey = d.getTime();
          dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
          // Month-level grouping for All Time
          const d = new Date(date.getFullYear(), date.getMonth(), 1);
          timestampKey = d.getTime();
          dayLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        }
        
        if (!pointsByTimestamp[timestampKey]) {
          pointsByTimestamp[timestampKey] = { total: 0, count: 0, label: dayLabel };
        }
        
        if (typeof c.hungerScale === 'number') {
          pointsByTimestamp[timestampKey].total += c.hungerScale;
          pointsByTimestamp[timestampKey].count += 1;
        }
      });

      const hungerPoints: HungerDataPoint[] = Object.entries(pointsByTimestamp)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([ts, stats]) => ({
          day: stats.label,
          avgHunger: stats.count > 0 ? parseFloat((stats.total / stats.count).toFixed(1)) : 0,
          count: stats.count
        }));
      setHungerTrend(hungerPoints);

      // 4. Process Emotions
      const emotionCounts: Record<string, number> = {};
      [...checkins, ...logs].forEach(item => {
        const emotionsArr = item.emotions || [];
        emotionsArr.forEach((e: string) => {
          emotionCounts[e] = (emotionCounts[e] || 0) + 1;
        });
      });

      const colors = ['#d27d56', '#5a5a40', '#d4a373', '#b4a89a', '#8a8a70'];
      const processedEmotions: EmotionStat[] = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count], i) => ({
          name,
          value: count,
          progress: count / ([...checkins, ...logs].length || 1),
          fill: colors[i % colors.length]
        }));
      setTopEmotions(processedEmotions);

      // 5. Basic Stats
      setTotalCheckins(checkins.length);
      const pauses = checkins.filter(c => c.usedUrgeSurfing).length;
      setMindfulPauseRate(checkins.length > 0 ? pauses / checkins.length : 0);
      
      const uniqueDays = new Set(checkins.map(c => (c.timestamp as Timestamp).toDate().toDateString()));
      setActiveDays(uniqueDays.size);

      // 6. Generate AI Summary (if enough data)
      if (checkins.length > 0) {
        generateAISummary(checkins, logs, processedEmotions);
      }

      // 7. Generate Patterns (Mocked but informed)
      const eveningCheckins = checkins.filter(c => {
        const h = (c.timestamp as Timestamp).toDate().getHours();
        return h >= 20 || h <= 4;
      }).length;

      const p: Pattern[] = [];
      if (eveningCheckins / (checkins.length || 1) > 0.4) {
        p.push({
          id: '1',
          title: 'The Evening Rush',
          description: 'You check in most frequently in the evening. This might be a time when stress or boredom peaks.',
          strength: eveningCheckins / (checkins.length || 1)
        });
      }
      if (processedEmotions.some(e => e.name === 'Stressed' && e.progress > 0.3)) {
        p.push({
          id: '2',
          title: 'Stress Trigger',
          description: 'Stress seems to be a significant driver for your check-ins recently.',
          strength: 0.8
        });
      }
      if (mindfulPauseRate > 0.5) {
        p.push({
          id: '3',
          title: 'Mindful Guardian',
          description: 'You have a high rate of pausing before acting on urges. This awareness is a superpower.',
          strength: mindfulPauseRate
        });
      }
      setPatterns(p);

    } catch (err) {
      console.error("Failed to fetch insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchRealInsights(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isMounted]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#f5f5f0] pt-32 pb-20 selection:bg-primary/20">
      <Nav />

      <main className="max-w-5xl mx-auto px-6 space-y-12">
        {/* Header Section */}
        <div className="space-y-4">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#5a5a40] opacity-60">
            Insights & Trends
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-[#3a3a2e] tracking-tight">
            Your mindful rhythm
          </h1>
          <p className="text-on-surface-variant/60 font-medium">
            Observing patterns without judgment is the first step toward change.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 p-1 bg-white inline-flex rounded-full border border-outline/5 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-bold transition-all",
                activeTab === tab 
                  ? "bg-[#5a5a40] text-white shadow-md" 
                  : "text-on-surface-variant/50 hover:bg-background"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Charts Grid */}
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Hunger Trend Chart */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[40px] border border-outline/5 shadow-sm space-y-8 min-h-[400px]"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#d27d56]">Trend</span>
                <h3 className="text-2xl font-serif">Average Hunger</h3>
              </div>
              <TrendingUp className="w-6 h-6 text-primary opacity-20" />
            </div>
            
            <div className="h-[250px] w-full">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
                </div>
              ) : hungerTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hungerTrend}>
                    <defs>
                      <linearGradient id="colorHunger" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5a5a40" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#5a5a40" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#5a5a4010" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#5a5a4060' }}
                      dy={10}
                    />
                    <YAxis 
                      hide 
                      domain={[0, 10]} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        fontSize: '12px',
                        padding: '12px'
                      }}
                      cursor={{ stroke: '#5a5a4020', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="avgHunger" 
                      name="Hunger (1-10)"
                      stroke="#5a5a40" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorHunger)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 space-y-4">
                  <Calendar className="w-12 h-12" />
                  <p className="text-sm font-medium">Not enough check-ins yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Emotions List */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="bg-white p-8 md:p-10 rounded-[40px] border border-outline/5 shadow-sm space-y-6 flex flex-col"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#d27d56]">Top Drivers</span>
              <h3 className="text-2xl font-serif">Top Emotions</h3>
            </div>
            
            <div className="flex-1 min-h-[250px] relative">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
                </div>
              ) : topEmotions.length > 0 ? (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="30%" 
                      outerRadius="100%" 
                      barSize={12} 
                      data={topEmotions}
                      startAngle={90}
                      endAngle={450}
                    >
                      <PolarAngleAxis 
                        type="number" 
                        domain={[0, Math.max(...topEmotions.map(e => e.value)) * 1.2]} 
                        angleAxisId={0} 
                        tick={false} 
                      />
                      <RadialBar
                        background={{ fill: '#f5f5f0' }}
                        dataKey="value"
                        cornerRadius={10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                          fontSize: '12px',
                          padding: '12px'
                        }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  {/* Center Stat */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
                    <span className="text-3xl font-serif text-[#3a3a2e]">{topEmotions[0].value}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">{topEmotions[0].name}</span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-on-surface-variant/40 italic text-sm">
                  Log your first check-in to see emotions.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 pt-4">
              {!loading && topEmotions.map((emotion) => {
                const Icon = emotionIcons[emotion.name] || Activity;
                return (
                  <div key={emotion.name} className="flex items-center justify-between p-3 rounded-2xl bg-[#f5f5f0]/30 hover:bg-[#f5f5f0]/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm" style={{ color: emotion.fill }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-on-surface-variant/80">{emotion.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1 bg-background rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${emotion.progress * 100}%` }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: emotion.fill }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                          <span className="text-[9px] font-bold opacity-30">{Math.round(emotion.progress * 100)}%</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-serif pr-2">{emotion.value}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* Discovery Board */}
        {patterns.length > 0 && (
          <div className="space-y-8">
            <h3 className="text-2xl font-serif">Discovery Board</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {patterns.map((pattern) => (
                <motion.div 
                  key={pattern.id}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-3xl border border-outline/5 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      {Math.round(pattern.strength * 100)}% Match
                    </span>
                  </div>
                  <h4 className="font-bold text-lg">{pattern.title}</h4>
                  <p className="text-sm text-on-surface-variant/70 leading-relaxed">
                    {pattern.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* AI Insight Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#3a3a2e] text-white p-8 md:p-12 rounded-[40px] space-y-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#d27d56] rounded-full blur-[120px] opacity-10 -mr-20 -mt-20" />
          
          <div className="space-y-6 relative z-10 w-full">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50">
                {activeTab} Reflection
              </span>
              {generatingSummary && <Loader2 className="w-4 h-4 animate-spin opacity-50" />}
            </div>
            
            {generatingSummary ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-white/10 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded" />
                  <div className="h-4 bg-white/10 rounded" />
                  <div className="h-4 bg-white/10 rounded w-5/6" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-serif leading-tight">
                  {summary ? "Your patterns revealed" : "\"You're building awareness day by day.\""}
                </h2>
                <div className="text-lg opacity-70 leading-relaxed max-w-3xl whitespace-pre-line italic">
                  {summary || "Continue checking in to reveal deeper patterns and receive personalized reflections."}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            {[
              { label: `${totalCheckins} Check-ins`, icon: TrendingUp },
              { label: `${Math.round(mindfulPauseRate * 100)}% Pauses`, icon: Heart },
              { label: `Top: ${topEmotions[0]?.name || '...'}`, icon: Sparkles },
              { label: `${activeDays} Days Active`, icon: Calendar },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-3">
                <stat.icon className="w-3.5 h-3.5 opacity-40" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer Support Banner */}
        <div className="bg-[#f2ede6] p-10 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="flex items-start gap-6">
             <div className="w-12 h-12 bg-[#d27d56]/20 rounded-full flex items-center justify-center shrink-0">
                <Info className="w-6 h-6 text-[#d27d56]" />
             </div>
             <p className="text-lg font-serif text-on-surface-variant leading-tight">
               If any of these patterns feel bigger than habits, talking to someone can really help.
             </p>
           </div>
          <button 
            onClick={() => setIsSupportModalOpen(true)}
            className="text-secondary font-bold border-b-2 border-secondary/20 pb-1 hover:text-[#5a5a40] transition-colors whitespace-nowrap"
          >
            Find support &rarr;
          </button>
        </div>

        <SafetyModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />
      </main>
    </div>
  );
}
