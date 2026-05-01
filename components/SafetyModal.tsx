'use client';

import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ExternalLink, Heart, X } from 'lucide-react';
import { SAFETY_RESOURCES } from '@/lib/safety';
import { NeomorphicButton } from './ui/NeomorphicButton';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SafetyModal({ isOpen, onClose }: SafetyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden relative"
          >
            <div className="p-8 md:p-12 space-y-8">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X className="w-6 h-6 opacity-30" />
                </button>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-serif text-on-surface">We&apos;re here for you.</h2>
                <p className="text-on-surface-variant/60 leading-relaxed">
                  Sanctuary is designed for behavioral coaching, but some of what you mentioned suggests you might need specialized support. You aren&apos;t alone, and there are resources dedicated to helping you navigate this.
                </p>
              </div>

              <div className="space-y-4">
                {SAFETY_RESOURCES.map((resource) => (
                  <a 
                    key={resource.name}
                    href={resource.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-6 rounded-3xl border border-outline/5 hover:border-primary/20 hover:bg-primary/5 transition-all group"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#5a5a40]">{resource.name}</h4>
                      <p className="text-xs opacity-50">{resource.desc}</p>
                      <p className="text-xs font-bold text-primary">{resource.contact}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-30 transition-opacity" />
                  </a>
                ))}
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <NeomorphicButton onClick={onClose} className="w-full text-sm font-bold uppercase tracking-widest bg-[#5a5a40] text-white">
                  I understand, carry on
                </NeomorphicButton>
                <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest opacity-30">
                  <Heart className="w-3 h-3" />
                  Take care of yourself
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
