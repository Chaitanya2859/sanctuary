'use client';

import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export function LandingView() {
  const revealVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] as any }
    })
  };

  const [selectedResource, setSelectedResource] = useState<{name: string, contact: string} | null>(null);

  return (
    <div className="bg-bone min-h-screen text-brown font-sans overflow-x-hidden">
      <Nav />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-20 pb-12 px-6 md:px-12 max-w-[1100px] mx-auto gap-16 flex-col lg:flex-row">
        <div className="flex-1 text-center lg:text-left">
          
          
          <motion.h1 
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={revealVariants}
            className="font-serif text-5xl md:text-8xl leading-[1.05] text-brown mb-6"
          >
            Pause.<br />
            <em className="italic text-moss not-italic">Attune.</em><br />
            Be well.
          </motion.h1>
          
          <motion.p 
            custom={3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={revealVariants}
            className="text-base md:text-lg leading-relaxed text-mocha max-w-[460px] mb-10 mx-auto lg:mx-0"
          >
            Sanctuary is a gentle intervention for emotional eating. We help you bridge the gap between impulse and action through radical self-honesty—no counting, no shame, just clarity.
          </motion.p>
          
          <motion.div 
            custom={4}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={revealVariants}
            className="flex flex-col gap-4 items-center lg:items-start"
          >
            <Link href="/signup">
              <button className="bg-moss text-bone px-10 py-5 rounded-full text-base font-medium tracking-tight hover:bg-brown hover:-translate-y-0.5 transition-all shadow-[0_10px_30px_rgba(90,90,64,0.15)] hover:shadow-[0_15px_40px_rgba(90,90,64,0.25)]">
                Begin your practice — free →
              </button>
            </Link>
            <div className="text-[12px] text-mocha px-1 font-medium opacity-60">
              For your mind, not your mirror.
              <span className="mx-2">•</span>
              <Link href="/login" className="text-terra hover:underline">Sign In</Link>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex-1 flex flex-col gap-4 w-full"
        >
          <div className="bg-white rounded-[40px] p-10 border border-border shadow-[0_4px_30px_rgba(61,44,30,0.04)]">
            <div className="font-serif text-[48px] text-ochre leading-none mb-4">&quot;</div>
            <div className="font-serif text-xl italic text-brown leading-relaxed mb-6">
              The pause is where your freedom lives. One check-in changes everything.
            </div>
            <div className="pt-6 border-t border-border/50">
              <div className="text-[11px] text-mocha/60 font-bold uppercase tracking-widest mb-4">Current state:</div>
              <div className="flex flex-wrap gap-2.5">
                <span className="px-5 py-2.5 rounded-full text-[13px] font-bold bg-amber/10 text-amber-900 border border-amber-200/50">Stressed</span>
                <span className="px-5 py-2.5 rounded-full text-[13px] font-bold bg-teal/10 text-teal-900 border border-teal-200/50">Bored</span>
                <span className="px-5 py-2.5 rounded-full text-[13px] font-bold bg-pink/10 text-pink-900 border border-pink-200/50">Lonely</span>
                <span className="px-5 py-2.5 rounded-full text-[13px] font-bold bg-purple/10 text-purple-900 border border-purple-200/50">Anxious</span>
              </div>
            </div>
          </div>
          <div className="bg-moss/5 rounded-[24px] p-6 border border-moss/10">
            <div className="text-[10px] text-terra tracking-widest uppercase font-bold mb-2">The Sanctuary Reflection</div>
            <div className="font-serif text-[15px] text-brown italic leading-relaxed opacity-80">
              &quot;I notice a pattern of lonely check-ins on Sunday evenings. Before you open the fridge: what would actually make you feel connected right now?&quot;
            </div>
          </div>
        </motion.div>
      </section>

      <hr className="border-border mx-6 md:mx-12" />

      {/* Philosophy Section */}
      <section className="py-16 px-6 md:px-12 max-w-[900px] mx-auto text-center space-y-8">
         <motion.div 
            whileInView={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            className="text-[11px] text-terra tracking-[0.2em] uppercase font-bold"
          >
            Our Philosophy
          </motion.div>
          <h2 className="font-serif text-4xl md:text-6xl text-brown leading-tight">
            Food is never the problem.<br />
            It&apos;s just a <em className="italic text-moss not-italic">messenger.</em>
          </h2>
          <p className="text-lg md:text-xl text-mocha leading-relaxed font-medium">
            Most emotional eating is a valid attempt to cope with a difficult feeling. 
            We don&apos;t ask you to &quot;stop.&quot; we ask you to <em className="italic">listen.</em> 
            By observing your urges, you transform them from commands into conversation.
          </p>
      </section>

      {/* How it Works */}
      <section id="how" className="py-16 px-6 md:px-12 max-w-[1100px] mx-auto text-center bg-white/50 border-y border-border rounded-[60px]">
        <motion.div 
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true }}
          className="text-[11px] text-terra tracking-[0.14em] uppercase font-bold mb-3.5"
        >
          The Method
        </motion.div>
        <motion.h2 
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-serif text-3xl md:text-5xl text-brown mb-20 leading-tight"
        >
          Simple ritual. Radical shift.
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { 
              num: 1, 
              title: "The Pause", 
              desc: "Before you eat, take 60 seconds. Name the emotion, rate your physical hunger, and describe the urge. This small gap is where change begins." 
            },
            { 
              num: 2, 
              title: "The Reflection", 
              desc: "Receive a calm, AI-powered reflection that mirrors your state without judgment. It helps you see the &apos;why&apos; behind the &apos;what&apos; instantly." 
            },
            { 
              num: 3, 
              title: "The Insight", 
              desc: "Over time, Sanctuary maps your internal world. Discover which emotions drive your urges and reclaim your power of choice, day by day." 
            }
          ].map((step, i) => (
            <motion.div 
              key={i}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 32 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="group"
            >
              <div className="w-16 h-16 rounded-[24px] bg-moss/10 flex items-center justify-center font-serif text-2xl text-moss mb-8 mx-auto group-hover:bg-moss group-hover:text-bone transition-all duration-500">
                {step.num}
              </div>
              <h3 className="font-serif text-2xl text-brown mb-4">{step.title}</h3>
              <p className="text-[15px] leading-relaxed text-mocha/80 px-4">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Support & Safety Section */}
      <section id="support" className="py-16 px-6 md:px-12">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <motion.div 
              whileInView={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              className="text-[11px] text-terra tracking-[0.2em] uppercase font-bold"
            >
              Support & Safety
            </motion.div>
            <h2 className="font-serif text-4xl text-brown leading-tight">
              You don&apos;t have to do this alone.
            </h2>
            <p className="text-base text-mocha leading-relaxed">
              Sanctuary is a tool for self-awareness, but it is not a replacement for professional therapy or medical care. If you are struggling with a clinical eating disorder, self-harm, or severe distress, please reach out for professional help immediately.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {[
              { name: "NIMHANS Helpline", desc: "Psychosocial support from India", contact: "080-46110007" },
              { name: "Vandrevala Foundation", desc: "24/7 psychological crisis support", contact: "9999-666-555" },
              { name: "iCall (TISS)", desc: "Psychosocial help across India", contact: "022-25521111" },
              { name: "Samaritans Mumbai", desc: "Emotional support & prevention", contact: "8422984528" }
            ].map((resource, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedResource(resource)}
                className="bg-white p-6 rounded-3xl border border-border/50 hover:border-terra/30 transition-all group flex flex-col cursor-pointer hover:shadow-xl hover:-translate-y-1"
              >
                <h4 className="font-bold text-brown mb-1 group-hover:text-terra transition-colors">{resource.name}</h4>
                <p className="text-[12px] text-mocha/60 mb-6">{resource.desc}</p>
                <div className="mt-auto pt-4 border-t border-border/30 flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-terra/40 group-hover:text-terra transition-colors">Contact Details →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Helpline Modal */}
      <AnimatePresence>
        {selectedResource && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResource(null)}
              className="absolute inset-0 bg-[#3d2c1e]/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-bone w-full max-w-sm rounded-[40px] p-10 shadow-2xl overflow-hidden border border-border"
            >
              <div className="text-[10px] text-terra tracking-widest uppercase font-bold mb-4 text-center">Support Resource</div>
              <h3 className="font-serif text-3xl text-brown text-center mb-2">{selectedResource.name}</h3>
              <p className="text-mocha/60 text-center text-sm mb-8 px-4">Please confirm if you would like to reach out for support.</p>
              
              <div className="bg-white/50 rounded-3xl p-6 mb-8 text-center border border-border/50 shadow-inner">
                <div className="text-2xl font-mono font-bold text-brown tracking-tight">{selectedResource.contact}</div>
              </div>
              
              <div className="flex flex-col gap-3">
                <a 
                  href={`tel:${selectedResource.contact.replace(/-/g, '')}`}
                  className="w-full py-5 bg-moss text-bone rounded-full text-center font-bold tracking-tight hover:bg-brown transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  Call Helpline Now
                </a>
                <button 
                  onClick={() => setSelectedResource(null)}
                  className="w-full py-4 text-mocha/40 font-bold uppercase tracking-widest text-[11px] hover:text-brown transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Minimal Footer */}
      <footer className="w-full py-4 border-t border-border/5 bg-white/50 mt-8 md:mt-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="font-serif text-3xl font-bold tracking-tighter opacity-10 text-brown">Sanctuary.</div>
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-mocha/20 italic">
              &quot;The pause is where your freedom lives.&quot;
            </div>
          </div>
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-mocha/40">
            Sanctuary
          </div>
        </div>
      </footer>
    </div>
  );
}
