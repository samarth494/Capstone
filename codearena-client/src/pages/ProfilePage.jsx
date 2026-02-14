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

export default function ProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/users/profile/${userId}`);
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
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-mono">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 animate-pulse text-sm font-bold uppercase tracking-widest">Accessing records...</p>
                </div>
            </div>
        );
    }

    if (!data || !data.user) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 font-mono">Warrior Not Found</h2>
                    <p className="text-slate-500 mb-8 font-sans">The requested battle profile could not be retrieved from the archives.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all font-mono"
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
                {/* Profile Hero */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 md:p-12 mb-8 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left relative z-10">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 relative overflow-hidden group">
                            <User size={48} className="md:size-64 group-hover:scale-110 transition-transform opacity-20" />
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-4xl text-slate-900 italic">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shadow-sm uppercase tracking-widest leading-none">ELITE WARRIOR</span>
                                        <span className="text-slate-400 text-xs font-medium">./Joined_{new Date(user.joinedAt).toLocaleDateString()}</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">{user.username}</h2>
                                </div>
                                <div className="flex gap-3">
                                    <div className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-mono text-sm shadow-lg shadow-slate-900/10 uppercase tracking-widest">
                                        {user.rank || 'Bronze'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {statCards.map((stat, i) => (
                                    <div key={i} className={`p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all duration-300 group`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-1.5 rounded-lg ${stat.bgColor} ${stat.color} group-hover:scale-110 transition-transform`}>
                                                <stat.icon size={16} />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                        </div>
                                        <div className="text-xl font-bold text-slate-900 font-mono tracking-tighter tabular-nums">
                                            {stat.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Battle History */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Clock size={20} className="text-blue-600" />
                                Recent Combat History
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {recentBattles.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                                    <p className="text-slate-400 font-sans italic">No combat records found for this warrior.</p>
                                </div>
                            ) : (
                                recentBattles.map((battle, i) => (
                                    <div
                                        key={i}
                                        onClick={() => navigate(`/replay/${battle.battleId}`)}
                                        className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition-all group relative overflow-hidden shadow-sm hover:shadow-md cursor-pointer"
                                    >
                                        <div className={`absolute top-0 right-0 w-24 h-full skew-x-[-20deg] translate-x-12 opacity-[0.03] group-hover:opacity-10 transition-all ${battle.result === 'VICTORY' ? 'bg-green-600' : 'bg-red-600'
                                            }`}></div>

                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${battle.result === 'VICTORY'
                                                    ? 'bg-green-50 text-green-600 ring-1 ring-green-100'
                                                    : battle.result === 'DEFEAT'
                                                        ? 'bg-red-50 text-red-600 ring-1 ring-red-100'
                                                        : 'bg-slate-50 text-slate-500 ring-1 ring-slate-100'
                                                    }`}>
                                                    {battle.result.charAt(0)}
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-sm font-bold text-slate-900">Battle_{battle.problemId}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium tracking-tight">/vs/{battle.opponent}</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {new Date(battle.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className={`text-xs font-black italic tracking-widest ${battle.result === 'VICTORY' ? 'text-green-600' : battle.result === 'DEFEAT' ? 'text-red-500' : 'text-slate-400'
                                                        }`}>
                                                        {battle.result === 'VICTORY' ? '+EXP_UP' : '-HP_LOST'}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-mono tracking-tighter">CERTIFIED_MATCH</div>
                                                </div>
                                                <ChevronRight className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={20} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Rank Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 font-mono italic">
                                    <Target size={20} className="text-blue-400" />
                                    Warrior Rank
                                </h3>

                                <div className="flex items-center justify-center py-10 mb-8 border-y border-white/10 relative">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                        <Activity size={120} className="text-blue-300 animate-pulse" />
                                    </div>
                                    <div className="text-center relative">
                                        <div className="text-5xl font-black tracking-tighter text-blue-400 mb-1 uppercase italic">{user.rank || 'Bronze'}</div>
                                        <div className="text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase leading-none">Classified_Tier</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-white/60">Rank Progress</span>
                                        <span className="text-blue-400 font-mono">{user.winRate}</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                                        <div className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: user.winRate }}></div>
                                    </div>
                                    <p className="text-[10px] text-white/40 text-center uppercase tracking-widest font-bold">certified combatant since {new Date(user.joinedAt).getFullYear()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
