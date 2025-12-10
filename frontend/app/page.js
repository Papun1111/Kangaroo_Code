"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import FaultyTerminal from './components/ui/FaultyTerminal';
import Image from 'next/image';
import virat from "@/public/Virat.jpg"
// --- 1. PRELOADER COMPONENT (Matches Reference Video's Text Fill) ---
import starc from "@/public/starc.jpg"
import msd from "@/public/msd.jpg"
const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulates the counter 0-100
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800); // Wait a bit before unmounting
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
      exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
    >
      <div className="relative p-4 text-center">
        {/* The Base Layer (Outline / Empty) */}
        <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-[#333] tracking-tighter uppercase relative z-0 leading-[0.85] select-none">
          Kangaroo<br />Code
        </h1>
        
        {/* The Fill Layer (Clipped by Progress) */}
        <motion.div 
          className="absolute top-0 left-0 right-0 mx-auto h-full z-10 flex flex-col items-center justify-center select-none"
          style={{ 
            clipPath: `inset(${100 - progress}% 0 0 0)`, // The "Fill Up" animation
            transition: 'clip-path 0.1s linear'
          }}
        >
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-emerald-500 tracking-tighter uppercase leading-[0.85]">
            CRICKET<br />ANALYSIS
          </h1>
        </motion.div>
      </div>

      {/* The Counter (Bottom Right) */}
      <div className="absolute bottom-10 right-10 flex flex-col items-end">
        <span className="text-6xl md:text-8xl font-light text-white/30 font-mono italic tracking-tighter">
          {progress}
        </span>
      </div>
    </motion.div>
  );
};

// --- 2. SQUAD GRID COMPONENT (Matches "Celebrate Our Green Earth" Section) ---


// --- 3. ACCORDION COMPONENT (Matches "Simplifying the Cool" Section) ---
const AccordionItem = ({ index, title, text }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10 group">
      <button 
        className="w-full py-10 flex items-center justify-between text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-baseline gap-8">
          <span className="font-mono text-emerald-500 text-sm">1.{index + 1}</span>
          <span className="text-2xl md:text-4xl font-light text-white group-hover:text-emerald-400 transition-colors tracking-tight">
            {title}
          </span>
        </div>
        <motion.span 
          animate={{ rotate: isOpen ? 45 : 0 }}
          className="text-3xl text-white/30 font-light"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-10 pl-14 text-gray-400 text-lg max-w-2xl leading-relaxed font-light">
              {text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN PAGE ---
export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <main className="bg-black min-h-screen text-white overflow-x-hidden selection:bg-emerald-500 selection:text-black font-sans">
      
      {/* BACKGROUND: FaultyTerminal with "Vignette" Overlay for readability */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-40">
          <FaultyTerminal
            scale={1.5}
            gridMul={[2, 1]}
            digitSize={1.2}
            tint="#10b981"
            flickerAmount={0.2}
            scanlineIntensity={0.4}
          />
        </div>
        {/* Dark gradients to ensure text pops */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/80 to-black" />
      </div>

      {/* PRELOADER */}
      <AnimatePresence mode="wait">
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && (
        <div className="relative z-10">
          
          {/* --- HERO SECTION --- */}
          <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 pt-20 pb-32">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h1 className="text-6xl sm:text-8xl md:text-[11rem] font-black tracking-tighter leading-[0.8] mb-12 mix-blend-screen text-white">
                Kangaroo<br />
                <span className="text-emerald-500">Code</span>
              </h1>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
                <Link 
                  href="/matches" 
                  className="px-10 py-4 bg-emerald-500 text-black rounded-full font-bold text-lg hover:bg-emerald-400 hover:scale-105 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                >
                  View Live Matches
                </Link>
                <Link 
                  href="/register" 
                  className="px-10 py-4 border border-white/20 rounded-full font-bold text-lg backdrop-blur-md hover:bg-white hover:text-black transition-all"
                >
                  Start Analysis
                </Link>
              </div>
            </motion.div>
          </section>

          {/* --- "TERRITORY" CARD SECTION --- */}
          {/* Replaces the white box in video with a Glass Card */}
          <section className="py-24 px-4 relative flex justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-6xl bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-20 overflow-hidden relative"
            >
              <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
                <div>
                  <h2 className="text-4xl md:text-6xl font-bold leading-[1.1] mb-8">
                    Ding dong!!<br />
                    You've entered the <span className="text-emerald-500 italic">stadium.</span>
                  </h2>
                  
                  <div className="space-y-6 text-lg text-gray-400 font-light">
                    <p>So you must:</p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border border-emerald-500" />
                        Analyze ball-by-ball data
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border border-emerald-500" />
                        Manage tournament rosters
                      </li>
                    </ul>
                  </div>

                  <button className="mt-12 text-emerald-500 border-b border-emerald-500 pb-1 font-bold hover:text-white hover:border-white transition-colors">
                    EXPLORE OUR SERVICE &gt;
                  </button>
                </div>

                {/* Right side visual (Abstract Field) */}
                <div className="h-80 md:h-[500px] bg-emerald-900/20 rounded-3xl border border-white/5 relative overflow-hidden group">
                   <Image src={virat} objectFit='full' alt='Kohli'/>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-2 border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                        <div className="w-20 h-20 rounded-full bg-emerald-500 blur-2xl opacity-20" />
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* --- PURPOSE SECTION (Split Layout) --- */}
          <section className="py-32 px-4">
             <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 border-t border-white/10 pt-20">
                 <div className="md:col-span-4">
                     <h2 className="text-sm font-mono text-emerald-500 mb-6 tracking-widest uppercase">The Purpose</h2>
                     <h3 className="text-4xl md:text-5xl font-bold leading-tight">
                         Data that drives <br/><span className="italic text-emerald-500">Performance.</span>
                     </h3>
                 </div>
                 <div className="md:col-span-8 text-xl md:text-2xl text-gray-400 font-light leading-relaxed">
                     <p>
                         One match has a significant impact on the tournament. 
                         We provide comprehensive data analysis not just to record scores, 
                         but to uncover the hidden potential in every delivery.
                     </p>
                     <div className="grid grid-cols-2 gap-4 mt-16">
                         <Image src={starc} objectFit='full'  alt='mitchel starc'/>
                         <Image src={msd} alt='msd' objectFit='full' />
                     </div>
                 </div>
             </div>
          </section>

          {/* --- ACCORDION SECTION (Simplifying the Cool) --- */}
          <section className="py-32 px-4 bg-gradient-to-b from-transparent to-black/80">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold mb-20 leading-tight">
                Simplifying the Game in a <br/>
                <span className="text-gray-500">Professional Playground!</span>
              </h2>
              <div className="border-t border-white/10">
                <AccordionItem 
                  index={0} 
                  title="What analytics do you provide?" 
                  text="We specialize in wagon wheels, run rate comparisons, player impact scores, and predictive match outcomes based on historical data." 
                />
                <AccordionItem 
                  index={1} 
                  title="How can I host a tournament?" 
                  text="Simply navigate to your dashboard, create a new tournament entity, and generate invite links for teams to join seamlessly." 
                />
                <AccordionItem 
                  index={2} 
                  title="Is the data real-time?" 
                  text="Yes. Our WebSocket infrastructure ensures that every ball bowled is reflected on the scoreboard within milliseconds." 
                />
                <AccordionItem 
                  index={3} 
                  title="Can I export the data?" 
                  text="Absolutely. Matches can be exported as PDF summaries or CSV raw data for further external analysis." 
                />
              </div>
            </div>
          </section>

          {/* --- CIRCLE GRID SECTION (Celebrate Green Earth) --- */}
    

          {/* --- FOOTER --- */}
          <footer className="py-12 border-t border-white/10 bg-black">
              <div className="flex flex-col md:flex-row justify-between max-w-7xl mx-auto px-4 items-center gap-6 text-xs font-mono text-gray-600">
                  <span className="uppercase tracking-widest">All Rights Reserved</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="font-bold text-white text-base">Kangaroo Code</span>
                  </div>
                  <span className="uppercase tracking-widest">© 2025</span>
              </div>
          </footer>

        </div>
      )}
    </main>
  );
}