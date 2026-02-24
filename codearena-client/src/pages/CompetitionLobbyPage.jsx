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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-blue-500/30">
            <Navbar theme="dark" />

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
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white font-mono tracking-tighter uppercase mb-4 leading-none">
                                BLIND_CODING<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 italic">CHAMPIONSHIP</span>
                            </h1>
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">SECURE_LOBBY_V4</span>
                                </div>
                                <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full">
                                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px] font-black uppercase tracking-widest leading-none">ID: {eventId.slice(-8).toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex items-center gap-8 min-w-[320px] shadow-2xl transition-all">
                            <div className="relative">
                                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse"></div>
                                <div className="relative bg-purple-500/10 p-5 rounded-3xl border border-purple-500/20">
                                    <Clock className="w-10 h-10 text-purple-500 animate-spin-slow" />
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-2 leading-none">TIME_TO_START</div>
                                <div className="text-5xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none">
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
                            <div className="relative bg-[#111827] p-8 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800/50 overflow-hidden group">
                                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-purple-600/5 to-blue-600/5 pointer-events-none"></div>
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="w-16 h-16 bg-slate-900/80 rounded-2xl border border-purple-500/30 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                        <Crown className="w-8 h-8 text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-2">HOST_COMMAND_CENTER</h3>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-80">Full administrative authority granted</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleStartBattle}
                                    className="relative z-10 w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-12 py-5 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-4 transition-all shadow-[0_15px_35px_-5px_rgba(139,92,246,0.4)] hover:shadow-purple-500/50 hover:-translate-y-1 active:scale-95 uppercase tracking-[0.2em]"
                                >
                                    <Play size={20} fill="currentColor" />
                                    Launch_Battle
                                </button>
                            </div>
                        )}

                        <section className="bg-white dark:bg-[#111827] rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-500">
                            <div className="p-10 border-b border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-8 bg-slate-50/50 dark:bg-slate-900/20">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20 flex items-center justify-center shadow-inner">
                                        <Users className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight leading-none mb-2">WARRIOR_REGISTRY</h2>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] leading-none">Authentication & Sync Protocol</p>
                                    </div>
                                </div>
                                <div className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 rounded-2xl border border-white/5 shadow-xl">
                                    <span className="text-[10px] font-black text-white tracking-[0.3em] uppercase">
                                        {players.length || 1}_/_5 READY
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
                                                    className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-300 relative group ${isMe
                                                        ? 'bg-blue-500/[0.03] dark:bg-blue-500/[0.05] border-blue-500/20 shadow-inner'
                                                        : 'bg-white dark:bg-slate-900/20 border-slate-100 dark:border-slate-800/50 hover:border-blue-500/30'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-5 relative z-10">
                                                        <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-black text-xl transition-all transform group-hover:rotate-12 ${isMe ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                            }`}>
                                                            {player.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-slate-900 dark:text-white text-lg tracking-tight mb-1 truncate max-w-[120px]">
                                                                {player.username.toUpperCase()}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${isMe ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                                                                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                                                                    {isMe ? 'LOCAL_HOST' : 'REMOTE_CLIENT'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isMe && <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[8px] font-black text-blue-500 uppercase tracking-widest">YOU</div>}
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
                        <section className="bg-white dark:bg-[#111827] rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden sticky top-8 transition-all duration-500">
                            <div className="p-10 border-b border-slate-100 dark:border-slate-800/50 flex items-center gap-5 bg-slate-50/50 dark:bg-slate-900/20">
                                <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 flex items-center justify-center shadow-inner">
                                    <Swords className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight leading-none mb-2">COMBAT_PROTOCOL</h2>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] leading-none">Rules of Engagement</p>
                                </div>
                            </div>

                            <div className="p-10 space-y-8">
                                {[
                                    { id: '01', title: 'ZERO_VISIBILITY', desc: 'No visual feedback. Code in the void.' },
                                    { id: '02', title: 'SINGLE_AUTH', desc: 'One attempt per level. Precision is key.' },
                                    { id: '03', title: 'MATRIX_SYNC', desc: 'No external documentation allowed.' },
                                    { id: '04', title: 'TEMPORAL_LIMIT', desc: '15:00 minutes total. Speed awards score.' }
                                ].map((rule, i) => (
                                    <div key={i} className="group flex items-start gap-6 p-2 transition-all">
                                        <div className="text-xl font-black text-slate-200 dark:text-slate-800 font-mono transition-colors group-hover:text-purple-500">
                                            {rule.id}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest leading-none mb-2 group-hover:text-blue-500 transition-colors">
                                                {rule.title}
                                            </h3>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed font-bold italic opacity-70">
                                                {rule.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                <div className="bg-red-500/5 p-6 rounded-[2rem] border border-red-500/10 relative overflow-hidden group mt-10">
                                    <div className="flex items-center gap-3 justify-center text-red-500 mb-2">
                                        <Zap size={16} />
                                        <span className="font-black text-[10px] uppercase tracking-[0.4em]">BAN_PROTOCOL_ACTIVE</span>
                                    </div>
                                    <p className="text-[9px] text-red-500/60 font-black text-center uppercase tracking-widest leading-relaxed">
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
                                            <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-full flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
                                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">
                                                    SYSTEM_INITIALIZATION_SEQUENCING
                                                </span>
                                            </div>
                                            <h3 className="text-slate-400 dark:text-slate-500 font-mono text-xs font-bold uppercase tracking-[0.3em]">
                                                Battle Begins In
                                            </h3>
                                        </div>

                                        <div className="relative">
                                            <div className="text-[14rem] font-black text-slate-900 dark:text-white tabular-nums leading-none tracking-tighter font-mono drop-shadow-2xl">
                                                {countdown}
                                            </div>
                                            {/* Minimalist circular progress */}
                                            <div className="absolute inset-0 flex items-center justify-center -z-10">
                                                <div className="w-80 h-80 rounded-full border-4 border-slate-100 dark:border-slate-800 border-dashed opacity-50 animate-spin-slow"></div>
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
                                            <div className="relative bg-blue-600 p-8 rounded-[2rem] shadow-2xl shadow-blue-500/40">
                                                <Swords className="w-full h-full text-white animate-bounce" />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h2 className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic font-mono mb-2">
                                                GO_!
                                            </h2>
                                            <p className="text-blue-600 dark:text-blue-400 font-mono font-black text-sm uppercase tracking-widest">
                                                Transmission_Active
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
