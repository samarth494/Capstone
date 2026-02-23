import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
    Swords,
    Trophy,
    Users,
    Code,
    Zap,
    Target,
    Activity,
    GitBranch,
    Terminal as TerminalIcon
} from 'lucide-react';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user) {
            navigate('/login');
        }
    }, [navigate, user]);

    // Block back button — user must logout to leave dashboard
    useEffect(() => {
        // Push an extra entry so pressing back stays on dashboard
        window.history.pushState(null, '', window.location.href);

        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    if (!user) return null; // Or a loading spinner

    const navItems = [
        { label: './Dashboard', path: '/dashboard', action: () => navigate('/dashboard') },
        { label: './Events', path: '/dashboard/events', action: () => navigate('/dashboard/events') },
        { label: './Profile', path: `/profile/${user._id}`, action: () => navigate(`/profile/${user._id}`) },
        { label: './Leaderboard', path: '/leaderboard', action: () => navigate('/leaderboard') }
    ];

    const stats = [
        { icon: Swords, label: 'Battles Won', value: '0' },
        { icon: Code, label: 'Problems Solved', value: '0' },
        { icon: Trophy, label: 'Current Rank', value: 'Novice' },
        { icon: Activity, label: 'Win Rate', value: '0%' }
    ];

    const actionCards = [
        {
            title: 'Start Battle',
            description: 'Enter the arena and challenge opponents in real-time.',
            icon: Swords,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'hover:border-blue-500',
            action: () => navigate('/lobby')
        },
        {
            title: 'Singleplayer',
            description: 'Master your coding skills with solo algorithmic challenges.',
            icon: Code,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'hover:border-green-500',
            action: () => navigate('/singleplayer')
        },
        {
            title: 'Leaderboard',
            description: 'See where you stand among the top developers globally.',
            icon: Trophy,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'hover:border-yellow-500',
            action: () => navigate('/leaderboard')
        },
        {
            title: 'Community',
            description: 'Connect with other developers and discuss strategies.',
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'hover:border-purple-500',
            action: () => console.log('Navigate to community')
        }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-['JetBrains_Mono'] transition-colors duration-300">
            <Navbar items={navItems} user={user} />

            {/* Welcome Section */}
            <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 font-mono tracking-tight">
                                <span className="text-blue-600 dark:text-blue-400 mr-2">&gt;</span>WELCOME_BACK(<span className="text-blue-600 dark:text-blue-400">{user.username}</span>)
                            </h2>
                            <p className="text-slate-500 font-mono text-lg">
                                Ready to enter the arena? System status: <span className="text-green-500">ONLINE</span>
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <button className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg transition-all border border-slate-200 dark:border-slate-700">
                                <GitBranch size={16} />
                                <span>v2.4.0</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Overview */}
            <section className="py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                        <stat.icon className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mb-1">{stat.value}</div>
                                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Actions Grid */}
            <section className="pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Target className="text-blue-600 dark:text-blue-400" size={20} />
                        AVAILABLE_MODULES
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {actionCards.map((card, idx) => (
                            <div
                                key={idx}
                                onClick={card.action}
                                className={`bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1 ${card.borderColor} dark:hover:border-blue-500/50 border-opacity-50`}
                            >
                                <div className={`w-12 h-12 rounded-lg ${card.bgColor} dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <card.icon className={`w-6 h-6 ${card.color} dark:text-blue-400`} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {card.title}
                                </h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                    {card.description}
                                </p>
                                <div className="mt-4 flex items-center text-sm font-medium text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    <span>Initialize</span>
                                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent Activity Mockup */}
            <section className="pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                <TerminalIcon size={16} />
                                Console_Log
                            </h3>
                        </div>
                        <div className="p-6 font-mono text-sm space-y-3">
                            <div className="flex gap-4 items-start">
                                <span className="text-slate-400 dark:text-slate-500">23:02:11</span>
                                <span className="text-green-600 dark:text-green-400">SUCCESS</span>
                                <span className="text-slate-600 dark:text-slate-300">System initialized. Welcome, {user.username}.</span>
                            </div>
                            <div className="flex gap-4 items-start">
                                <span className="text-slate-400 dark:text-slate-500">23:02:12</span>
                                <span className="text-blue-600 dark:text-blue-400">INFO</span>
                                <span className="text-slate-600 dark:text-slate-300">Connected to competitive servers...</span>
                            </div>
                            <div className="flex gap-4 items-start">
                                <span className="text-slate-400 dark:text-slate-500">23:02:15</span>
                                <span className="text-yellow-600 dark:text-yellow-400">WARN</span>
                                <span className="text-slate-600 dark:text-slate-300">No active battles found in local region.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
