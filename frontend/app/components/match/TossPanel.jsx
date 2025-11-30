"use client";

import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const TossPanel = ({ match, onTossUpdate }) => {
    const [tossWinnerId, setTossWinnerId] = useState('');
    const [decision, setDecision] = useState('bat');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tossWinnerId) {
            setError('Please select the team that won the toss.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            // 1. Submit the toss result
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/matches/${match.id}/toss`,
                { tossWinnerId, decision }
            );

            // 2. Fetch the fresh match data to ensure we have the newly created innings
            // This is a safety step to ensure the UI updates with the correct batting/bowling teams
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/matches/${match.id}`);
            
            // 3. Update the parent state
            onTossUpdate(res.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit toss result.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to get name of selected winner for the UI
    const getWinnerName = () => {
        if (tossWinnerId === match.homeTeam.id) return match.homeTeam.name;
        if (tossWinnerId === match.awayTeam.id) return match.awayTeam.name;
        return "The winner";
    };

    return (
        <motion.div 
            className="card max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 border border-slate-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h2 className="text-2xl font-bold text-center text-black mb-6">Match Toss</h2>
            
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Select Winner */}
                <div>
                    <label className="block text-gray-900 mb-2 font-bold text-lg">
                        Who won the toss?
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setTossWinnerId(match.homeTeam.id)}
                            className={`p-4 rounded-lg border-2 transition-all font-semibold ${
                                tossWinnerId === match.homeTeam.id 
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                        >
                            {match.homeTeam.name}
                        </button>
                        <button
                            type="button"
                            onClick={() => setTossWinnerId(match.awayTeam.id)}
                            className={`p-4 rounded-lg border-2 transition-all font-semibold ${
                                tossWinnerId === match.awayTeam.id 
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                        >
                            {match.awayTeam.name}
                        </button>
                    </div>
                </div>

                {/* 2. Select Decision (Only shows after winner is selected) */}
                {tossWinnerId && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        <label className="block text-gray-900 mb-2 font-bold text-lg">
                            {getWinnerName()} elected to...
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setDecision('bat')}
                                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                                    decision === 'bat' 
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-2 ring-emerald-200' 
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                }`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                <span className="font-bold">Bat First</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setDecision('field')}
                                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                                    decision === 'field' 
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-2 ring-emerald-200' 
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                }`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                <span className="font-bold">Field First</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                <motion.button 
                    type="submit" 
                    className="btn bg-emerald-600 text-white w-full py-4 text-xl font-bold shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!tossWinnerId || loading}
                    whileTap={{ scale: 0.98 }}
                >
                    {loading ? 'Starting Match...' : 'Start Match'}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default TossPanel;