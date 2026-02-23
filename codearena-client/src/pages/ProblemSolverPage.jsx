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
    Clock,
    Sun,
    Moon
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';
import API_BASE from '../config/api';


export default function ProblemSolverPage() {
    const navigate = useNavigate();
    const { problemId } = useParams();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const [blindMode, setBlindMode] = useState(location.state?.blindMode || false);
    const [user, setUser] = useState(null);
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
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

    const languages = [
        { id: 'javascript', name: 'JavaScript', version: 'v18.0' },
        { id: 'python', name: 'Python', version: 'v3.10' },
        { id: 'cpp', name: 'C++', version: 'GCC 11' },
        { id: 'c', name: 'C', version: 'GCC 11' },
        { id: 'java', name: 'Java', version: 'JDK 17' }
    ];


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

    useEffect(() => {
        const fetchProblem = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/api/problems/${problemId}`);
                const data = await response.json();
                setProblem(data);

                if (data.templates && Array.isArray(data.templates)) {
                    const template = data.templates.find(t => t.language === language);
                    if (template) {
                        setCode(template.code);
                    }
                }

            } catch (error) {
                console.error("Failed to fetch problem", error);
                setOutput("> Error: Failed to load problem details.");
            } finally {
                setLoading(false);
            }
        };

        if (problemId) {
            fetchProblem();
        }
    }, [problemId, language]);


    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('Running code...');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/code/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: code,
                    language: language,
                    problemId: problemId,
                    input: problem?.examples?.[0]?.input || ''
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const resultOutput = data.output || data.result || 'No output received.';
                setOutput(`> Execution Success (${data.executionTime || 'N/A'})\n\n${resultOutput}`);
            } else {
                setOutput(`> Execution Failed\n\n${data.message || data.error || 'Unknown error'}`);
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
        setOutput('Submitting solution to judge...');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/problems/${problemId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: code,
                    language: language
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const sub = data.submission;
                if (sub.status === 'Accepted') {
                    setOutput(`> status: ACCEPTED\n\n✅ ${sub.passedTestCases}/${sub.totalTestCases} test cases passed!\n🚀 XP Gained: +${data.xpGained}\n⏱️ Time: ${sub.executionTime}ms`);
                } else {
                    setOutput(`> status: ${sub.status.toUpperCase()}\n\n❌ ${sub.passedTestCases}/${sub.totalTestCases} passed.\n\n${sub.error || 'Check your logic.'}`);
                }
            } else {
                setOutput(`> Error\n\n${data.message || 'Submission failed.'}`);
            }
        } catch (error) {
            console.error('Submit error', error);
            setOutput(`> Server Connection Error\n\n${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };


    const handleReset = () => {
        if (problem?.templates && Array.isArray(problem.templates)) {
            const template = problem.templates.find(t => t.language === language);
            if (template) {
                setCode(template.code);
                setOutput('');
                return;
            }
        }

        if (language === 'cpp' || language === 'c') {
            setCode('#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}');
        } else if (language === 'python') {
            setCode('# Write your solution here\ndef solve():\n    pass');
        } else {
            setCode('// Write your solution here\nfunction solve(input) {\n  return input;\n}');
        }
        setOutput('');
    };


    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);

        // Update code with template if language changes
        if (problem?.templates && Array.isArray(problem.templates)) {
            const template = problem.templates.find(t => t.language === newLang);
            if (template) {
                setCode(template.code);
                return;
            }
        }

        // Default fallbacks
        if (newLang === 'cpp' || newLang === 'c') {
            setCode('#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}');
        } else if (newLang === 'python') {
            setCode('# Write your solution here\ndef solve():\n    pass');
        } else if (newLang === 'java') {
            setCode('public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}');
        } else {
            setCode('// Write your solution here\nfunction solve(input) {\n  return input;\n}');
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
                `}
            </style>
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 h-16 flex-none transition-colors duration-300">
                <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex justify-between items-center h-full">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/singleplayer')}

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

            {/* Main Content: Split View */}
            <main className="flex-1 flex overflow-hidden">

                {/* Left Panel: Problem Description */}
                <div className="w-1/2 overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 transition-colors duration-300">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="text-slate-500 font-mono italic">SYNTESIZING_PROBLEM_DATA...</p>
                        </div>
                    ) : problem ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">{problem.title}</h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${problem.difficulty === 'Easy' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' :
                                    problem.difficulty === 'Medium' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' :
                                        'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                    }`}>
                                    {problem.difficulty}
                                </span>
                            </div>

                            <div className="prose prose-slate max-w-none prose-headings:font-mono prose-headings:font-bold prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-900/30 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none text-slate-600 dark:text-slate-400">
                                <div dangerouslySetInnerHTML={{ __html: problem.description }} />

                                {problem.examples && problem.examples.map((ex, index) => (
                                    <div key={index}>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Example {index + 1}:</h3>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm my-4">
                                            <p className="mb-2"><span className="font-bold text-slate-900 dark:text-slate-100">Input:</span> {ex.input}</p>
                                            <p className="mb-2"><span className="font-bold text-slate-900 dark:text-slate-100">Output:</span> {ex.output}</p>
                                            {ex.explanation && (
                                                <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-900 dark:text-slate-100">Explanation:</span> {ex.explanation}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {problem.constraints && (
                                    <>
                                        <h3 className="text-lg">Constraints:</h3>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {problem.constraints.map((c, i) => (
                                                <li key={i}>{c}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                            <AlertCircle size={48} className="text-red-500" />
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Problem not found</h2>
                            <p className="text-slate-500 max-w-xs">The problem you're looking for could not be localized in our database.</p>
                            <button onClick={() => navigate('/singleplayer')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold">RETURN_TO_BASE</button>
                        </div>
                    )}
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
                        <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Language:</span>
                            <select
                                value={language}
                                onChange={handleLanguageChange}
                                className="bg-[#3e3e42] dark:bg-slate-800 text-white text-xs font-mono py-1 px-3 rounded-md border border-[#555] dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-[#4e4e52] transition-colors cursor-pointer"
                            >
                                {languages.map(lang => (
                                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                                ))}
                            </select>
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
