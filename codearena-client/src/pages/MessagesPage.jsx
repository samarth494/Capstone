import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
    Send,
    MessageSquare,
    Search,
    User,
    Circle,
    MoreVertical,
    Shield,
    Trash2,
    Smile,
    Paperclip,
    Mic
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { getSocket, initiateSocketConnection } from '../services/socket';

export default function MessagesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);

    // Handle initial friend selection from navigation state
    useEffect(() => {
        if (location.state?.selectedFriendId && friends.length > 0) {
            const friend = friends.find(f => f._id === location.state.selectedFriendId);
            if (friend) {
                handleSelectFriend(friend);
            }
        }
    }, [location.state, friends]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 1. Initial Friend Fetch
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user) {
            navigate('/login');
            return;
        }
        fetchFriends();
    }, [user]);

    // 2. Socket Setup & Global Listeners
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        initiateSocketConnection(token);
        const socket = getSocket();

        const handleNewMessage = (msg) => {
            // Check if this message belongs to the active conversation
            // Using a ref or checking state directly might be tricky in useEffect, 
            // but we can rely on the message sender/receiver IDs
            if (selectedFriend && (msg.sender === selectedFriend._id || msg.receiver === selectedFriend._id)) {
                setMessages(prev => {
                    // Avoid duplicate messages
                    if (prev.find(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });

                // Mark as read if we are currently looking at this friend
                if (msg.sender === selectedFriend._id) {
                    fetch(`${API_BASE_URL}/api/chat/read/${msg.sender}`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).catch(e => console.error("Mark read failed", e));
                }
            } else {
                // If it's a new message from someone else, we might want to refresh friend list to show badges
                fetchFriends();
            }
        };

        const handleMessageSent = (msg) => {
            if (selectedFriend && msg.receiver === selectedFriend._id) {
                setMessages(prev => {
                    if (prev.find(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
            }
        };

        if (socket) {
            socket.on('message:received', handleNewMessage);
            socket.on('message:sent', handleMessageSent);
        }

        return () => {
            if (socket) {
                socket.off('message:received', handleNewMessage);
                socket.off('message:sent', handleMessageSent);
            }
        };
    }, [selectedFriend]); // Re-bind listeners when selectedFriend changes to capture correct ID in closure

    const fetchFriends = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/friends`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                if (response.status === 401) navigate('/login');
                throw new Error('Failed to fetch');
            }
            const data = await response.json();
            setFriends(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch friends", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (friendId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/chat/${friendId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setMessages(data);

            // Mark as read
            await fetch(`${API_BASE_URL}/api/chat/read/${friendId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const handleSelectFriend = (friend) => {
        setSelectedFriend(friend);
        fetchMessages(friend._id);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedFriend) return;

        const socket = getSocket();
        if (socket) {
            socket.emit('message:send', {
                receiverId: selectedFriend._id,
                senderId: user._id,
                senderUsername: user.username,
                content: newMessage
            });
            setNewMessage('');
        }
    };

    const handleClearChat = async () => {
        if (!selectedFriend || !window.confirm('Are you sure you want to clear this conversation? This cannot be undone.')) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/chat/${selectedFriend._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setMessages([]);
            }
        } catch (error) {
            console.error("Failed to clear chat", error);
        }
    };

    const handleBlockUser = () => {
        alert("Block functionality coming soon!");
    };

    const handleViewProfile = () => {
        if (selectedFriend) {
            navigate(`/profile/${selectedFriend._id}`);
        }
    };

    const navItems = [
        { label: './Dashboard', path: '/dashboard', action: () => navigate('/dashboard') },
        { label: './Messages', path: '/messages', action: () => navigate('/messages') },
        { label: './Profile', path: `/profile/${user?._id}`, action: () => navigate(`/profile/${user?._id}`) },
        { label: './Leaderboard', path: '/leaderboard', action: () => navigate('/leaderboard') }
    ];

    const filteredFriends = friends.filter(f =>
        f && f.username && f.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Safety fallback: if loading for more than 5s, something is wrong
    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => setLoading(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-['JetBrains_Mono']">
            <Navbar user={user} items={navItems} />

            <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-80px)] overflow-hidden">

                {/* Sidebar: Friends List */}
                <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <MessageSquare className="text-blue-500" size={20} />
                                Messages
                            </h2>
                            <button
                                onClick={() => { setLoading(true); fetchFriends(); }}
                                className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg transition-colors"
                                title="Refresh friends"
                            >
                                <Circle size={14} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search friends..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-mono text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center text-slate-400 animate-pulse">Loading friends...</div>
                        ) : filteredFriends.length > 0 ? (
                            filteredFriends.map(friend => (
                                <div
                                    key={friend._id}
                                    onClick={() => handleSelectFriend(friend)}
                                    className={`p-4 flex items-center gap-3 cursor-pointer transition-all border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedFriend?._id === friend._id ? 'bg-blue-50/50 dark:bg-blue-500/5 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                            {friend.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm">{friend.username}</h3>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{friend.rank || 'Bronze'}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-sm text-slate-400">No friends found.</p>
                                <button onClick={() => navigate('/dashboard')} className="mt-2 text-xs text-blue-500 font-bold hover:underline">Find Friends</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main: Chat Area */}
                <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden relative">
                    {selectedFriend ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-500 font-bold">
                                        {selectedFriend.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-900 dark:text-white leading-tight">{selectedFriend.username}</h2>
                                        <div className="flex items-center gap-1.5">
                                            <Circle size={8} fill="#22c55e" className="text-green-500" />
                                            <span className="text-[10px] text-green-500 font-black uppercase tracking-[0.2em]">Active Now</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleBlockUser}
                                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all"
                                        title="Block User"
                                    >
                                        <Shield size={18} />
                                    </button>
                                    <button
                                        onClick={handleClearChat}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                                        title="Clear History"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button
                                        onClick={handleViewProfile}
                                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all"
                                        title="View Profile"
                                    >
                                        <User size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
                                {messages.map((msg, i) => {
                                    const isMe = msg.sender === user._id;
                                    return (
                                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm font-mono ${isMe
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                                                }`}>
                                                <p className="leading-relaxed">{msg.content}</p>
                                                <p className={`text-[9px] mt-1.5 font-bold opacity-60 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
                                    <div className="flex gap-1 mr-2 mb-2">
                                        <button type="button" className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Smile size={20} /></button>
                                        <button type="button" className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Paperclip size={20} /></button>
                                    </div>
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(e);
                                                }
                                            }}
                                            placeholder={`Message ${selectedFriend.username}...`}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-mono resize-none max-h-32 text-slate-900 dark:text-white"
                                            rows="1"
                                        />
                                    </div>
                                    <div className="flex gap-2 mb-1.5 ml-1">
                                        <button type="button" className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-200 transition-all"><Mic size={20} /></button>
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className={`p-2.5 rounded-full shadow-lg transition-all active:scale-90 ${newMessage.trim() ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                                        >
                                            <Send size={20} className={newMessage.trim() ? 'fill-current' : ''} />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 dark:bg-slate-950/20">
                            {/* Empty State */}
                            <div className="relative mb-8">
                                <div className="w-24 h-24 rounded-3xl bg-blue-500/10 dark:bg-blue-500/5 rotate-12 absolute inset-0 -z-10 animate-pulse"></div>
                                <div className="w-24 h-24 rounded-3xl bg-blue-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-500">
                                    <MessageSquare size={40} className="animate-bounce" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Your Inbox</h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm font-mono text-sm leading-relaxed">
                                Connect with other arena fighters. Discuss algorithms, challenge friends, or just say hello!
                            </p>
                            <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-xs">
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Encrypted
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Real-time
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
}
