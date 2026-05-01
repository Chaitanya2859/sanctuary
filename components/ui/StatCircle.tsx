'use client';

import { motion } from 'motion/react';

interface StatCircleProps {
  value: number;
  label: string;
  color: string;
  progress: number; // 0 to 1
}

export function StatCircle({ value, label, color, progress }: StatCircleProps) {
  // SVG background and foreground circles
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center relative p-1 group shadow-[0_8px_20px_rgba(90,90,64,0.06)] border border-outline/5">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            className="text-background"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="64"
            cy="64"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </svg>
        <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-[0.98]">
          <span className="text-4xl font-bold" style={{ color }}>
            {value}
          </span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-60">
        {label}
      </span>
    </div>
  );
}
