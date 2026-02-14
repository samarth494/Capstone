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
            case 'Easy': return 'text-green-600 bg-green-50 border-green-200';
            case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'Hard': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-slate-600 bg-slate-50 border-slate-200';
        }
    };

    const filteredProblems = problems.filter(problem => {
        const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All' || problem.difficulty === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-['JetBrains_Mono']">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                            <Swords className="w-8 h-8 text-blue-600" />
                            <h1 className="text-xl font-bold text-slate-900 font-mono tracking-tighter">CodeArena_</h1>
                        </div>

                        <nav className="hidden md:flex space-x-8 font-mono text-sm">
                            <a href="#" className="text-blue-600 font-bold transition-colors">./Practice</a>
                            <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">./Battle</a>
                            <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">./Leaderboard</a>
                        </nav>

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

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Page Title & Stats */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2 font-mono flex items-center gap-3">
                        <span className="text-blue-600">&gt;</span> PRACTICE_PROBLEMS
                    </h2>
                    <p className="text-slate-500 font-mono">
                        Select a challenge to sharpen your skills.
                    </p>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-mono text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {['All', 'Easy', 'Medium', 'Hard'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeFilter === filter
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Problems List */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 w-1/3">Title</th>
                                    <th className="px-6 py-4">Difficulty</th>
                                    <th className="px-6 py-4">Tags</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProblems.length > 0 ? (
                                    filteredProblems.map((problem) => (
                                        <tr key={problem.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                {problem.status === 'Solved' ? (
                                                    <CheckCircle className="text-green-500" size={18} />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {problem.id}. {problem.title}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getDifficultyColor(problem.difficulty)}`}>
                                                    {problem.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2 flex-wrap">
                                                    {problem.tags.slice(0, 2).map((tag, idx) => (
                                                        <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded border border-slate-200">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {problem.tags.length > 2 && (
                                                        <span className="text-xs text-slate-400 py-1">+{problem.tags.length - 2}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/problem/${problem.id}`)}
                                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <span>Solve</span>
                                                    <Play size={14} className="fill-current" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            No problems found matching your criteria.
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
