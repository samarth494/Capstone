import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../config/api';
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

export default function LeaderboardPage() {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
<<<<<<< HEAD
                const response = await fetch('http://10.252.225.132:5000/api/leaderboard');
=======
                const response = await fetch(`${API_BASE}/api/leaderboard`);
>>>>>>> singleplayer
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
        <div className="min-h-screen bg-[#F8FAFC] font-['JetBrains_Mono']">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                            <Swords className="w-8 h-8 text-blue-600" />
                            <h1 className="text-xl font-bold text-slate-900 font-mono tracking-tighter">CodeArena_</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-slate-200"
                            >
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Trophy size={24} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 font-mono tracking-tight">Global Hall of Fame</h2>
                        </div>
                        <p className="text-slate-500 max-w-2xl font-sans">
                            The arena's elite warriors. Rankings are calculated based on total wins and combat frequency.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="px-6 py-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TOTAL COMBATANTS</div>
                            <div className="text-2xl font-bold text-slate-900">{leaderboard.length}</div>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-24">RANK</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">WARRIOR</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">TIER</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">XP</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">WINS</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">LOSSES</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">WIN RATE</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">TOTAL BATTLES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="8" className="px-8 py-20 text-center text-slate-400 font-sans italic">
                                            Scanning battle records...
                                        </td>
                                    </tr>
                                ) : leaderboard.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-8 py-20 text-center text-slate-400 font-sans italic">
                                            The hall of fame is currently empty. Start a battle to make history.
                                        </td>
                                    </tr>
                                ) : (
                                    leaderboard.map((user, index) => (
                                        <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center">
                                                    {getRankIcon(index)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs ring-1 ring-slate-200">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-slate-900">{user.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest border ${user.rank === 'Diamond' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    user.rank === 'Platinum' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                        user.rank === 'Gold' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                                            user.rank === 'Silver' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                                                'bg-orange-50 text-orange-600 border-orange-100'
                                                    }`}>
                                                    {user.rank?.toUpperCase() || 'BRONZE'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="text-sm font-bold text-yellow-600 font-mono tracking-tighter shadow-sm border border-yellow-100 bg-yellow-50 px-2.5 py-0.5 rounded-full">
                                                    {user.xp} XP
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100 italic">
                                                    {user.wins}W
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center px-8 py-5">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100 italic">
                                                    {user.losses}L
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-sm font-bold text-slate-900 font-mono tracking-tighter">{user.winRate}</span>
                                                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-600 transition-all duration-1000"
                                                            style={{ width: user.winRate }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right font-mono text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
                                                {user.battlesPlayed.toString().padStart(3, '0')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <p className="text-slate-400 text-xs flex items-center gap-2">
                        <Zap size={14} className="text-yellow-500" />
                        Rankings refresh in real-time after every certified battle completion.
                    </p>
                </div>
            </main>
        </div>
    );
}
