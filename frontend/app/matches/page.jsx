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
        return <div className="flex justify-center items-center h-96"><Spinner /></div>;
    }

    return (
        <motion.div 
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
        >
            <motion.div 
                variants={itemVariants}
                className="mb-10 text-center md:text-left"
            >
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-100 tracking-tight">
                    Match <span className="text-emerald-600">Center</span>
                </h1>
                <p className="text-lg text-white mt-3 max-w-2xl">
                    Follow the action live. View upcoming fixtures, ongoing battles, and results from completed matches.
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
                                    className="group block h-full bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-500 transition-all duration-300 overflow-hidden relative"
                                    whileHover={{ y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {/* Decorative top bar */}
                                    <div className={`h-2 w-full ${
                                        match.status === 'ONGOING' ? 'bg-red-500' : 
                                        match.status === 'COMPLETED' ? 'bg-emerald-500' : 
                                        'bg-slate-300'
                                    }`} />

                                    <div className="p-6 flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                                                    match.status === 'ONGOING' ? 'bg-red-100 text-red-700 animate-pulse' : 
                                                    match.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {match.status === 'ONGOING' ? '● Live' : match.status}
                                                </span>
                                                <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                    {match.venue}
                                                </span>
                                            </div>

                                            <div className="space-y-4 mb-6">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                                        {match.homeTeam.name}
                                                    </h3>
                                                    <span className="text-sm font-bold text-slate-400">VS</span>
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-right">
                                                        {match.awayTeam.name}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                            <div className="flex items-center text-slate-500 text-sm">
                                                <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                {format(new Date(match.matchDate), 'MMM d, yyyy')}
                                            </div>
                                            <span className="text-emerald-600 font-semibold text-sm group-hover:translate-x-1 transition-transform flex items-center">
                                                View Details 
                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
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
                        className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300"
                    >
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No matches scheduled</h3>
                        <p className="text-slate-500 mt-2">Check back later for upcoming fixtures.</p>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}