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

export default function BattleLobbyPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [isMatchmaking, setIsMatchmaking] = useState(false);
    const [matchmakingTime, setMatchmakingTime] = useState(0);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

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
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-['JetBrains_Mono'] relative transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2 cursor-pointer transition-all hover:scale-105" onClick={() => navigate('/dashboard')}>
                            <Swords className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter transition-colors">CodeArena_</h1>
                        </div>

                        <nav className="hidden md:flex space-x-8 font-mono text-sm">
                            <button onClick={() => navigate('/practice')} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">./Practice</button>
                            <button onClick={() => navigate('/lobby')} className="text-blue-600 dark:text-blue-400 font-bold transition-colors">./Battle_Lobby</button>
                            <button onClick={() => navigate('/leaderboard')} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">./Leaderboard</button>
                        </nav>

                        <div className="flex items-center space-x-4">
                            {user && (
                                <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 mr-4 transition-colors">
                                    <TerminalIcon size={16} />
                                    <span>{user.username}</span>
                                </div>
                            )}
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-sm w-full mx-4 transform transition-all scale-100">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Confirm Logout</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed transition-colors">
                            Are you sure you want to terminate your current session and exit the arena?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                            >
                                <LogOut size={18} />
                                <span>TERMINATE_SESSION</span>
                            </button>
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="w-full px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Matchmaking Overlay */}
            {isMatchmaking && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md text-white transition-opacity duration-500">
                    <div className="relative mb-12">
                        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-30 animate-pulse rounded-full"></div>
                        <div className="relative bg-slate-800 p-8 rounded-full border border-blue-500/30 shadow-2xl">
                            <Swords size={80} className="text-blue-500 animate-bounce" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-4 font-mono tracking-tighter animate-pulse">SEARCHING_FOR_OPPONENT...</h2>
                    <p className="text-slate-400 font-mono text-lg mb-12 max-w-md text-center">
                        Synthesizing match vectors.
                        Estimated wait: <span className="text-blue-400">&lt; 30s</span>
                    </p>

                    <div className="flex items-center gap-4 bg-slate-800/80 backdrop-blur-md px-10 py-5 rounded-2xl border border-slate-700/50 mb-16 shadow-2xl">
                        <Clock size={28} className="text-blue-400" />
                        <span className="font-mono text-4xl font-bold tabular-nums">{formatTime(matchmakingTime)}</span>
                    </div>

                    <button
                        onClick={cancelMatchmaking}
                        className="group flex items-center gap-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-10 py-4 rounded-xl font-bold tracking-widest transition-all transform hover:scale-105 border border-red-500/50"
                    >
                        <span>CANCEL_SEARCH</span>
                        <Plus size={20} className="rotate-45" />
                    </button>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left Column: Actions */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group transition-all duration-300">
                            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                                <Zap size={200} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 font-mono tracking-tight transition-colors">
                                    QUICK_MATCH
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md text-lg leading-relaxed transition-colors">
                                    Find a worthy opponent instantly through our automated matchmaking. Ranked matches affect your global standing.
                                </p>
                                <button
                                    onClick={startMatchmaking}
                                    className="bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-4 shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all transform hover:-translate-y-1 active:scale-95"
                                >
                                    <Swords size={28} />
                                    <span>FIND_MATCH_NOW</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 transition-colors duration-300">
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1">
                                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-all">
                                    <Plus size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">Create Lobby</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">Host a private match for friends or specialized tournaments.</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1">
                                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6 text-green-600 dark:text-green-400 group-hover:scale-110 transition-all">
                                    <Users size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">Join with Code</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">Enter a unique room code to join an existing private lobby.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Active Battles */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden h-full flex flex-col transition-colors duration-300">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 font-mono transition-colors">
                                    <ActivityIcon size={24} className="text-green-500 dark:text-green-400" />
                                    LIVE_BATTLES
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto max-h-[600px] p-4">
                                {activeBattles.map(battle => (
                                    <div key={battle.id} className="p-5 mb-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group cursor-pointer shadow-sm hover:shadow-md">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-black tracking-widest px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full uppercase transition-colors">
                                                {battle.rank}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-bold transition-colors">
                                                <Users size={14} />
                                                <span>{battle.viewers} VIEWERS</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between font-mono text-sm mb-5">
                                            <span className="text-blue-600 dark:text-blue-400 font-black transition-colors">{battle.p1}</span>
                                            <span className="text-slate-300 dark:text-slate-700 font-bold px-2 italic transition-colors">vs</span>
                                            <span className={battle.p2 === 'waiting...' ? 'text-slate-400 dark:text-slate-600 italic' : 'text-red-500 dark:text-red-400 font-black transition-colors'}>
                                                {battle.p2}
                                            </span>
                                        </div>
                                        {battle.status === 'Waiting' ? (
                                            <button className="w-full py-3 bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 text-xs font-black rounded-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all transform active:scale-95">
                                                JOIN_LOBBY
                                            </button>
                                        ) : (
                                            <button className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                                <Users size={14} />
                                                SPECTATE_STREAM
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <div className="text-center p-6 text-[10px] text-slate-400 dark:text-slate-600 font-mono tracking-widest transition-colors">
                                    -- END OF BUFFER --
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
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}
