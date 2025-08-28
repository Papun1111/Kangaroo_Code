"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Spinner from '../components/ui/Spinner';

export default function DashboardPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.id) {
                try {
                    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/${user.id}`);
                    setProfile(res.data);
                } catch (error) {
                    console.error("Failed to fetch profile", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        if (!authLoading && isAuthenticated) {
            fetchProfile();
        }
    }, [user, authLoading, isAuthenticated]);

    const isCaptain = profile?.role === 'CAPTAIN';

    if (authLoading || loading || !profile) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-secondary">Dashboard</h1>
                {isCaptain && (
                    <Link href="/matches/create" className="btn btn-primary">
                        Host New Match
                    </Link>
                )}
            </div>
            
            <div className="card mb-8">
                <h2 className="text-2xl font-semibold mb-2">Welcome, {profile.username}!</h2>
                <p className="text-slate-600"><strong>Email:</strong> {profile.email}</p>
                <p className="text-slate-600"><strong>Role:</strong> {profile.role}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
                <div className="card">
                    <h3 className="text-xl font-bold mb-4">Your Teams</h3>
                    {profile.teamMemberships.length > 0 ? (
                        <ul className="space-y-2">
                            {profile.teamMemberships.map(membership => (
                                <li key={membership.team.id} className="p-2 bg-slate-50 rounded-md">
                                    <Link href={`/teams/${membership.team.id}`} className="text-primary hover:underline font-semibold">
                                        {membership.team.name}
                                    </Link>
                                    {membership.role === 'CAPTAIN' && <span className="text-xs ml-2 font-bold text-amber-600">(Captain)</span>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>You are not a member of any team yet.</p>
                    )}
                     <Link href="/teams" className="btn btn-secondary mt-4 inline-block">
                        Browse Teams
                    </Link>
                </div>

                <div className="card">
                    <h3 className="text-xl font-bold mb-4">Player Stats</h3>
                    <p><strong>Matches Played:</strong> {profile.profile.matchesPlayed}</p>
                    <p><strong>Batting Average:</strong> {profile.profile.battingAverage.toFixed(2)}</p>
                    <p><strong>Strike Rate:</strong> {profile.profile.strikeRate.toFixed(2)}</p>
                    <p><strong>Wickets Taken:</strong> {profile.profile.wicketsTaken}</p>
                </div>
            </div>
        </div>
    );
}
