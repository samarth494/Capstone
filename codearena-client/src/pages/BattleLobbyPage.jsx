import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Swords,
    LogOut,
    Plus,
    Users,
    Zap,
    Clock,
    Terminal as TerminalIcon,
    Loader
} from 'lucide-react';

import { initiateSocketConnection, joinQueue, subscribeToMatchFound, disconnectSocket, getSocket } from '../services/socket';

import { getUser, getAuthToken, logout } from '../utils/auth';

export default function BattleLobbyPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        return getUser();
    });
    const [isMatchmaking, setIsMatchmaking] = useState(false);
    const [matchmakingTime, setMatchmakingTime] = useState(0);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const token = getAuthToken();
        const storedUser = getUser();

        if (!token || !storedUser) {
            navigate('/login');
            return;
        }

        if (token && !getSocket()) {
            console.log("Initializing socket in lobby...");
            initiateSocketConnection(token);
        }

        // Listen for matches
        subscribeToMatchFound((data) => {
            console.log("Match found event received:", data);
            setIsMatchmaking(false);
            navigate(`/battle/${data.roomId}`, { state: { opponent: data.opponent } });
        });

        return () => {
            // Do NOT disconnect socket here. 
            // We want to keep it alive for the transition to BattleArena.
            console.log("Lobby unmounting, keeping socket alive...");
        };
    }, []);

    useEffect(() => {
        let interval;
        if (isMatchmaking) {
            interval = setInterval(() => {
                setMatchmakingTime(prev => prev + 1);
            }, 1000);
        } else {
            setMatchmakingTime(0);
        }
        return () => clearInterval(interval);
    }, [isMatchmaking]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const startMatchmaking = () => {
        // Always try to get fresh data from localStorage to avoid state staleness
        const storedData = localStorage.getItem('user');
        let currentUser = user;

        if (storedData) {
            currentUser = JSON.parse(storedData);
        }

        if (!currentUser) {
            console.error("No user data found in state or localStorage");
            alert("Session error. Please logout and login again.");
            return;
        }

        // Fallback for missing username
        if (!currentUser.username) {
            if (currentUser.email) {
                currentUser.username = currentUser.email.split('@')[0];
            } else {
                currentUser.username = `User_${Math.floor(Math.random() * 10000)}`;
            }
            // Update both state and storage
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
        }

        console.log("Lobby: Starting matchmaking for:", currentUser.username);
        setIsMatchmaking(true);
        joinQueue(currentUser);
    };

    const cancelMatchmaking = () => {
        setIsMatchmaking(false);
        // Implement leave queue logic in socket service if needed
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Mock active battles
    const activeBattles = [
        { id: 101, p1: 'dev_slayer', p2: 'algo_queen', rank: 'Gold', viewers: 12, status: 'In Progress' },
        { id: 102, p1: 'python_guru', p2: 'java_master', rank: 'Silver', viewers: 5, status: 'In Progress' },
        { id: 103, p1: 'bug_hunter', p2: 'waiting...', rank: 'Bronze', viewers: 0, status: 'Waiting' },
        { id: 104, p1: 'fullstack_hero', p2: 'waiting...', rank: 'Platinum', viewers: 2, status: 'Waiting' },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-['JetBrains_Mono'] relative">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                            <Swords className="w-8 h-8 text-blue-600" />
                            <h1 className="text-xl font-bold text-slate-900 font-mono tracking-tighter">CodeArena_</h1>
                        </div>

                        <nav className="hidden md:flex space-x-8 font-mono text-sm">

                            <button onClick={() => navigate('/lobby')} className="text-blue-600 font-bold transition-colors">./Battle_Lobby</button>
                            <button onClick={() => navigate('/leaderboard')} className="text-slate-500 hover:text-blue-600 transition-colors">./Leaderboard</button>
                        </nav>

                        <div className="flex items-center space-x-4">
                            {user && (
                                <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600 mr-4">
                                    <TerminalIcon size={16} />
                                    <span>{user.username}</span>
                                </div>
                            )}
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="flex items-center space-x-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full mx-4 transform transition-all scale-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Logout</h3>
                        <p className="text-slate-500 mb-6">
                            Are you sure you want to terminate your session?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Matchmaking Overlay */}
            {isMatchmaking && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm text-white transition-opacity">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                        <Swords size={64} className="text-blue-500 animate-bounce relative z-10" />
                    </div>
                    <h2 className="text-3xl font-bold mt-8 mb-2 font-mono tracking-tight animate-pulse">SEARCHING_FOR_OPPONENT...</h2>
                    <p className="text-slate-400 font-mono text-lg mb-8">
                        Estimated Wait: &lt; 30s
                    </p>

                    <div className="flex items-center gap-2 bg-slate-800 px-6 py-3 rounded-full border border-slate-700 mb-12">
                        <Clock size={20} className="text-blue-400" />
                        <span className="font-mono text-xl">{formatTime(matchmakingTime)}</span>
                    </div>

                    <button
                        onClick={cancelMatchmaking}
                        className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-bold tracking-wide transition-all transform hover:scale-105 border border-red-400"
                    >
                        CANCEL_SEARCH
                    </button>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left Column: Actions */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                                <Zap size={120} className="text-blue-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4 font-mono">
                                QUICK_MATCH
                            </h2>
                            <p className="text-slate-500 mb-8 max-w-md text-lg">
                                Find a worthy opponent instantly. Ranked matches affect your global standing.
                            </p>
                            <button
                                onClick={startMatchmaking}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1"
                            >
                                <Swords size={24} />
                                <span>FIND_MATCH</span>
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600 group-hover:scale-110 transition-transform">
                                    <Plus size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Create Lobby</h3>
                                <p className="text-slate-500 text-sm">Host a private match for friends or tournaments.</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-green-600 group-hover:scale-110 transition-transform">
                                    <Users size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Join with Code</h3>
                                <p className="text-slate-500 text-sm">Enter a room code to join an existing lobby.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Active Battles */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                            <div className="p-6 border-b border-slate-100 bg-slate-50">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-mono">
                                    <ActivityIcon size={20} className="text-green-500" />
                                    LIVE_BATTLES
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto max-h-[600px] p-2">
                                {activeBattles.map(battle => (
                                    <div key={battle.id} className="p-4 mb-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group cursor-pointer">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase">
                                                {battle.rank}
                                            </span>
                                            <div className="flex items-center gap-1 text-slate-400 text-xs">
                                                <Users size={12} />
                                                <span>{battle.viewers}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between font-mono text-sm mb-3">
                                            <span className="text-blue-600 font-medium">{battle.p1}</span>
                                            <span className="text-slate-300">vs</span>
                                            <span className={battle.p2 === 'waiting...' ? 'text-slate-400 italic' : 'text-red-500 font-medium'}>
                                                {battle.p2}
                                            </span>
                                        </div>
                                        {battle.status === 'Waiting' ? (
                                            <button className="w-full py-2 bg-white border border-blue-600 text-blue-600 text-xs font-bold rounded hover:bg-blue-50 transition-colors">
                                                JOIN LOBBY
                                            </button>
                                        ) : (
                                            <button className="w-full py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                                                <Users size={12} />
                                                SPECTATE
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <div className="text-center p-4 text-xs text-slate-400 font-mono">
                                    -- END OF LIST --
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

// Icon helper since Activity isn't imported for the usage above
function ActivityIcon({ size, className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}
