import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, Search, Check, X, Wifi, WifiOff, Swords, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import { getSocket, challengeFriend } from '../services/socket';

export default function FriendsPanel({ user }) {
    const navigate = useNavigate();
    const [tab, setTab] = useState('friends'); // 'friends' | 'requests' | 'search'
    const [friends, setFriends] = useState([]);
    const [onlineFriends, setOnlineFriends] = useState(new Set());
    const [requests, setRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [msgType, setMsgType] = useState('success'); // 'success' | 'error'

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const fetchFriends = useCallback(async () => {
        try {
            const [fRes, oRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/users/friends`, { headers }),
                fetch(`${API_BASE_URL}/api/users/online-friends`, { headers })
            ]);
            const fData = await fRes.json();
            const oData = await oRes.json();
            setFriends(Array.isArray(fData) ? fData : []);
            setOnlineFriends(new Set(Array.isArray(oData) ? oData.map(f => f._id.toString()) : []));
        } catch (e) { console.error(e); }
    }, []);

    const fetchRequests = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/friend-requests`, { headers });
            const data = await res.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        fetchFriends();
        fetchRequests();
    }, [fetchFriends, fetchRequests]);

    // Listen for real-time online/offline socket events
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleOnline = ({ userId }) => setOnlineFriends(prev => new Set([...prev, userId.toString()]));
        const handleOffline = ({ userId }) => setOnlineFriends(prev => { const s = new Set(prev); s.delete(userId.toString()); return s; });
        const handleNewRequest = () => fetchRequests();
        const onConnect = () => {
            console.log("[FriendsPanel] Socket connected - refreshing data");
            fetchFriends();
            fetchRequests();
        };

        if (socket.connected) {
            onConnect();
        }

        socket.on('connect', onConnect);
        socket.on('friend:online', handleOnline);
        socket.on('friend:offline', handleOffline);
        socket.on('notification', (n) => { if (n.type === 'friend_request') fetchRequests(); });

        return () => {
            socket.off('connect', onConnect);
            socket.off('friend:online', handleOnline);
            socket.off('friend:offline', handleOffline);
            socket.off('notification', handleNewRequest);
        };
    }, [fetchRequests]);

    const [searchStatus, setSearchStatus] = useState(''); // '' | 'searching' | 'error' | 'none'

    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            setSearchStatus('');
            return;
        }

        const t = setTimeout(async () => {
            setSearchStatus('searching');
            try {
                const currentToken = localStorage.getItem('token');
                const searchHeaders = {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentToken}`
                };

                const url = `${API_BASE_URL}/api/users/search?username=${encodeURIComponent(searchQuery)}`;
                console.log("[FriendsPanel] Searching at:", url);

                const res = await fetch(url, { headers: searchHeaders });

                if (!res.ok) {
                    console.error("[FriendsPanel] Search failed:", res.status);
                    setSearchStatus('error');
                    setSearchResults([]);
                } else {
                    const data = await res.json();
                    console.log("[FriendsPanel] Search data:", data);
                    setSearchResults(Array.isArray(data) ? data : []);
                    setSearchStatus(data.length === 0 ? 'none' : '');
                }
            } catch (e) {
                console.error("[FriendsPanel] Search exception:", e);
                setSearchStatus('error');
                setSearchResults([]);
            }
        }, 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const sendRequest = async (targetUserId) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/friend-request`, {
                method: 'POST', headers,
                body: JSON.stringify({ targetUserId })
            });
            const data = await res.json();
            if (res.ok) {
                setMsg(data.message || 'Request sent!');
                setMsgType('success');
            } else {
                setMsg(data.message || 'Failed to send request');
                setMsgType('error');
            }
            setTimeout(() => setMsg(''), 3000);
        } catch (e) {
            console.error("Friend request error:", e);
            setMsg('Network error. Try again.');
            setMsgType('error');
        }
        setLoading(false);
    };

    const respond = async (requestId, action) => {
        try {
            await fetch(`${API_BASE_URL}/api/users/respond-request`, {
                method: 'POST', headers,
                body: JSON.stringify({ requestId, action })
            });
            await Promise.all([fetchFriends(), fetchRequests()]);
        } catch (e) { console.error(e); }
    };

    const handleChallenge = (friend) => {
        if (!user) return;
        challengeFriend(friend._id, { _id: user._id, username: user.username, rank: user.rank || 'Bronze' });
        setMsg(`Challenge sent to ${friend.username}!`);
        setTimeout(() => setMsg(''), 3000);
    };

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Users size={16} className="text-blue-500" /> Friends
                        <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black rounded">
                            {onlineFriends.size} online
                        </span>
                    </h4>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-2">
                    {['friends', 'requests', 'search'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-all ${tab === t ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        >
                            {t === 'requests' ? `Requests${pendingCount > 0 ? ` (${pendingCount})` : ''}` : t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Flash message */}
            <AnimatePresence>
                {msg && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`px-4 py-2 text-xs font-bold border-b transition-colors ${msgType === 'success'
                                ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30'
                                : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30'
                            }`}>
                        {msgType === 'error' ? '⚠ ' : '✓ '}{msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-4 space-y-2 max-h-64 overflow-y-auto custom-scrollbar">

                {/* Friends List */}
                {tab === 'friends' && (
                    friends.filter(f => f._id.toString() !== user?._id?.toString()).length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">No friends yet. Search to add some!</p>
                    ) : friends.filter(f => f._id.toString() !== user?._id?.toString()).map(f => {
                        const isOnline = onlineFriends.has(f._id.toString());
                        return (
                            <div key={f._id} className="flex items-center justify-between py-1.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                                            {f.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${isOnline ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{f.username}</p>
                                        <p className={`text-[10px] font-medium ${isOnline ? 'text-green-500' : 'text-slate-400 dark:text-slate-500'}`}>
                                            {isOnline ? '● Online' : '○ Offline'} · {f.rank || 'Bronze'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => navigate('/messages', { state: { selectedFriendId: f._id } })}
                                        className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded border border-blue-200 dark:border-blue-900/40 transition-colors">
                                        <MessageSquare size={10} /> Chat
                                    </button>
                                    {isOnline && (
                                        <button onClick={() => handleChallenge(f)}
                                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded border border-orange-200 dark:border-orange-900/40 transition-colors">
                                            <Swords size={10} /> Battle
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Friend Requests */}
                {tab === 'requests' && (
                    requests.filter(r => r.status === 'pending').length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">No pending requests.</p>
                    ) : requests.filter(r => r.status === 'pending').map(r => (
                        <div key={r._id} className="flex items-center justify-between py-2 px-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                    {r.from?.username?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.from?.username}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{r.from?.rank || 'Bronze'} · Wants to be friends</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => respond(r._id, 'accept')}
                                    className="w-7 h-7 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors">
                                    <Check size={12} />
                                </button>
                                <button onClick={() => respond(r._id, 'reject')}
                                    className="w-7 h-7 flex items-center justify-center bg-slate-200 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-500 rounded-full transition-colors">
                                    <X size={12} />
                                </button>
                            </div>
                        </div>
                    ))
                )}

                {/* Search */}
                {tab === 'search' && (
                    <div className="space-y-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search username..."
                                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-slate-300 placeholder-slate-400"
                            />
                        </div>
                        {searchStatus === 'searching' && <p className="text-[10px] text-slate-400 text-center py-2">Searching...</p>}
                        {searchStatus === 'error' && <p className="text-[10px] text-red-500 text-center py-2">Error searching users.</p>}
                        {searchResults.map(u => (
                            <div key={u._id} className="flex items-center justify-between py-1.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                        {u.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{u.username}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{u.rank || 'Bronze'} · {u.wins || 0}W</p>
                                    </div>
                                </div>
                                <button onClick={() => sendRequest(u._id)} disabled={loading}
                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded border border-blue-200 dark:border-blue-900/40 transition-colors disabled:opacity-50">
                                    <UserPlus size={10} /> Add
                                </button>
                            </div>
                        ))}
                        {searchStatus === 'none' && searchQuery.length >= 2 && (
                            <p className="text-xs text-slate-400 text-center py-4">No users found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
