import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import Navbar from '../components/Navbar';
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
  const [showContent, setShowContent] = useState(() => {
    return !!sessionStorage.getItem('hasSeenDashboardEventsIntro');
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Animation complete hone ke baad content show karo
  React.useEffect(() => {
    if (showContent) return;

    const timer = setTimeout(() => {
      setShowContent(true);
      sessionStorage.setItem('hasSeenDashboardEventsIntro', 'true');
    }, 3500); // 3.5 seconds animation

    return () => clearTimeout(timer);
  }, [showContent]);

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
      icon: Zap,
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
    <>
      {/* Opening Logo Animation - Full Screen */}
      {!showContent && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center"
        >
          <div className="relative">
            {/* Background Circle */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative w-80 h-80 bg-white rounded-full flex items-center justify-center border-8 border-slate-100 shadow-2xl"
            >
              {/* Eye Icon with entrance animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  duration: 1,
                  delay: 0.3,
                  ease: [0.34, 1.56, 0.64, 1],
                  opacity: { duration: 0.4, delay: 0.3 }
                }}
                className="relative z-10"
              >
                <EyeOff className="w-32 h-32 text-slate-300" />
              </motion.div>

              {/* Dashed Circle with draw animation */}
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -90 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  rotate: 0,
                }}
                transition={{
                  duration: 1.2,
                  delay: 1.3,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full border-4 border-dashed border-slate-300"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 2.5
                  }}
                  className="w-full h-full"
                />
              </motion.div>

              {/* Code Badge */}
              <motion.div
                initial={{ scale: 0, y: -20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 2.2,
                  type: "spring",
                  stiffness: 200
                }}
                className="absolute -right-6 top-4 bg-gradient-to-br from-purple-500 to-indigo-600 p-5 rounded-2xl shadow-2xl"
              >
                <Code className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>

            {/* Title Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.5 }}
              className="text-center mt-8"
            >
              <h2 className="text-3xl font-bold text-slate-900 font-mono">Blind Coding</h2>
              <p className="text-slate-500 mt-2">Loading Event...</p>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Main Page Content - Fades in after animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen bg-[#F8FAFC] font-['JetBrains_Mono']"
      >
        {/* Navbar */}
        <Navbar
          items={[
            { label: './Dashboard', path: '/dashboard', action: () => navigate('/dashboard') },
            { label: './Events', path: '/dashboard/events', action: () => navigate('/dashboard/events') },
            { label: './Profile', path: user ? `/profile/${user._id}` : '#', action: () => user && navigate(`/profile/${user._id}`) },
            { label: './Leaderboard', path: '/leaderboard', action: () => navigate('/leaderboard') }
          ]}
          user={user}
        />

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
                    onClick={() => navigate('/competition/blind-coding/lobby')}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-slate-500/20 flex items-center group-hover:translate-x-1"
                  >
                    Join Competition <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>

                <div className="w-full md:w-1/3 flex justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative w-64 h-64 bg-slate-50 rounded-full flex items-center justify-center border-8 border-slate-100 shadow-inner"
                  >
                    {/* Eye Icon with entrance animation */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{
                        duration: 1,
                        delay: 0.3,
                        ease: [0.34, 1.56, 0.64, 1], // Bouncy ease
                        opacity: { duration: 0.4, delay: 0.3 }
                      }}
                      className="relative z-10"
                    >
                      <EyeOff className="w-24 h-24 text-slate-300" />
                    </motion.div>

                    {/* Dashed Circle with draw animation */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0, rotate: -90 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        rotate: 0,
                      }}
                      transition={{
                        duration: 1.2,
                        delay: 1.3,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 rounded-full border-4 border-dashed border-slate-200"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                          delay: 2.5
                        }}
                        className="w-full h-full"
                      />
                    </motion.div>

                    {/* Code Badge */}
                    <motion.div
                      initial={{ scale: 0, y: -20, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      transition={{
                        duration: 0.6,
                        delay: 2.2,
                        type: "spring",
                        stiffness: 200
                      }}
                      className="absolute -right-4 top-0 bg-white p-4 rounded-xl shadow-lg border border-slate-100"
                    >
                      <Code className="w-8 h-8 text-purple-600" />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>


        </main>

        {/* Modals */}
        <LoginModal isOpen={isLoginOpen} onClose={closeLogin} onSwitchToSignup={openSignup} />
        <SignupModal isOpen={isSignupOpen} onClose={closeSignup} onSwitchToLogin={openLogin} />
      </motion.div>
    </>
  );
}
