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
    Play
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
            socket.emit('competition:join', { eventId, user, language: 'cpp' });

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
                            language: 'cpp'
                        }
                    });
                }, 2000);
            });

            // Listen for errors
            socket.on('competition:error', ({ message }) => {
                alert(message);
            });

            // For demo purposes if server is not fully wired yet
            // setPlayers([{ username: user?.username, id: 'me' }, { username: 'Rival_Code', id: '2' }]);
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

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-['JetBrains_Mono']">
            <Navbar
                items={[]}
                user={user}
            />

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
                                <div className="p-2 bg-yellow-50 rounded-lg">
                                    <Trophy className="w-5 h-5 text-yellow-600" />
                                </div>
                                <h2 className="font-bold text-lg">Event Stats</h2>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    {leaderboard.map((item, idx) => (
                                        <div key={item.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 text-sm font-black text-slate-300 font-mono italic">
                                                    {(idx + 1).toString().padStart(2, '0')}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                        {item.username}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                        {item.rank}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <div className="text-sm font-black text-slate-900">
                                                    {item.xp} <span className="text-[10px] text-slate-400 ml-0.5">XP</span>
                                                </div>
                                                {idx === 0 && <Crown size={12} className="text-yellow-500" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100">
                                    <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Prize Pool</div>
                                        <div className="text-2xl font-black text-indigo-700">5,000 XP</div>
                                        <p className="text-[10px] text-indigo-500 mt-1 font-bold">Exclusive "Daredevil" Badge</p>
                                    </div>
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
                        className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-6 text-center overflow-hidden"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative z-10"
                        >
                            <div className="w-32 h-32 bg-purple-600 rounded-full mx-auto mb-10 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.5)] animate-pulse">
                                <Swords className="w-16 h-16 text-white" />
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-white mb-4 italic tracking-tighter">BATTLE STARTING</h2>
                            <p className="text-purple-400 text-xl font-bold uppercase tracking-[0.5em] animate-bounce">Prepare for Blind Coding...</p>
                        </motion.div>

                        {/* Background particles/elements */}
                        <div className="absolute inset-0 opacity-20">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{
                                        x: Math.random() * window.innerWidth,
                                        y: Math.random() * window.innerHeight
                                    }}
                                    animate={{
                                        y: [null, -1000],
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{
                                        duration: Math.random() * 5 + 5,
                                        repeat: Infinity,
                                        delay: Math.random() * 5
                                    }}
                                    className="absolute w-1 h-20 bg-purple-500 rounded-full"
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
