"use client";

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google'; // Import

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleLogin } = useAuth(); // Destructure googleLogin
    const router = useRouter();

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { staggerChildren: 0.2 },
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

    // Handle Google Success
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
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-4">
            <motion.div
                className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-slate-200"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h2 variants={itemVariants} className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back</motion.h2>
                
                {/* Google Button Section */}
                <motion.div variants={itemVariants} className="flex justify-center mb-6">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Login Failed')}
                        theme="filled_blue"
                        shape="pill"
                        size="large"
                        width="100%"
                    />
                </motion.div>

                <motion.div variants={itemVariants} className="relative flex py-2 items-center mb-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </motion.div>

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
                    {/* ... existing email/password inputs ... */}
                    <motion.div variants={itemVariants}>
                        <label className="block text-slate-700 mb-2 font-semibold" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="input-field transition-all duration-300 text-black focus:border-emerald-500 focus:ring-emerald-500"
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
                            className="text-black input-field transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500"
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
                        {loading ? 'Logging in...' : 'Login with Email'}
                    </motion.button>
                </form>
                <motion.p variants={itemVariants} className="text-center text-slate-600 mt-6">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-emerald-500 font-semibold hover:underline transition-colors">
                        Register here
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
}