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
                const { battleStartsAt, serverTime } = data;
                setServerTimeOffset(serverTime - Date.now());
                setIsStarting(true);

                const targetTime = battleStartsAt;
                const updateCountdown = () => {
                    const now = Date.now() + (serverTime - Date.now()); // approximate server now
                    const diff = Math.ceil((targetTime - Date.now()) / 1000);

                    if (diff <= 0) {
                        setCountdown(0);
                        setTimeout(() => {
                            navigate('/problem/blind-coding', {
                                state: {
                                    blindMode: true,
                                    language: 'c'
                                }
                            });
                        }, 1000);
                        return;
                    }
                    setCountdown(diff);
                    setTimeout(updateCountdown, 1000);
                };
                updateCountdown();
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

    const handleStartBattle = () => {
        const socket = getSocket();
        if (socket && isHost) {
            socket.emit('competition:startRound', { eventId });
        }
    };


    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-['JetBrains_Mono'] transition-colors duration-300 overflow-x-hidden">
            <Navbar items={[]} user={user} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 -z-10"></div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/dashboard/events')}
                            className="flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-all uppercase tracking-widest text-[10px] group mb-2"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Return to Events</span>
                        </button>
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white font-mono tracking-tighter uppercase transition-all mb-2 flex items-center gap-4">
                                BLIND_CODING <span className="text-purple-600 dark:text-purple-500 italic">LOBBY</span>
                            </h1>
                            <div className="flex items-center gap-4 transition-colors">
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-full">
                                    <ShieldCheck size={14} className="text-green-600 dark:text-green-400" />
                                    <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest">SECURE_INSTANCE</span>
                                </div>
                                <span className="text-slate-400 dark:text-slate-600 font-mono text-xs font-bold uppercase tracking-widest">ID: {eventId.slice(-8).toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl flex items-center gap-8 min-w-[280px] transition-all hover:scale-105 hover:border-purple-300 dark:hover:border-purple-900/50">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse"></div>
                            <div className="relative bg-purple-50 dark:bg-purple-900/40 p-4 rounded-2xl border border-purple-100 dark:border-purple-800 transition-colors">
                                <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin-slow" />
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1 transition-colors">TRANSMISSION_START</div>
                            <div className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter transition-colors">
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left: Player List */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Admin Controls - Only for Host */}
                        {isHost && (
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 p-8 rounded-[2rem] border-2 border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group mb-8">
                                <div className="absolute top-0 right-0 w-64 h-full bg-white/5 skew-x-[-30deg] translate-x-32 group-hover:translate-x-24 transition-all duration-1000"></div>
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-inner">
                                        <Crown className="w-8 h-8 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white transition-colors mb-1 tracking-tight">HOST_CONTROLS</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest transition-colors">You are the lobby host</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleStartBattle}
                                    className="relative z-10 w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:shadow-[0_0_40px_rgba(147,51,234,0.5)] transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest"
                                >
                                    <Play size={20} fill="currentColor" />
                                    INITIALIZE_BATTLE
                                </button>
                            </div>
                        )}


                        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-500">
                            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/50 transition-colors">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="font-black text-xl text-slate-900 dark:text-white transition-colors tracking-tight">WARRIOR_REGISTRY</h2>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Active Combatants In Lobby</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-lg border border-white/5">
                                        {players.length || 1} / 2 JOINED
                                    </span>
                                </div>

                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <AnimatePresence>
                                        {(players.length > 0 ? players : [{ username: user?.username || 'YOU', isMe: true, socketId: getSocket()?.id }]).map((player, idx) => {
                                            const isMe = player.socketId === getSocket()?.id;

                                            return (
                                                <motion.div
                                                    key={player.socketId || idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.03 }}
                                                    className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all duration-300 relative overflow-hidden group ${isMe
                                                        ? 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-800/50 shadow-inner'
                                                        : 'bg-white dark:bg-slate-800/10 border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-xl'
                                                        }`}
                                                >
                                                    {isMe && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}

                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all transform group-hover:rotate-6 ${isMe ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm'
                                                            }`}>
                                                            {player.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-black text-slate-900 dark:text-white truncate max-w-[150px] transition-colors tracking-tight text-lg">
                                                                    {player.username.toUpperCase()}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${isMe ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest transition-colors font-mono">
                                                                    {isMe ? 'PLAYER_READY' : 'CONNECTION_OK'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {!isMe && (
                                                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 transition-colors">
                                                            <Zap size={14} className="text-yellow-500" />
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>

                                <div className="mt-12 p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center text-center transition-all bg-slate-50/20 dark:bg-slate-900/10 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-xl relative">
                                        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-10 animate-pulse"></div>
                                        <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 transition-colors" />
                                    </div>
                                    <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-3 transition-colors tracking-tight">AWAITING_CHALLENGER</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed transition-colors font-bold italic">
                                        "The battle will begin once another warrior joins the lobby."
                                    </p>


                                    <div className="mt-10 w-full max-w-lg bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                                        <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-[0.3em] transition-colors">
                                            <span>LOBBY_STABILITY</span>
                                            <span className="text-blue-500">{players.length || 1}_/_2_READY</span>
                                        </div>
                                        <div className="h-4 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden transition-colors p-1 border border-slate-100 dark:border-slate-700">
                                            <div
                                                className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.5)] relative"
                                                style={{ width: `${((players.length || 1) / 2) * 100}%` }}
                                            >
                                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:15px_15px] animate-[framer-motion_1s_linear_infinite]"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right: Competition Rules */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden sticky top-32 transition-all duration-500">
                            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20 transition-colors">
                                <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/50 transition-colors">
                                    <Swords className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="font-black text-xl text-slate-900 dark:text-white transition-colors tracking-tight">ENGAGEMENT_RULES</h2>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Protocol Version 4.0</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Rule 1 */}
                                <div className="group flex items-start gap-5 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-800/10 hover:bg-white dark:hover:bg-slate-800/30 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-lg">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm min-w-[44px] flex items-center justify-center font-black text-slate-800 dark:text-white transition-all group-hover:scale-110 group-hover:rotate-3 border border-slate-50 dark:border-slate-700">
                                        01
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white transition-colors text-sm uppercase tracking-wider">ZERO_VISIBILITY</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed transition-colors font-bold italic">
                                            "The code editor will be blacked out. You will not see what you type. Rely on your muscle memory."
                                        </p>
                                    </div>
                                </div>

                                {/* Rule 2 */}
                                <div className="group flex items-start gap-5 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-800/10 hover:bg-white dark:hover:bg-slate-800/30 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-lg">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm min-w-[44px] flex items-center justify-center font-black text-slate-800 dark:text-white transition-all group-hover:scale-110 group-hover:-rotate-3 border border-slate-50 dark:border-slate-700">
                                        02
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white transition-colors text-sm uppercase tracking-wider">SINGLE_EXEC_AUTH</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed transition-colors font-bold italic">
                                            "You only get one chance to compile and run your code. Correctness is paramount."
                                        </p>
                                    </div>
                                </div>

                                {/* Rule 3 */}
                                <div className="group flex items-start gap-5 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-800/10 hover:bg-white dark:hover:bg-slate-800/30 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-lg">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm min-w-[44px] flex items-center justify-center font-black text-slate-800 dark:text-white transition-all group-hover:scale-110 group-hover:rotate-3 border border-slate-50 dark:border-slate-700">
                                        03
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white transition-colors text-sm uppercase tracking-wider">NO_EXTERNAL_SYNC</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed transition-colors font-bold italic">
                                            "Switching tabs or using external documentation will result in immediate disqualification."
                                        </p>
                                    </div>
                                </div>

                                {/* Rule 4 */}
                                <div className="group flex items-start gap-5 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-800/10 hover:bg-white dark:hover:bg-slate-800/30 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-lg">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm min-w-[44px] flex items-center justify-center font-black text-slate-800 dark:text-white transition-all group-hover:scale-110 group-hover:-rotate-3 border border-slate-50 dark:border-slate-700">
                                        04
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white transition-colors text-sm uppercase tracking-wider">TEMPORAL_LIMIT</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed transition-colors font-bold italic">
                                            "You have exactly 15 minutes to complete the challenge. Speed bonus applies."
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-red-500/10 dark:bg-red-500/10 p-5 rounded-2xl border-2 border-red-500/20 mt-6 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                                    <div className="flex items-center gap-3 justify-center text-red-600 dark:text-red-400 mb-2">
                                        <ShieldCheck size={18} />
                                        <span className="font-black text-xs uppercase tracking-widest">SYS_WARNING</span>
                                    </div>
                                    <p className="text-[10px] text-red-500 dark:text-red-400/80 font-black text-center uppercase tracking-widest leading-relaxed">
                                        Violation of any rule leads to immediate permanent ban.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Starting Overlay */}
            <AnimatePresence>
                {isStarting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/95 dark:bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-6 text-center overflow-hidden transition-colors duration-500"
                    >
                        {/* Decorative background elements for overlay */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-500/5 dark:bg-purple-600/10 blur-[150px] rounded-full animate-pulse"></div>
                            <div className="grid grid-cols-12 gap-0 absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
                                {Array.from({ length: 144 }).map((_, i) => (
                                    <div key={i} className="border border-slate-900 dark:border-white aspect-square"></div>
                                ))}
                            </div>
                        </div>

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="relative z-10 max-w-4xl w-full"
                        >
                            {/* Circle Container */}
                            <div className="relative w-80 h-80 mx-auto mb-16 flex items-center justify-center">
                                {/* Rotating Rings */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800 border-dashed opacity-40"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-8 rounded-full border-2 border-purple-200 dark:border-purple-800 border-dashed opacity-60"
                                />
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 blur-2xl"></div>

                                {/* Countdown Number / Icon */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        {countdown > 0 ? (
                                            <motion.span
                                                key={countdown}
                                                initial={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
                                                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                                                exit={{ scale: 0.5, opacity: 0, filter: 'blur(10px)' }}
                                                transition={{ duration: 0.5, type: "spring", damping: 15 }}
                                                className="text-[12rem] font-black text-slate-900 dark:text-white tabular-nums leading-none tracking-tighter drop-shadow-2xl transition-colors"
                                            >
                                                {countdown}
                                            </motion.span>
                                        ) : (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -45 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                                className="relative"
                                            >
                                                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-30"></div>
                                                <Swords className="w-48 h-48 text-blue-600 dark:text-blue-400 relative z-10 drop-shadow-2xl" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <h2 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase transition-colors mb-4 italic">
                                        {countdown > 0 ? "CALIBRATING_SYSTEMS" : "PROTOCOLS_READY"}
                                    </h2>
                                    <div className="h-2 w-48 bg-slate-100 dark:bg-slate-800 mx-auto rounded-full overflow-hidden p-0.5 mb-8">
                                        <motion.div
                                            className="h-full bg-blue-600 rounded-full"
                                            animate={{ width: countdown > 0 ? `${(10 - countdown) * 10}%` : "100%" }}
                                            transition={{ duration: 1 }}
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex flex-col items-center gap-6"
                                >
                                    <div className="flex items-center gap-6 text-slate-400 dark:text-slate-500 font-mono text-xs font-black uppercase tracking-[0.5em] transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                                            <span>ENCRYPTING_BUFFER</span>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></div>
                                            <span>SYNCING_LOGIC</span>
                                        </div>
                                    </div>
                                    <div className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl">
                                        {countdown > 0 ? `T-MINUS ${countdown} SECONDS` : "INITIALIZING_EXECUTION_LEVEL_01"}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
