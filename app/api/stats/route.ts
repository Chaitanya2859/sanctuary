import { NextResponse } from 'next/server';

export async function GET() {
  // Mock aggregation that would normally come from Firebase Admin
  // Calculated based on a simulated month of progress
  
  const heatmapData = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    // Simulating more activity in the last two weeks
    let level = 0;
    if (day > 15) {
      level = Math.floor(Math.random() * 4) + 1;
    } else if (day > 5) {
      level = Math.random() > 0.4 ? 1 : 0;
    }
    return { day, level };
  });

  const stats = [
    { value: '52', label: 'Total Check-ins', sub: '+8 this week', color: 'text-[#5a5a40]' },
    { value: '14', label: 'Days Active', sub: 'of 30 days', color: 'text-[#d27d56]' },
    { value: '67%', label: 'Mindful Pauses', sub: 'up from 58%', color: 'text-[#5a5a40]' },
    { value: '4', label: 'Insights Earned', sub: 'New today', color: 'text-[#d4a373]' },
  ];

  // Weekly mindful pause rates showing a learning curve over 4 weeks
  const pauseTrend = Array.from({ length: 4 }, (_, i) => {
    // Starts low (around 10-20%) and grows toward 60-70%
    const base = 0.15 + (i * 0.15);
    const noise = (Math.random() - 0.5) * 0.1;
    return Math.min(1, Math.max(0, base + noise));
  });

  return NextResponse.json({ 
    heatmapData, 
    stats, 
    pauseTrend 
  });
}
