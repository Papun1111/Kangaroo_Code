"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

const TeamCard = ({ team }) => {
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <Link href={`/teams/${team.id}`}>
            <motion.div
                className="group relative bg-[#0a0a0a] rounded-[2rem] border border-white/10 overflow-hidden hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-all duration-500 cursor-pointer h-full"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -5 }}
            >
                {/* Decorative Background Blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />

                <div className="p-8 flex flex-col justify-between h-full relative z-10">
                    {/* Header: Emblem + Arrow */}
                    <div className="flex items-start justify-between mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-800 flex items-center justify-center text-white font-black text-3xl shadow-lg group-hover:scale-110 group-hover:shadow-emerald-500/30 transition-all duration-300">
                            {team.name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all duration-300">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-black -rotate-45 group-hover:rotate-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                        </div>
                    </div>

                    {/* Content: Name + Stats */}
                    <div>
                        <h3 className="text-white text-2xl font-bold truncate mb-3 group-hover:text-emerald-400 transition-colors tracking-tight">
                            {team.name}
                        </h3>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                <span className="text-gray-400 text-sm font-mono">
                                    {team._count.members} <span className="text-gray-600 uppercase text-[10px]">Agents</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Bottom Border Highlight on Hover */}
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.div>
        </Link>
    );
};

export default TeamCard;