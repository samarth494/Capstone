import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../config/api';
import { getUser, getAuthToken, logout } from '../utils/auth';
import {
    Swords,
    LogOut,
    Search,
    CheckCircle,
    Play,
    Terminal as TerminalIcon,
    Code,
    Database,
    Cpu,
    Filter,
    Award,
    LayoutDashboard
} from 'lucide-react';

export default function SingleplayerPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Fundamentals'); // 'Fundamentals' or 'Data Structures'
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('All');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const storedUser = getUser();
        const token = getAuthToken();

        if (!token || !storedUser) {
            navigate('/login');
            return;
        }

        setUser(storedUser);
        fetchProblems(activeCategory);
    }, [navigate, activeCategory]);

    const fetchProblems = async (category) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/problems?category=${category}`);
            const data = await response.json();
            setProblems(data);
        } catch (error) {
            console.error("Failed to fetch problems", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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
        const matchesDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });

    const isSolved = (problemId) => {
        return user?.solvedProblems?.includes(problemId);
    };

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

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="hidden md:flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-slate-200"
                            >
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </button>

                            {user && (
                                <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                                    <TerminalIcon size={14} className="text-blue-600" />
                                    <span className="font-bold">{user.username}</span>
                                    <div className="h-4 w-px bg-slate-300 mx-2"></div>
                                    <span className="text-yellow-600 flex items-center gap-1 font-bold">
                                        <Award size={14} />
                                        {user.xp || 0} XP
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2 font-mono flex items-center gap-3">
                        <span className="text-blue-600">&gt;</span> SINGLEPLAYER_MODULE
                    </h2>
                    <p className="text-slate-500 font-mono">
                        Select a domain to practice.
                    </p>
                </div>

                {/* Category Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div
                        onClick={() => setActiveCategory('Fundamentals')}
                        className={`cursor-pointer group relative p-6 rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md ${activeCategory === 'Fundamentals'
                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                            : 'bg-white border-slate-200 hover:border-blue-400'
                            }`}
                    >
                        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                            <Cpu size={120} className="text-slate-900" />
                        </div>
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${activeCategory === 'Fundamentals' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                                }`}>
                                <Code size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Fundamentals</h3>
                            <p className="text-slate-500 text-sm">Master the basics of syntax, loops, logic, and standard algorithms.</p>
                        </div>
                    </div>

                    <div
                        onClick={() => setActiveCategory('Data Structures')}
                        className={`cursor-pointer group relative p-6 rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md ${activeCategory === 'Data Structures'
                            ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500'
                            : 'bg-white border-slate-200 hover:border-purple-400'
                            }`}
                    >
                        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                            <Database size={120} className="text-slate-900" />
                        </div>
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${activeCategory === 'Data Structures' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-purple-50 group-hover:text-purple-600'
                                }`}>
                                <Database size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Data Structures</h3>
                            <p className="text-slate-500 text-sm">Deep dive into Arrays, Linked Lists, Trees, Graphs, and Hash Maps.</p>
                        </div>
                    </div>

                    <div
                        onClick={() => setActiveCategory('Algorithms')}
                        className={`cursor-pointer group relative p-6 rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md ${activeCategory === 'Algorithms'
                            ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500'
                            : 'bg-white border-slate-200 hover:border-orange-400'
                            }`}
                    >
                        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                            <Cpu size={120} className="text-slate-900" />
                        </div>
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${activeCategory === 'Algorithms' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-600'
                                }`}>
                                <Cpu size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Algorithms</h3>
                            <p className="text-slate-500 text-sm">Master Sorting, Searching, Dynamic Programming, and Greedy techniques.</p>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-mono text-sm text-slate-900 placeholder-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {['All', 'Easy', 'Medium', 'Hard'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setDifficultyFilter(filter)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${difficultyFilter === filter
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Problems List */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="px-6 py-4 w-16 text-center">#</th>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Difficulty</th>
                                    <th className="px-6 py-4">Reward</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex justify-center items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                Loading problems...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredProblems.length > 0 ? (
                                    filteredProblems.map((problem, index) => (
                                        <tr key={problem._id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 text-center">
                                                {isSolved(problem._id) ? (
                                                    <div className="flex justify-center">
                                                        <CheckCircle className="text-green-500" size={20} />
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 font-mono text-sm">{(index + 1).toString().padStart(2, '0')}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/problem/${problem._id}`)}>
                                                    {problem.title}
                                                </div>
                                                {problem.tags && (
                                                    <div className="flex gap-2 mt-1">
                                                        {problem.tags.slice(0, 3).map((tag, i) => (
                                                            <span key={i} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getDifficultyColor(problem.difficulty)}`}>
                                                    {problem.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-yellow-600 text-xs font-mono font-bold flex items-center gap-1">
                                                    +{problem.xpReward} XP
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/problem/${problem._id}`)}
                                                    className="opacity-0 group-hover:opacity-100 transition-all text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg flex items-center gap-2 ml-auto shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                                >
                                                    <span>Solve</span>
                                                    <Play size={12} className="fill-current" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            No problems found in this category.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full mx-4">
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
                                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
