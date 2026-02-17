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

    const [selectedLanguage, setSelectedLanguage] = useState('cpp'); // Default to cpp or allow user to change later
    const [leaderboard, setLeaderboard] = useState([
        { id: 1, username: 'ZenithCode', xp: 12500, rank: 'Platinum' },
        { id: 2, username: 'ByteMaster', xp: 11200, rank: 'Gold' },
        { id: 3, username: 'LogicGhost', xp: 9800, rank: 'Gold' },
        { id: 4, username: 'ShadowDev', xp: 8500, rank: 'Silver' },
        { id: 5, username: 'BitSurfer', xp: 7200, rank: 'Bronze' },
    ]);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes mock
    const [isStarting, setIsStarting] = useState(false);

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

            // Listen for start event
            socket.on('competition:roundStarted', (data) => {
                setIsStarting(true);
                setTimeout(() => {
                    navigate('/problem/blind-coding', {
                        state: {
                            blindMode: true,
                            language: 'c'
                        }
                    });
                }, 2000);
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

    const [countdown, setCountdown] = useState(null);

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
        setIsStarting(true);
        let count = 10;
        setCountdown(count);
        playBeep(800, 200); // Initial start beep

        const interval = setInterval(() => {
            count--;
            setCountdown(count);
            
            if (count > 0) {
                 playBeep(440, 150); // Tick beep
            } else if (count === 0) {
                 playBeep(880, 1000); // Level start beep (longer)
            }

            // Wait 3 seconds showing "Level 1 Start"
            if (count < -3) {
                clearInterval(interval);
                navigate('/problem/blind-coding', {
                    state: {
                        blindMode: true,
                        language: 'c'
                    }
                });
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-['JetBrains_Mono']">
            <Navbar items={[]} user={user} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard/events')}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4 group"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Return to Events</span>
                        </button>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 font-mono tracking-tight uppercase">
                            Blind Coding <span className="text-purple-600">Lobby</span>
                        </h1>
                        <p className="text-slate-500 mt-2 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-green-500" />
                            Competitive Event Instance: {eventId}
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-6 min-w-[240px]">
                        <div className="bg-purple-50 p-3 rounded-xl border border-purple-100/50">
                            <Clock className="w-6 h-6 text-purple-600 animate-pulse" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Starting In</div>
                            <div className="text-2xl font-black text-slate-900 tabular-nums">
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-900">
                    {/* Left: Player List */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Admin Controls (TEMPORARY FOR TESTING) */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Crown className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Lobby Controls</h3>
                                    <p className="text-xs text-slate-500">Only visible to host</p>
                                </div>
                            </div>
                            <button
                                onClick={handleStartBattle}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                            >
                                <Play size={18} fill="currentColor" />
                                Start Battle Now
                            </button>
                        </div>

                        <section className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="font-bold text-lg">Active Participants</h2>
                                </div>
                                <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black tracking-widest uppercase">
                                    {players.length || 1} / 30 Joined
                                </span>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <AnimatePresence>
                                        {(players.length > 0 ? players : [{ username: user?.username || 'You', isMe: true, socketId: getSocket()?.id }]).map((player, idx) => {
                                            const isMe = player.socketId === getSocket()?.id;

                                            return (
                                                <motion.div
                                                    key={player.socketId || idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className={`flex items-center justify-between p-4 rounded-2xl border ${isMe
                                                        ? 'bg-blue-50 border-blue-200'
                                                        : 'bg-white border-slate-100 hover:border-slate-300'
                                                        } transition-all duration-300`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isMe ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {player.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-bold text-slate-900 truncate max-w-[120px]">
                                                                    {player.username}
                                                                </div>
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                                {isMe ? 'Your Status' : 'Ready'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isMe && (
                                                        <div className="flex h-2 w-2 rounded-full bg-green-500 animate-ping"></div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>

                                <div className="mt-10 p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <Users className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">Waiting for challengers...</h3>
                                    <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                                        The battle will commence automatically when 30 warriors have entered the arena.
                                    </p>

                                    <div className="mt-6 w-full max-w-md">
                                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                                            <span>Lobby Status</span>
                                            <span>{players.length || 1}/30 Ready</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                                                style={{ width: `${((players.length || 1) / 30) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right: Event Leaderboard */}
                    <div className="lg:col-span-4 space-y-6">
                        <section className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden sticky top-32">
                            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <Swords className="w-5 h-5 text-red-600" />
                                </div>
                                <h2 className="font-bold text-lg">Competition Rules</h2>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Rule 1 */}
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="bg-slate-100 p-2 rounded-lg mt-1 min-w-[36px] flex items-center justify-center font-bold text-slate-600">
                                        1
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Zero Visibility</h3>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            The code editor will be blacked out. You will not see what you type. Rely on your muscle memory.
                                        </p>
                                    </div>
                                </div>

                                {/* Rule 2 */}
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="bg-slate-100 p-2 rounded-lg mt-1 min-w-[36px] flex items-center justify-center font-bold text-slate-600">
                                        2
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Single Compilation</h3>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            You only get one chance to compile and run your code. Correctness is paramount.
                                        </p>
                                    </div>
                                </div>

                                {/* Rule 3 */}
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="bg-slate-100 p-2 rounded-lg mt-1 min-w-[36px] flex items-center justify-center font-bold text-slate-600">
                                        3
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">No External Help</h3>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            Switching tabs or using external documentation will result in immediate disqualification.
                                        </p>
                                    </div>
                                </div>

                                {/* Rule 4 */}
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="bg-slate-100 p-2 rounded-lg mt-1 min-w-[36px] flex items-center justify-center font-bold text-slate-600">
                                        4
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Time Limit</h3>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            You have exactly 15 minutes to complete the challenge. Speed bonus applies.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-4">
                                    <p className="text-xs text-red-600 font-bold text-center">
                                        Violation of any rule leads to a ban.
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
                        className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-xl flex items-center justify-center p-6 text-center overflow-hidden"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="relative z-10 max-w-4xl w-full"
                        >
                            {/* Circle Container */}
                            <div className="relative w-64 h-64 mx-auto mb-12 flex items-center justify-center">
                                {/* Rotating Rings */}
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border border-slate-200 border-dashed"
                                />
                                <motion.div 
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-4 rounded-full border border-purple-100 border-dashed"
                                />
                                
                                {/* Countdown Number / Icon */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        {countdown > 0 ? (
                                            <motion.span 
                                                key={countdown}
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                transition={{ duration: 0.4 }}
                                                className="text-[8rem] font-black text-slate-900 tabular-nums leading-none tracking-tighter"
                                            >
                                                {countdown}
                                            </motion.span>
                                        ) : (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                            >
                                                <Swords className="w-32 h-32 text-purple-600" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="space-y-6">
                                <motion.h2 
                                    key={countdown > 0 ? "prep" : "start"}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight uppercase"
                                >
                                    {countdown > 0 ? "System Auto-Calibration" : "Initialize Level 1"}
                                </motion.h2>
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center justify-center gap-3 text-slate-500 font-mono text-sm uppercase tracking-widest"
                                >
                                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                    {countdown > 0 ? "Syncing Logic Modules..." : "Blind Mode Protocol Engaged"}
                                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
