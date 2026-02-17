import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
    Swords,
    LogOut,
    Play,
    Terminal as TerminalIcon,
    ArrowLeft,
    RotateCcw,
    Check,
    Code,
    Award
} from 'lucide-react';

export default function ProblemSolverPage() {
    const navigate = useNavigate();
    const { problemId } = useParams();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [code, setCode] = useState('// Loading template...');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [language, setLanguage] = useState('javascript');
    const [activeTab, setActiveTab] = useState('description');
    const [submissionResult, setSubmissionResult] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [customInput, setCustomInput] = useState('');
    const [activeConsoleTab, setActiveConsoleTab] = useState('output');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }

        fetchProblem();
        fetchSubmissions();
    }, [problemId, navigate]);

    const fetchProblem = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/problems/${problemId}`);
            if (!response.ok) throw new Error('Problem not found');
            const data = await response.json();
            setProblem(data);

            const template = data.templates?.find(t => t.language === language)?.code || '// Write your code here';
            setCode(template);
        } catch (error) {
            console.error(error);
            setOutput('Failed to load problem.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`http://localhost:5000/api/problems/${problemId}/submissions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSubmissions(data);
            }
        } catch (error) {
            console.error("Failed to load submissions", error);
        }
    };

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        const template = problem?.templates?.find(t => t.language === newLang)?.code || '// Write your code here';
        setCode(template);
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('Compiling and running...');
        setSubmissionResult(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/code/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code,
                    language,
                    input: customInput || problem?.examples[0]?.input || ''
                }),
            });

            const data = await response.json();
            setActiveConsoleTab('output');
            if (response.ok) {
                setOutput(`> Output:\n${data.output}\n\n> Execution Time: ${data.executionTime}`);
            } else {
                setOutput(`> Error:\n${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            setOutput(`> Network Error:\n${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        setIsRunning(true);
        setOutput('Submitting solution to judge...');
        setSubmissionResult(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/problems/${problemId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code, language }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmissionResult(data);
                if (data.submission.status === 'Accepted') {
                    setOutput(`> Success! All test cases passed.\n> Runtime: ${data.submission.executionTime}ms\n> XP Gained: ${data.xpGained}`);
                    if (data.xpGained > 0) {
                        const updatedUser = { ...user, xp: (user.xp || 0) + data.xpGained };
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                } else {
                    setOutput(`> Failed: ${data.submission.status}\n> Passed: ${data.submission.passedTestCases}/${data.submission.totalTestCases} test cases.\n${data.submission.error ? '> Error:\n' + data.submission.error : ''}`);
                }
                fetchSubmissions();
            } else {
                setOutput(`> Submission Error: ${data.message}`);
            }
        } catch (error) {
            setOutput(`> Network Error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-500">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                Loading Problem...
            </div>
        </div>
    );

    if (!problem) return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-500">
            <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Problem Not Found</h2>
                <button onClick={() => navigate('/singleplayer')} className="text-blue-600 hover:underline">Return to Problems</button>
            </div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-['JetBrains_Mono'] overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0 shadow-sm">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/singleplayer')}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
                        title="Back to Problems"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                            <Swords className="w-4 h-4 text-blue-600" />
                        </div>
                        <h1 className="font-bold text-slate-900 tracking-tight text-lg">
                            {problem.title}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {user && (
                        <div className="hidden md:flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                            <span className="text-slate-600 font-bold">{user.username}</span>
                            <span className="text-yellow-600 flex items-center gap-1 font-bold">
                                <Award size={14} /> {user.xp || 0} XP
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content Split View */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Panel: Problem Description */}
                <div className="w-1/2 flex flex-col border-r border-slate-200 bg-white">
                    {/* Tabs */}
                    <div className="h-12 bg-white border-b border-slate-200 flex px-2 text-sm font-bold tracking-wide uppercase text-slate-400">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`px-4 h-full flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'description'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent hover:text-slate-600'
                                }`}
                        >
                            <Code size={16} /> Problem_Desc
                        </button>
                        <button
                            onClick={() => setActiveTab('submissions')}
                            className={`px-4 h-full flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'submissions'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent hover:text-slate-600'
                                }`}
                        >
                            <Award size={16} /> Submissions
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">

                        {activeTab === 'description' && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-3xl font-black text-slate-900">{problem.title}</h2>
                                    <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${problem.difficulty === 'Easy' ? 'text-green-600 border-green-200 bg-green-50' :
                                        problem.difficulty === 'Medium' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' :
                                            'text-red-600 border-red-200 bg-red-50'
                                        }`}>
                                        {problem.difficulty}
                                    </span>
                                </div>

                                <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-strong:text-slate-900 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-bold prose-pre:bg-slate-900 prose-pre:text-slate-50">
                                    {problem.description}
                                </div>

                                {/* Examples */}
                                <div className="space-y-6 mt-8">
                                    {problem.examples.map((example, i) => (
                                        <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Example {i + 1}</h3>
                                            <div className="space-y-2 font-mono text-sm">
                                                <div>
                                                    <span className="font-bold text-slate-700">Input:</span>
                                                    <span className="text-slate-900 ml-2 bg-white px-2 py-0.5 rounded border border-slate-200/50">{example.input}</span>
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-700">Output:</span>
                                                    <span className="text-slate-900 ml-2 bg-white px-2 py-0.5 rounded border border-slate-200/50">{example.output}</span>
                                                </div>
                                                {example.explanation && (
                                                    <div className="pt-2">
                                                        <span className="font-bold text-slate-700">Explanation:</span>
                                                        <span className="text-slate-600 ml-2 block mt-1 leading-relaxed">{example.explanation}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Constraints */}
                                <div className="mt-8">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Constraints</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm marker:text-slate-400">
                                        {problem.constraints.map((c, i) => (
                                            <li key={i} className="font-mono text-xs font-medium">{c}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === 'submissions' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Your Submissions</h2>
                                {submissions.length === 0 ? (
                                    <p className="text-slate-500 italic">No submissions yet.</p>
                                ) : (
                                    <div className="overflow-hidden border border-slate-200 rounded-lg">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Runtime</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-slate-200">
                                                {submissions.map((sub) => (
                                                    <tr key={sub._id}>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                                sub.status === 'Wrong Answer' ? 'bg-red-100 text-red-800' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {sub.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                                                            {sub.executionTime}ms
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                                                            {new Date(sub.createdAt).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Editor (Dark Environment in Light Frame) */}
                <div className="w-1/2 flex flex-col bg-[#1E1E1E]">

                    {/* Editor Toolbar - Light on Top */}
                    <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Language:</span>
                            <select
                                value={language}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                className="bg-slate-50 text-slate-700 text-xs font-bold rounded border border-slate-200 px-2 py-1 outline-none focus:border-blue-500 uppercase"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                            </select>
                        </div>

                        <button
                            onClick={() => {
                                const t = problem?.templates?.find(x => x.language === language)?.code;
                                if (t) setCode(t);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Reset Code"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 relative">
                        <Editor
                            height="100%"
                            language={language === 'c' || language === 'cpp' ? 'cpp' : language}
                            value={code}
                            onChange={(val) => setCode(val)}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                fontFamily: 'JetBrains Mono',
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 16 }
                            }}
                        />
                    </div>

                    {/* Console & Actions - White Footer like BattleArena */}
                    <div className="h-60 bg-white border-t border-slate-200 flex flex-col z-10 transition-all">
                        {/* Console Header */}
                        <div className="h-12 bg-white px-6 flex items-center justify-between border-b border-slate-100">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setActiveConsoleTab('output')}
                                    className={`text-[10px] font-black uppercase tracking-widest transition-colors ${activeConsoleTab === 'output' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Output
                                </button>
                                <button
                                    onClick={() => setActiveConsoleTab('input')}
                                    className={`text-[10px] font-black uppercase tracking-widest transition-colors ${activeConsoleTab === 'input' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Custom_Input
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleRunCode}
                                    disabled={isRunning}
                                    className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Play size={12} />
                                    Test_Run
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isRunning}
                                    className="flex items-center gap-2 px-6 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded-lg shadow-md hover:translate-y-[-1px] transition-all disabled:opacity-50"
                                >
                                    <Check size={12} />
                                    Submit_Solution
                                </button>
                            </div>
                        </div>

                        {/* Console Content */}
                        <div className="flex-1 p-6 font-mono text-xs text-slate-300 overflow-y-auto bg-[#1e1e1e]">
                            {activeConsoleTab === 'output' ? (
                                output ? (
                                    <pre className={`whitespace-pre-wrap ${submissionResult?.submission?.status === 'Accepted' ? 'text-green-400' :
                                            submissionResult?.submission?.status ? 'text-red-400' : 'text-slate-300'
                                        }`}>{output}</pre>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                                        <TerminalIcon size={24} className="mb-2" />
                                        <span>Ready for execution...</span>
                                    </div>
                                )
                            ) : (
                                <textarea
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    placeholder="Enter custom input here..."
                                    className="w-full h-full bg-transparent text-slate-300 outline-none resize-none font-mono text-xs"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full mx-4">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Logout</h3>
                        <p className="text-slate-500 mb-6">Are you sure you want to exit?</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">Logout</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
