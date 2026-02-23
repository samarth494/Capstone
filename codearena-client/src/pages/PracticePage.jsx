import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Swords,
    LogOut,
    Search,
    Filter,
    CheckCircle,
    Play,
    Terminal as TerminalIcon
} from 'lucide-react';

export default function PracticePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('token') || !localStorage.getItem('user')) {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Mock data for problems
    const problems = [
        { id: 1, title: 'Two Sum', difficulty: 'Easy', tags: ['Array', 'Hash Table'], status: 'Solved' },
        { id: 2, title: 'Add Two Numbers', difficulty: 'Medium', tags: ['Linked List', 'Math'], status: 'Unsolved' },
        { id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', tags: ['String', 'Sliding Window', 'Hash Table'], status: 'Solved' },
        { id: 4, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', tags: ['Array', 'Binary Search', 'Divide and Conquer'], status: 'Unsolved' },
        { id: 5, title: 'Longest Palindromic Substring', difficulty: 'Medium', tags: ['String', 'DP'], status: 'Unsolved' },
        { id: 6, title: 'Zigzag Conversion', difficulty: 'Medium', tags: ['String'], status: 'Solved' },
        { id: 7, title: 'Reverse Integer', difficulty: 'Medium', tags: ['Math'], status: 'Unsolved' },
        { id: 8, title: 'String to Integer (atoi)', difficulty: 'Medium', tags: ['String'], status: 'Unsolved' },
        { id: 9, title: 'Palindrome Number', difficulty: 'Easy', tags: ['Math'], status: 'Solved' },
        { id: 10, title: 'Regular Expression Matching', difficulty: 'Hard', tags: ['String', 'DP', 'Recursion'], status: 'Unsolved' },
        { id: 11, title: 'Container With Most Water', difficulty: 'Medium', tags: ['Array', 'Two Pointers'], status: 'Solved' },
        { id: 12, title: 'Integer to Roman', difficulty: 'Medium', tags: ['Math', 'String'], status: 'Unsolved' },
    ];

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'Medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            case 'Hard': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
        }
    };

    const filteredProblems = problems.filter(problem => {
        const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All' || problem.difficulty === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-['JetBrains_Mono'] transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2 cursor-pointer transition-all hover:scale-105" onClick={() => navigate('/dashboard')}>
                            <Swords className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter transition-colors">CodeArena_</h1>
                        </div>

                        <nav className="hidden md:flex space-x-8 font-mono text-sm">
                            <button onClick={() => navigate('/practice')} className="text-blue-600 dark:text-blue-400 font-bold transition-colors">./Practice</button>
                            <button onClick={() => navigate('/lobby')} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">./Battle</button>
                            <button onClick={() => navigate('/leaderboard')} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">./Leaderboard</button>
                        </nav>

                        <div className="flex items-center space-x-4">
                            {user && (
                                <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 mr-4 transition-colors">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-sm w-full mx-4 transform transition-all scale-100">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Confirm Logout</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed transition-colors">
                            Are you sure you want to terminate your session and exit the practice arena?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                            >
                                <LogOut size={18} />
                                <span>TERMINATE_SESSION</span>
                            </button>
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="w-full px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Page Title & Stats */}
                <div className="mb-10">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 font-mono flex items-center gap-4 tracking-tight transition-colors">
                        <span className="text-blue-600 dark:text-blue-400">&gt;</span> PRACTICE_PROBLEMS
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-mono text-lg transition-colors">
                        Expand your cognitive horizons through algorithmic challenges.
                    </p>
                </div>

                {/* Filters & Search */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl mb-8 flex flex-col md:flex-row gap-6 justify-between items-center transition-colors">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            className="w-full pl-12 pr-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all font-mono text-sm text-slate-900 dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {['All', 'Easy', 'Medium', 'Hard'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-6 py-3 rounded-xl text-sm font-black tracking-widest transition-all whitespace-nowrap border-2 ${activeFilter === filter
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                            >
                                {filter.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Problems List */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 font-black">
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 w-1/3">Challenge_Title</th>
                                    <th className="px-8 py-5">Level</th>
                                    <th className="px-8 py-5">Tags</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredProblems.length > 0 ? (
                                    filteredProblems.map((problem) => (
                                        <tr key={problem.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                                            <td className="px-8 py-6">
                                                {problem.status === 'Solved' ? (
                                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                                        <CheckCircle size={16} />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-blue-400 transition-colors"></div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 font-mono font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                <span className="text-slate-400 dark:text-slate-600 mr-2">{problem.id.toString().padStart(3, '0')}</span>
                                                {problem.title}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border transition-colors ${getDifficultyColor(problem.difficulty)}`}>
                                                    {problem.difficulty.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-2 flex-wrap">
                                                    {problem.tags.slice(0, 2).map((tag, idx) => (
                                                        <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition-colors">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {problem.tags.length > 2 && (
                                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 py-1">+{problem.tags.length - 2}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => navigate(`/problem/${problem.id}`)}
                                                    className="inline-flex items-center gap-2 bg-blue-600 dark:bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-black tracking-widest hover:bg-blue-700 dark:hover:bg-blue-500 shadow-lg shadow-blue-500/20 transform active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <span>INIT_SOLVE</span>
                                                    <Play size={10} className="fill-current" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center text-slate-500 dark:text-slate-400 font-mono tracking-widest transition-colors bg-slate-50/20 dark:bg-slate-800/20">
                                            -- NO_DATA_MATCHES_CRITERIA --
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}

