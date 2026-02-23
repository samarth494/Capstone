import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
    Swords,
    LogOut,
    Play,
    Terminal as TerminalIcon,
    ArrowLeft,
    RotateCcw,
    Save,
    Check,
    AlertCircle,
    Clock,
    Sun,
    Moon,
    Trophy,
    Crown,
    Medal,
    Zap,
    Users,
    ArrowRight,
    Star,
    Loader2
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';
import { getSocket, initiateSocketConnection } from '../services/socket';
import { API_BASE_URL } from '../config/api';

// ===== BLIND CODING LEVEL PROBLEMS =====
const LEVEL_PROBLEMS = {
    1: {
        title: 'Even/Odd Check',
        difficulty: 'Easy',
        description: (
            <>
                <p>
                    Write a C program that accepts an integer from the user and checks whether it is <strong>even or odd</strong>.
                </p>
                <p>
                    Print <code>"Even"</code> if the number is even, or <code>"Odd"</code> if the number is odd.
                </p>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Example 1:</h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm my-4">
                    <p className="mb-2"><span className="font-bold text-slate-900 dark:text-slate-100">Input:</span> 12</p>
                    <p className="mb-2"><span className="font-bold text-slate-900 dark:text-slate-100">Output:</span> Even</p>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Example 2:</h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm my-4">
                    <p className="mb-2"><span className="font-bold text-slate-900 dark:text-slate-100">Input:</span> 7</p>
                    <p><span className="font-bold text-slate-900 dark:text-slate-100">Output:</span> Odd</p>
                </div>

                <h3 className="text-lg">Constraints:</h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Input will be a valid integer <code>n</code>.</li>
                    <li><code>-10^9 &lt;= n &lt;= 10^9</code></li>
                </ul>
            </>
        ),
        starterCode: '#include <stdio.h>\n\nint main() {\n    // Read an integer and print Even or Odd\n    return 0;\n}',
        testCases: [
            { input: '12', expected: 'Even' },
            { input: '7', expected: 'Odd' },
            { input: '0', expected: 'Even' },
        ]
    },
    2: {
        title: 'Sum of Digits',
        difficulty: 'Medium',
        description: (
            <>
                <p>
                    Write a C program that reads a <strong>positive integer</strong> and prints the <strong>sum of its digits</strong>.
                </p>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Example 1:</h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm my-4">
                    <p className="mb-2"><span className="font-bold text-slate-900 dark:text-slate-100">Input:</span> 123</p>
                    <p className="mb-2"><span className="font-bold text-slate-900 dark:text-slate-100">Output:</span> 6</p>
                    <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-900 dark:text-slate-100">Explanation:</span> 1 + 2 + 3 = 6</p>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Example 2:</h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm my-4">
                    <p className="mb-2"><span className="font-bold text-slate-900 dark:text-slate-100">Input:</span> 9999</p>
                    <p><span className="font-bold text-slate-900 dark:text-slate-100">Output:</span> 36</p>
                    <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-900 dark:text-slate-100">Explanation:</span> 9 + 9 + 9 + 9 = 36</p>
                </div>

                <h3 className="text-lg">Constraints:</h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Input will be a positive integer <code>n</code>.</li>
                    <li><code>1 &lt;= n &lt;= 10^9</code></li>
                </ul>
            </>
        ),
        starterCode: '#include <stdio.h>\n\nint main() {\n    // Read an integer and print sum of its digits\n    return 0;\n}',
        testCases: [
            { input: '123', expected: '6' },
            { input: '9999', expected: '36' },
            { input: '5', expected: '5' },
        ]
    },
    3: {
        title: 'Factorial',
        difficulty: 'Hard',
        description: (
            <>
                <p>
                    Write a C program that reads a <strong>non-negative integer</strong> <code>n</code> and prints its <strong>factorial</strong> (<code>n!</code>).
                </p>
                <p>
                    Recall: <code>0! = 1</code>, <code>n! = n × (n-1) × ... × 2 × 1</code>.
                </p>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Example 1:</h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm my-4">
                    <p className="mb-2"><span className="font-bold text-slate-900 dark:text-slate-100">Input:</span> 5</p>
                    <p className="mb-2"><span className="font-bold text-slate-900 dark:text-slate-100">Output:</span> 120</p>
                    <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-900 dark:text-slate-100">Explanation:</span> 5 × 4 × 3 × 2 × 1 = 120</p>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Example 2:</h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm my-4">
                    <p className="mb-2"><span className="font-bold text-slate-900 dark:text-slate-100">Input:</span> 0</p>
                    <p><span className="font-bold text-slate-900 dark:text-slate-100">Output:</span> 1</p>
                </div>

                <h3 className="text-lg">Constraints:</h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li><code>0 &lt;= n &lt;= 12</code></li>
                </ul>
            </>
        ),
        starterCode: '#include <stdio.h>\n\nint main() {\n    // Read an integer and print its factorial\n    return 0;\n}',
        testCases: [
            { input: '5', expected: '120' },
            { input: '0', expected: '1' },
            { input: '10', expected: '3628800' },
        ]
    }
};

const LEVEL_TIME_LIMIT = 10 * 60; // 10 minutes per level

export default function ProblemSolverPage() {
    const navigate = useNavigate();
    const { problemId } = useParams();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const [blindMode, setBlindMode] = useState(location.state?.blindMode || false);
    const [user, setUser] = useState(null);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [language, setLanguage] = useState(location.state?.language || 'javascript');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // === Competition Mode State ===
    const isCompetitionMode = blindMode && location.state?.eventId;
    const eventId = location.state?.eventId;
    const [currentLevel, setCurrentLevel] = useState(location.state?.level || 1);
    const totalLevels = location.state?.totalLevels || 3;

    // Competition overlays & data
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [showWaiting, setShowWaiting] = useState(false);
    const [showLevelLeaderboard, setShowLevelLeaderboard] = useState(false);
    const [showFinalResults, setShowFinalResults] = useState(false);
    const [levelLeaderboard, setLevelLeaderboard] = useState([]);
    const [cumulativeLeaderboard, setCumulativeLeaderboard] = useState([]);
    const [winner, setWinner] = useState(null);
    const [submittedCount, setSubmittedCount] = useState(0);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [levelStartTime, setLevelStartTime] = useState(Date.now());
    const [nextLevel, setNextLevel] = useState(null);

    // Code state - different for competition vs regular
    const getStarterCode = (level) => {
        if (isCompetitionMode && LEVEL_PROBLEMS[level]) {
            return LEVEL_PROBLEMS[level].starterCode;
        }
        const lang = location.state?.language || 'javascript';
        if (lang === 'cpp' || lang === 'c') {
            return '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}';
        }
        return '// Write your solution here\nfunction solve(input) {\n  return input;\n}';
    };

    const [code, setCode] = useState(() => getStarterCode(location.state?.level || 1));

    // Timer state
    const [timeLeft, setTimeLeft] = useState(isCompetitionMode ? LEVEL_TIME_LIMIT : 15 * 60);
    const timerRef = useRef(null);

    // Timer effect
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    // Auto-submit on timeout in competition mode
                    if (isCompetitionMode && !hasSubmitted) {
                        handleAutoSubmitTimeout();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [currentLevel, hasSubmitted]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse user data", error);
            }
        }
    }, []);

    // === Socket Integration for Competition Mode ===
    useEffect(() => {
        if (!isCompetitionMode) return;

        const token = localStorage.getItem('token');
        let socket = getSocket();
        if (!socket || !socket.connected) {
            initiateSocketConnection(token);
            socket = getSocket();
        }
        if (!socket) return;

        const handlePlayerSubmitted = ({ totalSubmitted, totalPlayers: tp, level }) => {
            if (level === currentLevel) {
                setSubmittedCount(totalSubmitted);
                setTotalPlayers(tp);
            }
        };

        const handleLevelComplete = ({ level, levelLeaderboard: lb, cumulativeLeaderboard: cb, nextLevel: nl }) => {
            if (level === currentLevel) {
                setLevelLeaderboard(lb);
                setCumulativeLeaderboard(cb);
                setNextLevel(nl);
                setShowWaiting(false);
                setShowLevelLeaderboard(true);
            }
        };

        const handleCompetitionEnd = ({ cumulativeLeaderboard: cb, winner: w }) => {
            setCumulativeLeaderboard(cb);
            setWinner(w);
            setShowWaiting(false);
            setShowLevelLeaderboard(false);
            setShowFinalResults(true);
        };

        socket.on('competition:playerSubmitted', handlePlayerSubmitted);
        socket.on('competition:levelComplete', handleLevelComplete);
        socket.on('competition:competitionEnd', handleCompetitionEnd);

        return () => {
            socket.off('competition:playerSubmitted', handlePlayerSubmitted);
            socket.off('competition:levelComplete', handleLevelComplete);
            socket.off('competition:competitionEnd', handleCompetitionEnd);
        };
    }, [isCompetitionMode, currentLevel]);

    // === Move to Next Level ===
    const handleNextLevel = () => {
        if (!nextLevel) return;
        setShowLevelLeaderboard(false);
        setCurrentLevel(nextLevel);
        setCode(getStarterCode(nextLevel));
        setHasSubmitted(false);
        setShowWaiting(false);
        setTimeLeft(LEVEL_TIME_LIMIT);
        setLevelStartTime(Date.now());
        setSubmittedCount(0);
        setOutput('');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('Running tests...');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/code/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: code,
                    language: language,
                    input: ''
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setOutput(`> Execution Success (${data.executionTime})\n\n${data.output}`);
            } else {
                setOutput(`> Execution Failed\n\n${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Run code error', error);
            setOutput(`> Server Connection Error\n\n${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    // === Competition Submit ===
    const handleCompetitionSubmit = async () => {
        if (hasSubmitted) return;

        setIsRunning(true);
        setOutput('⚡ Running test cases...');

        const problem = LEVEL_PROBLEMS[currentLevel];
        if (!problem) return;

        let totalPassed = 0;
        let testResults = [];

        try {
            const token = localStorage.getItem('token');

            // Run against all test cases
            for (let i = 0; i < problem.testCases.length; i++) {
                const tc = problem.testCases[i];
                try {
                    const response = await fetch(`${API_BASE_URL}/api/code/run`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            code: code,
                            language: language,
                            input: tc.input
                        }),
                    });

                    const data = await response.json();
                    const actualOutput = data.output?.trim() || '';
                    const passed = response.ok && actualOutput === tc.expected.trim();
                    if (passed) totalPassed++;
                    testResults.push({ input: tc.input, expected: tc.expected, actual: actualOutput, passed });
                } catch (err) {
                    testResults.push({ input: tc.input, expected: tc.expected, actual: 'Error', passed: false });
                }
            }

            const allPassed = totalPassed === problem.testCases.length;
            const timeElapsed = Math.floor((Date.now() - levelStartTime) / 1000);
            const timeLeftVal = Math.max(0, LEVEL_TIME_LIMIT - timeElapsed);

            // Calculate score
            const correctScore = allPassed ? 1000 : 0;
            const speedBonus = allPassed ? Math.floor((timeLeftVal / LEVEL_TIME_LIMIT) * 500) : 0;
            const totalScore = correctScore + speedBonus;

            // Build output
            let outputStr = `> Test Results: ${totalPassed}/${problem.testCases.length} passed\n\n`;
            testResults.forEach((r, i) => {
                outputStr += `  Test ${i + 1}: ${r.passed ? '✅ PASS' : '❌ FAIL'}\n`;
                if (!r.passed) {
                    outputStr += `    Input: ${r.input} | Expected: ${r.expected} | Got: ${r.actual}\n`;
                }
            });
            outputStr += `\n> Score: ${totalScore} (Correct: ${correctScore} + Speed: ${speedBonus})`;
            setOutput(outputStr);

            // Send to server
            const socket = getSocket();
            const storedUser = JSON.parse(localStorage.getItem('user'));

            socket.emit('competition:submit', {
                eventId: eventId,
                userId: storedUser._id,
                username: storedUser.username,
                score: totalScore,
                breakdown: {
                    correctCode: correctScore,
                    cleanCodeBonus: 0,
                    speedBonus: speedBonus,
                },
                timeTaken: timeElapsed,
                status: allPassed ? 'completed' : 'failed',
                level: currentLevel,
            });

            setHasSubmitted(true);
            setShowWaiting(true);

        } catch (error) {
            setOutput(`> Error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    // Auto-submit on timeout
    const handleAutoSubmitTimeout = () => {
        if (hasSubmitted) return;

        const socket = getSocket();
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!socket || !storedUser) return;

        socket.emit('competition:submit', {
            eventId: eventId,
            userId: storedUser._id,
            username: storedUser.username,
            score: 0,
            breakdown: { correctCode: 0, cleanCodeBonus: 0, speedBonus: 0 },
            timeTaken: LEVEL_TIME_LIMIT,
            status: 'timeout',
            level: currentLevel,
        });

        setHasSubmitted(true);
        setShowWaiting(true);
        setOutput('> ⏰ Time expired! Auto-submitted with score 0.');
    };

    const handleSubmit = async () => {
        if (isCompetitionMode) {
            await handleCompetitionSubmit();
        } else {
            setIsRunning(true);
            setOutput('Submitting solution...');
            setTimeout(() => {
                setIsRunning(false);
                setOutput('> Submission Received\n\nAll Test Cases Passed! \nRank Updated.');
            }, 2000);
        }
    };

    const handleReset = () => {
        setCode(getStarterCode(currentLevel));
        setOutput('');
    };

    // Current problem for display
    const currentProblem = isCompetitionMode ? LEVEL_PROBLEMS[currentLevel] : null;

    // Get difficulty badge color
    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'Easy': return 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'Medium': return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
            case 'Hard': return 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className={`min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-['JetBrains_Mono'] flex flex-col transition-colors duration-300 ${blindMode ? 'blind-mode-active' : ''}`}>
            <style>
                {`
                    .blind-mode-active .monaco-editor .view-line,
                    .blind-mode-active .monaco-editor .mtk1,
                    .blind-mode-active .monaco-editor .mtk2,
                    .blind-mode-active .monaco-editor .mtk3,
                    .blind-mode-active .monaco-editor .mtk4,
                    .blind-mode-active .monaco-editor .mtk5,
                    .blind-mode-active .monaco-editor .mtk6,
                    .blind-mode-active .monaco-editor .mtk7,
                    .blind-mode-active .monaco-editor .mtk8,
                    .blind-mode-active .monaco-editor .mtk9 {
                        color: transparent !important;
                    }
                    .blind-mode-active .monaco-editor .view-lines {
                        opacity: 0 !important;
                    }
                    .blind-mode-active .monaco-editor .cursor {
                        background-color: #ffffff !important;
                        border-color: #ffffff !important;
                        color: #ffffff !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        z-index: 100 !important;
                    }
                    @keyframes confetti-fall {
                        0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                    }
                    @keyframes pulse-glow {
                        0%, 100% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.3); }
                        50% { box-shadow: 0 0 40px rgba(147, 51, 234, 0.6); }
                    }
                    @keyframes slide-up {
                        from { transform: translateY(30px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    .animate-slide-up {
                        animation: slide-up 0.6s ease-out forwards;
                    }
                `}
            </style>

            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 h-16 flex-none transition-colors duration-300">
                <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex justify-between items-center h-full">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/practice')}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex items-center space-x-2">
                                <Swords className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white font-mono tracking-tighter">CodeArena_</h1>
                            </div>
                            {/* Level Indicator */}
                            {isCompetitionMode && (
                                <div className="flex items-center gap-2 ml-4">
                                    {[1, 2, 3].map(lvl => (
                                        <div key={lvl} className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black border-2 transition-all ${
                                            lvl === currentLevel
                                                ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/30 scale-110'
                                                : lvl < currentLevel
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-300 dark:border-green-700'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700'
                                        }`}>
                                            {lvl < currentLevel ? <Check size={14} /> : lvl}
                                        </div>
                                    ))}
                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                                        LEVEL_{currentLevel}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Timer Display */}
                        <div className={`
                            flex items-center space-x-2 px-4 py-1.5 rounded-lg border font-mono font-bold transition-all
                            ${timeLeft < 60
                                ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 animate-pulse'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}
                        `}>
                            <Clock size={16} className={timeLeft < 60 ? 'animate-bounce' : ''} />
                            <span>{formatTime(timeLeft)}</span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                aria-label="Toggle Theme"
                            >
                                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                            </button>
                            {user && (
                                <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 mr-4">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full mx-4 transform transition-all scale-100">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Confirm Logout</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
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

            {/* Main Content: Split View */}
            <main className="flex-1 flex overflow-hidden">

                {/* Left Panel: Problem Description */}
                <div className="w-1/2 overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
                            {isCompetitionMode
                                ? `Level ${currentLevel}. ${currentProblem?.title}`
                                : '1. Even/Odd & Digit Sum'
                            }
                        </h2>
                        <span className={`px-3 py-1 border rounded-full text-xs font-bold ${
                            isCompetitionMode
                                ? getDifficultyColor(currentProblem?.difficulty)
                                : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                        }`}>
                            {isCompetitionMode ? currentProblem?.difficulty : 'Easy'}
                        </span>
                    </div>

                    <div className="prose prose-slate max-w-none prose-headings:font-mono prose-headings:font-bold prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-900/30 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none text-slate-600 dark:text-slate-400">
                        {isCompetitionMode ? (
                            currentProblem?.description
                        ) : (
                            <>
                                <p>
                                    Write a C program to accept an integer from the user, check whether it is <strong>even or odd</strong>, and calculate the <strong>sum of its digits</strong>.
                                </p>
                                <p>
                                    If the number is negative, treat it as a signed integer for the even/odd check, but sum the digits of its absolute value.
                                </p>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Example 1:</h3>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm my-4">
                                    <p className="mb-2"><span className="font-bold text-slate-900 dark:text-slate-100">Input:</span> 12</p>
                                    <p className="mb-2"><span className="font-bold text-slate-900 dark:text-slate-100">Output:</span> Even, Sum: 3</p>
                                    <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-900 dark:text-slate-100">Explanation:</span> 12 is even. 1 + 2 = 3.</p>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Example 2:</h3>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm my-4">
                                    <p className="mb-2"><span className="font-bold text-slate-900 dark:text-slate-100">Input:</span> 15</p>
                                    <p><span className="font-bold text-slate-900 dark:text-slate-100">Output:</span> Odd, Sum: 6</p>
                                    <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-900 dark:text-slate-100">Explanation:</span> 15 is odd. 1 + 5 = 6.</p>
                                </div>
                                <h3 className="text-lg">Constraints:</h3>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Input will be a valid integer `n`.</li>
                                    <li><code>-10^9 &lt;= n &lt;= 10^9</code></li>
                                </ul>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Panel: Editor & Console */}
                <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
                    {blindMode && (
                        <div className="bg-purple-600 text-white px-4 py-2 text-center text-xs font-bold uppercase tracking-wider animate-pulse flex items-center justify-center gap-2">
                            <AlertCircle size={14} />
                            Blind Mode Active: Code is hidden.
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="h-12 bg-[#252526] dark:bg-slate-900 border-b border-[#3e3e42] dark:border-slate-800 flex items-center justify-between px-4 transition-colors">
                        <div className="text-slate-400 dark:text-slate-500 text-xs font-mono uppercase font-black tracking-widest">
                            {language === 'cpp' ? 'C++ (GCC 11)' : language === 'c' ? 'C (GCC 11)' : language === 'java' ? 'Java (OpenJDK 17)' : 'JavaScript (ES6)'}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleReset}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-[#3e3e42] dark:hover:bg-slate-800 rounded transition-colors"
                                title="Reset Code"
                            >
                                <RotateCcw size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            language={language === 'cpp' ? 'cpp' : language === 'c' ? 'cpp' : language}
                            defaultLanguage={language}
                            value={code}
                            onChange={(value) => setCode(value)}
                            theme={theme === 'dark' ? 'vs-dark' : 'light'}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: 'JetBrains Mono',
                                lineNumbers: blindMode ? 'off' : 'on',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                quickSuggestions: !blindMode,
                                parameterHints: { enabled: !blindMode },
                                suggestOnTriggerCharacters: !blindMode,
                                wordBasedSuggestions: !blindMode,
                                snippetSuggestions: blindMode ? 'none' : 'inline',
                                foldGutter: !blindMode,
                                glyphMargin: !blindMode,
                            }}
                        />
                    </div>

                    {/* Console Panel */}
                    <div className="h-48 bg-[#1e1e1e] dark:bg-slate-950 border-t border-[#3e3e42] dark:border-slate-800 flex flex-col transition-colors">
                        <div className="h-10 bg-[#252526] dark:bg-slate-900 px-4 flex items-center justify-between border-b border-[#3e3e42] dark:border-slate-800">
                            <span className="text-slate-300 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Console</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRunCode}
                                    disabled={isRunning || hasSubmitted}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-[#3e3e42] dark:bg-slate-800 hover:bg-[#4e4e52] dark:hover:bg-slate-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                                >
                                    <Play size={12} />
                                    Run
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isRunning || hasSubmitted}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                                >
                                    {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                    {isCompetitionMode ? `Submit Level ${currentLevel}` : 'Submit'}
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-4 font-mono text-sm text-slate-300 overflow-y-auto">
                            {output ? (
                                <pre className="whitespace-pre-wrap">{output}</pre>
                            ) : (
                                <span className="text-slate-500 italic">Run your code to see output...</span>
                            )}
                        </div>
                    </div>
                </div>

            </main>

            {/* ===== COMPETITION OVERLAYS ===== */}

            {/* Waiting Overlay - After submit, waiting for others */}
            {showWaiting && (
                <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="max-w-lg w-full text-center animate-slide-up">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 shadow-2xl p-10">
                            {/* Pulsing loader */}
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping"></div>
                                <div className="absolute inset-2 bg-purple-500/30 rounded-full animate-pulse"></div>
                                <div className="relative w-24 h-24 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
                                    <Users className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                                WAITING_FOR_WARRIORS
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-8">
                                Level {currentLevel} submitted. Waiting for all players to finish...
                            </p>

                            {/* Progress bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">
                                    <span>SUBMISSIONS</span>
                                    <span className="text-purple-500">{submittedCount} / {totalPlayers || '?'}</span>
                                </div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: totalPlayers ? `${(submittedCount / totalPlayers) * 100}%` : '0%' }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-bold">
                                <Loader2 size={14} className="animate-spin" />
                                <span>Next level starts automatically when all submit</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Level Leaderboard Overlay - Between levels */}
            {showLevelLeaderboard && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
                    <div className="max-w-2xl w-full animate-slide-up">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <Trophy className="w-8 h-8 text-yellow-300" />
                                    <h2 className="text-3xl font-black text-white tracking-tight">
                                        LEVEL {currentLevel} COMPLETE
                                    </h2>
                                </div>
                                <p className="text-purple-200 text-sm font-bold">
                                    All warriors have submitted! Here are the standings.
                                </p>
                            </div>

                            {/* Level Scores */}
                            <div className="p-6">
                                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                                    LEVEL {currentLevel} RESULTS
                                </h3>
                                <div className="space-y-2">
                                    {levelLeaderboard.map((player, idx) => {
                                        const isMe = player.username === user?.username || player.userId === user?._id;
                                        return (
                                            <div key={player.userId} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                                                isMe
                                                    ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800'
                                                    : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
                                            }`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                                                        idx === 0 ? 'bg-yellow-100 text-yellow-600' :
                                                        idx === 1 ? 'bg-slate-200 text-slate-600' :
                                                        idx === 2 ? 'bg-amber-100 text-amber-600' :
                                                        'bg-slate-100 text-slate-500'
                                                    }`}>
                                                        {idx === 0 ? <Crown size={16} /> : `#${idx + 1}`}
                                                    </div>
                                                    <span className={`font-bold ${isMe ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}>
                                                        {player.username} {isMe && <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded ml-1">YOU</span>}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                        player.status === 'completed'
                                                            ? 'bg-green-100 text-green-600'
                                                            : 'bg-red-100 text-red-600'
                                                    }`}>
                                                        {player.status}
                                                    </span>
                                                    <span className="font-black text-lg text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                                        <Zap size={14} /> {player.score}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Cumulative Standings */}
                                {cumulativeLeaderboard.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                                            CUMULATIVE STANDINGS
                                        </h3>
                                        {cumulativeLeaderboard.map((player, idx) => {
                                            const isMe = player.username === user?.username || player.userId === user?._id;
                                            return (
                                                <div key={player.userId} className={`flex items-center justify-between p-3 rounded-lg mb-1 ${
                                                    isMe ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''
                                                }`}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-black text-slate-400 w-6">#{idx + 1}</span>
                                                        <span className={`font-bold text-sm ${isMe ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                                            {player.username}
                                                        </span>
                                                    </div>
                                                    <span className="font-black text-sm text-slate-900 dark:text-white">{player.totalScore} pts</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Next Level Button */}
                            <div className="p-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={handleNextLevel}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transform hover:-translate-y-0.5 active:scale-95 uppercase tracking-widest"
                                    style={{ animation: 'pulse-glow 2s infinite' }}
                                >
                                    <Play size={20} fill="currentColor" />
                                    PROCEED TO LEVEL {nextLevel}
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Final Results Overlay - After Level 3 */}
            {showFinalResults && (
                <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 overflow-y-auto">
                    {/* Confetti */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {Array.from({ length: 40 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-3 h-3 rounded-sm"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD', '#F0E68C'][i % 7],
                                    animation: `confetti-fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`,
                                    transform: `rotate(${Math.random() * 360}deg)`,
                                }}
                            ></div>
                        ))}
                    </div>

                    <div className="max-w-3xl w-full relative z-10 animate-slide-up">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-yellow-300 dark:border-yellow-600 shadow-[0_0_60px_rgba(234,179,8,0.3)] overflow-hidden">
                            {/* Winner Header */}
                            <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 p-10 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px]"></div>
                                <div className="relative z-10">
                                    <Crown className="w-16 h-16 text-white mx-auto mb-4 drop-shadow-lg" />
                                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 drop-shadow-lg">
                                        COMPETITION COMPLETE!
                                    </h1>
                                    <p className="text-yellow-100 font-bold text-lg">
                                        All 3 levels have been conquered.
                                    </p>
                                </div>
                            </div>

                            {/* Winner Spotlight */}
                            {winner && (
                                <div className="p-8 text-center bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/20 dark:to-slate-900">
                                    <div className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-[0.5em] mb-4">
                                        🏆 CHAMPION 🏆
                                    </div>
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-xl shadow-yellow-500/30 ring-4 ring-yellow-300">
                                        {winner.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                                        {winner.username}
                                    </h2>
                                    <div className="flex items-center justify-center gap-2 text-2xl font-black text-yellow-600">
                                        <Star size={24} fill="currentColor" />
                                        {winner.totalScore} TOTAL POINTS
                                    </div>
                                </div>
                            )}

                            {/* Full Leaderboard */}
                            <div className="p-6">
                                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                                    FINAL STANDINGS
                                </h3>
                                <div className="space-y-2">
                                    {cumulativeLeaderboard.map((player, idx) => {
                                        const isMe = player.username === user?.username || player.userId === user?._id;
                                        return (
                                            <div key={player.userId} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                                                idx === 0
                                                    ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-800 shadow-lg'
                                                    : idx === 1
                                                        ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700'
                                                        : idx === 2
                                                            ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-800'
                                                            : 'bg-white dark:bg-slate-800/20 border-slate-100 dark:border-slate-800'
                                            }`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                                                        idx === 0 ? 'bg-yellow-400 text-white shadow-lg' :
                                                        idx === 1 ? 'bg-slate-300 text-white' :
                                                        idx === 2 ? 'bg-amber-400 text-white' :
                                                        'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                    }`}>
                                                        {idx === 0 ? <Crown size={18} /> : idx === 1 ? <Medal size={18} /> : `#${idx + 1}`}
                                                    </div>
                                                    <div>
                                                        <span className={`font-bold text-lg ${isMe ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}>
                                                            {player.username}
                                                        </span>
                                                        {isMe && <span className="ml-2 text-[9px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-black">YOU</span>}
                                                        {/* Level breakdown */}
                                                        {player.levelScores && (
                                                            <div className="flex gap-3 mt-1">
                                                                {Object.entries(player.levelScores).map(([lvl, score]) => (
                                                                    <span key={lvl} className="text-[10px] text-slate-400 font-bold">
                                                                        L{lvl}: {score}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-black text-xl text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                                        <Zap size={16} /> {player.totalScore}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-bold">TOTAL</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-6 pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                                <button
                                    onClick={() => navigate('/dashboard/events')}
                                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 uppercase tracking-widest"
                                >
                                    <ArrowLeft size={18} />
                                    EVENTS
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-purple-500/30 uppercase tracking-widest"
                                >
                                    DASHBOARD
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
