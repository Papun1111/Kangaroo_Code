"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import LoadingScreen from './components/ui/LoadingScreen';
export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <motion.div
          className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)] px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-secondary mb-4"
            variants={itemVariants}
          >
            Welcome to the Ultimate <br />
            <span className="text-emerald-500">Cricket Analysis Platform</span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-[#FAF6E9] mb-8 max-w-2xl"
            variants={itemVariants}
          >
            Host matches, track live scores, and dive deep into player analytics. Your all-in-one solution for managing and following the game you love.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
            variants={itemVariants}
          >
            <Link
              href="/matches"
              className="w-full sm:w-auto btn bg-emerald-500 text-white text-lg px-8 py-3 rounded-full font-bold shadow-lg hover:bg-emerald-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              View Live Matches
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto btn bg-secondary text-white text-lg px-8 py-3 rounded-full font-bold shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              Get Started
            </Link>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}