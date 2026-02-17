import React, { useState, useEffect } from 'react';
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
    Clock
} from 'lucide-react';

export default function ProblemSolverPage() {
    const navigate = useNavigate();
    const { problemId } = useParams();
    const location = useLocation();
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

    // Timer state for 15 minutes
    const [timeLeft, setTimeLeft] = useState(15 * 60);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Optionally auto-submit here
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

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
            const response = await fetch('http://10.252.225.132:5000/api/code/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: code,
                    language: language,
                    input: '' // In the future, this could come from user input or test cases
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

        // Mock submission for now
        setTimeout(() => {
            setIsRunning(false);
            setOutput('> Submission Received\n\nAll Test Cases Passed! \nRank Updated.');
        }, 2000);
    };

    const handleReset = () => {
        setCode('// Write your solution here\nfunction solve(input) {\n  return input;\n}');
        setOutput('');
    };

    return (
        <div className={`min-h-screen bg-[#F8FAFC] font-['JetBrains_Mono'] flex flex-col ${blindMode ? 'blind-mode-active' : ''}`}>
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
                `}
            </style>
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 flex-none">
                <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex justify-between items-center h-full">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/practice')}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex items-center space-x-2">
                                <Swords className="w-6 h-6 text-blue-600" />
                                <h1 className="text-lg font-bold text-slate-900 font-mono tracking-tighter">CodeArena_</h1>
                            </div>
                        </div>

                        {/* Timer Display */}
                        <div className={`
                            flex items-center space-x-2 px-4 py-1.5 rounded-lg border font-mono font-bold transition-all
                            ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200'}
                        `}>
                            <Clock size={16} className={timeLeft < 60 ? 'animate-bounce' : ''} />
                            <span>{formatTime(timeLeft)}</span>
                        </div>

                        <div className="flex items-center space-x-4">
                            {user && (
                                <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600 mr-4">
                                    <TerminalIcon size={16} />
                                    <span>{user.username}</span>
                                </div>
                            )}
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="flex items-center space-x-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium"
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
                    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full mx-4 transform transition-all scale-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Logout</h3>
                        <p className="text-slate-500 mb-6">
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
                <div className="w-1/2 overflow-y-auto border-r border-slate-200 bg-white p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">1. Even/Odd & Digit Sum</h2>
                        <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-full text-xs font-bold">Easy</span>
                    </div>

                    <div className="prose prose-slate max-w-none prose-headings:font-mono prose-headings:font-bold prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none text-slate-600">
                        <p>
                            Write a C program to accept an integer from the user, check whether it is <strong>even or odd</strong>, and calculate the <strong>sum of its digits</strong>.
                        </p>
                        <p>
                            If the number is negative, treat it as a signed integer for the even/odd check, but sum the digits of its absolute value.
                        </p>

                        <h3 className="text-lg">Example 1:</h3>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-sm my-4">
                            <p className="mb-2"><span className="font-bold text-slate-900">Input:</span> 12</p>
                            <p className="mb-2"><span className="font-bold text-slate-900">Output:</span> Even, Sum: 3</p>
                            <p><span className="font-bold text-slate-900">Explanation:</span> 12 is even. 1 + 2 = 3.</p>
                        </div>

                        <h3 className="text-lg">Example 2:</h3>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-sm my-4">
                            <p className="mb-2"><span className="font-bold text-slate-900">Input:</span> 15</p>
                            <p><span className="font-bold text-slate-900">Output:</span> Odd, Sum: 6</p>
                            <p><span className="font-bold text-slate-900">Explanation:</span> 15 is odd. 1 + 5 = 6.</p>
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
                    <div className="h-12 bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between px-4">
                        <div className="text-slate-400 text-xs font-mono uppercase font-black tracking-widest">
                            {language === 'cpp' ? 'C++ (GCC 11)' : language === 'c' ? 'C (GCC 11)' : language === 'java' ? 'Java (OpenJDK 17)' : 'JavaScript (ES6)'}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleReset}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-[#3e3e42] rounded transition-colors"
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
                            theme="vs-dark"
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
                    <div className="h-48 bg-[#1e1e1e] border-t border-[#3e3e42] flex flex-col">
                        <div className="h-10 bg-[#252526] px-4 flex items-center justify-between border-b border-[#3e3e42]">
                            <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">Console</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRunCode}
                                    disabled={isRunning}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-[#3e3e42] hover:bg-[#4e4e52] text-white text-xs rounded transition-colors disabled:opacity-50"
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
