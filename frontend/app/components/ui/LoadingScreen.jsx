"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

export default function LoadingScreen({ onComplete }) {
  const [stage, setStage] = useState('stance'); // stance -> hit -> exit

  useEffect(() => {
    const stanceTimer = setTimeout(() => {
      setStage('hit');
    }, 800);

    const hitTimer = setTimeout(() => {
      setStage('exit');
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 300);
    }, 1700);

    return () => {
      clearTimeout(stanceTimer);
      clearTimeout(hitTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Background Orbs */}
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-blue-500/20 via-blue-600/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-orange-500/15 via-orange-600/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, rgba(59, 130, 246, 0.4) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Cricket Animation Container */}
          <div className="relative w-96 h-96 mb-8">
            {/* Stadium Atmosphere - Light Beams */}
            <motion.div
              className="absolute inset-0"
              animate={{
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              <div className="absolute top-0 left-1/4 w-32 h-full bg-gradient-to-b from-white/10 to-transparent transform -skew-x-12" />
              <div className="absolute top-0 right-1/4 w-32 h-full bg-gradient-to-b from-white/10 to-transparent transform skew-x-12" />
            </motion.div>

            {/* Cricket Ball */}
            <AnimatePresence>
              {stage === 'hit' && (
                <motion.div
                  className="absolute top-1/2 left-1/2"
                  initial={{ x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
                  animate={{
                    x: ['50%', '350%'],
                    y: ['-50%', '-250%'],
                    scale: [1, 0.5],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 1.8,
                    ease: [0.6, 0.05, 0.01, 0.9],
                  }}
                >
                  <motion.div 
                    className="relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: 2 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-red-600 to-red-800 rounded-full shadow-2xl shadow-red-500/50 relative">
                      {/* Ball Seam */}
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40 transform -translate-y-1/2" />
                        <div className="absolute top-1/2 left-1/4 w-1/2 h-4 border-2 border-white/30 rounded-full transform -translate-y-1/2" />
                      </div>
                      {/* Shine */}
                      <div className="absolute top-1 right-2 w-3 h-3 bg-white/40 rounded-full blur-sm" />
                    </div>
                    {/* Ball Trail */}
                    <motion.div
                      className="absolute inset-0 bg-red-500/30 rounded-full blur-lg"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Batsman */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
              {/* Cricket Pitch Line */}
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-0.5 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"
                animate={{ 
                  opacity: [0.4, 0.8, 0.4],
                  scaleX: [0.95, 1, 0.95],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Shadow */}
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-3 bg-black/40 rounded-full blur-md"
                animate={{
                  scale: stage === 'hit' ? [1, 0.8, 1] : [1, 0.95, 1],
                }}
                transition={{ duration: stage === 'hit' ? 0.6 : 1.5, repeat: stage === 'hit' ? 1 : Infinity }}
              />

              {/* Batsman Body */}
              <div className="relative">
                {/* Head with Helmet */}
                <motion.div
                  className="w-10 h-10 mx-auto mb-1 relative"
                  animate={stage === 'stance' ? {
                    y: [0, -3, 0],
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {/* Face */}
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full mx-auto relative z-10" />
                  
                  {/* Indian Helmet - Blue */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-full opacity-95">
                    {/* Helmet Grill */}
                    <div className="absolute inset-x-2 bottom-2 space-y-0.5">
                      <div className="h-0.5 bg-slate-300/50 rounded" />
                      <div className="h-0.5 bg-slate-300/50 rounded" />
                      <div className="h-0.5 bg-slate-300/50 rounded" />
                    </div>
                    {/* Helmet Shine */}
                    <div className="absolute top-1 right-2 w-3 h-3 bg-white/60 rounded-full blur-sm" />
                    {/* India Flag Emblem */}
                    <div className="absolute top-1 left-1 flex flex-col gap-0.5">
                      <div className="w-2 h-0.5 bg-orange-500" />
                      <div className="w-2 h-0.5 bg-white" />
                      <div className="w-2 h-0.5 bg-green-600" />
                    </div>
                  </div>
                </motion.div>

                {/* Indian Jersey - Blue with #7 */}
                <motion.div
                  className="w-14 h-20 mx-auto relative rounded-lg overflow-hidden"
                  animate={stage === 'stance' ? {
                    scaleY: [1, 0.97, 1],
                  } : {
                    rotate: [0, -20, 0],
                    x: [0, 4, 0],
                  }}
                  transition={stage === 'hit' ? {
                    duration: 0.6,
                    times: [0, 0.3, 1],
                  } : {
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  {/* Jersey Main Color - Indian Blue */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800" />
                  
                  {/* Tricolor Stripes */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600" />
                  <div className="absolute inset-x-0 top-1 h-0.5 bg-white" />
                  <div className="absolute inset-x-0 top-1.5 h-1 bg-gradient-to-r from-green-600 to-green-700" />
                  
                  {/* Dhoni's Number 7 */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <motion.div 
                      className="text-white text-3xl font-bold"
                      style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                      animate={{
                        scale: stage === 'hit' ? [1, 1.2, 1] : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      7
                    </motion.div>
                  </div>
                  
                  {/* BCCI Logo Area */}
                  <div className="absolute top-2 right-2 w-4 h-4 bg-blue-900/40 rounded-full border border-white/30" />
                  
                  {/* Jersey Collar */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-3 bg-blue-700 rounded-b-lg border-b-2 border-orange-500" />
                  
                  {/* Arms */}
                  <div className="absolute -left-2 top-2 w-4 h-12 bg-gradient-to-b from-blue-600 to-blue-800 rounded-lg shadow-lg" />
                  <div className="absolute -right-2 top-2 w-4 h-12 bg-gradient-to-b from-blue-600 to-blue-800 rounded-lg shadow-lg" />
                  
                  {/* Jersey Shadow/Depth */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
                  
                  {/* Subtle Pattern */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
                  }} />
                </motion.div>

                {/* Cricket Pads - White with Blue Stripes */}
                <div className="absolute -left-2 top-16 w-5 h-16 bg-gradient-to-b from-white to-gray-100 rounded-lg shadow-lg border-2 border-blue-500/30">
                  <div className="absolute inset-x-0 top-1/3 h-1 bg-blue-500/40" />
                  <div className="absolute inset-x-0 top-2/3 h-0.5 bg-blue-400/30" />
                </div>
                <div className="absolute -right-2 top-16 w-5 h-16 bg-gradient-to-b from-white to-gray-100 rounded-lg shadow-lg border-2 border-blue-500/30">
                  <div className="absolute inset-x-0 top-1/3 h-1 bg-blue-500/40" />
                  <div className="absolute inset-x-0 top-2/3 h-0.5 bg-blue-400/30" />
                </div>

                {/* Cricket Bat */}
                <motion.div
                  className="absolute -right-10 top-14 origin-top-left"
                  animate={stage === 'stance' ? {
                    rotate: [-25, -30, -25],
                  } : {
                    rotate: [-25, 50, -25],
                  }}
                  transition={stage === 'hit' ? {
                    duration: 0.6,
                    times: [0, 0.3, 1],
                  } : {
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <div className="relative">
                    {/* Bat Blade */}
                    <div className="w-4 h-24 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 rounded-lg shadow-2xl relative">
                      {/* Bat Details */}
                      <div className="absolute inset-y-6 left-1/2 w-0.5 h-14 bg-amber-950/60 -translate-x-1/2" />
                      <div className="absolute bottom-4 left-0 right-0 h-8 bg-amber-800/40" />
                      {/* Bat Shine */}
                      <div className="absolute top-8 right-0.5 w-1 h-12 bg-amber-400/30 rounded-full" />
                    </div>
                    {/* Bat Handle */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-2.5 h-6 bg-gradient-to-b from-slate-800 to-slate-900 rounded-sm">
                      {/* Grip Lines */}
                      <div className="absolute inset-0 space-y-0.5 py-0.5">
                        <div className="h-0.5 bg-red-600/60" />
                        <div className="h-0.5 bg-red-600/60" />
                        <div className="h-0.5 bg-red-600/60" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Hit Impact Effect */}
                <AnimatePresence>
                  {stage === 'hit' && (
                    <>
                      <motion.div
                        className="absolute -right-8 top-20"
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        <div className="w-16 h-16 border-4 border-blue-400 rounded-full" />
                      </motion.div>
                      <motion.div
                        className="absolute -right-8 top-20"
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="w-16 h-16 bg-orange-400/50 rounded-full blur-lg" />
                      </motion.div>
                      {/* Six Text */}
                      <motion.div
                        className="absolute -right-8 top-16 text-5xl font-black text-orange-500"
                        initial={{ scale: 0, opacity: 0, y: 0 }}
                        animate={{ scale: [0, 1.5, 1.2], opacity: [0, 1, 0], y: [0, -20, -40] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ textShadow: '0 0 20px rgba(249, 115, 22, 0.8), 0 0 40px rgba(249, 115, 22, 0.4)' }}
                      >
                        6
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.h2
              className="text-4xl font-bold mb-2"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                backgroundImage: 'linear-gradient(90deg, #3b82f6, #f97316, #3b82f6)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {stage === 'stance' ? 'Captain Taking Stance...' : 'Dhoni Finishes it in Style!'}
            </motion.h2>

            {/* Loading Dots */}
            <div className="flex gap-2 justify-center mt-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #f97316)',
                  }}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            className="mt-10 w-80 h-1.5 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-blue-500/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #3b82f6, #f97316, #3b82f6)',
                backgroundSize: '200% 100%',
              }}
              initial={{ width: '0%' }}
              animate={{ 
                width: '100%',
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ 
                width: { duration: 4, ease: "easeInOut" },
                backgroundPosition: { duration: 2, repeat: Infinity },
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}