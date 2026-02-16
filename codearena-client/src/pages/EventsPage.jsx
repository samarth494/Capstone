import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import { 
  Calendar, 
  EyeOff, 
  Terminal, 
  Clock, 
  Trophy, 
  Zap, 
  Users,
  ArrowRight,
  Code,
  Swords,
  LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function EventsPage() {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const [user, setUser] = useState(() => {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const openLogin = () => { setIsLoginOpen(true); setIsSignupOpen(false); };
  const closeLogin = () => setIsLoginOpen(false);
  const openSignup = () => { setIsSignupOpen(true); setIsLoginOpen(false); };
  const closeSignup = () => setIsSignupOpen(false);

  const events = [
    {
      id: 'blind-coding',
      title: 'Blind Coding',
      description: 'The ultimate test of memory and logic. Write C/C++ code without seeing the editor. No syntax highlighting, no compilation until the end.',
      icon: EyeOff,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      date: 'Starting in 2h 30m',
      participants: 124,
      status: 'Registration Open'
    },
    {
      id: 'debug-relay',
      title: 'Speed Debugging',
      description: 'Fix as many bugs as possible in 15 minutes. The code is broken, the clock is ticking.',
      icon:  Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      date: 'Tomorrow, 10:00 AM',
      participants: 89,
      status: 'Upcoming'
    },
    {
      id: 'reverse-coding',
      title: 'Reverse Coding',
      description: 'We give you the input and output, you write the algorithm. Deduce the logic from test cases alone.',
      icon: Code,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      date: 'Sat, 18 Feb',
      participants: 256,
      status: 'Upcoming'
    }
  ];

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
                        className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-slate-200"
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </button>
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
              Competitive Season 2026
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-mono tracking-tight">
              Special <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Events</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Push your coding skills to the limit with our unique event modes. 
              Compete against the best, earn exclusive badges, and dominate the leaderboard.
            </p>
          </motion.div>
        </div>

        {/* Featured Event - Blind Coding */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-6 border border-purple-100">
                  <Zap size={14} className="mr-1 fill-current" />
                  Featured Event
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-mono tracking-tight">Blind Coding Competition</h2>
                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                  The editor is blacked out. You can't see what you type. 
                  Rely on your muscle memory and pure logic to solve <span className="font-semibold text-slate-900">C/C++</span> algorithmic challenges. 
                  Top 3 winners get the exclusive "Daredevil" badge.
                </p>
                
                <div className="flex flex-wrap gap-8 text-sm font-medium text-slate-500 mb-10">
                  <div className="flex items-center">
                    <div className="p-2 bg-slate-50 rounded-lg mr-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <span>Starts in 2h 30m</span>
                  </div>
                  <div className="flex items-center">
                    <div className="p-2 bg-slate-50 rounded-lg mr-3">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                    </div>
                    <span>Prize: 5000 XP</span>
                  </div>
                  <div className="flex items-center">
                    <div className="p-2 bg-slate-50 rounded-lg mr-3">
                        <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <span>Limit: 30</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/lobby')} 
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-slate-500/20 flex items-center group-hover:translate-x-1"
                >
                  Join Competition <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
              
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="relative w-64 h-64 bg-slate-50 rounded-full flex items-center justify-center border-8 border-slate-100 shadow-inner">
                  <EyeOff className="w-24 h-24 text-slate-300" />
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-slate-200 animate-[spin_20s_linear_infinite]"></div>
                  <div className="absolute -right-4 top-0 bg-white p-4 rounded-xl shadow-lg border border-slate-100 animation-bounce">
                    <Code className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>


      </main>

      {/* Modals */}
      <LoginModal isOpen={isLoginOpen} onClose={closeLogin} onSwitchToSignup={openSignup} />
      <SignupModal isOpen={isSignupOpen} onClose={closeSignup} onSwitchToLogin={openLogin} />
    </div>
  );
}
