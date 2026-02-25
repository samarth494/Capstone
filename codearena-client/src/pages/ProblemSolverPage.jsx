import React, { useState, useEffect, useRef } from 'react';
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
    X,
    Trophy,
    XCircle,
    Code,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Zap
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

export default function ProblemSolverPage() {
    const navigate = useNavigate();
    const { problemId } = useParams();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const [blindMode, setBlindMode] = useState(location.state?.blindMode || false);
    const [user, setUser] = useState(null);
    const [code, setCode] = useState(() => {
        const lang = location.state?.language || 'javascript';
        if (lang === 'cpp' || lang === 'c') {
            return '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}';
        }
        return '// Write your solution here\nfunction solve(input) {\n  return input;\n}';
    });
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [language, setLanguage] = useState(location.state?.language || 'javascript');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Submit result popup state
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [resultData, setResultData] = useState(null);
    const [showCodeInPopup, setShowCodeInPopup] = useState(false);
    const [animatedScore, setAnimatedScore] = useState(0);

    // Timer state for 15 minutes
    const [timeLeft, setTimeLeft] = useState(15 * 60);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Auto-submit when time runs out
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Animate score counting up
    useEffect(() => {
        if (showResultPopup && resultData && resultData.passed) {
            const targetScore = resultData.score;
            let current = 0;
            const step = Math.ceil(targetScore / 40);
            const interval = setInterval(() => {
                current += step;
                if (current >= targetScore) {
                    current = targetScore;
                    clearInterval(interval);
                }
                setAnimatedScore(current);
            }, 30);
            return () => clearInterval(interval);
        }
    }, [showResultPopup, resultData]);

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
            const response = await fetch('http://localhost:5000/api/code/run', {
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

    const handleSubmit = async () => {
        setIsRunning(true);
        setOutput('Submitting solution...');
        setShowCodeInPopup(false);
        setAnimatedScore(0);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/code/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: code,
                    language: language,
                    problemId: problemId || 'even-odd-digit-sum',
                    input: ''
                }),
            });

            const data = await response.json();

            if (data.compilationError) {
                // Compilation error — code didn't even compile
                setResultData({
                    passed: false,
                    score: 0,
                    testCasesPassed: 0,
                    totalTestCases: data.totalTestCases || 5,
                    executionTime: data.executionTime || '0.00s',
                    message: 'Compilation Error',
                    output: data.output,
                    errorDetails: data.output
                });
                setOutput(`> Compilation Error\n\n${data.output}`);
            } else if (data.success) {
                // All test cases passed
                const timeBonus = Math.round((timeLeft / (15 * 60)) * 40);
                const baseScore = 60;
                const totalScore = baseScore + timeBonus;

                setResultData({
                    passed: true,
                    score: totalScore,
                    testCasesPassed: data.testCasesPassed,
                    totalTestCases: data.totalTestCases,
                    executionTime: data.executionTime || '0.012s',
                    message: data.message || 'All test cases passed!',
                    output: data.output
                });
                setOutput(`> Submission Successful\n\nAll Test Cases Passed!\nScore: ${totalScore}/100`);
            } else {
                // Some or all test cases failed
                const score = data.score || Math.round((data.testCasesPassed / data.totalTestCases) * 60);

                setResultData({
                    passed: false,
                    score: score,
                    testCasesPassed: data.testCasesPassed || 0,
                    totalTestCases: data.totalTestCases || 5,
                    executionTime: data.executionTime || '0.04s',
                    message: data.message || 'Some test cases failed.',
                    output: data.output,
                    errorDetails: data.output
                });
                setOutput(`> Submission Failed\n\n${data.output}`);
            }

            setShowResultPopup(true);

        } catch (error) {
            // Server/network error - treat as fail
            setResultData({
                passed: false,
                score: 0,
                testCasesPassed: 0,
                totalTestCases: 5,
                executionTime: '—',
                message: 'Server connection error. Please try again.',
                output: error.message,
                errorDetails: `Connection Error: ${error.message}`
            });
            setShowResultPopup(true);
            setOutput(`> Server Connection Error\n\n${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleReset = () => {
        const lang = language;
        if (lang === 'cpp' || lang === 'c') {
            setCode('#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}');
        } else {
            setCode('// Write your solution here\nfunction solve(input) {\n  return input;\n}');
        }
        setOutput('');
    };

    const handleClosePopup = () => {
        setShowResultPopup(false);
        setResultData(null);
        setShowCodeInPopup(false);
        setAnimatedScore(0);
    };

    // Generate confetti particles for pass animation
    const renderConfetti = () => {
        const particles = [];
        const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];
        for (let i = 0; i < 40; i++) {
            const style = {
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`,
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                width: `${4 + Math.random() * 6}px`,
                height: `${4 + Math.random() * 6}px`,
            };
            particles.push(
                <div
                    key={i}
                    className="confetti-particle"
                    style={style}
                />
            );
        }
        return particles;
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

                    /* Result Popup Animations */
                    @keyframes popupSlideIn {
                        from {
                            opacity: 0;
                            transform: scale(0.95) translateY(30px);
                            filter: blur(10px);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                            filter: blur(0px);
                        }
                    }

                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }

                    @keyframes confettiFall {
                        0% {
                            opacity: 1;
                            transform: translateY(-20px) rotate(0deg);
                        }
                        100% {
                            opacity: 0;
                            transform: translateY(600px) rotate(720deg);
                        }
                    }

                    @keyframes scoreCount {
                        from { opacity: 0; transform: scale(0.5); }
                        to { opacity: 1; transform: scale(1); }
                    }

                    @keyframes slideDown {
                        from { max-height: 0; opacity: 0; }
                        to { max-height: 500px; opacity: 1; }
                    }

                    .popup-enter {
                        animation: popupSlideIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    }

                    .confetti-particle {
                        position: absolute;
                        top: 0;
                        border-radius: 2px;
                        animation: confettiFall linear forwards;
                        pointer-events: none;
                    }

                    .score-animate {
                        animation: scoreCount 0.5s ease-out forwards;
                    }

                    .code-reveal {
                        animation: slideDown 0.4s ease-out forwards;
                        overflow: hidden;
                    }

                    /* Progress bar animation */
                    @keyframes progressFill {
                        from { width: 0%; }
                    }

                    .progress-animate {
                        animation: progressFill 1s ease-out forwards;
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

            {/* =================== RESULT POPUP MODAL =================== */}
            {showResultPopup && resultData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 dark:bg-slate-950/98 backdrop-blur-3xl transition-colors duration-500">
                    {/* Background Decor */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[150px] rounded-full animate-pulse ${resultData.passed ? 'bg-emerald-500/5 dark:bg-emerald-600/10' : 'bg-red-500/5 dark:bg-red-600/10'}`}></div>
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
                        {/* Grid overlay */}
                        <div className="grid grid-cols-12 gap-0 absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
                            {Array.from({ length: 144 }).map((_, i) => (
                                <div key={i} className="border border-slate-900 dark:border-white aspect-square"></div>
                            ))}
                        </div>
                    </div>

                    {/* Confetti for pass */}
                    {resultData.passed && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {renderConfetti()}
                        </div>
                    )}

                    <div className="relative z-10 max-w-2xl w-full mx-4 popup-enter">
                        {/* Top Status Icon with Rotating Rings */}
                        <div className="flex justify-center mb-10">
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                {/* Rotating outer ring */}
                                <div className={`absolute inset-0 rounded-full border-4 border-dashed opacity-40 animate-spin ${resultData.passed ? 'border-emerald-300 dark:border-emerald-700' : 'border-red-300 dark:border-red-800'}`} style={{ animationDuration: '10s' }}></div>
                                {/* Rotating inner ring */}
                                <div className={`absolute inset-6 rounded-full border-2 border-dashed opacity-60 ${resultData.passed ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-900'}`} style={{ animation: 'spin 15s linear infinite reverse' }}></div>
                                {/* Glow */}
                                <div className={`absolute inset-0 rounded-full blur-2xl ${resultData.passed ? 'bg-emerald-500/10 dark:bg-emerald-500/20' : 'bg-red-500/10 dark:bg-red-500/20'}`}></div>
                                {/* Center Icon */}
                                <div className={`relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center border-2 shadow-2xl ${resultData.passed ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700' : 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-800'}`}>
                                    {resultData.passed
                                        ? <Trophy className="w-10 h-10 text-emerald-600 dark:text-emerald-400 drop-shadow-lg" />
                                        : <XCircle className="w-10 h-10 text-red-600 dark:text-red-400 drop-shadow-lg" />
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-10">
                            <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase transition-colors mb-3 italic font-mono">
                                {resultData.passed ? 'MISSION_COMPLETE' : 'EXECUTION_FAILED'}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold italic max-w-md mx-auto">
                                {resultData.passed
                                    ? '"All protocols executed successfully. Target objectives achieved."'
                                    : '"Critical errors detected in execution pipeline. Review required."'}
                            </p>
                        </div>

                        {/* Main Card */}
                        <div className={`bg-white dark:bg-slate-900 rounded-[2rem] border-2 shadow-2xl overflow-hidden transition-all ${resultData.passed ? 'border-emerald-200 dark:border-emerald-800/50' : 'border-red-200 dark:border-red-800/50'}`}>
                            
                            {/* Card Header */}
                            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl border transition-colors ${resultData.passed ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50'}`}>
                                        {resultData.passed ? <Check className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg text-slate-900 dark:text-white transition-colors tracking-tight uppercase">PERFORMANCE_REPORT</h3>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Analysis Complete</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClosePopup}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Score Display */}
                                <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-8 rounded-[1.5rem] border-2 border-slate-700 shadow-2xl text-center relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-full bg-white/5 skew-x-[-30deg] translate-x-32 group-hover:translate-x-24 transition-all duration-1000"></div>
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">SCORE_ANALYSIS</p>
                                        <div className="score-animate">
                                            <span className={`text-7xl font-black font-mono tabular-nums tracking-tighter ${resultData.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {resultData.passed ? animatedScore : resultData.score}
                                            </span>
                                            <span className="text-3xl font-bold text-slate-500">/100</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Test Cases Progress */}
                                <div className="bg-white dark:bg-slate-800/30 rounded-[1.5rem] p-6 border-2 border-slate-100 dark:border-slate-800 transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                                <Code size={16} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">TEST_CASE_RESULTS</span>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase shadow-lg border border-white/5 ${resultData.passed ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                                            {resultData.testCasesPassed}/{resultData.totalTestCases} PASSED
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden p-1 border border-slate-200 dark:border-slate-600">
                                        <div
                                            className={`h-full rounded-full progress-animate transition-all shadow-lg relative ${resultData.passed
                                                ? 'bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                                                : 'bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}
                                            style={{ width: `${(resultData.testCasesPassed / resultData.totalTestCases) * 100}%` }}
                                        >
                                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:15px_15px]"></div>
                                        </div>
                                    </div>
                                    {/* Individual test case indicators */}
                                    <div className="flex gap-2 mt-4">
                                        {Array.from({ length: resultData.totalTestCases }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`flex-1 h-2 rounded-full transition-all ${i < resultData.testCasesPassed
                                                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                                    : 'bg-red-500/60 dark:bg-red-600/60'}`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Execution Metrics */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="group bg-white dark:bg-slate-800/30 rounded-[1.5rem] p-5 border-2 border-slate-100 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-900/50 transition-all hover:shadow-xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-900/50 transition-all group-hover:scale-110">
                                                <Zap size={16} className="text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">EXEC_TIME</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{resultData.executionTime}</p>
                                    </div>
                                    <div className="group bg-white dark:bg-slate-800/30 rounded-[1.5rem] p-5 border-2 border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900/50 transition-all hover:shadow-xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-900/50 transition-all group-hover:scale-110">
                                                <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">TIME_LEFT</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{formatTime(timeLeft)}</p>
                                    </div>
                                </div>

                                {/* Error Details (for fail) */}
                                {!resultData.passed && resultData.errorDetails && (
                                    <div className="bg-red-500/10 dark:bg-red-500/10 p-5 rounded-[1.5rem] border-2 border-red-500/20 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
                                            <span className="font-black text-xs uppercase tracking-widest text-red-600 dark:text-red-400">ERROR_LOG</span>
                                        </div>
                                        <pre className="text-xs text-red-600 dark:text-red-400 font-mono whitespace-pre-wrap bg-red-900/10 dark:bg-red-900/30 rounded-xl p-4 max-h-32 overflow-y-auto border border-red-200 dark:border-red-800">
                                            {resultData.errorDetails}
                                        </pre>
                                    </div>
                                )}

                                {/* Code Reveal Toggle (for blind mode) */}
                                {blindMode && (
                                    <div>
                                        <button
                                            onClick={() => setShowCodeInPopup(!showCodeInPopup)}
                                            className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-purple-500/10 dark:bg-purple-500/10 border-2 border-purple-500/20 rounded-[1.5rem] text-purple-700 dark:text-purple-400 hover:bg-purple-500/15 transition-all font-black text-xs uppercase tracking-widest group"
                                        >
                                            {showCodeInPopup ? <EyeOff size={16} /> : <Eye size={16} />}
                                            {showCodeInPopup ? 'HIDE_SOURCE_CODE' : 'REVEAL_SOURCE_CODE'}
                                            {showCodeInPopup ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>

                                        {showCodeInPopup && (
                                            <div className="code-reveal mt-4">
                                                <div className="bg-[#1e1e1e] rounded-[1.5rem] overflow-hidden border-2 border-slate-700">
                                                    {/* Code header */}
                                                    <div className="flex items-center px-5 py-3 bg-[#252526] border-b border-[#3e3e42]">
                                                        <div className="flex space-x-1.5 mr-4">
                                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                        </div>
                                                        <Code size={12} className="text-slate-400 mr-2" />
                                                        <span className="text-[10px] text-slate-400 font-mono font-black uppercase tracking-widest">your_submission.{language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language === 'java' ? 'java' : 'js'}</span>
                                                    </div>
                                                    {/* Code content */}
                                                    <pre className="p-5 text-xs font-mono text-slate-300 overflow-x-auto max-h-48 overflow-y-auto leading-relaxed">
                                                        <code>{code}</code>
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-4 mt-2">
                                    {resultData.passed ? (
                                        <button
                                            onClick={() => {
                                                handleClosePopup();
                                                navigate(blindMode ? '/competition/blind-coding/lobby' : '/practice');
                                            }}
                                            className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest"
                                        >
                                            <Sparkles size={18} />
                                            PROCEED_TO_NEXT
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleClosePopup}
                                                className="flex-1 px-6 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 uppercase tracking-widest hover:-translate-y-1 active:scale-95"
                                            >
                                                <RotateCcw size={16} />
                                                RETRY
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleClosePopup();
                                                    navigate(blindMode ? '/competition/blind-coding/lobby' : '/practice');
                                                }}
                                                className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest"
                                            >
                                                <LogOut size={16} />
                                                ABORT
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* =================== END RESULT POPUP =================== */}

            {/* Main Content: Split View */}
            <main className="flex-1 flex overflow-hidden">

                {/* Left Panel: Problem Description */}
                <div className="w-1/2 overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">1. Even/Odd & Digit Sum</h2>
                        <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-full text-xs font-bold">Easy</span>
                    </div>

                    <div className="prose prose-slate max-w-none prose-headings:font-mono prose-headings:font-bold prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-900/30 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none text-slate-600 dark:text-slate-400">
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
                                    disabled={isRunning}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-[#3e3e42] dark:bg-slate-800 hover:bg-[#4e4e52] dark:hover:bg-slate-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                                >
                                    <Play size={12} />
                                    Run
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isRunning}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                                >
                                    <Check size={12} />
                                    Submit
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
        </div>
    );
}
