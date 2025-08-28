"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

const UmpireControlPanel = ({ match, onScoreUpdate }) => {
    const [batsmanId, setBatsmanId] = useState('');
    const [bowlerId, setBowlerId] = useState('');
    const [runsScored, setRunsScored] = useState('0');
    const [isWicket, setIsWicket] = useState(false);
    const [extraType, setExtraType] = useState('');
    const [extraRuns, setExtraRuns] = useState('0');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [battingTeam, setBattingTeam] = useState(null);
    const [bowlingTeam, setBowlingTeam] = useState(null);

    // This effect correctly determines the current batting and bowling teams whenever the match data changes.
    useEffect(() => {
        if (!match) return;

        const currentInnings = match.innings.length > 0 ? match.innings[match.innings.length - 1] : null;

        if (currentInnings) {
            // An innings is in progress. Identify teams from the latest innings record.
            const currentBattingTeam = match.homeTeam.id === currentInnings.battingTeamId ? match.homeTeam : match.awayTeam;
            const currentBowlingTeam = match.homeTeam.id === currentInnings.bowlingTeamId ? match.homeTeam : match.awayTeam;
            setBattingTeam(currentBattingTeam);
            setBowlingTeam(currentBowlingTeam);
        } else {
            // Match has not started. Assume home team bats first.
            // A more advanced implementation would use a toss winner decision.
            setBattingTeam(match.homeTeam);
            setBowlingTeam(match.awayTeam);
        }
        // Reset selections when teams change (e.g., end of innings)
        setBatsmanId('');
        setBowlerId('');

    }, [match]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!batsmanId || !bowlerId) {
            setError('Please select both a batsman and a bowler.');
            return;
        }
        setError('');
        setLoading(true);

        const currentInnings = match.innings.length > 0 ? match.innings[match.innings.length - 1] : null;

        const scoreData = {
            inningsId: currentInnings?.id, // Can be null for the first ball of the match
            battingTeamId: battingTeam.id,
            bowlingTeamId: bowlingTeam.id,
            batsmanId,
            bowlerId,
            runsScored: parseInt(runsScored, 10),
            isWicket,
            extraType: extraType || null,
            extraRuns: parseInt(extraRuns, 10),
        };

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/matches/${match.id}/score`, scoreData);
            onScoreUpdate(res.data.data);
            // Reset form for the next ball, but keep players selected
            setIsWicket(false);
            setRunsScored('0');
            setExtraType('');
            setExtraRuns('0');
        } catch (err)
 {
            setError(err.response?.data?.message || 'Failed to update score.');
        } finally {
            setLoading(false);
        }
    };
    
    if (!battingTeam || !bowlingTeam) {
        return null; // Don't render the form until teams are determined
    }

    return (
        <div className="card mt-8 border-t-4 border-primary animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-4 text-secondary">Score Update Panel</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-700 mb-2 font-semibold">On Strike</label>
                        <select value={batsmanId} onChange={(e) => setBatsmanId(e.target.value)} className="input-field" required>
                            <option value="">Select Batsman</option>
                            {battingTeam.members.map(m => <option key={m.userId} value={m.userId}>{m.user.username}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-slate-700 mb-2 font-semibold">Bowler</label>
                        <select value={bowlerId} onChange={(e) => setBowlerId(e.target.value)} className="input-field" required>
                            <option value="">Select Bowler</option>
                            {bowlingTeam.members.map(m => <option key={m.userId} value={m.userId}>{m.user.username}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-slate-700 mb-2 font-semibold">Runs</label>
                        <input type="number" min="0" max="6" value={runsScored} onChange={(e) => setRunsScored(e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <label className="block text-slate-700 mb-2 font-semibold">Extras Type</label>
                        <select value={extraType} onChange={(e) => setExtraType(e.target.value)} className="input-field">
                            <option value="">None</option>
                            <option value="wd">Wide</option>
                            <option value="nb">No Ball</option>
                            <option value="b">Bye</option>
                            <option value="lb">Leg Bye</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-slate-700 mb-2 font-semibold">Extra Runs</label>
                        <input type="number" min="0" value={extraRuns} onChange={(e) => setExtraRuns(e.target.value)} className="input-field" />
                    </div>
                    <div className="flex items-center justify-center pb-2">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" checked={isWicket} onChange={(e) => setIsWicket(e.target.checked)} className="h-5 w-5" />
                            <span className="font-semibold text-red-600">Wicket?</span>
                        </label>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary w-full !mt-6 py-3 text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Ball'}
                </button>
                {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            </form>
        </div>
    );
};

export default UmpireControlPanel;
