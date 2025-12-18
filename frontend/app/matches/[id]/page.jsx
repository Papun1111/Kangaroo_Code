"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/ui/Spinner';
import LiveScorecard from '../../components/match/LiveScorecard';
import UmpireControlPanel from '../../components/match/UmpireControlPanel';
import TossPanel from '../../components/match/TossPanel';
import InningsBreakPanel from '../../components/match/InningsBreakPanel';
import MatchResultPanel from '../../components/match/MatchResultPanel'; // Import the new component
import { motion } from 'framer-motion';

export default function MatchDetailPage() {
    const { id: matchId } = useParams();
    const socket = useSocket();
    const { user, isAuthenticated } = useAuth();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMatch = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/matches/${matchId}`);
            setMatch(res.data);
        } catch (err) {
            setError('Failed to load match data.');
        } finally {
            setLoading(false);
        }
    }, [matchId]);

    useEffect(() => {
        if (matchId) fetchMatch();
    }, [matchId, fetchMatch]);

    useEffect(() => {
        if (socket && matchId) {
            socket.emit('joinMatch', matchId);
            const handleScoreUpdate = (updatedMatchData) => setMatch(updatedMatchData);
            socket.on('scoreUpdated', handleScoreUpdate);
            return () => socket.off('scoreUpdated', handleScoreUpdate);
        }
    }, [socket, matchId]);

    const canUpdateScore = isAuthenticated && user && match && (
        match.homeTeam.members.some(m => m.userId === user.id && m.role === 'CAPTAIN') ||
        match.awayTeam.members.some(m => m.userId === user.id && m.role === 'CAPTAIN') ||
        user.role === 'UMPIRE'
    );

    if (loading) return <div className="flex justify-center mt-16"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (!match) return <p className="text-center">Match not found.</p>;

    const renderMatchState = () => {
        switch (match.status) {
            case 'TOSS':
                return canUpdateScore ? <TossPanel match={match} onTossUpdate={setMatch} /> : <p className="text-center text-slate-500">Waiting for toss...</p>;
            case 'ONGOING':
                return (
                    <>
                        <LiveScorecard match={match} />
                        {canUpdateScore && <UmpireControlPanel match={match} onScoreUpdate={setMatch} />}
                    </>
                );
            case 'INNINGS_BREAK':
                 return (
                    <>
                        <LiveScorecard match={match} />
                        {canUpdateScore ? <InningsBreakPanel match={match} onInningsStart={setMatch} /> : <p className="text-center text-slate-500">Innings break in progress...</p>}
                    </>
                );
            case 'COMPLETED':
                return (
                    <>
                        <MatchResultPanel match={match} />
                        <div className="mt-8">
                            <LiveScorecard match={match} />
                        </div>
                    </>
                );
            default:
                return <p className="text-center text-white">Match is yet to begin.</p>;
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mt-20">
                <h1 className="text-4xl font-bold text-gray-200">{match.homeTeam.name} vs {match.awayTeam.name}</h1>
                <p className="text-green-600 mt-1">{match.venue}</p>
                 <span className={`mt-2 inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                    match.status === 'ONGOING' ? 'bg-red-100 text-red-800 animate-pulse' : 
                    match.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 
                    'bg-slate-200 text-slate-800'
                }`}>
                    {match.status}
                </span>
            </div>
            {renderMatchState()}
        </motion.div>
    );
}
