import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import API_BASE from '../config/api';
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
    EyeOff
} from 'lucide-react';
import { getSocket, initiateSocketConnection } from '../services/socket';
import { getAuthToken, getUser, logout } from '../utils/auth';

export default function BattleArenaPage() {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const location = useLocation();

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [opponent, setOpponent] = useState({ username: 'Opponent', status: 'Thinking...', rank: 'Bronze' });
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [language, setLanguage] = useState('python');
    const [gameStatus, setGameStatus] = useState('active');
    const [timeLeft, setTimeLeft] = useState(60);
    const [opponentActivity, setOpponentActivity] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [problem, setProblem] = useState(null);
    const [loadingProblem, setLoadingProblem] = useState(true);

    // Default code templates per language
    const defaultTemplates = {
        python: 'print("Hello, World!")',
        cpp: '#include<iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
        java: 'public class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
        c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}'
    };

    // Determine if we are in blind mode based on problem title or state
    const isBlindMode = location.state?.blindMode || problem?.title?.toLowerCase().includes('blind');

    // Fetch problem details
    const fetchProblem = async (problemId) => {
        try {
            const response = await fetch(`${API_BASE}/api/problems/${problemId}`);
            if (response.ok) {
                const data = await response.json();
                setProblem(data);

                // Set initial code if not already set
                if (!code) {
                    const template = data.templates?.find(t => t.language === language)?.code;
                    setCode(template || defaultTemplates[language] || '');
                }
            }
        } catch (err) {
            console.error("Failed to fetch problem:", err);
        } finally {
            setLoadingProblem(false);
        }
    };

    // Socket Setup
    useEffect(() => {
        let socket = getSocket();

        if (!socket || !socket.connected) {
            const token = getAuthToken();
            if (token) {
                initiateSocketConnection(token);
                socket = getSocket();
            } else {
                navigate('/login');
                return;
            }
        }

        if (socket) {
            const currentUser = getUser() || user;
            socket.emit('join_room', roomId, { username: currentUser?.username });

            socket.on('battle:opponentInfo', (opponentData) => {
                setOpponent({
                    username: opponentData.username,
                    status: 'Connected',
                    rank: opponentData.rank || 'Bronze'
                });
            });

            socket.on('battle:timerUpdate', ({ timeLeft, problemId }) => {
                setTimeLeft(timeLeft);
                if (problemId && (!problem || problem.slug !== problemId)) {
                    fetchProblem(problemId);
                }
            });

            socket.on('battle:startTimer', ({ duration }) => {
                setTimeLeft(duration);
            });

            socket.on('battle:result', ({ winnerId, winnerName }) => {
                if (socket.id === winnerId) {
                    setGameStatus('won');
                } else {
                    setGameStatus('lost');
                }
                setIsRunning(false);
            });

            socket.on('battle:opponentTyping', () => setOpponentActivity('Typing...'));
            socket.on('battle:opponentRunningTests', () => setOpponentActivity('Running tests...'));
            socket.on('battle:opponentAttempting', () => setOpponentActivity('Submitted solution'));

            socket.on('battle:executionResult', (result) => {
                setIsRunning(false);
                if (result.success) {
                    setOutput(`PASSED: ${result.logs}\nExecution Time: ${result.executionTime}ms`);
                } else {
                    setOutput(`FAILED: ${result.error || result.logs}\nExecution Time: ${result.executionTime}ms`);
                }
            });

            socket.on('battle:end', () => {
                setGameStatus('timeout');
                setIsRunning(false);
            });

            return () => {
                socket.off('battle:opponentInfo');
                socket.off('battle:timerUpdate');
                socket.off('battle:startTimer');
                socket.off('battle:result');
                socket.off('battle:opponentTyping');
                socket.off('battle:opponentRunningTests');
                socket.off('battle:opponentAttempting');
                socket.off('battle:executionResult');
                socket.off('battle:end');
            };
        }
    }, [roomId]);

    // Opponent Activity Clearer
    useEffect(() => {
        if (opponentActivity) {
            const timer = setTimeout(() => setOpponentActivity(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [opponentActivity]);

    // Typing emission
    useEffect(() => {
        const socket = getSocket();
        if (socket && code && gameStatus === 'active') {
            socket.emit('battle:typing', { roomId });
            const timer = setTimeout(() => {
                socket.emit('battle:codeUpdate', { roomId, code });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [code, roomId, gameStatus]);

    const handleRunCode = () => {
        setIsRunning(true);
        setOutput('EXECUTING TEST SUITE...');
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

    const handleLanguageChange = (newLang) => {
        if (isBlindMode && newLang !== 'c') return; // Enforce C only for blind mode matches
        setLanguage(newLang);
        const template = problem?.templates?.find(t => t.language === newLang)?.code;
        setCode(template || defaultTemplates[newLang] || '');
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

            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex-none px-6 flex items-center justify-between shadow-sm z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                            <Swords className="w-5 h-5 text-blue-600" />
                        </div>
                        <h1 className="text-lg font-bold tracking-tighter text-slate-900 font-mono">CodeArena_</h1>
                    </div>

                    <div className="h-6 w-[1px] bg-slate-200 hidden lg:block"></div>

                    <div className="flex items-center gap-4 hidden md:flex">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">YOU</span>
                                <span className="text-sm font-bold text-slate-700">{user?.username || 'Player'}</span>
                            </div>
                            <span className="text-[10px] font-black text-blue-600 uppercase italic mr-4">{user?.rank || 'Bronze'}</span>
                        </div>
                        <div className="relative">
                            <span className="text-[10px] font-black text-red-600 italic px-2">VS</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                                <span className="text-sm font-bold text-slate-700">{opponent.username}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OPP</span>
                            </div>
                            <span className="text-[10px] font-black text-red-600 uppercase italic ml-4">{opponent.rank || 'Bronze'}</span>
                        </div>
                    </div>
                </div>

                {/* TIMER */}
                <div className="absolute left-1/2 -translate-x-1/2">
                    <div className={`px-8 py-2 rounded-xl border-2 font-mono font-black text-2xl flex items-center gap-4 transition-all duration-500 bg-white ${timeLeft <= 30 ? 'border-red-500 text-red-600 animate-pulse' : 'border-slate-200 text-slate-900'}`}>
                        <Clock size={20} className={timeLeft <= 30 ? 'text-red-500' : 'text-blue-500'} />
                        <span className="tabular-nums">
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

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Panel: Problem */}
                <div className="w-[42%] bg-[#F1F5F9]/30 p-8 overflow-y-auto border-r border-slate-200 custom-scrollbar">
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${problem?.difficulty === 'Hard' ? 'bg-red-100 text-red-700 border-red-200' :
                                        problem?.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                            'bg-green-100 text-green-700 border-green-200'
                                    }`}>
                                    Rank_{problem?.difficulty || 'Easy'}
                                </span>
                                {isBlindMode && (
                                    <span className="px-2.5 py-1 rounded text-[10px] font-black bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-wider flex items-center gap-1">
                                        <EyeOff size={10} /> Blind_Mode
                                    </span>
                                )}
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                {loadingProblem ? 'Synchronizing...' : (problem?.title || 'Hello World')}
                            </h2>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                            <div className="text-base leading-relaxed text-slate-600 space-y-4 font-medium">
                                {loadingProblem ? (
                                    <p className="text-slate-400 animate-pulse font-mono italic text-sm">Waiting for secure problem stream...</p>
                                ) : (
                                    <>
                                        <p>{problem?.description || 'Build a solution that outputs "Hello World".'}</p>
                                    </>
                                )}
                            </div>

                            {problem?.examples?.length > 0 && (
                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60 mt-6">
                                    <div className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Sample_IO</div>
                                    <div className="space-y-4 font-mono text-sm text-slate-700">
                                        <div>
                                            <span className="text-slate-400 block mb-1">Input:</span>
                                            <div className="bg-white/50 p-2 rounded border border-slate-200/40">{problem.examples[0].input || '(None)'}</div>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block mb-1">Output:</span>
                                            <div className="bg-white/50 p-2 rounded border border-slate-200/40">{problem.examples[0].output}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isBlindMode && (
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 text-[11px] text-purple-700 font-bold uppercase tracking-wider flex items-center gap-3">
                                <EyeOff size={16} />
                                Protocol: Code visibility is currently restricted.
                            </div>
                        )}

                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 text-[11px] text-orange-700 font-bold uppercase tracking-wider flex items-center gap-3">
                            <Activity size={16} />
                            Rule: Single attempt submission recommended.
                        </div>
                    </div>
                </div>

                {/* Right Panel: Editor */}
                <div className="flex-1 flex flex-col bg-[#1E1E1E]">
                    <div className="h-10 bg-white border-b border-slate-200 flex items-center justify-between px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <div className="flex items-center gap-4 h-full">
                            <span className="text-blue-600 border-b-2 border-blue-600 h-full flex items-center">Main.file</span>
                            <select
                                value={language}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                disabled={isBlindMode || gameStatus !== 'active'}
                                className="bg-slate-50 text-slate-700 rounded border border-slate-200 px-2 py-0.5 outline-none focus:border-blue-500 uppercase disabled:opacity-50"
                            >
                                <option value="python">Python</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                                <option value="c">C</option>
                            </select>
                        </div>
                        {opponentActivity && (
                            <div className="text-blue-500 italic animate-pulse lowercase">{opponent.username} is {opponentActivity.toLowerCase()}</div>
                        )}
                    </div>

                    <div className={`flex-1 relative ${isBlindMode ? 'blind-mode-active' : ''}`}>
                        <Editor
                            height="100%"
                            language={language}
                            value={code}
                            onChange={setCode}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                fontFamily: "'JetBrains Mono', monospace",
                                readOnly: gameStatus !== 'active',
                                automaticLayout: true,
                                scrollBeyondLastLine: false,
                                lineNumbers: isBlindMode ? 'off' : 'on'
                            }}
                        />
                    </div>

                    {/* Console */}
                    <div className="h-60 bg-white border-t border-slate-200 flex flex-col z-40">
                        <div className="h-12 bg-white px-6 flex items-center justify-between border-b border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Console.log</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRunCode}
                                    disabled={isRunning || gameStatus !== 'active'}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg disabled:opacity-30"
                                >
                                    <Play size={12} /> Test_Run
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isRunning || gameStatus !== 'active'}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded-lg shadow-md disabled:opacity-30"
                                >
                                    <Check size={12} /> Submit
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-6 font-mono text-sm overflow-y-auto bg-slate-900 text-slate-300">
                            {isRunning ? (
                                <div className="space-y-2">
                                    <div className="text-blue-400 animate-pulse text-xs">COMMUNICATING WITH SANBOX...</div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 animate-[loading_1.5s_infinite]"></div>
                                    </div>
                                </div>
                            ) : (
                                <pre className="whitespace-pre-wrap">{output || "> STANDBY: Awaiting input..."}</pre>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Results Overlay */}
            {(gameStatus === 'won' || gameStatus === 'lost') && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
                    <div className="bg-white p-12 rounded-[2rem] max-w-md w-full text-center shadow-2xl border border-slate-200">
                        <div className={`w-28 h-28 mx-auto mb-8 rounded-3xl flex items-center justify-center border-4 ${gameStatus === 'won' ? 'bg-green-50 text-green-500 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                            {gameStatus === 'won' ? <Check size={56} strokeWidth={3} /> : <Swords size={56} strokeWidth={3} />}
                        </div>
                        <h2 className={`text-5xl font-black mb-4 ${gameStatus === 'won' ? 'text-green-600' : 'text-red-600'}`}>
                            {gameStatus === 'won' ? 'VICTORY' : 'DEFEAT'}
                        </h2>
                        <p className="text-slate-500 mb-10 font-bold">
                            {gameStatus === 'won' ? 'Duel completed. Accuracy: 100%' : 'Duel lost. Performance evaluated.'}
                        </p>
                        <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-slate-900 text-white font-black uppercase rounded-2xl hover:bg-slate-800 transition-all">
                            Return to HQ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
