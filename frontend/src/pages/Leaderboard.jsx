import React, { useState, useEffect, useCallback } from 'react';
import { Medal, Trophy, Crown, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Leaderboard = () => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameType, setGameType] = useState('reaction_time');
    const [refreshing, setRefreshing] = useState(false);

    const fetchScores = useCallback(async (isManual = false) => {
        if (isManual) setRefreshing(true);
        else setLoading(true);

        try {
            const url = `${API_BASE_URL}/api/games/scores/?game_type=${gameType}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch scores');
            }
            const data = await response.json();
            setScores(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [gameType]);

    useEffect(() => {
        fetchScores();
    }, [fetchScores]);

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Crown className="text-yellow-400" size={24} />;
            case 1: return <Medal className="text-slate-300" size={24} />;
            case 2: return <Medal className="text-amber-600" size={24} />;
            default: return <span className="text-slate-500 font-bold w-6 text-center">{index + 1}</span>;
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="text-red-400 text-center p-8">
            Error: {error}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-4">
                        <Trophy size={32} className="text-yellow-500" />
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase font-outfit">Hall of Fame</h1>
                    </div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] ml-12">Top Level Operatives Ranked by Performance</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex p-1 bg-slate-900/80 rounded-xl border border-white/5 backdrop-blur-md">
                        <button
                            onClick={() => setGameType('reaction_time')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${gameType === 'reaction_time' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Reaction Time
                        </button>
                        <button
                            onClick={() => setGameType('evade_and_sequence')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${gameType === 'evade_and_sequence' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Evade & Sequence
                        </button>
                    </div>

                    <button
                        onClick={() => fetchScores(true)}
                        disabled={refreshing || loading}
                        className="p-3 rounded-xl bg-slate-800/50 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all active:scale-95 disabled:opacity-50"
                        title="Synchronize Data"
                    >
                        <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-900/50 text-slate-400 text-left">
                        <tr>
                            <th className="p-4 pl-6">Rank</th>
                            <th className="p-4">Player</th>
                            <th className="p-4">Score</th>
                            <th className="p-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {scores.map((score, index) => (
                            <tr key={score.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 pl-6">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900/50">
                                        {getRankIcon(index)}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                                            {score.avatar ? (
                                                <img src={score.avatar} alt={score.username} className="w-full h-full object-cover" />
                                            ) : (
                                                score.username?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span className="font-medium text-white">{score.username}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`font-mono font-black ${gameType === 'reaction_time' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                        {score.score}
                                        <span className="text-[10px] ml-1 uppercase opacity-60">
                                            {gameType === 'reaction_time' ? 'ms' : 'pts'}
                                        </span>
                                    </span>
                                </td>
                                <td className="p-4 text-slate-500 text-sm">
                                    {new Date(score.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {scores.length === 0 && (
                    <div className="text-center p-8 text-slate-500">
                        No scores yet. Be the first!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
