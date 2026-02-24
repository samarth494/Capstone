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

const LEVEL_TIME_LIMIT = 15 * 60; // 15 minutes per level

export default function ProblemSolverPage() {
    const navigate = useNavigate();
    const { problemId } = useParams();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    // === Competition Mode State (Calculated first to avoid ReferenceErrors) ===
    const isCompetitionMode = (location.state?.blindMode || false) && location.state?.eventId;
    const eventId = location.state?.eventId;

    // === Basic States ===
    const [blindMode, setBlindMode] = useState(location.state?.blindMode || false);
    const [user, setUser] = useState(null);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [language, setLanguage] = useState(isCompetitionMode ? 'c' : (location.state?.language || 'javascript'));
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(!isCompetitionMode);
    const [currentLevel, setCurrentLevel] = useState(location.state?.level || 1);
    const totalLevels = location.state?.totalLevels || 3;

    // === Custom Input / Test Case Selection (LeetCode-style) ===
    const [customInput, setCustomInput] = useState('');
    const [activeTestCaseTab, setActiveTestCaseTab] = useState(0); // 0 = custom, 1+ = test case index
    const [activeConsoleTab, setActiveConsoleTab] = useState('output'); // 'output' | 'testcases'
    const [testCaseResults, setTestCaseResults] = useState([]);

    // === Competition Runtime Data ===
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
    const [compileErrorCount, setCompileErrorCount] = useState(0); // Only tracks compile/runtime errors, not wrong answers

    const languages = [
        { id: 'javascript', name: 'JavaScript', version: 'v18.0' },
        { id: 'python', name: 'Python', version: 'v3.10' },
        { id: 'cpp', name: 'C++', version: 'GCC 11' },
        { id: 'c', name: 'C', version: 'GCC 11' },
        { id: 'java', name: 'Java', version: 'JDK 17' }
    ];

    // Code state - different for competition vs regular
    const getStarterCode = (level) => {
        if (isCompetitionMode && LEVEL_PROBLEMS[level]) {
            return LEVEL_PROBLEMS[level].starterCode;
        }

        // If we have a problem object from API (singleplayer)
        if (!isCompetitionMode && problem?.templates) {
            const template = problem.templates.find(t => t.language === language);
            if (template) return template.code;
        }

        const lang = language || location.state?.language || 'javascript';
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

    // === Competition Auto-Setup ===
    useEffect(() => {
        if (isCompetitionMode) {
            setLanguage('c');
            if (problemId === 'blind-coding' && !eventId) {
                console.warn("Competition mode active but eventId missing. Redirecting...");
                navigate('/events');
            }
        }
    }, [isCompetitionMode, eventId, navigate, problemId]);

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

    // === Fetch Problem (For Singleplayer Mode) ===
    useEffect(() => {
        if (isCompetitionMode) return;

        const fetchProblem = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/problems/${problemId}`);
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
    }, [problemId, language, isCompetitionMode]);

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
        setCompileErrorCount(0);
        setTestCaseResults([]);
        setCustomInput('');
        setActiveTestCaseTab(0);
        setActiveConsoleTab('output');
        setOutput('');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Get the stdin input based on what tab is active
    const getRunInput = () => {
        if (activeTestCaseTab === 0) return customInput; // Custom input tab
        // Test case tab → use that test case's input
        const problemData = isCompetitionMode ? LEVEL_PROBLEMS[currentLevel] : problem;
        const testCases = isCompetitionMode ? problemData?.testCases : problemData?.testCases;
        if (testCases && testCases[activeTestCaseTab - 1]) {
            return testCases[activeTestCaseTab - 1].input || '';
        }
        return customInput;
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('⏳ Running code...');
        setActiveConsoleTab('output');

        const stdinInput = getRunInput();

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
                    input: stdinInput
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const resultOutput = data.output || data.result || 'No output received.';
                // If running against a specific test case, show expected vs actual
                let comparison = '';
                if (activeTestCaseTab > 0) {
                    const problemData = isCompetitionMode ? LEVEL_PROBLEMS[currentLevel] : problem;
                    const tc = problemData?.testCases?.[activeTestCaseTab - 1];
                    if (tc) {
                        const expected = (tc.expected || tc.output || '').trim();
                        const actual = resultOutput.trim();
                        const passed = actual === expected;
                        comparison = `\n\n── Test Case ${activeTestCaseTab} ──\n  Input:    ${stdinInput}\n  Expected: ${expected}\n  Output:   ${actual}\n  Status:   ${passed ? '✅ PASS' : '❌ FAIL'}`;
                    }
                }
                setOutput(`> Execution Success (${data.executionTime || 'N/A'}ms)\n\n${resultOutput}${comparison}`);
            } else {
                // Only count compile/runtime errors, NOT wrong answers
                setCompileErrorCount(prev => prev + 1);
                const errorHeadline = data.status === 'timeout' ? 'Time Limit Exceeded' : 'Compilation / Runtime Error';
                const errorMsg = data.stderr || data.output || data.message || data.error || 'Unknown error';
                setOutput(`> ❌ ${errorHeadline}\n\n${errorMsg}`);
            }
        } catch (error) {
            console.error('Run code error', error);
            setOutput(`> 🔌 Server Connection Error\n\n${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    // === Competition Submit ===
    const handleCompetitionSubmit = async () => {
        if (hasSubmitted) return;

        setIsRunning(true);
        setOutput('⚡ Running all test cases...');
        setActiveConsoleTab('testcases');

        const levelProblem = LEVEL_PROBLEMS[currentLevel];
        if (!levelProblem) return;

        let totalPassed = 0;
        let testResults = [];

        try {
            const token = localStorage.getItem('token');

            // Run against all test cases
            for (let i = 0; i < levelProblem.testCases.length; i++) {
                const tc = levelProblem.testCases[i];
                try {
                    const response = await fetch(`${API_BASE_URL}/api/code/run`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            code: code,
                            language: 'c', // Always C in competition
                            input: tc.input
                        }),
                    });

                    const data = await response.json();

                    const isSuccess = data.success && response.ok;
                    const actualOut = (data.output || '').trim();
                    const expectedOut = tc.expected.trim();

                    // Strict comparison — exact match after trimming
                    const passed = isSuccess && actualOut === expectedOut;

                    // Track compile/runtime errors (NOT wrong answers)
                    if (!isSuccess && (data.stderr || data.status === 'timeout')) {
                        setCompileErrorCount(prev => prev + 1);
                    }

                    if (passed) totalPassed++;

                    testResults.push({
                        input: tc.input,
                        expected: expectedOut,
                        actual: actualOut || (data.stderr ? 'Runtime Error' : 'No Output'),
                        passed,
                        error: !isSuccess ? (data.stderr || 'Execution Failed') : null,
                        executionTime: data.executionTime || 0
                    });
                } catch (err) {
                    setCompileErrorCount(prev => prev + 1);
                    testResults.push({ input: tc.input, expected: tc.expected, actual: 'Connection Error', passed: false, error: err.message });
                }
            }

            setTestCaseResults(testResults);

            const allPassed = totalPassed === levelProblem.testCases.length;
            const totalTests = levelProblem.testCases.length;
            const passRatio = totalTests > 0 ? totalPassed / totalTests : 0;
            const timeElapsed = Math.floor((Date.now() - levelStartTime) / 1000);
            const timeLeftVal = Math.max(0, LEVEL_TIME_LIMIT - timeElapsed);
            const timeRatio = LEVEL_TIME_LIMIT > 0 ? timeLeftVal / LEVEL_TIME_LIMIT : 0;

            // ═══════════════════════════════════════════════════════════════
            // COMPREHENSIVE FAIR SCORING SYSTEM
            // ═══════════════════════════════════════════════════════════════
            // Max possible per level: 50 + 1000 + 500 + 150 + 500 = 2200
            //
            // DESIGN PRINCIPLES:
            //   1. Correctness is KING — more test cases passed = always higher
            //   2. Speed rewards scale with performance tier
            //   3. Everyone who submits gets something (vs timeout = 0)
            //   4. Effort-based scoring prevents empty submissions gaming
            //   5. Server-side relative bonus prevents ties
            // ═══════════════════════════════════════════════════════════════

            // ── 1. PARTICIPATION (50 pts) ──
            // Awarded for manually submitting. Timeout auto-submit = 0.
            // Ensures manual submitters always rank above AFK timeouts.
            const participationBonus = 50;

            // ── 2. CORRECTNESS (0-1000 pts) ──
            // All passed: flat 1000 (perfect bonus for 100% completion)
            // Partial:    smooth curve — (passed/total)^0.8 * 800
            //             The exponent < 1 means diminishing returns are generous:
            //             1/5 passed ≈ 200pts, 3/5 passed ≈ 540pts, 4/5 ≈ 680pts
            //             This rewards partial progress fairly.
            // Zero:       0 pts
            let correctScore;
            if (allPassed) {
                correctScore = 1000;
            } else if (totalPassed > 0) {
                correctScore = Math.floor(Math.pow(passRatio, 0.8) * 800);
            } else {
                correctScore = 0;
            }

            // ── 3. EFFORT BONUS (0-150 pts) — CALCULATED FIRST (gates speed) ──
            // Rewards writing REAL code vs submitting starter unchanged.
            // Anti-gaming: strips comments & whitespace before measuring length.
            //   • Strips // single-line comments   → can't pad with // comment walls
            //   • Strips /* block comments */       → can't pad with /* ... */
            //   • Strips all whitespace             → newlines/spaces don't count
            // Only actual logic characters count toward effort score.
            const stripComments = (src) => src
                .replace(/\/\/[^\n]*/g, '')        // remove // single-line comments
                .replace(/\/\*[\s\S]*?\*\//g, '')  // remove /* block comments */
                .replace(/\s/g, '');               // remove all whitespace
            const starterCode = getStarterCode(currentLevel);
            const codeLength = stripComments(code).length;
            const starterLength = stripComments(starterCode).length;
            const codeDiff = Math.max(0, codeLength - starterLength);
            const effortBonus = Math.min(150, Math.floor(codeDiff * 1.5));

            // ── ANTI-GAMING: Minimum effort threshold ──
            // If you barely changed the starter code (< 10 non-whitespace chars added),
            // you get NO speed bonus. This prevents the exploit where someone submits
            // trivial error-free code like "return 0;" instantly to get speed points
            // without actually trying to solve the problem.
            const MIN_EFFORT_FOR_SPEED = 10; // characters of meaningful code change
            const hasMinimumEffort = codeDiff >= MIN_EFFORT_FOR_SPEED || allPassed;
            // allPassed override: if your code actually passes all tests, you earned speed
            // regardless of code length (one-liners that work should be rewarded)

            // ── 4. SPEED BONUS (tiered by performance, gated by effort) ──
            // The better you perform, the more speed matters.
            //   All passed:     0-500 pts (max reward for fast + correct)
            //   Partial pass:   0-300 pts (still rewarded for trying fast)
            //   Zero pass:      0-100 pts (small consolation for fast submit)
            // BUT: requires minimum effort threshold to prevent gaming
            let speedBonusMax;
            if (!hasMinimumEffort) {
                speedBonusMax = 0; // Anti-gaming: no speed reward for trivial submissions
            } else if (allPassed) {
                speedBonusMax = 500;
            } else if (totalPassed > 0) {
                speedBonusMax = 300;
            } else {
                speedBonusMax = 100;
            }
            const speedBonus = Math.floor(timeRatio * speedBonusMax);

            // ── 5. RELATIVE PERFORMANCE BONUS (0-500 pts) ──
            // Calculated SERVER-SIDE after all players submit.
            // Ranks players by: testsPassed (desc) → errorCount (asc) → timeTaken (asc)
            // This ensures fair differentiation in ALL scenarios:
            //   • Everyone fails:  ranked by who had fewest errors + fastest
            //   • Some pass:       passers ranked above failers
            //   • Everyone passes: ranked by fewest errors + fastest

            const totalScore = participationBonus + correctScore + speedBonus + effortBonus;

            // ── BUILD OUTPUT ──
            const perfTier = allPassed ? '🏆 PERFECT' : totalPassed > 0 ? '⚡ PARTIAL' : '🔧 ATTEMPT';
            let outputStr = `═══ SUBMISSION RESULTS ═══\n\n`;
            outputStr += `  Performance: ${perfTier}\n`;
            outputStr += `  Test Cases:  ${totalPassed}/${totalTests} passed (${Math.round(passRatio * 100)}%)\n\n`;
            testResults.forEach((r, i) => {
                outputStr += `  Case ${i + 1}: ${r.passed ? '✅ PASS' : '❌ FAIL'}`;
                if (r.executionTime) outputStr += ` (${r.executionTime}ms)`;
                outputStr += `\n`;
                if (!r.passed) {
                    outputStr += `    Input:    ${r.input}\n`;
                    outputStr += `    Expected: ${r.expected}\n`;
                    outputStr += `    Got:      ${r.actual.length > 80 ? r.actual.substring(0, 80) + '...' : r.actual}\n`;
                    if (r.error) outputStr += `    Error:    ${r.error.split('\n')[0]}\n`;
                }
            });
            outputStr += `\n═══ SCORE BREAKDOWN ═══\n`;
            outputStr += `  Participation:  +${participationBonus}\n`;
            outputStr += `  Correctness:    ${correctScore} / 1000 ${allPassed ? '(Perfect!)' : totalPassed > 0 ? `(${totalPassed}/${totalTests} passed)` : '(No tests passed)'}\n`;
            outputStr += `  Effort Bonus:   ${effortBonus} / 150${!hasMinimumEffort ? ' ⚠️ Below minimum effort!' : ''}\n`;
            outputStr += `  Speed Bonus:    ${speedBonus} / ${speedBonusMax} ${!hasMinimumEffort ? '(blocked: write more code!)' : allPassed ? '' : totalPassed > 0 ? '(partial tier)' : '(attempt tier)'}\n`;
            const isSolo = totalPlayers <= 1;
            outputStr += `  Relative Bonus: ${isSolo ? '0 (solo — no opponents to rank against)' : 'Calculated after all players submit (0-500)'}\n`;
            outputStr += `  ─────────────────────\n`;
            outputStr += `  Base Total:     ${totalScore} pts${isSolo ? '' : ' (+ up to 500 relative bonus)'}\n`;
            outputStr += `  Time Taken:     ${Math.floor(timeElapsed / 60)}m ${timeElapsed % 60}s\n`;
            outputStr += `  Compile Errors: ${compileErrorCount}`;
            setOutput(outputStr);

            // ── SEND TO SERVER ──
            const socket = getSocket();
            const storedUser = JSON.parse(localStorage.getItem('user'));

            socket.emit('competition:submit', {
                eventId: eventId,
                userId: storedUser._id,
                username: storedUser.username,
                score: totalScore,
                breakdown: {
                    participationBonus,
                    correctCode: correctScore,
                    speedBonus,
                    effortBonus,
                    relativeBonus: 0, // Server calculates after all submit
                    errorCount: compileErrorCount,
                    testsPassed: totalPassed,
                    testsTotal: totalTests,
                    passRatio: Math.round(passRatio * 100), // % for server ranking
                },
                timeTaken: timeElapsed,
                status: allPassed ? 'completed' : totalPassed > 0 ? 'partial' : 'failed',
                level: currentLevel,
            });

            setHasSubmitted(true);
            setShowWaiting(true);

        } catch (error) {
            setOutput(`> ❌ Submission Error: ${error.message}`);
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

        // Timeout = absolute minimum score. No participation, no speed, no effort.
        socket.emit('competition:submit', {
            eventId: eventId,
            userId: storedUser._id,
            username: storedUser.username,
            score: 0,
            breakdown: {
                participationBonus: 0,
                correctCode: 0,
                speedBonus: 0,
                effortBonus: 0,
                relativeBonus: 0,
                errorCount: compileErrorCount,
                testsPassed: 0,
                testsTotal: LEVEL_PROBLEMS[currentLevel]?.testCases?.length || 0,
                passRatio: 0,
            },
            timeTaken: LEVEL_TIME_LIMIT,
            status: 'timeout',
            level: currentLevel,
        });

        setHasSubmitted(true);
        setShowWaiting(true);
        setOutput('> ⏰ Time expired! Auto-submitted with score 0.\n  You receive no points for timed-out rounds.\n  Submit manually next time for participation bonus!');
    };

    const handleSubmit = async () => {
        if (isCompetitionMode) {
            await handleCompetitionSubmit();
        } else {
            setIsRunning(true);
            setOutput('⚡ Submitting to judge for verification...');

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/problems/${problemId}/submit`, {
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
                    if (data.success) {
                        setOutput(`> ✅ SOLUTION_ACCEPTED\n\nVerdict: ${data.verdict}\nPassed: ${data.passedCount}/${data.totalTests}\nRuntime: ${data.runtime}ms\n\nXP Awarded: +${problem?.xpReward || 5}`);
                        setHasSubmitted(true);
                    } else {
                        setOutput(`> ❌ SOLUTION_REJECTED\n\nVerdict: ${data.verdict}\n${data.error || ''}`);
                    }
                } else {
                    setOutput(`> ❌ Submission Failed\n\n${data.message || data.error || 'Server error'}`);
                }
            } catch (error) {
                console.error('Submit error', error);
                setOutput(`> Server Connection Error\n\n${error.message}`);
            } finally {
                setIsRunning(false);
            }
        }
    };


    const handleReset = () => {
        if (!isCompetitionMode && problem?.templates) {
            const template = problem.templates.find(t => t.language === language);
            if (template) {
                setCode(template.code);
                setOutput('');
                return;
            }
        }
        setCode(getStarterCode(currentLevel));
        setOutput('');
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);

        if (!isCompetitionMode && problem?.templates) {
            const template = problem.templates.find(t => t.language === newLang);
            if (template) {
                setCode(template.code);
            }
        }
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
                                onClick={() => navigate('/singleplayer')}

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
                                        <div key={lvl} className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black border-2 transition-all ${lvl === currentLevel
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
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="text-slate-500 font-mono italic">SYNTESIZING_PROBLEM_DATA...</p>
                        </div>
                    ) : (isCompetitionMode || problem) ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
                                    {isCompetitionMode
                                        ? `Level ${currentLevel}. ${currentProblem?.title}`
                                        : problem?.title || 'Problem Details'
                                    }
                                </h2>
                                <span className={`px-3 py-1 border rounded-full text-xs font-bold ${isCompetitionMode
                                    ? getDifficultyColor(currentProblem?.difficulty)
                                    : getDifficultyColor(problem?.difficulty)
                                    }`}>
                                    {isCompetitionMode ? currentProblem?.difficulty : (problem?.difficulty || 'Easy')}
                                </span>
                            </div>

                            <div className="prose prose-slate max-w-none prose-headings:font-mono prose-headings:font-bold prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-900/30 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none text-slate-600 dark:text-slate-400">
                                {isCompetitionMode ? (
                                    currentProblem?.description
                                ) : (
                                    <>
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
                            Blind Mode Active: Code is hidden
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="h-12 bg-[#252526] dark:bg-slate-900 border-b border-[#3e3e42] dark:border-slate-800 flex items-center justify-between px-4 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Language:</span>
                            {isCompetitionMode ? (
                                <div className="bg-[#3e3e42] text-green-400 text-xs font-mono py-1 px-3 rounded-md border border-green-800/50 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                                    C (GCC 11) — Locked
                                </div>
                            ) : (
                                <select
                                    value={language}
                                    onChange={handleLanguageChange}
                                    className="bg-[#3e3e42] dark:bg-slate-800 text-white text-xs font-mono py-1 px-3 rounded-md border border-[#555] dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-[#4e4e52] transition-colors cursor-pointer"
                                >
                                    {languages.map(lang => (
                                        <option key={lang.id} value={lang.id}>{lang.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {isCompetitionMode && (
                                <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                                    <AlertCircle size={10} />
                                    {compileErrorCount} error{compileErrorCount !== 1 ? 's' : ''}
                                </span>
                            )}
                            <button
                                onClick={handleReset}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-[#3e3e42] dark:hover:bg-slate-800 rounded transition-colors"
                                title="Reset Code"
                                disabled={hasSubmitted}
                            >
                                <RotateCcw size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 overflow-hidden" style={{ minHeight: '300px' }}>
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
                                wordBasedSuggestions: !blindMode ? 'currentDocument' : 'off',
                                snippetSuggestions: blindMode ? 'none' : 'inline',
                                foldGutter: !blindMode,
                                glyphMargin: !blindMode,
                                readOnly: hasSubmitted,
                                tabSize: 4,
                                insertSpaces: true,
                                formatOnPaste: true,
                                bracketPairColorization: { enabled: true },
                            }}
                        />
                    </div>

                    {/* ═══ Bottom Panel: Testcase Input + Console Output (LeetCode-style) ═══ */}
                    <div className="h-[280px] bg-[#1e1e1e] dark:bg-slate-950 border-t border-[#3e3e42] dark:border-slate-800 flex flex-col transition-colors">

                        {/* Tab Bar + Action Buttons */}
                        <div className="h-10 bg-[#252526] dark:bg-slate-900 px-4 flex items-center justify-between border-b border-[#3e3e42] dark:border-slate-800">
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setActiveConsoleTab('testcases')}
                                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-t transition-colors ${activeConsoleTab === 'testcases'
                                        ? 'text-white bg-[#1e1e1e] border-t-2 border-blue-500'
                                        : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    Testcase
                                </button>
                                <button
                                    onClick={() => setActiveConsoleTab('output')}
                                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-t transition-colors ${activeConsoleTab === 'output'
                                        ? 'text-white bg-[#1e1e1e] border-t-2 border-green-500'
                                        : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    Output
                                </button>
                            </div>

                            <div className="flex gap-2">
                                {(!isCompetitionMode || (isCompetitionMode && !hasSubmitted)) && (
                                    <button
                                        onClick={handleRunCode}
                                        disabled={isRunning || hasSubmitted}
                                        className="flex items-center gap-1.5 px-3 py-1 bg-[#3e3e42] dark:bg-slate-800 hover:bg-[#4e4e52] dark:hover:bg-slate-700 text-white text-xs rounded transition-colors disabled:opacity-50 font-bold"
                                    >
                                        <Play size={12} />
                                        Run
                                    </button>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    disabled={isRunning || hasSubmitted}
                                    className="flex items-center gap-1.5 px-4 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors disabled:opacity-50 font-bold"
                                >
                                    {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                    {isCompetitionMode ? `Submit Lv.${currentLevel}` : 'Submit'}
                                </button>
                            </div>
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 overflow-hidden">

                            {/* ─── Test Case Input Tab ─── */}
                            {activeConsoleTab === 'testcases' && (
                                <div className="h-full flex flex-col">
                                    {/* Quick test case selector tabs */}
                                    <div className="flex items-center gap-1 px-4 py-2 border-b border-[#3e3e42] bg-[#1e1e1e]">
                                        <button
                                            onClick={() => { setActiveTestCaseTab(0); setCustomInput(''); }}
                                            className={`px-2.5 py-1 text-[10px] font-bold rounded transition-colors ${activeTestCaseTab === 0
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-[#3e3e42] text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            Custom
                                        </button>
                                        {(() => {
                                            const problemData = isCompetitionMode ? LEVEL_PROBLEMS[currentLevel] : problem;
                                            return (problemData?.testCases || []).map((tc, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => { setActiveTestCaseTab(i + 1); setCustomInput(tc.input || ''); }}
                                                    className={`px-2.5 py-1 text-[10px] font-bold rounded transition-colors flex items-center gap-1 ${activeTestCaseTab === i + 1
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-[#3e3e42] text-slate-400 hover:text-white'
                                                        }`}
                                                >
                                                    {testCaseResults[i] && (
                                                        <span className={`w-1.5 h-1.5 rounded-full ${testCaseResults[i].passed ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                                    )}
                                                    Case {i + 1}
                                                </button>
                                            ));
                                        })()}
                                    </div>

                                    {/* Input area */}
                                    <div className="flex-1 p-4 overflow-y-auto">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                                            stdin input
                                        </label>
                                        <textarea
                                            value={customInput}
                                            onChange={(e) => setCustomInput(e.target.value)}
                                            placeholder="Enter your test input here...\nExample: 12"
                                            className="w-full h-20 bg-[#2d2d30] text-slate-200 text-sm font-mono p-3 rounded-lg border border-[#3e3e42] focus:border-blue-500 focus:outline-none resize-none placeholder-slate-600"
                                            disabled={hasSubmitted}
                                        />
                                        {activeTestCaseTab > 0 && (() => {
                                            const problemData = isCompetitionMode ? LEVEL_PROBLEMS[currentLevel] : problem;
                                            const tc = problemData?.testCases?.[activeTestCaseTab - 1];
                                            if (!tc) return null;
                                            return (
                                                <div className="mt-3 text-xs">
                                                    <span className="text-slate-500 font-bold">Expected Output: </span>
                                                    <span className="text-green-400 font-mono">{tc.expected || tc.output}</span>
                                                    {testCaseResults[activeTestCaseTab - 1] && (
                                                        <div className="mt-2">
                                                            <span className="text-slate-500 font-bold">Your Output: </span>
                                                            <span className={`font-mono ${testCaseResults[activeTestCaseTab - 1].passed ? 'text-green-400' : 'text-red-400'}`}>
                                                                {testCaseResults[activeTestCaseTab - 1].actual}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* ─── Output / Console Tab ─── */}
                            {activeConsoleTab === 'output' && (
                                <div className="h-full p-4 font-mono text-sm text-slate-300 overflow-y-auto">
                                    {output ? (
                                        <pre className="whitespace-pre-wrap">{output}</pre>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                                            <TerminalIcon size={24} />
                                            <span className="text-xs font-bold">Run your code to see output</span>
                                            <span className="text-[10px] text-slate-700">
                                                Click "Run" for a quick test or "Submit" to evaluate all test cases
                                            </span>
                                        </div>
                                    )}
                                </div>
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
                                            <div key={player.userId} className={`p-4 rounded-xl border-2 transition-all group ${isMe
                                                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-500/5'
                                                : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
                                                }`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-600' :
                                                            idx === 1 ? 'bg-slate-200 text-slate-600' :
                                                                idx === 2 ? 'bg-amber-100 text-amber-600' :
                                                                    'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {idx === 0 ? <Crown size={16} /> : `#${idx + 1}`}
                                                        </div>
                                                        <span className={`font-bold ${isMe ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}>
                                                            {player.username} {isMe && <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded ml-1 font-black">YOU</span>}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-black text-xl text-purple-600 dark:text-purple-400 flex items-center gap-1.5 transition-transform group-hover:scale-110">
                                                            <Zap size={18} fill="currentColor" /> {player.score}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase mt-1 ${player.status === 'completed'
                                                            ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                                                            : player.status === 'partial'
                                                                ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400'
                                                                : player.status === 'timeout'
                                                                    ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                                                                    : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                                                            }`}>
                                                            {player.status === 'completed' ? '✓ SOLVED'
                                                                : player.status === 'partial' ? `◐ ${player.breakdown?.testsPassed || 0}/${player.breakdown?.testsTotal || '?'} PASSED`
                                                                    : player.status === 'timeout' ? '⏰ TIMEOUT'
                                                                        : '✗ FAILED'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Detailed Points Breakdown */}
                                                {player.breakdown && (
                                                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-3 md:grid-cols-7 gap-3">
                                                        <div className="flex flex-col" title="Points for submitting (50 for manual, 0 for timeout)">
                                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Participation</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">+{player.breakdown.participationBonus || 0}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col" title="Points for test cases passed (max 1000 for all passed)">
                                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Correctness</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">+{player.breakdown.correctCode}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col" title="Bonus for faster submission (scales with performance)">
                                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Speed</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">+{player.breakdown.speedBonus}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col" title="Bonus for writing meaningful code vs starter template">
                                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Effort</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">+{player.breakdown.effortBonus || 0}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col" title="Server-calculated bonus based on relative ranking among all players">
                                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Ranking</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">+{player.breakdown.relativeBonus || 0}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col" title="Total compiler/runtime errors encountered during this level">
                                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Errors</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                                                <span className="text-xs font-bold text-red-500 group-hover:text-red-600">{player.breakdown.errorCount || 0}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col" title="Total time taken to submit">
                                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Time</span>
                                                            <div className="flex items-center gap-2">
                                                                <Clock size={12} className="text-slate-400 group-hover:text-slate-500" />
                                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">{formatTime(player.timeTaken)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
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
                                                <div key={player.userId} className={`flex items-center justify-between p-3 rounded-lg mb-1 ${isMe ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''
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
                                )
                                }
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
                                            <div key={player.userId} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${idx === 0
                                                ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-800 shadow-lg'
                                                : idx === 1
                                                    ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700'
                                                    : idx === 2
                                                        ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-800'
                                                        : 'bg-white dark:bg-slate-800/20 border-slate-100 dark:border-slate-800'
                                                }`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${idx === 0 ? 'bg-yellow-400 text-white shadow-lg' :
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

