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
            className="card max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 border border-slate-200"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        >
            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-center mb-4 text-secondary">Create a New Team</motion.h2>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                <motion.div variants={itemVariants} className="mb-4">
                    <label htmlFor="teamName" className="block text-slate-700 mb-2 font-semibold">Team Name</label>
                    <input
                        type="text"
                        id="teamName"
                        className="text-black input-field transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., The Champions"
                        required
                    />
                </motion.div>
                <motion.button 
                    variants={itemVariants}
                    type="submit" 
                    className="btn bg-emerald-500 text-white w-full py-3 text-lg transition-all duration-300 hover:bg-emerald-600 hover:shadow-lg hover:-translate-y-1" 
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                >
                    {loading ? 'Creating...' : 'Create Team'}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default CreateTeamForm;
