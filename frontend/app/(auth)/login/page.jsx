"use client";

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-4">
            {/* The card will fade in and slide up slightly */}
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-slate-200 animate-fade-in-up">
                <h2 className="text-3xl font-bold text-center text-secondary mb-6">Welcome Back</h2>
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4" role="alert">
                        <p>{error}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-slate-700 mb-2 font-semibold" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="input-field transition-all duration-300 focus:border-primary focus:ring-primary"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-700 mb-2 font-semibold" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="input-field transition-all duration-300 focus:border-primary focus:ring-primary"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-primary w-full py-3 text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-sm"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="text-center text-slate-600 mt-6">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary font-semibold hover:underline transition-colors">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
