import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Swords,
    LogOut,
    Plus,
    Users,
    Zap,
    Clock,
    Terminal as TerminalIcon,
    Loader,
    Search,
    UserPlus,
    Check,
    X,
    Bell,
    UserCheck,
    Send
} from 'lucide-react';

import { initiateSocketConnection, joinQueue, leaveQueue, disconnectSocket, getSocket, joinPersonalRoom, challengeFriend, respondToChallenge } from '../services/socket';
import { API_BASE_URL } from '../config/api';

export default function BattleLobbyPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [isMatchmaking, setIsMatchmaking] = useState(false);
    const [matchmakingTime, setMatchmakingTime] = useState(0);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Friend System State
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'battles'
    const [incomingChallenge, setIncomingChallenge] = useState(null);
    const [toast, setToast] = useState(null); // { message, type: 'info' | 'error' | 'success' }

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            navigate('/login');
            return;
        }

        if (token && !getSocket()) {
            console.log("Initializing socket in lobby...");
            initiateSocketConnection(token);
        }

        const socket = getSocket();
        if (socket && storedUser) {
            const userId = JSON.parse(storedUser)._id;
            joinPersonalRoom(userId);

            socket.on("challenge:received", (data) => {
                console.log("Challenge received:", data);
                setIncomingChallenge(data);
            });

            socket.on("challenge:rejected", ({ friendName }) => {
                setToast({ message: `${friendName} rejected your challenge.`, type: 'error' });
                setTimeout(() => setToast(null), 3000);
            });
        }

        // Listen for matches
        const handleMatchFound = (data) => {
            console.log("Match found event received:", data);
            setIsMatchmaking(false);
            navigate(`/battle/${data.roomId}`, { state: { opponent: data.opponent } });
        };

        if (socket) {
            socket.on('match_found', handleMatchFound);
        }

        // Fetch Initial Friends & track online status
        fetchFriends();
        fetchFriendRequests();

        const socket2 = getSocket();
        if (socket2) {
            const addOnline = ({ userId, username, rank }) => {
                setFriends(prev => prev.find(f => f._id === userId) ? prev : [...prev, { _id: userId, username, rank: rank || 'Bronze', wins: 0 }]);
            };
            const removeOffline = ({ userId }) => {
                setFriends(prev => prev.filter(f => f._id !== userId));
            };
            socket2.on('friend:online', addOnline);
            socket2.on('friend:offline', removeOffline);
            return () => {
                socket2.off("challenge:received");
                socket2.off("challenge:rejected");
                socket2.off('friend:online', addOnline);
                socket2.off('friend:offline', removeOffline);
                socket2.off('match_found', handleMatchFound);
            };
        }

        return () => {
            if (socket) {
                socket.off("challenge:received");
                socket.off("challenge:rejected");
                socket.off('match_found', handleMatchFound);
            }
        };
    }, []);

    const fetchFriends = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/users/online-friends`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setFriends(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch online friends", error);
        }
    };

    const fetchFriendRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/users/friend-requests`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setFriendRequests(data);
        } catch (error) {
            console.error("Failed to fetch friend requests", error);
        }
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/users/search?username=${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    const sendFriendRequest = async (targetUserId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/users/friend-request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ targetUserId })
            });
            const data = await res.json();
            if (data.success) {
                alert("Request sent!");
                setSearchResults(prev => prev.filter(u => u._id !== targetUserId));
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Friend request failed", error);
        }
    };

    const respondToRequest = async (requestId, action) => {
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
                fetchFriends();
                fetchFriendRequests();
            }
        } catch (error) {
            console.error("Response failed", error);
        }
    };

    const handleChallenge = (friend) => {
        challengeFriend(friend._id, user);
        setToast({ message: `Challenge sent to ${friend.username}! Waiting for response...`, type: 'info' });
        setTimeout(() => setToast(null), 5000);
    };

    const handleIncomingResponse = (accepted) => {
        respondToChallenge(incomingChallenge.challenger._id, accepted, user);
        setIncomingChallenge(null);
    };

    useEffect(() => {
        let interval;
        if (isMatchmaking) {
            interval = setInterval(() => {
                setMatchmakingTime(prev => prev + 1);
            }, 1000);
        } else {
            setMatchmakingTime(0);
        }
        return () => clearInterval(interval);
    }, [isMatchmaking]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const startMatchmaking = () => {
        // Always try to get fresh data from localStorage to avoid state staleness
        const storedData = localStorage.getItem('user');
        let currentUser = user;

        if (storedData) {
            currentUser = JSON.parse(storedData);
        }

        if (!currentUser) {
            console.error("No user data found in state or localStorage");
            alert("Session error. Please logout and login again.");
            return;
        }

        // Fallback for missing username
        if (!currentUser.username) {
            if (currentUser.email) {
                currentUser.username = currentUser.email.split('@')[0];
            } else {
                currentUser.username = `User_${Math.floor(Math.random() * 10000)}`;
            }
            // Update both state and storage
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
        }

        console.log("Lobby: Starting matchmaking for:", currentUser.username);
        setIsMatchmaking(true);
        joinQueue(currentUser);
    };

    const cancelMatchmaking = () => {
        setIsMatchmaking(false);
        leaveQueue();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Mock active battles
    const activeBattles = [
        { id: 101, p1: 'dev_slayer', p2: 'algo_queen', rank: 'Gold', viewers: 12, status: 'In Progress' },
        { id: 102, p1: 'python_guru', p2: 'java_master', rank: 'Silver', viewers: 5, status: 'In Progress' },
        { id: 103, p1: 'bug_hunter', p2: 'waiting...', rank: 'Bronze', viewers: 0, status: 'Waiting' },
        { id: 104, p1: 'fullstack_hero', p2: 'waiting...', rank: 'Platinum', viewers: 2, status: 'Waiting' },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-['JetBrains_Mono'] relative transition-colors duration-300">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-20 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                    toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                        'bg-blue-50 border-blue-200 text-blue-700'
                    }`}>
                    {toast.type === 'success' ? <Check size={20} /> : toast.type === 'error' ? <X size={20} /> : <Bell size={20} />}
                    <span className="font-bold">{toast.message}</span>
                </div>
            )}

            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2 cursor-pointer transition-all hover:scale-105" onClick={() => navigate('/dashboard')}>
                            <Swords className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter transition-colors">CodeArena_</h1>
                        </div>

                        <nav className="hidden md:flex space-x-8 font-mono text-sm">
                            <button onClick={() => navigate('/singleplayer')} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">./Singleplayer</button>

                            <button onClick={() => navigate('/lobby')} className="text-blue-600 dark:text-blue-400 font-bold transition-colors">./Battle_Lobby</button>
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
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-sm w-full mx-4 transform transition-all scale-100">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Confirm Logout</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed transition-colors">
                            Are you sure you want to terminate your current session and exit the arena?
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

            {/* Matchmaking Overlay */}
            {isMatchmaking && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md text-white transition-opacity duration-500">
                    <div className="relative mb-12">
                        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-30 animate-pulse rounded-full"></div>
                        <div className="relative bg-slate-800 p-8 rounded-full border border-blue-500/30 shadow-2xl">
                            <Swords size={80} className="text-blue-500 animate-bounce" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-4 font-mono tracking-tighter animate-pulse">SEARCHING_FOR_OPPONENT...</h2>
                    <p className="text-slate-400 font-mono text-lg mb-12 max-w-md text-center">
                        Synthesizing match vectors.
                        Estimated wait: <span className="text-blue-400">&lt; 30s</span>
                    </p>

                    <div className="flex items-center gap-4 bg-slate-800/80 backdrop-blur-md px-10 py-5 rounded-2xl border border-slate-700/50 mb-16 shadow-2xl">
                        <Clock size={28} className="text-blue-400" />
                        <span className="font-mono text-4xl font-bold tabular-nums">{formatTime(matchmakingTime)}</span>
                    </div>

                    <button
                        onClick={cancelMatchmaking}
                        className="group flex items-center gap-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-10 py-4 rounded-xl font-bold tracking-widest transition-all transform hover:scale-105 border border-red-500/50"
                    >
                        <span>CANCEL_SEARCH</span>
                        <Plus size={20} className="rotate-45" />
                    </button>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left Column: Actions */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group transition-all duration-300">
                            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                                <Zap size={200} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 font-mono tracking-tight transition-colors">
                                    QUICK_MATCH
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md text-lg leading-relaxed transition-colors">
                                    Find a worthy opponent instantly through our automated matchmaking. Ranked matches affect your global standing.
                                </p>
                                <button
                                    onClick={startMatchmaking}
                                    className="bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-4 shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all transform hover:-translate-y-1 active:scale-95"
                                >
                                    <Swords size={28} />
                                    <span>FIND_MATCH_NOW</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <Search size={24} className="text-blue-600" />
                                Add Friends
                            </h3>
                            <div className="relative mb-6">
                                <input
                                    type="text"
                                    placeholder="Search by username..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500 transition-all font-mono"
                                />
                                {isSearching && <Loader className="absolute right-4 top-4 animate-spin text-blue-500" />}
                            </div>

                            <div className="space-y-3">
                                {searchResults.map(result => (
                                    <div key={result._id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                {result.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold dark:text-white">{result.username}</div>
                                                <div className="text-xs text-slate-500 uppercase tracking-tighter">{result.rank}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => sendFriendRequest(result._id)}
                                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
                                            title="Send Friend Request"
                                        >
                                            <UserPlus size={18} />
                                        </button>
                                    </div>
                                ))}
                                {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                                    <div className="text-center py-4 text-slate-400 font-mono text-sm">NO_USERS_FOUND</div>
                                )}
                            </div>
                        </div>

                        {friendRequests.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-blue-200 dark:border-blue-800 shadow-xl bg-blue-50/10 transition-colors">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <Bell size={24} className="text-blue-600 animate-bounce" />
                                    Pending Requests
                                </h3>
                                <div className="space-y-3">
                                    {friendRequests.map(req => (
                                        <div key={req._id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="font-bold dark:text-white">{req.from.username}</div>
                                                <div className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 rounded-full">{req.from.rank}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => respondToRequest(req._id, 'accept')}
                                                    className="p-2 bg-green-100 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => respondToRequest(req._id, 'reject')}
                                                    className="p-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Online Friends & Live Battles */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* ── Incoming Challenge Banner ───────────────────────────── */}
                        {incomingChallenge && (
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-3xl shadow-2xl animate-pulse border border-blue-400/40">
                                <h3 className="font-black text-xl mb-1 flex items-center gap-2">
                                    <Zap size={22} className="animate-bounce" />
                                    CHALLENGE RECEIVED!
                                </h3>
                                <p className="mb-4 text-blue-100 text-sm">
                                    <span className="font-black text-white">{incomingChallenge.challenger.username}</span> wants to duel!
                                </p>
                                <div className="flex gap-2">
                                    <button onClick={() => handleIncomingResponse(true)}
                                        className="flex-1 py-3 bg-white text-blue-600 rounded-xl font-black hover:bg-blue-50 transition-colors text-sm">
                                        ✓ ACCEPT
                                    </button>
                                    <button onClick={() => handleIncomingResponse(false)}
                                        className="px-5 py-3 bg-blue-800/60 text-white rounded-xl font-black hover:bg-blue-800 transition-colors text-sm">
                                        ✗
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Online Friends Card ─────────────────────────────────── */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-slate-50 to-green-50/50 dark:from-slate-800/80 dark:to-green-900/10 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <Users size={16} className="text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white text-sm font-mono tracking-tight">ONLINE_FRIENDS</h3>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Challenge instantly</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-green-700 dark:text-green-400">{friends.length} LIVE</span>
                                    </div>
                                </div>
                            </div>

                            {/* Friend List */}
                            <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-80 overflow-y-auto">
                                {friends.length > 0 ? (
                                    friends.map(friend => (
                                        <div key={friend._id}
                                            className="flex items-center gap-3 px-5 py-4 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors group">
                                            {/* Avatar with live dot */}
                                            <div className="relative flex-shrink-0">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                                                    {friend.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-900 shadow-sm animate-pulse" />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-slate-900 dark:text-white text-sm truncate">{friend.username}</p>
                                                <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest">
                                                    {friend.rank || 'Bronze'} · {friend.wins || 0}W
                                                </p>
                                            </div>

                                            {/* Challenge Button */}
                                            <button
                                                onClick={() => handleChallenge(friend)}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[10px] font-black rounded-xl shadow-md shadow-blue-500/30 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                                            >
                                                <Swords size={12} /> DUEL
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                                            <Users size={24} className="text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500 font-mono">NO_ONLINE_FRIENDS</p>
                                        <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">Friends will appear here when they log in</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Live Battles Spectate Card ──────────────────────────── */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
                            <div className="bg-slate-50/80 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white text-sm font-mono">LIVE_BATTLES</h3>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Active arena matches</p>
                                    </div>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-50 dark:divide-slate-800/50 max-h-64 overflow-y-auto">
                                {activeBattles.map(battle => (
                                    <div key={battle.id} className="px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[9px] font-black tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full uppercase">{battle.rank}</span>
                                            {battle.status === 'In Progress' && (
                                                <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />LIVE
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between font-mono text-xs">
                                            <span className="font-black text-blue-600 dark:text-blue-400 truncate">{battle.p1}</span>
                                            <span className="text-slate-300 dark:text-slate-600 px-1.5 font-bold italic text-[9px]">VS</span>
                                            <span className={`font-black truncate ${battle.p2 === 'waiting...' ? 'text-slate-300 dark:text-slate-600 italic' : 'text-red-500 dark:text-red-400'}`}>{battle.p2}</span>
                                        </div>
                                        {battle.status === 'Waiting' && (
                                            <p className="text-[9px] text-slate-400 mt-1 font-mono">Waiting for opponent...</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>

            </main>
        </div>
    );
}

// Icon helper since Activity isn't imported for the usage above
function ActivityIcon({ size, className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}
