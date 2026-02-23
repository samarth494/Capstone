import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Trophy,
    Medal,
    ArrowLeft,
    LayoutDashboard,
    Swords,
    Zap,
    Target,
    Activity
} from 'lucide-react';
import API_BASE from '../config/api';


export default function LeaderboardPage() {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/leaderboard`);

                const data = await response.json();
                setLeaderboard(data);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankIcon = (index) => {
        if (index === 0) return <Trophy className="text-yellow-500 w-5 h-5" />;
        if (index === 1) return <Medal className="text-slate-400 w-5 h-5" />;
        if (index === 2) return <Medal className="text-amber-600 w-5 h-5" />;
        return <span className="text-slate-400 font-mono text-sm leading-none ml-1">#{index + 1}</span>;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-['JetBrains_Mono'] transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2 cursor-pointer transition-all hover:scale-105" onClick={() => navigate('/dashboard')}>
                            <Swords className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter transition-colors">CodeArena_</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center space-x-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all text-sm font-black tracking-widest border border-slate-200 dark:border-slate-700 shadow-sm"
                            >
                                <LayoutDashboard size={18} />
                                <span>DASHBOARD</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 transition-colors duration-300">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-orange-100 dark:bg-orange-500/10 rounded-2xl text-orange-600 dark:text-orange-400 transition-colors shadow-2xl shadow-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                                <Trophy size={32} />
                            </div>
                            <div>
                                <h1 className="text-[10px] font-black tracking-[0.3em] text-blue-600 dark:text-blue-500 uppercase mb-2">arena_rankings</h1>
                                <h2 className="text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tighter transition-colors">HALL_OF_FAME</h2>
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl font-mono text-lg leading-relaxed transition-colors">
                            The arena's elite digital warriors. Rankings are synthesized based on total victories and synaptic combat efficiency.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="px-8 py-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl transition-colors relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-600 dark:text-blue-400">
                                <Activity size={40} />
                            </div>
                            <div className="relative z-10">
                                <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 transition-colors">ACTIVE_COMBATANTS</div>
                                <div className="text-4xl font-black text-slate-900 dark:text-white transition-colors">{leaderboard.length.toString().padStart(3, '0')}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] w-32">RANKING</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">WARRIOR_ENTITY</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">TIER_CLASS</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">WINS_LOG</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">LOSSES_LOG</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">SYNAPTIC_RATIO</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">TOTAL_CYCLES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="7" className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                                <span className="text-slate-400 dark:text-slate-500 font-mono italic text-sm tracking-widest">SCANNIG_BATTLE_RECORDS...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : leaderboard.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-10 py-32 text-center text-slate-400 dark:text-slate-500 font-mono tracking-widest italic text-sm">
                                            -- THE_HALL_OF_FAME_IS_CURRENTLY_VACANT --
                                        </td>
                                    </tr>
                                ) : (
                                    leaderboard.map((user, index) => (
                                        <tr key={index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group cursor-pointer">
                                            <td className="px-10 py-7">
                                                <div className="flex items-center">
                                                    {getRankIcon(index)}
                                                </div>
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-black text-lg ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-blue-500 transition-all">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all">{user.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7 text-center">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest border transition-all ${user.rank === 'Diamond' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 shadow-lg shadow-blue-500/10' :
                                                    user.rank === 'Platinum' ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700 shadow-lg shadow-purple-500/10' :
                                                        user.rank === 'Gold' ? 'bg-yellow-50 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700 shadow-lg shadow-yellow-500/10' :
                                                            user.rank === 'Silver' ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700' :
                                                                'bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700 shadow-lg shadow-orange-500/10'
                                                    }`}>
                                                    {user.rank?.toUpperCase() || 'BRONZE'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-7 text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 italic tracking-widest transition-all">
                                                    {user.wins}W
                                                </span>
                                            </td>
                                            <td className="px-10 py-7 text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 italic tracking-widest transition-all">
                                                    {user.losses}L
                                                </span>
                                            </td>
                                            <td className="px-10 py-7 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-tighter transition-colors">{user.winRate}</span>
                                                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                                                        <div
                                                            className="h-full bg-blue-600 dark:bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-1000"
                                                            style={{ width: user.winRate }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7 text-right font-mono text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all">
                                                {user.battlesPlayed.toString().padStart(4, '0')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <div className="bg-white dark:bg-slate-900 px-8 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-4 transition-colors">
                        <Zap size={20} className="text-yellow-500 dark:text-yellow-400 animate-pulse" />
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-widest uppercase transition-colors">
                            RANKING_PROTOCOL_ONLINE // REALTIME_DATA_SYNCHRONIZATION_ACTIVE
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}
