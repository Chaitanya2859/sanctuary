'use client';

import { motion } from 'motion/react';
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
      <section id="support" className="py-16 px-6 md:px-12 bg-[#3d2c1e]/5 rounded-t-[80px]">
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
              { name: "NIMHANS Helpline", desc: "Psychosocial support from NIMHANS India", link: "tel:08046110007" },
              { name: "Vandrevala Foundation", desc: "24/7 psychological crisis support", link: "tel:9999666555" },
              { name: "iCall (TISS)", desc: "Psychosocial help across India", link: "tel:02225521111" },
              { name: "Samaritans Mumbai", desc: "Emotional support & suicide prevention", link: "tel:8422984528" }
            ].map((resource, i) => (
              <a 
                key={i} 
                href={resource.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white p-6 rounded-3xl border border-border/50 hover:border-terra/30 transition-all group"
              >
                <h4 className="font-bold text-brown group-hover:text-terra transition-colors mb-1">{resource.name}</h4>
                <p className="text-[12px] text-mocha/60">{resource.desc}</p>
                <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-terra/40 group-hover:text-terra transition-colors">Visit Resource →</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 md:px-12 bg-[#3d2c1e]/5 max-w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-8 border-t border-border/20">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="font-serif text-xl text-brown">Sanctuary</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-terra/60">Sanctuary</div>
          </div>
          <div className="text-[11px] font-serif italic text-mocha/40">
            &quot;The pause is where your freedom lives.&quot;
          </div>
        </div>
        <div className="flex gap-8">
          <Link href="#support" className="text-[11px] font-bold uppercase tracking-widest text-terra hover:text-brown transition-colors">Emergency Resources</Link>
        </div>
      </footer>
    </div>
  );
}
