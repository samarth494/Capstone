import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Swords, UserPlus, User, MessageSquare, Check, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getSocket, respondToChallenge } from '../services/socket';

export default function NotificationBell({ user }) {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const socket = getSocket();
        if (!socket || !user?._id) return;

        const handleNotification = (notif) => {
            // Avoid duplicate notifications of the same message (spam prevention)
            setNotifications(prev => {
                if (prev.some(p => p.message === notif.message && Date.now() - new Date(p.createdAt).getTime() < 5000)) {
                    return prev;
                }
                return [{ ...notif, id: Date.now() + Math.random(), read: false }, ...prev].slice(0, 20);
            });
            
            if (!notif.read) {
                try { 
                    const audio = new Audio('/notification.mp3'); 
                    audio.play().catch(() => {}); // Ignore interaction blocks
                } catch(e) {}
            }
        };

        const handleMatchFound = (data) => {
            console.log("[Global] Match found from notification accept!", data);
            navigate(`/battle/${data.roomId}`, { state: { opponent: data.opponent } });
        };

        const onConnect = () => {
            console.log("[Socket] Connected - re-joining personal room:", user._id);
            socket.emit("user:join_self", user._id);
        };

        if (socket.connected) {
            onConnect();
        }

        socket.on('connect', onConnect);
        socket.on('notification', handleNotification);
        socket.on('match_found', handleMatchFound);

        return () => {
            socket.off('connect', onConnect);
            socket.off('notification', handleNotification);
            socket.off('match_found', handleMatchFound);
        };
    }, [user, navigate]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

    const handleChallengeResponse = (notif, accepted) => {
        if (!notif.from) return;
        
        respondToChallenge(notif.from._id || notif.from.id, accepted, user);
        
        // Mark as read and dismiss the specific notification
        dismiss(notif.id);
        setOpen(false);
    };

    const getIcon = (type) => {
        if (type === 'challenge') return <Swords size={14} className="text-orange-500" />;
        if (type === 'friend_request') return <UserPlus size={14} className="text-blue-500" />;
        if (type === 'new_message') return <MessageSquare size={14} className="text-blue-500" />;
        return <User size={14} className="text-slate-500" />;
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => { setOpen(o => !o); if (!open) markAllRead(); }}
                className="relative p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[200]"
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Notifications</h3>
                            {notifications.length > 0 && (
                                <button onClick={() => setNotifications([])} className="text-xs text-slate-400 hover:text-red-500 transition-colors">Clear all</button>
                            )}
                        </div>

                        <div className="max-h-72 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-slate-400 dark:text-slate-500">
                                    <Bell size={28} className="mb-2 opacity-30" />
                                    <p className="text-xs font-medium">No notifications</p>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <motion.div
                                        key={n.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`flex flex-col px-4 py-3 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${!n.read ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <div className="flex items-start gap-3 w-full">
                                            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                {getIcon(n.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-tight">{n.message}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                                    {new Date(n.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                </p>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); dismiss(n.id); }} className="text-slate-300 dark:text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
                                                <X size={12} />
                                            </button>
                                        </div>

                                        {/* Action buttons for challenges */}
                                        {n.type === 'challenge' && (
                                            <div className="flex items-center gap-2 mt-3 ml-10">
                                                <button
                                                    onClick={() => handleChallengeResponse(n, true)}
                                                    className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                                                >
                                                    <Check size={12} /> ACCEPT
                                                </button>
                                                <button
                                                    onClick={() => handleChallengeResponse(n, false)}
                                                    className="flex-1 py-1.5 px-3 bg-slate-200 dark:bg-slate-700 hover:bg-red-500 hover:text-white text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                                                >
                                                    <Ban size={12} /> DECLINE
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
