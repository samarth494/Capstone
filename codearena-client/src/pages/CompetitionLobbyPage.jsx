import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Trophy,
    Clock,
    ArrowLeft,
    ShieldCheck,
    Swords,
    Crown,
    Play,
    Zap,
    CheckCircle2
} from 'lucide-react';
import { getSocket, initiateSocketConnection } from '../services/socket';
import Navbar from '../components/Navbar';

export default function CompetitionLobbyPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [players, setPlayers] = useState([]);
    const [hostId, setHostId] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('cpp');
    const [timeLeft, setTimeLeft] = useState(300);
    const [isStarting, setIsStarting] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [serverTimeOffset, setServerTimeOffset] = useState(0);
    const [battleStartsAt, setBattleStartsAt] = useState(null);



    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        let socket = getSocket();
        if (!socket || !socket.connected) {
            initiateSocketConnection(token);
            socket = getSocket();
        }

        if (socket) {
            // Join competition directly
            socket.emit('competition:join', { eventId, user, language: 'c' });

            // Listen for player updates
            socket.on('competition:updatePlayers', (updatedPlayers) => {
                setPlayers(updatedPlayers);
            });

            // Listen for timer updates
            socket.on('competition:timerUpdate', (time) => {
                setTimeLeft(time);
            });

            // Listen for host info
            socket.on('competition:hostInfo', ({ hostId: hId }) => {
                setHostId(hId);
            });

            // Listen for start event (from server)
            socket.on('competition:roundStarted', (data) => {
                const { battleStartsAt: startsAt, serverTime, countdownSeconds } = data;
                setServerTimeOffset(serverTime - Date.now());
                setBattleStartsAt(startsAt);
                setIsStarting(true);
                setCountdown(countdownSeconds || 10);
            });

            // Listen for errors
            socket.on('competition:error', ({ message }) => {
                alert(message);
            });
        }

        return () => {
            if (socket) {
                socket.off('competition:updatePlayers');
                socket.off('competition:hostInfo');
                socket.off('competition:roundStarted');
                socket.off('competition:error');
            }
        };
    }, [eventId, navigate, user]);


    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const isHost = hostId === (getSocket()?.id);


    // Initial simple beep sound generator for "Get Ready" beeps
    const playBeep = (freq = 440, duration = 100) => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = freq;
        gainNode.gain.value = 0.1;

        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
        }, duration);
    };

    // Unified Countdown Logic
    useEffect(() => {
        if (!isStarting || !battleStartsAt) return;

        playBeep(800, 200); // Initial start beep

        const interval = setInterval(() => {
            const now = Date.now() + serverTimeOffset;
            const diff = Math.ceil((battleStartsAt - now) / 1000);
            
            if (diff >= 0) {
                setCountdown(diff);
                if (diff > 0) {
                    playBeep(440, 150); // Tick beep
                } else if (diff === 0) {
                    playBeep(880, 1000); // Level start beep
                }
            } else if (diff < 0) {
                // Showing "Level 1 Start" for a few seconds
                setCountdown(0);
                if (diff < -3) {
                    clearInterval(interval);
                    navigate('/problem/blind-coding', {
                        state: {
                            blindMode: true,
                            language: 'c',
                            eventId: eventId,
                            level: 1,
                            totalLevels: 3
                        }
                    });
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isStarting, battleStartsAt, serverTimeOffset, eventId, navigate]);

    const handleStartBattle = () => {
        const socket = getSocket();
        if (socket) {
            socket.emit('competition:startRound', { eventId });
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-['JetBrains_Mono'] text-slate-900 dark:text-white selection:bg-blue-500/30 transition-colors duration-300">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2 -z-10"></div>

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-10">
                    <div className="space-y-6">
                        <button
                            onClick={() => navigate('/dashboard/events')}
                            className="flex items-center gap-3 text-slate-500 hover:text-blue-500 font-black transition-all uppercase tracking-[0.2em] text-[10px] group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Return_To_Events</span>
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                                Blind Coding <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Championship</span>
                            </h1>
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-full">
                                    <div className="w-1.5 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Active Session</span>
                                </div>
                                <div className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full">
                                    <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">ID: {eventId.slice(-8).toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex items-center gap-8 min-w-[320px] shadow-xl transition-all">
                            <div className="relative">
                                <div className="relative bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20">
                                    <Clock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 leading-none">Time to Start</div>
                                <div className="text-5xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight leading-none">
                                    {formatTime(timeLeft)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left: Player List */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Admin Controls - Only for Host (Updated) */}
                        {isHost && (
                            <div className="relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-2xl border border-blue-100 dark:border-slate-700 flex items-center justify-center shadow-lg transition-transform">
                                        <Crown className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-2">Host Controls</h3>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest opacity-80">You are the lobby leader</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleStartBattle}
                                    className="relative z-10 w-full md:w-auto bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                                >
                                    <Play size={18} fill="currentColor" />
                                    Launch Battle
                                </button>
                            </div>
                        )}

                        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-800/20">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-slate-700 flex items-center justify-center">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-xl text-slate-900 dark:text-white tracking-tight leading-none mb-2">Warrior Registry</h2>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Active Challengers</p>
                                    </div>
                                </div>
                                <div className="px-4 py-1.5 bg-slate-900 dark:bg-slate-800 rounded-xl">
                                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                                        {players.length || 1}/5 Ready
                                    </span>
                                </div>
                            </div>

                            <div className="p-10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <AnimatePresence>
                                        {(players.length > 0 ? players : [{ username: user?.username || 'YOU', isMe: true, socketId: getSocket()?.id }]).map((player, idx) => {
                                            const isMe = player.socketId === getSocket()?.id;

                                            return (
                                                <motion.div
                                                    key={player.socketId || idx}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className={`flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 relative group ${isMe
                                                        ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm'
                                                        : 'bg-white dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/50 hover:border-blue-200 dark:hover:border-blue-800'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-5 relative z-10">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${isMe ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                            }`}>
                                                            {player.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 dark:text-white text-base tracking-tight mb-1 truncate max-w-[120px]">
                                                                {player.username}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${isMe ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                                                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                                    {isMe ? 'Local Host' : 'Remote Client'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isMe && <div className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">YOU</div>}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>

                                <div className="mt-12 p-12 border-2 border-dashed border-slate-200 dark:border-slate-800/50 rounded-[3rem] bg-slate-50/50 dark:bg-slate-900/10 flex flex-col items-center text-center group hover:bg-slate-100 dark:hover:bg-slate-900/20 transition-all">
                                    <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl relative group-hover:scale-110 transition-transform">
                                        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-10 animate-pulse"></div>
                                        <Users className="w-9 h-9 text-slate-300 dark:text-slate-700" />
                                    </div>
                                    <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-3 tracking-tight">AWAITING_CHALLENGER_SYNC</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-500 max-w-sm leading-relaxed font-bold italic opacity-80 mb-8">
                                        "Broadcast active. Seeking compatible logic patterns in the matrix."
                                    </p>

                                    <div className="w-full max-w-md space-y-4">
                                        <div className="flex justify-between text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] px-2 leading-none">
                                            <span>CONNECTION_STABILITY</span>
                                            <span className="text-blue-500">PROBING...</span>
                                        </div>
                                        <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                                                animate={{ width: `${(players.length / 5) * 100}%` }}
                                                transition={{ duration: 1.5, ease: "anticipate" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right: Competition Rules */}
                    <div className="lg:col-span-4 space-y-10">
                        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden sticky top-8 transition-all duration-300">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800/50 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20">
                                <div className="w-12 h-12 bg-red-50 dark:bg-slate-800 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-slate-700 flex items-center justify-center">
                                    <Swords className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-xl text-slate-900 dark:text-white tracking-tight leading-none mb-2">Combat Protocol</h2>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Rules of Engagement</p>
                                </div>
                            </div>
 
                            <div className="p-8 space-y-6">
                                {[
                                    { id: '01', title: 'Zero Visibility', desc: 'No visual feedback. Code in the void.' },
                                    { id: '02', title: 'Manual Only', desc: 'One attempt per level. Precision is key.' },
                                    { id: '03', title: 'Offline Mode', desc: 'No external documentation allowed.' },
                                    { id: '04', title: 'Time Limit', desc: '15:00 minutes total. Speed awards score.' }
                                ].map((rule, i) => (
                                    <div key={i} className="group flex items-start gap-4">
                                        <div className="text-xl font-bold text-slate-200 dark:text-slate-800 font-mono transition-colors group-hover:text-blue-500">
                                            {rule.id}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-widest leading-none mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {rule.title}
                                            </h3>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                                {rule.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
 
                                <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/20 relative overflow-hidden group mt-6">
                                    <div className="flex items-center gap-2 justify-center text-red-600 dark:text-red-400 mb-1">
                                        <Zap size={14} />
                                        <span className="font-bold text-[10px] uppercase tracking-widest">Protocol Active</span>
                                    </div>
                                    <p className="text-[9px] text-red-500/70 dark:text-red-400/60 font-bold text-center uppercase tracking-widest leading-relaxed">
                                        Manual integrity checks in progress. Disqualification is final.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Starting Overlay - Themed for CodeArena */}
            <AnimatePresence>
                {isStarting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/90 dark:bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 text-center transition-colors duration-500"
                    >
                        {/* Themed Background Decor */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full animate-pulse"></div>
                            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full animate-pulse"></div>
                        </div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="relative z-10 w-full max-w-lg"
                        >
                            <AnimatePresence mode="wait">
                                {countdown > 0 ? (
                                    <motion.div
                                        key="countdown"
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -20, opacity: 0 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-500/20 rounded-full flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></div>
                                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                                    Match Initialization
                                                </span>
                                            </div>
                                            <h3 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">
                                                Battle Begins In
                                            </h3>
                                        </div>

                                        <div className="relative">
                                            <div className="text-[14rem] font-bold text-slate-900 dark:text-white tabular-nums leading-none tracking-tight drop-shadow-2xl">
                                                {countdown}
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center -z-10">
                                                <div className="w-80 h-80 rounded-full border-2 border-slate-100 dark:border-slate-800 border-dashed opacity-50 animate-spin-slow"></div>
                                            </div>
                                        </div>

                                        <div className="max-w-[200px] mx-auto">
                                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                                                <motion.div 
                                                    className="h-full bg-blue-600 rounded-full"
                                                    animate={{ width: `${(countdown / 10) * 100}%` }}
                                                    transition={{ duration: 1, ease: "linear" }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="go"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="space-y-8"
                                    >
                                        <div className="relative w-40 h-40 mx-auto">
                                            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20"></div>
                                            <div className="relative bg-blue-600 p-8 rounded-3xl shadow-xl shadow-blue-500/20 transition-all">
                                                <Swords className="w-full h-full text-white animate-bounce" />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h2 className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic mb-2">
                                                Go!
                                            </h2>
                                            <p className="text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-widest">
                                                Match Starting
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
