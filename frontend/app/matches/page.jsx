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
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    };

    if (loading) {
        return <div className="flex justify-center mt-16"><Spinner /></div>;
    }

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div 
                variants={itemVariants}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold text-[#FAF7F3]">Matches</h1>
                <p className="text-slate-500 mt-1">View upcoming, live, and completed matches.</p>
            </motion.div>
            
            <motion.div className="space-y-4" variants={containerVariants}>
                {matches.length > 0 ? (
                    matches.map(match => (
                        <motion.div key={match.id} variants={itemVariants}>
                            <Link href={`/matches/${match.id}`} legacyBehavior>
                                <a className="block card bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5">
                                        <div>
                                            <p className="font-bold text-xl text-black">
                                                {match.homeTeam.name} vs {match.awayTeam.name}
                                            </p>
                                            <p className="text-slate-500 text-sm mt-1">{match.venue}</p>
                                            <p className="text-slate-500 text-sm">
                                                {format(new Date(match.matchDate), 'PPP')}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full whitespace-nowrap ${
                                            match.status === 'ONGOING' ? 'bg-red-100 text-red-800' : 
                                            match.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 
                                            'bg-slate-200 text-slate-800'
                                        }`}>
                                            {match.status}
                                        </span>
                                    </div>
                                </a>
                            </Link>
                        </motion.div>
                    ))
                ) : (
                    <motion.p variants={itemVariants} className="text-center text-[#FAF6E9] mt-8">No matches scheduled.</motion.p>
                )}
            </motion.div>
        </motion.div>
    );
}
