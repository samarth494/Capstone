import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Swords, Trophy, Users, Code, Zap, Target, Clock,
  TrendingUp, Activity, Terminal, Shield, Cpu, Globe,
<<<<<<< HEAD
  CheckCircle, ChevronRight, Menu, X
=======
  CheckCircle, ChevronRight, Menu, X, Database
>>>>>>> singleplayer
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import CodeArenaIntro from '../components/CodeArenaIntro';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Frontpage() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('hasSeenIntro');
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  // Scroll to top on refresh
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: Swords,
      title: 'Real-Time Battles',
      description: 'Challenge developers worldwide in live coding duels. See their cursor logic in real-time.'
    },
    {
      icon: Target,
      title: 'Skill-Based Matching',
      description: 'Our Elo-based matchmaking ensures you always face a worthy opponent.'
    },
    {
      icon: Clock,
      title: 'Speed & Efficiency',
      description: 'It’s not just about solving it. It’s about solving it fast and optimized.'
    },
    {
      icon: Trophy,
      title: 'Rankings & Rewards',
      description: 'Climb the global leaderboard and earn unique badges for your profile.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden selection:bg-blue-200 selection:text-blue-900">
      {/* Cinematic Intro */}
      <AnimatePresence>
        {showIntro && <CodeArenaIntro onComplete={() => {
          setShowIntro(false);
          sessionStorage.setItem('hasSeenIntro', 'true');
        }} />}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              {!showIntro && (
                <>
                  <motion.div
                    layoutId="logo-icon"
                    className="text-blue-600"
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    <Swords className="w-8 h-8" />
                  </motion.div>
                  <motion.h1
                    layoutId="logo-text"
                    className="text-xl font-bold text-slate-900 font-mono tracking-tighter"
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    CodeArena_
                  </motion.h1>
                </>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 font-mono text-sm h-full">
              {[
                { label: './Features', href: '#features' },
                { label: './Battle', href: '#battles' },
                { label: './Events', action: () => navigate('/events') },

                { label: './Community', href: '#community' },
                { label: './About', action: () => navigate('/about') }
              ].map((item, index) => (
                item.action ? (
                  <button
                    key={index}
                    onClick={item.action}
                    className="group relative flex items-center h-full text-slate-600 hover:text-blue-600 font-medium transition-colors"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                  </button>
                ) : (
                  <a
                    key={index}
                    href={item.href}
                    className="group relative flex items-center h-full text-slate-600 hover:text-blue-600 font-medium transition-colors"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                  </a>
                )
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-slate-900 text-white px-6 py-2 rounded-full hover:bg-slate-800 font-medium shadow-lg shadow-slate-200 transition-all hover:shadow-xl active:scale-95 font-mono text-sm"
                >
                  Log_In
                </button>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden text-slate-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Classic & Premium */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-2xl z-30 overflow-hidden"
            >
              <div className="px-6 py-8 space-y-6 font-mono">
                <div className="space-y-4">
                  <a href="#features" onClick={() => setIsMenuOpen(false)} className="block px-4 text-slate-600 hover:text-blue-600 transition-colors font-medium text-lg">
                    ./Features
                  </a>
                  <a href="#battles" onClick={() => setIsMenuOpen(false)} className="block px-4 text-slate-600 hover:text-blue-600 transition-colors font-medium text-lg">
                    ./Battle_Arena
                  </a>
                  <button onClick={() => { navigate('/events'); setIsMenuOpen(false); }} className="w-full text-left px-4 text-slate-600 hover:text-blue-600 transition-colors font-medium text-lg">
                    ./Events
                  </button>
                  <a href="#community" onClick={() => setIsMenuOpen(false)} className="block px-4 text-slate-600 hover:text-blue-600 transition-colors font-medium text-lg">
                    ./Community
                  </a>
                  <button onClick={() => { navigate('/about'); setIsMenuOpen(false); }} className="w-full text-left px-4 text-slate-600 hover:text-blue-600 transition-colors font-medium text-lg">
                    ./About
                  </button>

                </div>

                <div className="h-px bg-slate-100 w-full my-6"></div>

                <div className="px-2">
                  <button onClick={() => navigate('/login')} className="w-full flex items-center justify-center py-3 text-white bg-slate-900 font-bold rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95">
                    Log_In
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
              v2.0 is live: New tournament modes
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 font-mono tracking-tight leading-tight">
              Master the Code.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Win the Battle.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              The ultimate competitive programming platform. <br className="hidden md:block" />
              Real-time 1v1 battles, instant feedback, and global rankings.
            </p>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => navigate('/battle/data-structures')}
                className="group bg-transparent text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-lg hover:border-slate-900 hover:bg-slate-50 font-mono text-lg flex items-center justify-center transition-all"
              >
                <Zap className="w-5 h-5 mr-3 text-slate-400 group-hover:text-yellow-500 transition-colors" />
                Start Battle
              </button>
              <button
                onClick={() => document.getElementById('battles').scrollIntoView({ behavior: 'smooth' })}
                className="text-slate-700 bg-white px-8 py-4 rounded-lg border border-slate-200 hover:border-blue-400 hover:text-blue-600 font-mono text-lg transition-all flex items-center justify-center"
              >
                <Terminal className="w-5 h-5 mr-3" />
                Explore Problems
              </button>
            </div>
          </motion.div>

          {/* Code Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-20 relative max-w-4xl mx-auto"
          >
            <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
              <div className="flex items-center px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4 text-xs text-slate-400 font-mono">match_handler.js</div>
              </div>
              <div className="p-6 overflow-x-auto text-left">
                <pre className="text-sm md:text-base font-mono leading-relaxed">
                  <code>
                    <span className="text-purple-400">function</span> <span className="text-blue-400">initBattle</span>(player1, player2) {'{'}
                    <br />
                    {'  '}<span className="text-slate-400">// Initialize real-time connection</span>
                    <br />
                    {'  '}<span className="text-purple-400">const</span> arena = <span className="text-yellow-400">new</span> Arena(player1.id, player2.id);
                    <br />
                    {'  '}
                    <br />
                    {'  '}<span className="text-purple-400">await</span> arena.connect();
                    <br />
                    {'  '}console.<span className="text-blue-400">log</span>(<span className="text-green-400">"Battle Started!"</span>);
                    <br />
                    {'}'}
                  </code>
                </pre>
              </div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Detailed Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 font-mono">Why CodeArena?</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Built for developers who want to test their limits and improve continuously.</p>
          </div>

          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12 mb-24">
            <motion.div
              className="flex-1"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.5 }}
              variants={fadeInUp}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Swords className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">Real-Time Multiplayer Battles</h3>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                No more lonely coding sessions. Challenge friends or get matched with opponents globally.
                Write code, run test cases, and debug in real-time while seeing your opponent’s progress bar race against yours.
              </p>
              <ul className="space-y-3">
                {[
                  'Live progress tracking',
                  'Simultaneous test case execution',
                  'Post-match code review'
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              className="flex-1 bg-white p-2 rounded-xl border border-slate-200 shadow-xl"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspec-video bg-slate-900 rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[#0f172a] opacity-50"></div>
                <Users className="w-20 h-20 text-slate-700 relative z-10" />
                <div className="absolute bottom-4 left-4 right-4 bg-slate-800/80 p-3 rounded backdrop-blur-sm border border-slate-700">
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[75%]"></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
                    <span>You</span>
                    <span>Opponent (60%)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 mb-24">
            <motion.div
              className="flex-1"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.5 }}
              variants={fadeInUp}
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">Adaptive Difficulty Engine</h3>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                Stop wasting time on problems that are too easy or getting stuck on impossible ones.
                Our AI-driven engine adapts to your skill level, ensuring every battle is challenging but winnable.
              </p>
              <ul className="space-y-3">
                {[
                  'Smart matchmaking algorithm',
                  'Personalized problem recommendations',
                  'Skill progression tracking'
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="text-sm font-semibold text-slate-500 mb-2">Current Rank</div>
                  <div className="text-2xl font-bold text-slate-900">Gold II</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="text-sm font-semibold text-slate-500 mb-2">Win Rate</div>
                  <div className="text-2xl font-bold text-green-600">68%</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all col-span-2">
                  <div className="text-sm font-semibold text-slate-500 mb-2">Recent Performance</div>
                  <div className="h-16 flex items-end space-x-2">
                    {[40, 60, 45, 70, 85, 60, 90].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-100 rounded-t hover:bg-blue-200 transition-colors" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Grid Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group"
                variants={fadeInUp}
              >
                <feature.icon className="w-10 h-10 text-slate-400 group-hover:text-blue-600 transition-colors mb-6" />
                <h4 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories / Problem Types */}
      <section id="battles" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-800/20 skew-x-12 transform translate-x-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4 font-mono">Singleplayer Practice</h2>
              <p className="text-slate-400">Master the basics and advance your skills.</p>
            </div>
            <button
              onClick={() => navigate('/singleplayer')}
              className="hidden md:flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all problems <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Fundamentals', icon: Code, color: 'bg-blue-500', count: 'Syntax, Loops, Logic', link: '/singleplayer' },
              { title: 'Data Structures', icon: Database, color: 'bg-purple-500', count: 'Arrays, Trees, Graphs', link: '/singleplayer' }
            ].map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                onClick={() => cat.link !== '#' && navigate(cat.link)}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-lg ${cat.color} bg-opacity-20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <cat.icon className={`w-6 h-6 ${cat.color.replace('bg-', 'text-')}`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                <p className="text-sm text-slate-400 mb-4">{cat.count}</p>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color} w-3/4`}></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community / Live Feed */}
      <section id="community" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 font-mono mb-2">Live from the Arena</h2>
            <p className="text-slate-600">See what's happening in the community right now.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Leaderboard Snippet */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 flex items-center">
                  <Trophy className="w-5 h-5 text-yellow-500 mr-2" /> Top Players
                </h3>
                <a href="#" className="text-sm text-blue-600 hover:underline">View All</a>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((rank) => (
                  <div key={rank} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <span className={`w-6 h-6 flex items-center justify-center font-bold text-sm ${rank === 1 ? 'text-yellow-600 bg-yellow-100 rounded-full' : 'text-slate-500'}`}>#{rank}</span>
                      <div className="h-8 w-8 rounded-full bg-slate-200"></div>
                      <span className="font-medium text-slate-700">Dev_Master_{rank}</span>
                    </div>
                    <span className="text-sm font-mono text-slate-500">{2500 - (rank * 50)} rating</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 flex items-center">
                  <Activity className="w-5 h-5 text-green-500 mr-2" /> Live Activity
                </h3>
              </div>
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-100">
                {[
                  { user: 'Sarah_K', action: 'solved', problem: 'Binary Tree Level Order', time: '2m ago' },
                  { user: 'Alex_Code', action: 'won', problem: 'vs Mark_Dev', time: '5m ago' },
                  { user: 'System', action: 'deploy', problem: 'Weekly Contest 45 Started', time: '10m ago' }
                ].map((item, i) => (
                  <div key={i} className="relative pl-10">
                    <div className="absolute left-2.5 top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white transform -translate-x-1/2"></div>
                    <p className="text-sm text-slate-800">
                      <span className="font-semibold">{item.user}</span> {item.action} <span className="text-blue-600">{item.problem}</span>
                    </p>
                    <span className="text-xs text-slate-400">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false, amount: 0.5 }}
          >
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 font-mono tracking-tight">
              &gt; READY_TO_DEPLOY?
            </h3>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-light">
              Join 10,000+ developers competing in the area.
              <br />0 compilations failed so far.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-full hover:bg-slate-100 font-bold text-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] active:scale-95"
              >
                Log In
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-16 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <Swords className="w-6 h-6 text-blue-600" />
                <span className="text-white font-bold text-lg font-mono">CodeArena_</span>
              </div>
              <p className="leading-relaxed mb-6">
                The ultimate platform for competitive coding battles. Sharpen your skills, challenge friends, and rise to the top.
              </p>
              <div className="flex space-x-4">
                {/* Social placeholders */}
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"><Globe className="w-4 h-4" /></div>
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"><ShareIcon /></div>
              </div>
            </div>

            <div>
              <h5 className="text-white font-bold mb-6 font-mono">Platform</h5>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Problems</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Battles</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Rankings</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Tournaments</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-bold mb-6 font-mono">Company</h5>
              <ul className="space-y-4">
                <li><button onClick={() => navigate('/about')} className="hover:text-blue-400 transition-colors">About</button></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-bold mb-6 font-mono">Legal</h5>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
            <p>&copy; 2026 CodeArena. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0 font-mono">
              <span>System Status: <span className="text-green-500">Online</span></span>
              <span>v2.4.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ShareIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  )
}