"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Spinner from '../components/ui/Spinner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function MatchesPage() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/matches`);
                setMatches(res.data);
            } catch (error) {
                console.error("Failed to fetch matches", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1, 
            transition: { 
                staggerChildren: 0.1,
                delayChildren: 0.2
            } 
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1, 
            transition: { duration: 0.5, ease: "easeOut" } 
        },
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-black">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

            <motion.div 
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12"
                initial="hidden" 
                animate="visible" 
                variants={containerVariants}
            >
                {/* Header Section */}
                <motion.div 
                    variants={itemVariants}
                    className="mb-12 border-b border-white/10 pb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]"></span>
                        <span className="text-xs font-mono text-red-500 uppercase tracking-widest">Live Feed</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                        Match <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">Center</span>
                    </h1>
                    <p className="text-gray-400 mt-4 max-w-2xl text-lg font-light">
                        Monitor live telemetry, upcoming fixtures, and historical battle data from the arena.
                    </p>
                </motion.div>
                
                <motion.div 
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
                    variants={containerVariants}
                >
                    {matches.length > 0 ? (
                        matches.map(match => (
                            <motion.div key={match.id} variants={itemVariants} layout>
                                <Link href={`/matches/${match.id}`} >
                                    <motion.div
                                        className="group block h-full bg-[#0a0a0a] rounded-[2rem] border border-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300 overflow-hidden relative cursor-pointer"
                                        whileHover={{ y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {/* Status Line Indicator */}
                                        <div className={`absolute top-0 left-0 w-full h-1 ${
                                            match.status === 'ONGOING' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 
                                            match.status === 'COMPLETED' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 
                                            'bg-gray-700'
                                        }`} />

                                        <div className="p-6 md:p-8 flex flex-col h-full justify-between relative z-10">
                                            {/* Top Row: Status & Venue */}
                                            <div className="flex justify-between items-start mb-8">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                                                    match.status === 'ONGOING' ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 
                                                    match.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                                    'bg-white/5 text-gray-400 border-white/10'
                                                }`}>
                                                    {match.status === 'ONGOING' ? '● LIVE NOW' : match.status}
                                                </span>
                                                <span className="text-xs font-mono text-gray-500 uppercase truncate max-w-[120px]">
                                                    {match.venue}
                                                </span>
                                            </div>

                                            {/* Teams VS */}
                                            <div className="mb-8">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex flex-col">
                                                        <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                                                            {match.homeTeam.name}
                                                        </h3>
                                                        <span className="text-[10px] text-gray-600 font-mono uppercase">Home</span>
                                                    </div>
                                                    
                                                    <div className="text-gray-600 font-black text-xl italic opacity-50">VS</div>

                                                    <div className="flex flex-col items-end text-right">
                                                        <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                                                            {match.awayTeam.name}
                                                        </h3>
                                                        <span className="text-[10px] text-gray-600 font-mono uppercase">Away</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer: Date & CTA */}
                                            <div className="pt-6 border-t border-white/5 flex justify-between items-center mt-auto">
                                                <div className="flex items-center text-gray-500 text-xs font-mono">
                                                    <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    {format(new Date(match.matchDate), 'MMM d, yyyy')}
                                                </div>
                                                <span className="text-white text-xs font-bold group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex items-center uppercase tracking-wide">
                                                    Analyze Data
                                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div 
                            variants={itemVariants} 
                            className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-[2rem] bg-white/5"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">No Matches Scheduled</h3>
                            <p className="text-gray-500 mt-2 font-mono text-sm">Arena is currently inactive. Check back later.</p>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}