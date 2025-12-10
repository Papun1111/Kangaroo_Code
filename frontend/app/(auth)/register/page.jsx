"use client";

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        setLoading(true);
        try {
            await register(username, email, password);
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen px-4 bg-black relative">
            {/* Ambient Background Glow matching the theme */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full max-h-lg bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

            <motion.div
                className="w-full max-w-md bg-[#0a0a0a] backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/10 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2 uppercase">
                        Create Account
                    </h2>
                    <p className="text-gray-400 text-sm">Join the league and start scoring.</p>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm text-center"
                        role="alert"
                    >
                        <p>{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <motion.div variants={itemVariants}>
                        <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest mb-2 ml-1" htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your Name"
                            required
                        />
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                        <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest mb-2 ml-1" htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest mb-2 ml-1" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </motion.div>

                    <motion.button 
                        variants={itemVariants}
                        type="submit" 
                        className="btn bg-emerald-500 text-black font-bold w-full py-4 rounded-xl text-lg transition-all duration-300 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Register Access'}
                    </motion.button>
                </form>

                <motion.p variants={itemVariants} className="text-center text-gray-500 mt-8 text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors">
                        Login here
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
}