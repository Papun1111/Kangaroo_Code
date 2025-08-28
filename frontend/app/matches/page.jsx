"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Spinner from '../components/ui/Spinner';
import { format } from 'date-fns';

export default function MatchesPage() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/matches`);
                setMatches(res.data);
            } catch (error) {
                console.error("Failed to fetch matches", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, []);

    if (loading) {
        return <div className="flex justify-center mt-16"><Spinner /></div>;
    }

    return (
        <div>
            <h1 className="text-4xl font-bold text-secondary mb-8">Matches</h1>
            <div className="space-y-4">
                {matches.length > 0 ? (
                    matches.map(match => (
                        <Link key={match.id} href={`/matches/${match.id}`}>
                            <div className="card flex justify-between items-center hover:shadow-lg transition-shadow cursor-pointer">
                                <div>
                                    <p className="font-bold text-xl text-secondary">
                                        {match.homeTeam.name} vs {match.awayTeam.name}
                                    </p>
                                    <p className="text-slate-500 text-sm">{match.venue}</p>
                                    <p className="text-slate-500 text-sm">
                                        {format(new Date(match.matchDate), 'PPP')}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                    match.status === 'ONGOING' ? 'bg-red-200 text-red-800' : 
                                    match.status === 'COMPLETED' ? 'bg-green-200 text-green-800' : 
                                    'bg-slate-200 text-slate-800'
                                }`}>
                                    {match.status}
                                </span>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p>No matches scheduled.</p>
                )}
            </div>
        </div>
    );
}
