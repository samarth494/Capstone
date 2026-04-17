import React, { useEffect, useState, useRef } from 'react';
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
    Terminal as TerminalIcon,
    Loader,
    Globe2,
    Flame,
    Clock,
    Award,
    TrendingUp,
    Star,
    Calendar,
    ChevronRight,
    Bell,
    MessageSquare
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import FriendsPanel from '../components/FriendsPanel';
import { getSocket } from '../services/socket';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Live Feed State
    const [liveLogs, setLiveLogs] = useState(() => {
        const saved = sessionStorage.getItem('dashboardLiveLogs');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        sessionStorage.setItem('dashboardLiveLogs', JSON.stringify(liveLogs));
    }, [liveLogs]);
    const [notifications, setNotifications] = useState([]);
    const lastActivityId = useRef(null);

    // Competitive Presentation States
    const [platformStats, setPlatformStats] = useState({
        totalBattles: 0,
        leaders: [],
        trendingProblems: []
    });
    const [countdown, setCountdown] = useState(3600 * 24 * 3 + 3600 * 5 + 60 * 12 + 45); // Keep contest timer for aesthetic

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user) {
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/users/profile/${user._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.user) {
                    setUser(result.user);
                    localStorage.setItem('user', JSON.stringify(result.user));
                }
            } catch (error) {
                console.error("Failed to sync user data", error);
            }
        };

        fetchUserData();

        // Refresh when tab is focused (e.g. coming back from a coding session)
        window.addEventListener('focus', fetchUserData);
        return () => window.removeEventListener('focus', fetchUserData);
    }, [navigate]);

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

    // Real Platform Logs & Stats Fetcher (Initial Load + WebSockets)
    useEffect(() => {
        if (!user) return;

        // 1. Initial Data Fetch
        const fetchInitialData = async () => {
            try {
                const [leaderboardRes, problemsRes, actRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/leaderboard`),
                    fetch(`${API_BASE_URL}/api/problems?category=All`),
                    fetch(`${API_BASE_URL}/api/problems/activity`)
                ]);

                const leadersData = await leaderboardRes.json();
                const problemsData = await problemsRes.json();
                const activities = await actRes.json();

                const totalPlayed = Array.isArray(leadersData)
                    ? leadersData.reduce((sum, u) => sum + (u.battlesPlayed || 0), 0)
                    : 0;

                setPlatformStats({
                    totalBattles: totalPlayed,
                    leaders: Array.isArray(leadersData) ? leadersData.slice(0, 3) : [],
                    trendingProblems: Array.isArray(problemsData) ? problemsData.slice(0, 3) : []
                });
            } catch (err) {
                console.error("Failed fetching initial platform data:", err);
            }
        };

        fetchInitialData();

    }, [user]);

    // WebSocket Registration for True Real-Time Feed
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        import('../services/socket').then(({ initiateSocketConnection, getSocket }) => {
            initiateSocketConnection(token);
            const socket = getSocket();

            if (socket) {
                const handleRespondRequest = async (requestId, action, notificationIndex) => {
                    try {
                        const token = localStorage.getItem('token');
                        const res = await fetch(`${API_BASE_URL}/api/users/respond-request`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ requestId, action })
                        });

                        if (res.ok) {
                            // Remove notification after action
                            setNotifications(prev => prev.filter((_, i) => i !== notificationIndex));
                            // Refresh user data to show new friend in list if needed
                            const userRes = await fetch(`${API_BASE_URL}/api/users/profile/${user._id}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const userData = await userRes.json();
                            if (userData.user) {
                                setUser(userData.user);
                                localStorage.setItem('user', JSON.stringify(userData.user));
                            }
                        }
                    } catch (err) {
                        console.error("Failed to respond to request", err);
                    }
                };

                const handleNewActivity = (act) => {
                    if (!act) return;

                    // Enhanced deduplication
                    const logHash = act._id || `${act.type}_${act.username || act.player1 || ''}`;
                    if (logHash && lastActivityId.current === logHash) return;
                    lastActivityId.current = logHash;

                    const actType = (act.type || 'SUBMIT').toUpperCase();
                    let color = 'text-cyan-500';
                    let userName = act.user?.username || act.username || 'Unknown Player';
                    let displayType = actType;
                    let msg = '';

                    if (actType === 'LOGIN') {
                        displayType = 'LOGIN';
                        color = 'text-indigo-500';
                        msg = `User '${userName}' just connected to the arena.`;
                    } else if (actType === 'QUEUE_JOIN' || actType === 'MATCHMAKING') {
                        displayType = 'MATCHMAKING';
                        color = 'text-blue-500';
                        msg = `User '${userName}' [${act.rank || 'Bronze'}] is looking for a match!`;
                    } else if (actType === 'BATTLE_START' || actType === 'BATTLE') {
                        displayType = 'BATTLE';
                        color = 'text-orange-500';
                        msg = `New Battle Started: ${act.player1 || 'P1'} vs ${act.player2 || 'P2'}!`;
                    } else if (act.status) {
                        // DB Submissions
                        if (act.status === 'Accepted') {
                            displayType = 'SUCCESS';
                            color = 'text-green-500';
                            let probTitle = act.problem?.title || 'Problem';
                            msg = `User '${userName}' successfully solved '${probTitle}' in ${act.executionTime || 0}ms!`;
                        } else {
                            displayType = 'SUBMIT';
                            color = (act.status === 'Wrong Answer' || act.status === 'Runtime Error') ? 'text-red-500' : 'text-cyan-500';
                            let probTitle = act.problem?.title || 'Problem';
                            msg = `User '${userName}' encountered ${act.status} on '${probTitle}'.`;
                        }
                    } else {
                        // Generic fallback
                        msg = `Activity detected from ${userName}.`;
                    }

                    const freshLog = {
                        id: act._id || Date.now() + Math.random(),
                        time: new Date(act.createdAt || Date.now()).toLocaleTimeString('en-US', { hour12: false }),
                        type: displayType,
                        color,
                        text: msg,
                        isNew: true
                    };

                    setLiveLogs(prev => {
                        const updated = prev.map(l => ({ ...l, isNew: false }));
                        return [freshLog, ...updated].slice(0, 20);
                    });
                };

                const handleNotification = (notif) => {
                    setNotifications(prev => {
                        // Avoid duplicates of the same notification message
                        if (prev.some(p => p.message === notif.message)) return prev;
                        return [notif, ...prev].slice(0, 5);
                    });
                };

                socket.on('newGlobalActivity', handleNewActivity);
                socket.on('notification', handleNotification);
                window.dashboardRespondRequest = handleRespondRequest;

                // Join personal room if available
                if (user?._id) {
                    socket.emit("user:join_self", user._id);
                }

                return () => {
                    socket.off('newGlobalActivity', handleNewActivity);
                    socket.off('notification', handleNotification);
                };
            }
        });
    }, [user]);


    if (!user) return null; // Or a loading spinner

    const navItems = [
        { label: './Dashboard', path: '/dashboard', action: () => navigate('/dashboard') },
        { label: './Messages', path: '/messages', action: () => navigate('/messages') },
        { label: './Events', path: '/dashboard/events', action: () => navigate('/dashboard/events') },
        { label: './Profile', path: `/profile/${user._id}`, action: () => navigate(`/profile/${user._id}`) },
        { label: './Leaderboard', path: '/leaderboard', action: () => navigate('/leaderboard') }
    ];

    const stats = [
        { icon: Swords, label: 'Battles Won', value: user.wins || 0 },
        { icon: Code, label: 'Problems Solved', value: (user.solvedProblems?.length || 0) },
        { icon: Trophy, label: 'Current Rank', value: user.rank || 'Bronze' },
        { icon: Activity, label: 'Win Rate', value: user.winRate || '0%' }
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

                {/* Decorative background grid and blurs */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                                    <span className="text-blue-600 dark:text-blue-400 mr-2">&gt;</span>WELCOME_BACK(<span className="text-blue-600 dark:text-blue-400">{user.username}</span>)
                                </h2>
                                {user.currentStreak > 0 && (
                                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold border border-orange-200 dark:border-orange-500/20">
                                        <Flame size={14} className="animate-pulse" />
                                        <span>{user.currentStreak} Day Streak</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-mono text-base flex items-center gap-2">
                                System status: <span className="flex items-center gap-1.5 text-green-500"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> ONLINE</span>
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Total Arena Battles</span>
                                <div className="text-xl font-black font-mono text-slate-900 dark:text-white flex items-center gap-2">
                                    <Swords size={16} className="text-blue-500" />
                                    {platformStats.totalBattles.toLocaleString()}
                                </div>
                            </div>
                            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                            <button className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg transition-all border border-slate-200 dark:border-slate-700 shadow-sm font-mono text-sm group">
                                <GitBranch size={16} className="group-hover:text-blue-500 transition-colors" />
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

            {/* Split Content: Live Feed & Dashboard Sidebar */}
            <section className="pb-16 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Global Live Feed */}
                    <div className="lg:col-span-2 flex flex-col">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Activity className="text-blue-600 dark:text-blue-400" size={20} />
                            GLOBAL_NETWORK
                        </h3>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[600px] relative">
                            {/* Decorative grid background */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

                            <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center relative z-10 backdrop-blur-sm">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                    <Globe2 size={16} className="text-blue-500 mr-1" />
                                    Live Activity Stream
                                </h3>
                                <div className="flex items-center gap-2 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-[10px] font-bold tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    CONNECTED
                                </div>
                            </div>
                            <div className="flex-1 p-6 font-mono text-sm space-y-2.5 overflow-y-auto relative z-10 custom-scrollbar scroll-smooth">
                                {liveLogs.length > 0 ? (
                                    liveLogs.map((log) => (
                                        <div
                                            key={log.id}
                                            className={`flex gap-4 items-start p-2 rounded-lg transition-all duration-500 ${log.isNew ? 'bg-blue-50 dark:bg-blue-900/20 translate-y-0 opacity-100 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-transparent translate-y-0 opacity-100'}`}
                                            style={{
                                                animation: log.isNew ? 'slideUpFade 0.4s ease-out' : 'none'
                                            }}
                                        >
                                            <span className="text-slate-400 dark:text-slate-500 shrink-0 select-none text-[11px]">[{log.time}]</span>
                                            <span className={`${log.color} shrink-0 w-20 font-bold tracking-widest text-[11px]`}>{log.type}</span>
                                            <span className="text-slate-700 dark:text-slate-300 font-medium">{log.text}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-24 opacity-30 select-none">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
                                            <span className="text-[10px] uppercase font-black tracking-[0.3em] font-mono text-slate-500">Listening_to_arena...</span>
                                        </div>
                                        <p className="text-[10px] font-medium font-mono text-slate-400">Waiting for live activity from coders worldwide</p>
                                    </div>
                                )}
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                                    @keyframes slideUpFade {
                                        from { opacity: 0; transform: translateY(10px) scale(0.98); }
                                        to { opacity: 1; transform: translateY(0) scale(1); }
                                    }
                                `}} />
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: Competitive Elements */}
                    <div className="lg:col-span-1 space-y-6 flex flex-col pt-0 lg:pt-14">

                        {/* Real-time Notifications Panel */}
                        {notifications.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        <Bell size={16} className="text-blue-500" /> Notifications
                                    </h4>
                                    <button onClick={() => setNotifications([])} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Clear</button>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {notifications.map((n, i) => (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                if (n.type === 'new_message') navigate('/messages', { state: { selectedFriendId: n.fromId } });
                                                else if (n.type === 'challenge') navigate('/lobby');
                                            }}
                                            className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex gap-3 items-start">
                                                <div className={`mt-1 p-1.5 rounded-lg ${n.type === 'new_message' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : n.type === 'friend_request' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                                    {n.type === 'new_message' ? <MessageSquare size={14} /> : n.type === 'friend_request' ? <User size={14} /> : <Swords size={14} />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">{n.message}</p>
                                                    {n.type === 'friend_request' && n.requestId && (
                                                        <div className="flex gap-2 mt-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.dashboardRespondRequest?.(n.requestId, 'accept', i);
                                                                }}
                                                                className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.dashboardRespondRequest?.(n.requestId, 'reject', i);
                                                                }}
                                                                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                            >
                                                                Decline
                                                            </button>
                                                        </div>
                                                    )}
                                                    <p className="text-[10px] text-slate-400 font-mono mt-1">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Friends Panel - TOP position for maximum visibility */}
                        <FriendsPanel user={user} />

                        {/* Live Leaderboard Preview */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <Award size={16} className="text-yellow-500" /> Top Ranked
                                </h4>
                                <button onClick={() => navigate('/leaderboard')} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center transition-colors">
                                    View All <ChevronRight size={14} />
                                </button>
                            </div>
                            <div className="p-2 flex flex-col flex-1 gap-1">
                                {platformStats.leaders.length > 0 ? platformStats.leaders.map((player, i) => {
                                    const rankData = i === 0 ? { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30 font-black border border-yellow-200 dark:border-yellow-700/50' } :
                                        i === 1 ? { color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800 font-bold border border-slate-200 dark:border-slate-700' } :
                                            { color: 'text-amber-700 dark:text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30 font-bold border border-amber-200 dark:border-amber-700/50' };

                                    return (
                                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group hover:translate-x-1 duration-300">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs shadow-sm ${rankData.bg} ${rankData.color}`}>
                                                    {i + 1}
                                                </div>
                                                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {player.username}
                                                </span>
                                            </div>
                                            <div className="font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                {player.wins} WINS
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center text-sm text-slate-500 p-4">Loading Data...</div>
                                )}
                            </div>
                        </div>

                        {/* Trending Problems */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <TrendingUp size={16} className="text-green-500" /> Trending
                                </h4>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {platformStats.trendingProblems.length > 0 ? platformStats.trendingProblems.map((prob, i) => {
                                    const diffStyles = prob.difficulty === 'Hard' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50' :
                                        prob.difficulty === 'Medium' ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900/50' :
                                            'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/50';

                                    return (
                                        <div key={i} onClick={() => navigate('/singleplayer')} className="px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex justify-between items-center group">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate pr-4">{prob.title}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-wider ${diffStyles} border px-2 py-0.5 rounded shadow-sm shrink-0`}>{prob.difficulty}</span>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center text-sm text-slate-500 p-4">Loading Data...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
