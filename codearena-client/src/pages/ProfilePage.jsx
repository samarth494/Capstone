import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User,
    Swords,
    Trophy,
    Activity,
    Clock,
    LayoutDashboard,
    ChevronRight,
    Target,
    Zap,
    ZapOff
} from 'lucide-react';
import API_BASE from '../config/api';


export default function ProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/users/profile/${userId}`);

                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center font-mono transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 dark:text-slate-400 animate-pulse text-sm font-bold uppercase tracking-widest">Accessing records...</p>
                </div>
            </div>
        );
    }

    if (!data || !data.user) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-300">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-mono">Warrior Not Found</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 font-sans">The requested battle profile could not be retrieved from the archives.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl font-bold transition-all font-mono shadow-lg shadow-blue-500/20"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const { user, recentBattles } = data;

    const statCards = [
        { label: 'Battles Won', value: user.wins, icon: Trophy, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
        { label: 'Battles Lost', value: user.losses, icon: ZapOff, color: 'text-red-600', bgColor: 'bg-red-50' },
        { label: 'Win Rate', value: user.winRate, icon: Activity, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { label: 'Total Combat', value: user.battlesPlayed, icon: Swords, color: 'text-slate-600', bgColor: 'bg-slate-50' }
    ];

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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Profile Hero */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-8 md:p-16 mb-12 overflow-hidden relative transition-all duration-300">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                    <div className="flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left relative z-10">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 border-4 border-slate-50 dark:border-slate-700 shadow-2xl relative overflow-hidden group transition-all duration-500 hover:rotate-2">
                            <User size={64} className="md:size-96 group-hover:scale-110 transition-transform opacity-10 absolute -bottom-10" />
                            <div className="absolute inset-0 flex items-center justify-center font-black text-6xl md:text-8xl text-slate-900 dark:text-white italic select-none">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
                                <div>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-500/20 shadow-sm uppercase tracking-[0.2em] leading-none transition-colors">CERTIFIED_WARRIOR</span>
                                        <span className="text-slate-400 dark:text-slate-500 text-xs font-bold font-mono transition-colors">./ACCESS_POINT_{new Date(user.joinedAt).getFullYear()}</span>
                                    </div>
                                    <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors mb-2">{user.username.toUpperCase()}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-mono text-lg transition-colors italic">"Code is my weapon, algorithms are my strategy."</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="px-8 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-500/20 uppercase tracking-widest border-2 border-white/10">
                                        {user.rank || 'BRONZE'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {statCards.map((stat, i) => (
                                    <div key={i} className={`p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800/50 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-500 group relative overflow-hidden`}>
                                        <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <stat.icon size={64} />
                                        </div>
                                        <div className="flex items-center gap-3 mb-3 relative z-10">
                                            <div className={`p-2 rounded-xl ${stat.bgColor.replace('bg-', 'bg-').replace('-50', '-50 dark:bg-opacity-20')} ${stat.color} group-hover:scale-110 transition-transform shadow-sm`}>
                                                <stat.icon size={20} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">{stat.label.replace(' ', '_')}</span>
                                        </div>
                                        <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tighter tabular-nums transition-colors relative z-10">
                                            {stat.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Battle History */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-4 transition-colors">
                                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
                                    <Clock size={24} />
                                </div>
                                COMBAT_LOGS
                            </h3>
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 mx-6 transition-colors"></div>
                        </div>

                        <div className="space-y-6">
                            {recentBattles.length === 0 ? (
                                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-16 text-center transition-all shadow-sm">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600 transition-colors">
                                        <Activity size={32} />
                                    </div>
                                    <p className="text-slate-400 dark:text-slate-500 font-mono italic tracking-widest uppercase text-sm">-- NO_COMBAT_HISTORY_FOUND --</p>
                                </div>
                            ) : (
                                recentBattles.map((battle, i) => (
                                    <div
                                        key={i}
                                        onClick={() => navigate(`/replay/${battle.battleId}`)}
                                        className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-50 dark:border-slate-800 p-6 hover:border-blue-300 dark:hover:border-blue-800 transition-all group relative overflow-hidden shadow-sm hover:shadow-2xl cursor-pointer transform hover:-translate-y-1"
                                    >
                                        <div className={`absolute top-0 right-0 w-32 h-full skew-x-[-15deg] translate-x-16 opacity-5 group-hover:opacity-10 transition-all ${battle.result === 'VICTORY' ? 'bg-green-600' : 'bg-red-600'}`}></div>

                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-8">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg transition-all ${battle.result === 'VICTORY'
                                                    ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                                                    : battle.result === 'DEFEAT'
                                                        ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                                    }`}>
                                                    {battle.result.charAt(0)}
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight transition-colors">MISSION_{battle.problemId}</span>
                                                        <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded transition-colors uppercase">VS_{battle.opponent.toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-mono text-xs transition-colors font-bold uppercase tracking-widest">
                                                        <Clock size={12} />
                                                        {new Date(battle.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <div className={`text-sm font-black italic tracking-[0.2em] transition-colors mb-1 ${battle.result === 'VICTORY' ? 'text-green-600 dark:text-green-400' : battle.result === 'DEFEAT' ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                                        {battle.result === 'VICTORY' ? '+EXP_SYNC' : '-HP_DECAY'}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 dark:text-slate-600 font-mono font-black tracking-widest transition-colors uppercase italic shadow-sm">verified_match</div>
                                                </div>
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg transition-all">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Rank Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 dark:bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border-2 border-white/5 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-50"></div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-10 flex items-center gap-3 font-mono italic tracking-widest text-blue-400 transition-colors uppercase">
                                    <Target size={24} className="animate-pulse" />
                                    SYNC_LEVEL
                                </h3>

                                <div className="flex items-center justify-center py-12 mb-10 border-y border-white/5 relative">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                        <Activity size={180} className="text-blue-400 animate-pulse" />
                                    </div>
                                    <div className="text-center relative">
                                        <div className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-400 mb-2 uppercase italic leading-none drop-shadow-2xl">
                                            {user.rank || 'BRONZE'}
                                        </div>
                                        <div className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase leading-none">authorized_classification</div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <span className="block text-[10px] font-black text-white/40 uppercase tracking-widest">RANK_PROGRESSION</span>
                                            <span className="block text-2xl font-black font-mono text-blue-400 tabular-nums">{user.winRate}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[10px] font-black text-white/40 uppercase tracking-widest">NEXT_TIER</span>
                                            <span className="block text-sm font-bold text-white/80 uppercase">TOP_1%</span>
                                        </div>
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10 relative">
                                        <div className="h-full bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.8)] transition-all duration-1000 relative" style={{ width: user.winRate }}>
                                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[framer-motion_1s_linear_infinite]"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-[0.2em] font-mono">
                                        <span>INIT_ID_{user._id.slice(-6).toUpperCase()}</span>
                                        <span>SYS_VER_2.4.0</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
                            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <Zap size={14} className="text-yellow-500" />
                                COMBAT_OVERVIEW
                            </h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800 transition-colors">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total XP</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{user.wins * 100}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800 transition-colors">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Win Rate</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{user.winRate}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800 transition-colors">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Status</span>
                                    <span className="text-[10px] font-black text-green-500 dark:text-green-400 uppercase tracking-widest flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        ACTIVE
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
