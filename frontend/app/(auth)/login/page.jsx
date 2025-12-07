"use client";

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleLogin } = useAuth(); 
    const router = useRouter();

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            await googleLogin(credentialResponse.credential);
            router.push('/dashboard');
        } catch (err) {
            setError('Google login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-4 bg-black relative">
            {/* Ambient Background Glow matching the Home Page */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full max-h-lg bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

            <motion.div
                className="w-full max-w-md bg-[#0a0a0a] backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/10 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                        WELCOME BACK
                    </h2>
                    <p className="text-gray-400 text-sm">Enter the stadium to continue analysis.</p>
                </motion.div>
                
                {/* Google Button Section */}
                <motion.div variants={itemVariants} className="flex justify-center mb-8">
                    <div className="w-full">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Login Failed')}
                            theme="filled_black" // Changed to black theme to fit aesthetics
                            shape="pill"
                            size="large"
                            width="100%"
                            text="continue_with"
                        />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="relative flex py-2 items-center mb-8">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-xs font-mono uppercase tracking-widest">Or continue with</span>
                    <div className="flex-grow border-t border-white/10"></div>
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
                        <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest mb-2 ml-1" htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="coach@cricket-horizon.com"
                            required
                        />
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest" htmlFor="password">Password</label>
                            <Link href="/forgot-password" className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">
                                Forgot?
                            </Link>
                        </div>
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
                        {loading ? 'Authenticating...' : 'Login Access'}
                    </motion.button>
                </form>

                <motion.p variants={itemVariants} className="text-center text-gray-500 mt-8 text-sm">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors">
                        Register
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
}