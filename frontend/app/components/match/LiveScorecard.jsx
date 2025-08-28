const LiveScorecard = ({ match }) => {
    // Helper function to get a player's username from their ID
    const getPlayerUsername = (playerId) => {
        const allMembers = [...match.homeTeam.members, ...match.awayTeam.members];
        const member = allMembers.find(m => m.user.id === playerId);
        return member ? member.user.username : 'Unknown Player';
    };

    // This function processes all ball data for an innings to calculate player stats
    const calculateInningsStats = (innings) => {
        const battingStats = {};
        const bowlingStats = {};

        if (!innings || !innings.oversData) {
            return { batting: [], bowling: [] };
        }

        for (const over of innings.oversData) {
            // Initialize bowler stats if they don't exist
            if (!bowlingStats[over.bowlerId]) {
                bowlingStats[over.bowlerId] = { runs: 0, wickets: 0, balls: 0 };
            }

            for (const ball of over.balls) {
                // Initialize batsman stats if they don't exist
                if (!battingStats[ball.batsmanId]) {
                    battingStats[ball.batsmanId] = { runs: 0, balls: 0, isOut: false };
                }

                // Aggregate batting stats
                battingStats[ball.batsmanId].runs += ball.runsScored;
                if (ball.extraType !== 'wd') { // Wides don't count as a ball faced
                    battingStats[ball.batsmanId].balls++;
                }

                // Aggregate bowling stats
                if (ball.extraType !== 'lb' && ball.extraType !== 'b') { // Leg-byes and byes don't count against bowler
                    bowlingStats[over.bowlerId].runs += ball.runsScored + (ball.extraRuns || 0);
                }
                
                if (ball.extraType !== 'wd' && ball.extraType !== 'nb') { // Wides & No-balls must be re-bowled
                    bowlingStats[over.bowlerId].balls++;
                }

                if (ball.isWicket) {
                    battingStats[ball.batsmanId].isOut = true;
                    // Wicket is credited to the bowler (unless it's a run-out)
                    if (ball.wicketType !== 'run_out') { 
                        bowlingStats[over.bowlerId].wickets++;
                    }
                }
            }
        }

        // Convert the stats objects into arrays for easier rendering
        const batting = Object.entries(battingStats).map(([playerId, stats]) => ({ playerId, ...stats }));
        const bowling = Object.entries(bowlingStats).map(([playerId, stats]) => ({ playerId, ...stats }));
        
        return { batting, bowling };
    };

    const renderInnings = (innings, inningsNumber) => {
        if (!innings) {
            return (
                <div className="card">
                    <h2 className="text-2xl font-bold text-secondary mb-4">Innings {inningsNumber}</h2>
                    <p>Yet to bat.</p>
                </div>
            );
        }
        
        const battingTeamName = match.homeTeam.id === innings.battingTeamId ? match.homeTeam.name : match.awayTeam.name;
        const { batting, bowling } = calculateInningsStats(innings);

        return (
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-secondary">{battingTeamName}</h2>
                    <p className="text-3xl font-bold">
                        {innings.score} - {innings.wickets}
                        <span className="text-xl text-slate-500 ml-2">({Math.floor(innings.overs)}.{(innings.overs * 10 % 10).toFixed(0)} Overs)</span>
                    </p>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-2">Batting</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-2">Batsman</th>
                                    <th className="p-2">Runs</th>
                                    <th className="p-2">Balls</th>
                                    <th className="p-2">SR</th>
                                </tr>
                           </thead>
                           <tbody>
                                {batting.map(b => (
                                    <tr key={b.playerId}>
                                        <td className="p-2 font-semibold">{getPlayerUsername(b.playerId)} {!b.isOut && '*'}</td>
                                        <td className="p-2">{b.runs}</td>
                                        <td className="p-2">{b.balls}</td>
                                        <td className="p-2">{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(2) : '0.00'}</td>
                                    </tr>
                                ))}
                           </tbody>
                        </table>
                    </div>
                </div>
                 <div className="mt-6">
                    <h3 className="font-bold text-lg mb-2">Bowling</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-2">Bowler</th>
                                    <th className="p-2">Overs</th>
                                    <th className="p-2">Runs</th>
                                    <th className="p-2">Wickets</th>
                                    <th className="p-2">Econ</th>
                                </tr>
                           </thead>
                           <tbody>
                                {bowling.map(b => {
                                    const overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`;
                                    const economy = b.balls > 0 ? (b.runs / (b.balls / 6)).toFixed(2) : '0.00';
                                    return (
                                        <tr key={b.playerId}>
                                            <td className="p-2 font-semibold">{getPlayerUsername(b.playerId)}</td>
                                            <td className="p-2">{overs}</td>
                                            <td className="p-2">{b.runs}</td>
                                            <td className="p-2">{b.wickets}</td>
                                            <td className="p-2">{economy}</td>
                                        </tr>
                                    );
                                })}
                           </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {renderInnings(match.innings[0], 1)}
            {match.status !== 'UPCOMING' && renderInnings(match.innings[1], 2)}
        </div>
    );
};

export default LiveScorecard;
