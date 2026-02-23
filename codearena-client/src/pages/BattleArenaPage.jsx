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
    User,
    Sun,
    Moon
} from 'lucide-react';
import { getSocket, initiateSocketConnection } from '../services/socket';
import { useTheme } from '../context/ThemeContext';

export default function BattleArenaPage() {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [opponent, setOpponent] = useState({ username: 'Opponent', status: 'Thinking...' });
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('// Write your solution here\n');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [gameStatus, setGameStatus] = useState('active'); // active, won, lost, timeout
    const [timeLeft, setTimeLeft] = useState(60);
    const [language, setLanguage] = useState('javascript');
    const [opponentActivity, setOpponentActivity] = useState('');
    const [problemId, setProblemId] = useState(null);



    const languages = [
        { id: 'javascript', name: 'JavaScript', version: 'v18.0' },
        { id: 'python', name: 'Python', version: 'v3.10' },
        { id: 'cpp', name: 'C++', version: 'GCC 11' },
        { id: 'c', name: 'C', version: 'GCC 11' },
        { id: 'java', name: 'Java', version: 'JDK 17' }
    ];


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

                socket.on('battle:timerUpdate', ({ timeLeft, problemId: pId }) => {
                    console.log("Timer update received:", timeLeft, pId);
                    setTimeLeft(timeLeft);
                    if (pId && !problemId) setProblemId(pId);
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
                    navigate('/dashboard');
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
    }, [roomId, location.state, problemId]);

    useEffect(() => {
        const fetchProblem = async () => {
            if (!problemId) return;
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/api/problems/${problemId}`);
                const data = await response.json();
                setProblem(data);

                // Set initial code from template if available
                if (data.templates && Array.isArray(data.templates)) {
                    const template = data.templates.find(t => t.language === language);
                    if (template) setCode(template.code);
                }
            } catch (error) {
                console.error("Failed to fetch problem", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [problemId]);


    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('EXACTING TEST SUITE...');

        const socket = getSocket();
        if (socket) {
            socket.emit('battle:runTests', { roomId });
            socket.emit('battle:submit', { roomId, code, language, dryRun: true });
        }

    };

    const handleSubmit = () => {
        setIsRunning(true);
        setOutput('SUBMITTING TO SERVER...');

        const socket = getSocket();
        if (socket) {
            socket.emit('battle:attempt', { roomId });
            socket.emit('battle:submit', { roomId, code, language });
        }

    };

    return (
        <div className="h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 font-sans relative transition-colors duration-300">
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
            <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-none px-6 flex items-center justify-between shadow-sm z-50 transition-all duration-300">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 group cursor-default">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center border border-blue-100 dark:border-blue-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                            <Swords className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <h1 className="text-lg font-bold tracking-tighter text-slate-900 dark:text-white font-mono">CodeArena_</h1>
                    </div>

                    <div className="h-6 w-[1px] bg-slate-200 hidden lg:block"></div>

                    {/* VS Indicator - Light Mode */}
                    <div className="flex items-center gap-4 hidden md:flex">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">YOU</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{user?.username || 'Player'}</span>
                            </div>
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase italic mr-4">{user?.rank || 'Bronze'}</span>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500 blur-sm opacity-20"></div>
                            <span className="relative text-[10px] font-black text-red-600 italic px-2">VS</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 relative">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{opponent.username}</span>
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">OPP</span>
                            </div>
                            <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase italic ml-4">{opponent.rank || 'Bronze'}</span>
                        </div>

                        {/* Opponent Activity Indicator Tag */}
                        {opponentActivity && (
                            <div className="absolute -bottom-6 right-0 whitespace-nowrap animate-bounce">
                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800 shadow-sm">
                                    {opponentActivity}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* CENTRAL TIMER - Light/Dark Mode High Contrast */}
                <div className="absolute left-1/2 -translate-x-1/2">
                    <div className={`px-8 py-2 rounded-xl border-2 font-mono font-black text-2xl flex items-center gap-4 transition-all duration-500 shadow-sm ${timeLeft <= 30
                        ? 'bg-red-50 dark:bg-red-950 border-red-500 text-red-600 dark:text-red-400 scale-105'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
                        }`}>
                        <Clock size={20} className={timeLeft <= 30 ? 'animate-pulse text-red-500' : 'text-blue-500'} />
                        <span className="tabular-nums tracking-tight">
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900/50 rounded-lg transition-all uppercase flex items-center gap-2"
                    >
                        <LogOut size={14} />
                        <span>Withdraw</span>
                    </button>
                </div>
            </header>

            {/* Main Application Area */}
            <main className="flex-1 flex overflow-hidden">

                {/* Left Side: Problem Card - Clean Light/Dark */}
                <div className="w-[42%] bg-[#F1F5F9]/30 dark:bg-slate-900/30 p-8 overflow-y-auto border-r border-slate-200 dark:border-slate-800 custom-scrollbar transition-colors duration-300">
                    <div className="space-y-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="text-slate-500 font-mono text-xs">SYNCHRONIZING_PROBLEM...</p>
                            </div>
                        ) : problem ? (
                            <>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${problem.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50' :
                                            problem.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50' :
                                                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50'
                                            }`}>
                                            Rank_{problem.difficulty}
                                        </span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest flex items-center gap-1.5">
                                            <Activity size={14} className="text-blue-500 dark:text-blue-400" /> {problem.xpReward} XP Reward
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight transition-colors duration-300">{problem.title}</h2>
                                </div>

                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 transition-colors duration-300">
                                    <div className="text-base leading-relaxed text-slate-600 dark:text-slate-400 space-y-4 font-medium prose prose-slate dark:prose-invert max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: problem.description }} />
                                    </div>

                                    {problem.examples && problem.examples.length > 0 && (
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200/60 dark:border-slate-700/60 mt-6">
                                            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-3 tracking-widest">Example Case 01</div>
                                            <pre className="text-sm font-mono text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-950/50 p-3 rounded border border-slate-200/40 dark:border-slate-800/40">
                                                Input: {problem.examples[0].input}{"\n"}
                                                Output: {problem.examples[0].output}{"\n"}
                                                {problem.examples[0].explanation && `Explanation: ${problem.examples[0].explanation}`}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-500 italic">No problem data found for ID: {problemId}</p>
                            </div>
                        )}

                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900/30 text-[11px] text-orange-700 dark:text-orange-400 font-bold uppercase tracking-wider flex items-center gap-3 mt-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></div>
                            Competitive Rule: Manual test execution is limited.
                        </div>
                    </div>
                </div>


                {/* Right Side: Interactive Zone */}
                <div className="flex-1 flex flex-col bg-[#1E1E1E]" >
                    {/* Tab Bar - Light/Dark Style */}
                    <div className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 transition-colors duration-300" >
                        <div className="flex items-center gap-4 h-full">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Language:</span>
                                <select
                                    value={language}
                                    onChange={(e) => {
                                        const newLang = e.target.value;
                                        setLanguage(newLang);

                                        // Try to find template in problem data
                                        if (problem?.templates && Array.isArray(problem.templates)) {
                                            const template = problem.templates.find(t => t.language === newLang);
                                            if (template) {
                                                setCode(template.code);
                                                return;
                                            }
                                        }

                                        // Fallback templates
                                        if (newLang === 'python') setCode('# Write your solution here\n');
                                        else if (newLang === 'cpp' || newLang === 'c') setCode('#include <stdio.h>\n\nint main() {\n    return 0;\n}');
                                        else if (newLang === 'java') setCode('public class Solution {\n    public static void main(String[] args) {\n    }\n}');
                                        else setCode('// Write your solution here\nfunction solve(input) {\n}');
                                    }}

                                    className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold py-1 px-2 rounded border border-slate-200 dark:border-slate-700 focus:outline-none"
                                >
                                    {languages.map(lang => (
                                        <option key={lang.id} value={lang.id}>{lang.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">Environment: Docker_Sandbox</div>
                    </div>


                    <div className="flex-1 relative overflow-hidden">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            language={language === 'cpp' || language === 'c' ? 'cpp' : language}
                            value={code}

                            onChange={(value) => {
                                setCode(value);
                                const socket = getSocket();
                                if (socket && gameStatus === 'active') {
                                    socket.emit('battle:typing', { roomId });
                                }
                            }}
                            theme={theme === 'dark' ? 'vs-dark' : 'light'}
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

                    {/* Pro Console Footer - Light/Dark Terminal */}
                    <div className="h-60 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col z-40 transition-colors duration-300">
                        <div className="h-12 bg-white dark:bg-slate-900 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Execution_Logs</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleRunCode}
                                    disabled={isRunning || gameStatus !== 'active'}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase rounded-lg transition-all disabled:opacity-30 border border-transparent dark:border-slate-700"
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
                        <div className="flex-1 p-6 font-mono text-sm overflow-y-auto bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-white transition-colors duration-300">
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
                </div>
            </main>

            {/* Battle Result Overlay - Clean Light/Dark Accent */}
            {(gameStatus === 'won' || gameStatus === 'lost') && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="bg-white dark:bg-slate-900 p-12 rounded-[2rem] max-w-md w-full text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-200 dark:border-slate-800 transform animate-in zoom-in-95 duration-300">
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
                                className="w-full py-4 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-slate-200 dark:shadow-none hover:translate-y-[-2px]"
                            >
                                Enter Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full py-4 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-black uppercase tracking-widest rounded-2xl transition-all"
                            >
                                Seek New Rival
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
