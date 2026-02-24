import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
    Trophy,
    Medal,
    ArrowLeft,
    Swords,
    Zap,
    Clock,
    Target,
    Crown,
    Star,
    ArrowRight
} from 'lucide-react';

export default function RoomLeaderboardPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { eventId } = useParams();

    const [user] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Get room data from navigation state
    const roomPlayers = location.state?.players || [];
    const currentUserScore = location.state?.myScore || 0;
    const currentUserBreakdown = location.state?.myBreakdown || { participationBonus: 0, correctCode: 0, speedBonus: 0, effortBonus: 0, relativeBonus: 0 };
    const roundNumber = location.state?.round || 1;
    const quitReason = location.state?.reason || 'completed'; // 'completed' | 'quit' | 'timeout'

    // Build leaderboard from room players with scores
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        // Sort players by score (highest first), then by time (lowest first)
        const sorted = [...roomPlayers].sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return (a.timeTaken || 0) - (b.timeTaken || 0); // Faster time wins tiebreak
        });
        setLeaderboard(sorted);
    }, [roomPlayers]);

    const getRankIcon = (index) => {
        if (index === 0) return <Crown className="text-yellow-500 w-5 h-5" />;
        if (index === 1) return <Medal className="text-slate-400 w-5 h-5" />;
        if (index === 2) return <Medal className="text-amber-600 w-5 h-5" />;
        return <span className="text-slate-400 font-mono text-sm leading-none ml-1">#{index + 1}</span>;
    };

    const getScoreColor = (score) => {
        if (score >= 1500) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
        if (score >= 1000) return 'text-green-600 bg-green-50 border-green-100';
        if (score > 0) return 'text-blue-600 bg-blue-50 border-blue-100';
        return 'text-slate-500 bg-slate-50 border-slate-100';
    };

    const getStatusBadge = (reason) => {
        switch (reason) {
            case 'completed':
                return <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-[10px] font-black tracking-widest uppercase">Completed</span>;
            case 'timeout':
                return <span className="px-3 py-1 bg-yellow-50 text-yellow-600 border border-yellow-100 rounded-full text-[10px] font-black tracking-widest uppercase">Time Up</span>;
            case 'quit':
                return <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-[10px] font-black tracking-widest uppercase">Quit</span>;
            default:
                return null;
        }
    };

    // Find current user's rank
    const myRank = leaderboard.findIndex(p =>
        p.username === user?.username || p.id === user?._id
    ) + 1;

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
                                onClick={() => navigate('/dashboard/events')}
                                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-slate-200"
                            >
                                <ArrowLeft size={18} />
                                <span>Back to Events</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Title Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <Trophy size={24} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
                                Room Leaderboard
                            </h2>
                        </div>
                        <p className="text-slate-500 max-w-2xl font-sans">
                            Round {roundNumber} results — Blind Coding Championship. See how you rank among the arena's warriors.
                        </p>
                    </div>

                    <div className="flex gap-4 flex-wrap">
                        {/* Your Status */}
                        <div className="px-6 py-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">YOUR STATUS</div>
                            {getStatusBadge(quitReason)}
                        </div>

                        {/* Your Rank */}
                        <div className="px-6 py-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">YOUR RANK</div>
                            <div className="text-2xl font-bold text-slate-900">
                                {myRank > 0 ? `#${myRank}` : '-'} <span className="text-sm text-slate-400">/ {leaderboard.length}</span>
                            </div>
                        </div>

                        {/* Your Score */}
                        <div className="px-6 py-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">YOUR TOTAL</div>
                            <div className="text-2xl font-bold text-purple-600 flex items-center gap-1">
                                <Zap size={18} />
                                {currentUserScore} <span className="text-sm text-slate-400 font-normal">/ 2200</span>
                            </div>
                        </div>

                        {/* Total Players */}
                        <div className="px-6 py-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">COMBATANTS</div>
                            <div className="text-2xl font-bold text-slate-900">{leaderboard.length}</div>
                        </div>
                    </div>
                </div>

                {/* Podium for Top 3 */}
                {leaderboard.length >= 3 && (
                    <div className="flex justify-center items-end gap-4 mb-12">
                        {/* 2nd Place */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600 ring-4 ring-slate-200 mb-2">
                                {leaderboard[1]?.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-slate-700 mb-1 truncate max-w-[100px]">{leaderboard[1]?.username}</span>
                            <span className="text-xs text-slate-400 mb-2">{leaderboard[1]?.score || 0} pts</span>
                            <div className="w-24 h-20 bg-slate-200 rounded-t-xl flex items-center justify-center">
                                <Medal className="text-slate-500 w-8 h-8" />
                            </div>
                        </div>

                        {/* 1st Place */}
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center text-2xl font-bold text-yellow-600 ring-4 ring-yellow-300 mb-2 shadow-lg shadow-yellow-100">
                                {leaderboard[0]?.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-slate-900 mb-1 truncate max-w-[100px]">{leaderboard[0]?.username}</span>
                            <span className="text-xs text-yellow-600 font-bold mb-2">{leaderboard[0]?.score || 0} pts</span>
                            <div className="w-28 h-28 bg-yellow-100 rounded-t-xl flex items-center justify-center border-2 border-yellow-200">
                                <Crown className="text-yellow-500 w-10 h-10" />
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-xl font-bold text-amber-600 ring-4 ring-amber-200 mb-2">
                                {leaderboard[2]?.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-slate-700 mb-1 truncate max-w-[100px]">{leaderboard[2]?.username}</span>
                            <span className="text-xs text-slate-400 mb-2">{leaderboard[2]?.score || 0} pts</span>
                            <div className="w-24 h-14 bg-amber-100 rounded-t-xl flex items-center justify-center">
                                <Medal className="text-amber-600 w-8 h-8" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Full Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16">RANK</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">WARRIOR</th>
                                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">STATUS</th>
                                    <th className="px-4 py-4 text-[10px] font-bold text-cyan-500 uppercase tracking-widest text-center">PARTCPN<br />+50</th>
                                    <th className="px-4 py-4 text-[10px] font-bold text-green-500 uppercase tracking-widest text-center">CORRECT<br />+1000</th>
                                    <th className="px-4 py-4 text-[10px] font-bold text-blue-500 uppercase tracking-widest text-center">SPEED<br />+500</th>
                                    <th className="px-4 py-4 text-[10px] font-bold text-amber-500 uppercase tracking-widest text-center">EFFORT<br />+150</th>
                                    <th className="px-4 py-4 text-[10px] font-bold text-purple-500 uppercase tracking-widest text-center">RANKING<br />+500</th>
                                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">TOTAL</th>
                                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">TIME</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leaderboard.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="px-8 py-20 text-center text-slate-400 font-sans italic">
                                            No battle data available yet.
                                        </td>
                                    </tr>
                                ) : (
                                    leaderboard.map((player, index) => {
                                        const isMe = player.username === user?.username || player.id === user?._id;
                                        const bd = player.breakdown || { participationBonus: 0, correctCode: 0, speedBonus: 0, effortBonus: 0, relativeBonus: 0 };
                                        return (
                                            <tr
                                                key={player.id || index}
                                                className={`transition-colors group ${isMe
                                                    ? 'bg-blue-50/50 hover:bg-blue-50'
                                                    : 'hover:bg-slate-50/50'
                                                    }`}
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center">
                                                        {getRankIcon(index)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ring-1 ${isMe
                                                            ? 'bg-blue-500 text-white ring-blue-400'
                                                            : 'bg-slate-100 text-slate-600 ring-slate-200'
                                                            }`}>
                                                            {player.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-bold ${isMe ? 'text-blue-600' : 'text-slate-900'}`}>
                                                                {player.username}
                                                            </span>
                                                            {isMe && (
                                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[9px] font-black uppercase tracking-wider">
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest border ${player.status === 'completed'
                                                        ? 'bg-green-50 text-green-600 border-green-100'
                                                        : player.status === 'quit'
                                                            ? 'bg-red-50 text-red-600 border-red-100'
                                                            : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                                        }`}>
                                                        {(player.status || 'PENDING').toUpperCase()}
                                                    </span>
                                                </td>
                                                {/* Participation */}
                                                <td className="px-4 py-5 text-center">
                                                    <span className={`font-bold text-sm ${bd.participationBonus > 0 ? 'text-cyan-600' : 'text-slate-300'}`}>
                                                        +{bd.participationBonus || 0}
                                                    </span>
                                                </td>
                                                {/* Correct Code */}
                                                <td className="px-4 py-5 text-center">
                                                    <span className={`font-bold text-sm ${bd.correctCode > 0 ? 'text-green-600' : 'text-slate-300'}`}>
                                                        +{bd.correctCode || 0}
                                                    </span>
                                                </td>
                                                {/* Speed Bonus */}
                                                <td className="px-4 py-5 text-center">
                                                    <span className={`font-bold text-sm ${bd.speedBonus > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                                                        +{bd.speedBonus || 0}
                                                    </span>
                                                </td>
                                                {/* Effort Bonus */}
                                                <td className="px-4 py-5 text-center">
                                                    <span className={`font-bold text-sm ${bd.effortBonus > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
                                                        +{bd.effortBonus || 0}
                                                    </span>
                                                </td>
                                                {/* Ranking Bonus */}
                                                <td className="px-4 py-5 text-center">
                                                    <span className={`font-bold text-sm ${bd.relativeBonus > 0 ? 'text-purple-600' : 'text-slate-300'}`}>
                                                        +{bd.relativeBonus || 0}
                                                    </span>
                                                </td>
                                                {/* Total Score */}
                                                <td className="px-4 py-5 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(player.score)}`}>
                                                        <Zap size={12} /> {player.score || 0}
                                                    </span>
                                                </td>
                                                {/* Time Taken */}
                                                <td className="px-4 py-5 text-center font-mono text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
                                                    {player.timeTaken
                                                        ? `${Math.floor(player.timeTaken / 60)}:${(player.timeTaken % 60).toString().padStart(2, '0')}`
                                                        : '--:--'
                                                    }
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-slate-400 text-xs space-y-1">
                        <p className="flex items-center gap-2">
                            <Star size={14} className="text-yellow-500" />
                            <strong>Scoring:</strong> Participation (50) + Correctness (0-1000) + Speed (0-500) + Effort (0-150) + Ranking (0-500) = Max 2200 pts
                        </p>
                        <p className="ml-6 text-[10px]">Speed scales with performance tier &nbsp;|&nbsp; Ranking bonus based on tests passed → errors → time</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(`/competition/${eventId}/lobby`)}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm shadow-sm"
                        >
                            <ArrowLeft size={16} />
                            Back to Lobby
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-bold text-sm shadow-lg shadow-purple-500/20"
                        >
                            Dashboard
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
