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
                className="block card bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.03 }}
            >
                <div className="p-6">
                    <h3 className="text-black text-xl font-bold text-secondary truncate">{team.name}</h3>
                    <p className="text-slate-500 mt-2">{team._count.members} Members</p>
                </div>
                <div className="bg-emerald-500 h-1 w-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </motion.div>
        </Link>
    );
};

export default TeamCard;
