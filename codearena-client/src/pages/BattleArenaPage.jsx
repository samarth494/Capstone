import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
    Swords,
    LogOut,
    Play,
    Terminal as TerminalIcon,
    Clock,
    Activity,
    Check,
    User
} from 'lucide-react';
import { getSocket, initiateSocketConnection } from '../services/socket';

export default function BattleArenaPage() {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const location = useLocation();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [opponent, setOpponent] = useState({ username: 'Opponent', status: 'Thinking...' });
    const [code, setCode] = useState('// Solve: Return indices of the two numbers that add up to target\nfunction solve(input) {\n  const { nums, target } = input;\n  \n  // Your logic here\n  \n  return [0, 1]; // Example return\n}');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [gameStatus, setGameStatus] = useState('active'); // active, won, lost, timeout
    const [timeLeft, setTimeLeft] = useState(60);
    const [opponentActivity, setOpponentActivity] = useState('');

    // Clear opponent activity after 3 seconds
    useEffect(() => {
        if (opponentActivity) {
            const timer = setTimeout(() => {
                setOpponentActivity('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [opponentActivity]);

    // Emit code updates for replays and indicators
    useEffect(() => {
        const socket = getSocket();
        if (socket && code) {
            socket.emit('battle:typing', { roomId });

            // Debounce actual content update to avoid flood
            const timer = setTimeout(() => {
                socket.emit('battle:codeUpdate', { roomId, code });
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [code, roomId]);

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            let socket = getSocket();

            // Check if missing or disconnected
            if (!socket || !socket.connected) {
                if (token) {
                    console.log("Socket missing or disconnected, (re)connecting...");
                    initiateSocketConnection(token);
                    socket = getSocket();
                } else {
                    navigate('/login');
                    return;
                }
            }

            // Restore opponent name if we came from Lobby
            if (location.state?.opponent) {
                setOpponent({ username: location.state.opponent.username, status: 'Connected' });
            }

            const storedUser = JSON.parse(localStorage.getItem('user'));
            const currentUser = user || storedUser;

            // Fallback for missing username
            if (currentUser && !currentUser.username && currentUser.email) {
                currentUser.username = currentUser.email.split('@')[0];
                localStorage.setItem('user', JSON.stringify(currentUser));
                if (!user) setUser(currentUser);
            }

            console.log("BATTLE_ARENA: Identified user as:", currentUser?.username);

            if (socket) {
                console.log(`BATTLE_ARENA: Attempting to join room [${roomId}] as [${currentUser?.username}]`);
                socket.emit('join_room', roomId, { username: currentUser?.username });

                socket.on('battle:opponentInfo', (opponentData) => {
                    console.log("Opponent info received:", opponentData);
                    setOpponent({ username: opponentData.username, status: 'Connected' });
                });

                socket.on('battle:startTimer', ({ duration }) => {
                    console.log("Timer started:", duration);
                    setTimeLeft(duration);
                });

                socket.on('battle:timerUpdate', ({ timeLeft }) => {
                    console.log("Timer update received:", timeLeft);
                    setTimeLeft(timeLeft);
                });

                socket.on('battle:end', ({ reason }) => {
                    console.log("Battle ended:", reason);
                    setGameStatus('timeout');
                    setIsRunning(false);
                    alert("BATTLE ENDED: Time Limit Reached.");
                });

                socket.on('battle:error', ({ message }) => {
                    console.error("Battle error:", message);
                    alert(message);
                    navigate('/lobby');
                });

                socket.on('battle:result', ({ winnerId, winnerName, reason }) => {
                    console.log("Battle Result Received:", winnerId, winnerName);
                    if (socket.id === winnerId) {
                        setGameStatus('won');
                    } else {
                        setGameStatus('lost');
                    }
                    setIsRunning(false);
                });

                // Opponent Activity Listeners
                socket.on('battle:opponentTyping', () => {
                    setOpponentActivity('Typing...');
                });

                socket.on('battle:opponentRunningTests', () => {
                    setOpponentActivity('Running tests...');
                });

                socket.on('battle:opponentAttempting', () => {
                    setOpponentActivity('Submitted solution');
                });

                socket.on('battle:executionResult', (result) => {
                    setIsRunning(false);
                    if (result.success) {
                        setOutput(`PASSED: ${result.logs}\nExecution Time: ${result.executionTime}ms`);
                    } else {
                        setOutput(`FAILED: ${result.error || result.logs}\nExecution Time: ${result.executionTime}ms`);
                    }
                });

                // Cleanup listeners on unmount
                return () => {
                    socket.off('battle:opponentInfo');
                    socket.off('battle:startTimer');
                    socket.off('battle:timerUpdate');
                    socket.off('battle:end');
                    socket.off('battle:error');
                    socket.off('battle:result');
                    socket.off('battle:opponentTyping');
                    socket.off('battle:opponentRunningTests');
                    socket.off('battle:opponentAttempting');
                    socket.off('battle:executionResult');
                };
            }
        } catch (err) {
            console.error("CRITICAL ERROR IN BATTLE_ARENA_EFFECT:", err);
        }
    }, [roomId, location.state]);

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('EXACTING TEST SUITE...');

        const socket = getSocket();
        if (socket) {
            socket.emit('battle:runTests', { roomId });
            // For now, we use battle:submit just for testing logic, 
            // but the server is currently wired to end the battle on success.
            // I will add a separate 'battle:executeOnly' event on the server next.
            socket.emit('battle:submit', { roomId, code, dryRun: true });
        }
    };

    const handleSubmit = () => {
        setIsRunning(true);
        setOutput('SUBMITTING TO SERVER...');

        const socket = getSocket();
        if (socket) {
            socket.emit('battle:attempt', { roomId });
            socket.emit('battle:submit', { roomId, code });
        }
    };

    return (
        <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden text-slate-900 font-sans relative">
            <style>
                {`
                    @keyframes loading {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
                `}
            </style>

            {/* Clean Competitive Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex-none px-6 flex items-center justify-between shadow-sm z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 group cursor-default">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100 group-hover:bg-blue-100 transition-colors">
                            <Swords className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <h1 className="text-lg font-bold tracking-tighter text-slate-900 font-mono">CodeArena_</h1>
                    </div>

                    <div className="h-6 w-[1px] bg-slate-200 hidden lg:block"></div>

                    {/* VS Indicator - Light Mode */}
                    <div className="flex items-center gap-4 hidden md:flex">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">YOU</span>
                                <span className="text-sm font-bold text-slate-700">{user?.username || 'Player'}</span>
                            </div>
                            <span className="text-[10px] font-black text-blue-600 uppercase italic mr-4">{user?.rank || 'Bronze'}</span>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500 blur-sm opacity-20"></div>
                            <span className="relative text-[10px] font-black text-red-600 italic px-2">VS</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200 relative">
                                <span className="text-sm font-bold text-slate-700">{opponent.username}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OPP</span>
                            </div>
                            <span className="text-[10px] font-black text-red-600 uppercase italic ml-4">{opponent.rank || 'Bronze'}</span>
                        </div>

                        {/* Opponent Activity Indicator Tag */}
                        {opponentActivity && (
                            <div className="absolute -bottom-6 right-0 whitespace-nowrap animate-bounce">
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shadow-sm">
                                    {opponentActivity}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* CENTRAL TIMER - Light Mode High Contrast */}
                <div className="absolute left-1/2 -translate-x-1/2">
                    <div className={`px-8 py-2 rounded-xl border-2 font-mono font-black text-2xl flex items-center gap-4 transition-all duration-500 shadow-sm ${timeLeft <= 30
                        ? 'bg-red-50 border-red-500 text-red-600 scale-105'
                        : 'bg-white border-slate-200 text-slate-900'
                        }`}>
                        <Clock size={20} className={timeLeft <= 30 ? 'animate-pulse text-red-500' : 'text-blue-500'} />
                        <span className="tabular-nums tracking-tight">
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-5 py-2 text-xs font-bold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all uppercase flex items-center gap-2"
                    >
                        <LogOut size={14} />
                        <span>Withdraw</span>
                    </button>
                </div>
            </header>

            {/* Main Application Area */}
            <main className="flex-1 flex overflow-hidden">

                {/* Left Side: Problem Card - Clean Light */}
                <div className="w-[42%] bg-[#F1F5F9]/30 p-8 overflow-y-auto border-r border-slate-200 custom-scrollbar">
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2.5 py-1 rounded text-[10px] font-black bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider">Rank_Hard</span>
                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest flex items-center gap-1.5">
                                    <Activity size={14} className="text-blue-500" /> 2.4K Battles Won
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Two Sum</h2>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                            <div className="text-base leading-relaxed text-slate-600 space-y-4 font-medium">
                                <p>
                                    Given an array of integers <code className="text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded font-bold">nums</code> and an integer <code className="text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded font-bold">target</code>, return indices of the two numbers such that they add up to target.
                                </p>
                                <p className="text-slate-400 text-sm">You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60 mt-6">
                                <div className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Example Case 01</div>
                                <pre className="text-sm font-mono text-slate-700 bg-white/50 p-3 rounded border border-slate-200/40">
                                    Input: nums = [2,7,11,15], target = 9{"\n"}
                                    Output: [0,1]{"\n"}
                                    Explanation: nums[0] + nums[1] == 9
                                </pre>
                            </div>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 text-[11px] text-orange-700 font-bold uppercase tracking-wider flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></div>
                            Competitive Rule: Manual test execution is limited.
                        </div>
                    </div>
                </div >

                {/* Right Side: Interactive Zone */}
                < div className="flex-1 flex flex-col bg-[#1E1E1E]" >
                    {/* Tab Bar - Light Style */}
                    < div className="h-10 bg-white border-b border-slate-200 flex items-center justify-between px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest" >
                        <div className="flex items-center gap-6 h-full font-mono">
                            <button className="text-blue-600 border-b-2 border-blue-600 h-full flex items-center px-2">./solution.js</button>
                            <button className="hover:text-slate-600 transition-colors h-full flex items-center px-2">./test_suite.js</button>
                        </div>
                        <div className="text-slate-400">Environment: Node_v20</div>
                    </div >

                    <div className="flex-1 relative overflow-hidden">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            value={code}
                            onChange={(value) => {
                                setCode(value);
                                const socket = getSocket();
                                if (socket && gameStatus === 'active') {
                                    socket.emit('battle:typing', { roomId });
                                }
                            }}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                fontFamily: "'JetBrains Mono', monospace",
                                lineNumbers: 'on',
                                padding: { top: 20 },
                                automaticLayout: true,
                                scrollBeyondLastLine: false,
                                readOnly: gameStatus !== 'active'
                            }}
                        />
                    </div>

                    {/* Pro Console Footer - Dark Terminal High Contrast */}
                    <div className="h-60 bg-white border-t border-slate-200 flex flex-col z-40">
                        <div className="h-12 bg-white px-6 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution_Logs</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleRunCode}
                                    disabled={isRunning || gameStatus !== 'active'}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg transition-all disabled:opacity-30"
                                >
                                    <Play size={14} /> Run_Tests
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isRunning || gameStatus !== 'active'}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded-lg shadow-md hover:translate-y-[-1px] transition-all disabled:opacity-30"
                                >
                                    <Check size={14} /> Submit_Ready
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-6 font-mono text-sm overflow-y-auto bg-slate-900 text-slate-300">
                            {isRunning ? (
                                <div className="space-y-3">
                                    <div className="text-blue-400 animate-pulse font-black tracking-widest text-xs uppercase">Connecting to runtime...</div>
                                    <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 animate-[loading_1.5s_infinite]"></div>
                                    </div>
                                </div>
                            ) : (
                                <pre className="whitespace-pre-wrap leading-relaxed opacity-90">{output || "> STANDBY: Awaiting input..."}</pre>
                            )}
                        </div>
                    </div>
                </div >
            </main >

            {/* Battle Result Overlay - Clean Light Accent */}
            {
                (gameStatus === 'won' || gameStatus === 'lost') && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500">
                        <div className="bg-white p-12 rounded-[2rem] max-w-md w-full text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-200 transform animate-in zoom-in-95 duration-300">
                            <div className={`w-28 h-28 mx-auto mb-10 rounded-3xl rotate-12 flex items-center justify-center border-4 ${gameStatus === 'won' ? 'bg-green-50 text-green-500 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                <div className="-rotate-12">
                                    {gameStatus === 'won' ? <Check size={56} strokeWidth={3} /> : <Swords size={56} strokeWidth={3} />}
                                </div>
                            </div>

                            <h2 className={`text-5xl font-black font-sans mb-4 tracking-tighter ${gameStatus === 'won' ? 'text-green-600' : 'text-red-600'}`}>
                                {gameStatus === 'won' ? 'VICTORY' : 'DEFEAT'}
                            </h2>

                            <p className="text-slate-500 mb-12 font-bold tracking-tight text-lg">
                                {gameStatus === 'won' ? 'Superior logic. Duel completed.' : 'Performance analyzed. Try again.'}
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-slate-200 hover:translate-y-[-2px]"
                                >
                                    Enter Dashboard
                                </button>
                                <button
                                    onClick={() => navigate('/lobby')}
                                    className="w-full py-4 text-slate-500 hover:text-blue-600 font-black uppercase tracking-widest rounded-2xl transition-all"
                                >
                                    Seek New Rival
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
