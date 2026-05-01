'use client';

import { motion, HTMLMotionProps } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NeomorphicButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'surface';
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function NeomorphicButton({
  variant = 'surface',
  icon: Icon,
  children,
  className,
  ...props
}: NeomorphicButtonProps) {
  const variants = {
    surface: 'bg-white text-primary border border-outline hover:bg-background',
    primary: 'bg-primary text-on-primary hover:opacity-90',
    secondary: 'bg-secondary-container text-secondary font-semibold hover:bg-secondary-container/80',
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(90,90,64,0.08)]',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
      {Icon && <Icon className="w-5 h-5" />}
    </motion.button>
  );
}
