"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const CreateTeamForm = ({ onTeamCreated }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/teams`,
                { name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onTeamCreated(res.data);
            router.push(`/teams/${res.data.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create team.');
        } finally {
            setLoading(false);
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    return (
        <motion.div 
            className="w-full max-w-2xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
            <div className="text-center mb-8">
                <motion.h2 variants={itemVariants} className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                    Initialize Squad
                </motion.h2>
                <motion.p variants={itemVariants} className="text-gray-400 font-mono text-xs uppercase tracking-widest">
                    Enter designation to register new entity
                </motion.p>
            </div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-3"
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={itemVariants}>
                    <label htmlFor="teamName" className="block text-emerald-500 text-xs font-mono uppercase tracking-widest mb-2 ml-1">
                        Team Designation
                    </label>
                    <div className="relative group">
                        <input
                            type="text"
                            id="teamName"
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 text-lg font-medium"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. THE INVINCIBLES"
                            required
                            autoComplete="off"
                        />
                        {/* Glow effect on hover/focus */}
                        <div className="absolute inset-0 rounded-xl bg-emerald-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
                    </div>
                </motion.div>

                <motion.button 
                    variants={itemVariants}
                    type="submit" 
                    className="btn bg-emerald-500 text-black font-bold w-full py-4 rounded-xl text-lg uppercase tracking-wide transition-all duration-300 hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            PROCESSING REGISTRY...
                        </span>
                    ) : (
                        'CONFIRM REGISTRATION'
                    )}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default CreateTeamForm;