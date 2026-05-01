import { NextResponse } from 'next/server';

export async function GET() {
  // In a production app, this would use firebase-admin to aggregate real check-ins.
  // For this version, we provide structured data that reflects the "real" state
  // of a user's mindful eating journey, which can be easily swapped for a real
  // aggregation query.
  
  const patterns = [
    { 
      id: '1', 
      title: 'The Evening Rush', 
      description: 'You check in most frequently between 8 PM and 11 PM. This is when your stress and boredom levels are highest.', 
      strength: 0.85 
    },
    { 
      id: '2', 
      title: 'Stress Trigger', 
      description: 'Stress correlates with a 74% increase in the likelihood of reaching for snacks before checking in.', 
      strength: 0.74 
    },
    { 
      id: '3', 
      title: 'Post-Pause Success', 
      description: 'When you wait at least 5 minutes, you report feeling "Satisfied" 82% of the time after eating.', 
      strength: 0.82 
    },
  ];

  const emotions = [
    { name: 'Stressed', value: 28, progress: 0.75, color: 'bg-[#d27d56]' },
    { name: 'Bored', value: 18, progress: 0.55, color: 'bg-[#5a5a40]/30' },
    { name: 'Lonely', value: 14, progress: 0.40, color: 'bg-[#d4a373]' },
    { name: 'Anxious', value: 10, progress: 0.30, color: 'bg-[#d27d56]/40' },
    { name: 'Tired', value: 8, progress: 0.20, color: 'bg-[#5a5a40]/10' },
  ];

  // Generates 24 hours of distribution peaking at 20:00 - 23:00 (8 PM - 11 PM)
  const timeDistribution = Array.from({ length: 24 }, (_, hour) => {
    // Basic bell curve logic centered around 21:00
    const peak = 21;
    const distance = Math.abs(hour - peak);
    // Ensure 11 PM and 1 AM wrap around correctly for distance
    const cyclicDistance = Math.min(distance, 24 - distance);
    let intensity = Math.max(0.1, 1 - (cyclicDistance / 10));
    // Add some noise
    intensity = intensity * (0.8 + Math.random() * 0.4);
    return Math.min(1, intensity);
  });

  const behaviorStats = {
    totalCheckins: 52,
    activeDays: 14,
    mindfulPauseRate: 0.67,
    satisfiedRate: 0.48,
    beforeAfter: {
      before: [
        { label: 'Stressed', value: '52%' },
        { label: 'Bored', value: '31%' },
        { label: 'Lonely', value: '24%' },
        { label: 'Anxious', value: '21%' },
      ],
      after: [
        { label: 'Stressed', value: '45%' },
        { label: 'Calm', value: '31%' },
        { label: 'Guilty', value: '19%' },
        { label: 'Neutral', value: '15%' },
      ]
    }
  };

  return NextResponse.json({ 
    patterns, 
    emotions, 
    timeDistribution, 
    behaviorStats 
  });
}
