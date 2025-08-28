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
            staggerChildren: 0.2,
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
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-4">
            <motion.div
                className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-slate-200"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h2 variants={itemVariants} className="text-3xl font-bold text-center text-secondary mb-6">Create Your Account</motion.h2>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4"
                        role="alert"
                    >
                        <p>{error}</p>
                    </motion.div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div variants={itemVariants}>
                        <label className="block text-slate-700 mb-2 font-semibold" htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="input-field transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your Name"
                            required
                        />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <label className="block text-slate-700 mb-2 font-semibold" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="input-field transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <label className="block text-slate-700 mb-2 font-semibold" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="input-field transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </motion.div>
                    <motion.button 
                        variants={itemVariants}
                        type="submit" 
                        className="btn bg-emerald-500 text-white w-full py-3 text-lg transition-all duration-300 hover:bg-emerald-600 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-sm"
                        disabled={loading}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </motion.button>
                </form>
                <motion.p variants={itemVariants} className="text-center text-slate-600 mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-emerald-500 font-semibold hover:underline transition-colors">
                        Login here
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
}
