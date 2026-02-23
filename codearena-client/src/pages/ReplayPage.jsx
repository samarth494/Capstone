import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    LayoutDashboard,
    Swords,
    Clock,
    RotateCcw
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

export default function ReplayPage() {
    const { theme } = useTheme();
    const { battleId } = useParams();
    const navigate = useNavigate();
    const [battle, setBattle] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const [player1Code, setPlayer1Code] = useState('// LOADING...');
    const [player2Code, setPlayer2Code] = useState('// LOADING...');

    useEffect(() => {
        const fetchReplay = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/battles/${battleId}/replay`);
                const data = await response.json();
                setBattle(data);

                // Set initial code state
                setPlayer1Code('// Solve: Return indices of the two numbers that add up to target\nfunction solve(input) {\n  const { nums, target } = input;\n  return [0, 1]; \n}');
                setPlayer2Code('// Solve: Return indices of the two numbers that add up to target\nfunction solve(input) {\n  const { nums, target } = input;\n  return [0, 1]; \n}');
            } catch (err) {
                console.error("Failed to fetch replay", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReplay();
    }, [battleId]);

    useEffect(() => {
        let interval;
        if (isPlaying && battle) {
            const start = new Date(battle.startTime).getTime();
            const end = new Date(battle.endTime).getTime();
            const totalDuration = end - start;

            interval = setInterval(() => {
                setCurrentTime(prev => {
                    const next = prev + (100 * playbackSpeed);
                    if (next >= totalDuration) {
                        setIsPlaying(false);
                        return totalDuration;
                    }
                    return next;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying, battle, playbackSpeed]);

    useEffect(() => {
        if (!battle) return;

        const p1Id = battle.players[0]._id;
        const p2Id = battle.players[1]._id;

        const eventsBefore = battle.events.filter(e => e.timestamp <= currentTime);

        const latestP1 = eventsBefore.filter(e => e.playerId === p1Id && e.type === 'code_update').pop();
        const latestP2 = eventsBefore.filter(e => e.playerId === p2Id && e.type === 'code_update').pop();

        if (latestP1) setPlayer1Code(latestP1.data);
        if (latestP2) setPlayer2Code(latestP2.data);
    }, [currentTime, battle]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center font-mono transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 dark:text-slate-400 animate-pulse text-sm font-bold uppercase tracking-widest">Constructing Replay...</p>
                </div>
            </div>
        );
    }

    if (!battle) return <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center font-mono text-slate-900 dark:text-white transition-colors">BATTLE_NOT_FOUND</div>;

    const totalDuration = new Date(battle.endTime).getTime() - new Date(battle.startTime).getTime();

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-['JetBrains_Mono'] transition-colors duration-300">
            {/* Header */}
            <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shadow-sm flex-none sticky top-0 z-50 transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <Swords className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                        <h1 className="text-lg font-bold tracking-tighter text-slate-900 dark:text-white font-mono transition-colors">Replay: ARCHIVE_{battle.battleId?.slice(-6).toUpperCase()}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
                    {[1, 2, 4].map(s => (
                        <button
                            key={s}
                            onClick={() => setPlaybackSpeed(s)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${playbackSpeed === s ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            {s}X_SPD
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium">
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </button>
                </div>
            </header>

            {/* Viewport */}
            <main className="flex-1 flex overflow-hidden p-6 gap-6">
                {/* Player 1 */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-5 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-800 italic transition-colors">
                                {battle.players[0].username.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 transition-colors">{battle.players[0].username}</span>
                        </div>
                        {battle.winnerId?._id === battle.players[0]._id && (
                            <span className="text-[10px] font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-lg border border-green-100 dark:border-green-800 uppercase tracking-widest shadow-sm transition-colors">VICTOR</span>
                        )}
                    </div>
                    <div className="flex-1 rounded-[1.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 p-1 transition-colors">
                        <Editor
                            height="100%"
                            language="javascript"
                            theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                            value={player1Code}
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 13,
                                fontFamily: 'JetBrains Mono',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </div>
                </div>

                {/* Player 2 */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-5 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold border border-red-100 dark:border-red-800 italic transition-colors">
                                {battle.players[1].username.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 transition-colors">{battle.players[1].username}</span>
                        </div>
                        {battle.winnerId?._id === battle.players[1]._id && (
                            <span className="text-[10px] font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-lg border border-green-100 dark:border-green-800 uppercase tracking-widest shadow-sm transition-colors">VICTOR</span>
                        )}
                    </div>
                    <div className="flex-1 rounded-[1.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 p-1 transition-colors">
                        <Editor
                            height="100%"
                            language="javascript"
                            theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                            value={player2Code}
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 13,
                                fontFamily: 'JetBrains Mono',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </div>
                </div>
            </main>

            {/* Controls */}
            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-8 flex-none transition-colors duration-300">
                <div className="max-w-6xl mx-auto flex flex-col gap-6">
                    {/* Progress Bar Container */}
                    <div className="relative pt-6">
                        <input
                            type="range"
                            min="0"
                            max={totalDuration}
                            value={currentTime}
                            onChange={(e) => { setIsPlaying(false); setCurrentTime(parseInt(e.target.value)); }}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600 relative z-20"
                        />
                        {/* Event Markers Overlay */}
                        <div className="absolute top-6 left-0 w-full h-2 pointer-events-none z-10">
                            {battle.events.filter(e => e.type === 'submission').map((e, i) => (
                                <div
                                    key={i}
                                    className={`absolute top-1/2 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white dark:border-slate-900 shadow-sm ${e.data.result?.success ? 'bg-green-500 scale-125' : 'bg-red-400'}`}
                                    style={{ left: `${(e.timestamp / totalDuration) * 100}%` }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-4">
                                <button onClick={() => { setIsPlaying(false); setCurrentTime(0); }} className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><SkipBack size={24} /></button>
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-14 h-14 bg-slate-900 dark:bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-black dark:hover:bg-slate-600 transition-all shadow-xl shadow-slate-200 dark:shadow-none hover:scale-105 active:scale-95"
                                >
                                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                                </button>
                                <button onClick={() => { setIsPlaying(false); setCurrentTime(totalDuration); }} className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><SkipForward size={24} /></button>
                            </div>

                            <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-slate-800 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                                <Clock size={16} className="text-blue-500 dark:text-blue-400" />
                                <span className="tabular-nums">{(currentTime / 1000).toFixed(1)}s</span>
                                <span className="text-slate-300 dark:text-slate-600">/</span>
                                <span className="text-slate-400 dark:text-slate-500">{(totalDuration / 1000).toFixed(1)}s</span>
                            </div>
                        </div>

                        {/* Event Tooltip / Indicator */}
                        <div className="flex gap-3">
                            {battle.events
                                .filter(e => Math.abs(e.timestamp - currentTime) < 1500)
                                .slice(-1)
                                .map((e, i) => (
                                    <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest animate-in slide-in-from-bottom-2 duration-300 border shadow-sm transition-colors ${e.type === 'submission'
                                        ? (e.data.result?.success ? 'bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800 text-red-600 dark:text-red-400')
                                        : 'bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                                        }`}>
                                        {e.type === 'submission'
                                            ? (e.data.result?.success ? 'SUCCESSFUL_EXECUTION' : 'FAILED_SUBMISSION')
                                            : 'CODE_INFILTRATION'}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
