import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Swords, ArrowLeft, Zap, Trophy, Clock,
  ChevronRight, Cpu, Star, Users,
  Play, Target, Activity, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';

const problems = [
  // 🟢 Beginner Tier (1-5)
  {
    id: 1, title: 'Two Sum', tier: 'beginner', tierLabel: 'Beginner',
    concept: 'Hash map lookup', coreSkill: 'O(n) thinking',
    pressureFactor: 'Avoid brute force', timeLimit: 10, points: 100,
  },
  {
    id: 2, title: 'Valid Parentheses', tier: 'beginner', tierLabel: 'Beginner',
    concept: 'Stack', coreSkill: 'Push/pop logic',
    pressureFactor: 'Edge cases', timeLimit: 8, points: 100,
  },
  {
    id: 3, title: 'Palindrome Number', tier: 'beginner', tierLabel: 'Beginner',
    concept: 'Math or string reversal', coreSkill: 'Clean logic',
    pressureFactor: 'Negative numbers', timeLimit: 7, points: 100,
  },
  {
    id: 4, title: 'Merge Two Sorted Lists', tier: 'beginner', tierLabel: 'Beginner',
    concept: 'Linked list basics', coreSkill: 'Pointer handling',
    pressureFactor: 'Null checks', timeLimit: 10, points: 120,
  },
  {
    id: 5, title: 'Maximum Subarray', tier: 'beginner', tierLabel: 'Beginner',
    concept: 'Dynamic programming (basic)', coreSkill: 'Greedy optimization',
    pressureFactor: 'Reset logic', timeLimit: 10, points: 120,
  },

  // 🟡 Easy-Intermediate Tier (6-10)
  {
    id: 6, title: 'Best Time to Buy and Sell Stock', tier: 'easy-intermediate', tierLabel: 'Easy–Intermediate',
    concept: 'One-pass greedy', coreSkill: 'Track min value',
    pressureFactor: 'Single pass constraint', timeLimit: 10, points: 150,
  },
  {
    id: 7, title: 'Binary Search', tier: 'easy-intermediate', tierLabel: 'Easy–Intermediate',
    concept: 'Divide and conquer', coreSkill: 'Boundary handling',
    pressureFactor: 'Infinite loop risk', timeLimit: 8, points: 150,
  },
  {
    id: 8, title: 'Climbing Stairs', tier: 'easy-intermediate', tierLabel: 'Easy–Intermediate',
    concept: 'Fibonacci DP', coreSkill: 'Bottom-up thinking',
    pressureFactor: 'Overlapping subproblems', timeLimit: 8, points: 150,
  },
  {
    id: 9, title: 'Invert Binary Tree', tier: 'easy-intermediate', tierLabel: 'Easy–Intermediate',
    concept: 'Recursion', coreSkill: 'Tree traversal',
    pressureFactor: 'Base case handling', timeLimit: 8, points: 160,
  },
  {
    id: 10, title: 'Flood Fill', tier: 'easy-intermediate', tierLabel: 'Easy–Intermediate',
    concept: 'DFS / BFS', coreSkill: 'Grid traversal',
    pressureFactor: 'Visited tracking', timeLimit: 12, points: 160,
  },

  // 🟠 Intermediate Tier (11-15)
  {
    id: 11, title: 'Longest Substring Without Repeating Characters', tier: 'intermediate', tierLabel: 'Intermediate',
    concept: 'Sliding window', coreSkill: 'Hash set + window control',
    pressureFactor: 'Window shrink logic', timeLimit: 15, points: 200,
  },
  {
    id: 12, title: 'Number of Islands', tier: 'intermediate', tierLabel: 'Intermediate',
    concept: 'Graph traversal', coreSkill: 'DFS/BFS in grid',
    pressureFactor: 'Mutation vs visited set', timeLimit: 15, points: 200,
  },
  {
    id: 13, title: 'Product of Array Except Self', tier: 'intermediate', tierLabel: 'Intermediate',
    concept: 'Prefix/suffix multiplication', coreSkill: 'O(n) without division',
    pressureFactor: 'Zero handling', timeLimit: 12, points: 220,
  },
  {
    id: 14, title: 'Kth Largest Element in an Array', tier: 'intermediate', tierLabel: 'Intermediate',
    concept: 'Heap / Quickselect', coreSkill: 'Partial sorting',
    pressureFactor: 'Pivot selection', timeLimit: 15, points: 220,
  },
  {
    id: 15, title: 'Search in Rotated Sorted Array', tier: 'intermediate', tierLabel: 'Intermediate',
    concept: 'Modified binary search', coreSkill: 'Conditional branching under pressure',
    pressureFactor: 'Rotation pivot', timeLimit: 15, points: 250,
  },

  // 🔴 Advanced Tier (16-18)
  {
    id: 16, title: 'Lowest Common Ancestor of a Binary Tree', tier: 'advanced', tierLabel: 'Advanced',
    concept: 'Tree recursion', coreSkill: 'Return propagation logic',
    pressureFactor: 'Multiple return paths', timeLimit: 18, points: 300,
  },
  {
    id: 17, title: 'Word Break', tier: 'advanced', tierLabel: 'Advanced',
    concept: 'DP + HashSet', coreSkill: 'String segmentation',
    pressureFactor: 'Overlapping splits', timeLimit: 18, points: 300,
  },
  {
    id: 18, title: 'Course Schedule', tier: 'advanced', tierLabel: 'Advanced',
    concept: 'Topological sort', coreSkill: 'Cycle detection (DFS / Kahn\'s)',
    pressureFactor: 'Graph construction', timeLimit: 20, points: 320,
  },

  // 🟣 Expert Tier (19-20)
  {
    id: 19, title: 'Merge k Sorted Lists', tier: 'expert', tierLabel: 'Expert',
    concept: 'Min heap', coreSkill: 'Efficient merging',
    pressureFactor: 'Pointer + heap combo', timeLimit: 25, points: 400,
  },
  {
    id: 20, title: 'Median of Two Sorted Arrays', tier: 'expert', tierLabel: 'Expert',
    concept: 'Binary search partitioning', coreSkill: 'O(log(min(n,m))) thinking',
    pressureFactor: 'Brutal edge cases', timeLimit: 25, points: 500,
  },
];

const tierConfig = {
  beginner: {
    bgLight: 'bg-green-50', border: 'border-green-200', text: 'text-green-700',
    badge: 'bg-green-100 text-green-700 border-green-200',
    dot: 'bg-green-500', hoverBorder: 'hover:border-green-300',
  },
  'easy-intermediate': {
    bgLight: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    dot: 'bg-yellow-500', hoverBorder: 'hover:border-yellow-300',
  },
  intermediate: {
    bgLight: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    dot: 'bg-orange-500', hoverBorder: 'hover:border-orange-300',
  },
  advanced: {
    bgLight: 'bg-red-50', border: 'border-red-200', text: 'text-red-700',
    badge: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-500', hoverBorder: 'hover:border-red-300',
  },
  expert: {
    bgLight: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    dot: 'bg-purple-500', hoverBorder: 'hover:border-purple-300',
  },
};

const tiers = [
  { key: 'beginner', label: 'Beginner', range: '1–5', icon: '🟢' },
  { key: 'easy-intermediate', label: 'Easy–Intermediate', range: '6–10', icon: '🟡' },
  { key: 'intermediate', label: 'Intermediate', range: '11–15', icon: '🟠' },
  { key: 'advanced', label: 'Advanced', range: '16–18', icon: '🔴' },
  { key: 'expert', label: 'Expert', range: '19–20', icon: '🟣' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function DataStructureBattlePage() {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState('all');
  const [hoveredProblem, setHoveredProblem] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const switchToSignup = () => {
    setShowLoginModal(false);
    setTimeout(() => setShowSignupModal(true), 300); // Small delay for smooth transition or invoke immediately based on preference. Framer motion exit might take time.
    // Actually, setting state immediately is fine if AnimatePresence handles it.
    setShowSignupModal(true);
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const filteredProblems =
    selectedTier === 'all'
      ? problems
      : problems.filter((p) => p.tier === selectedTier);

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden selection:bg-blue-200 selection:text-blue-900">
      {/* Header — same as homepage */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-slate-400 hover:text-slate-900 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="font-mono text-sm">cd ..</span>
              </button>
              <div className="h-5 w-px bg-slate-200"></div>
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                <Swords className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-bold text-slate-900 font-mono tracking-tighter">CodeArena_</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-2 text-sm text-slate-500">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span><span className="text-slate-700 font-semibold">247</span> online</span>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-slate-500">
                <Swords className="w-4 h-4 text-blue-500" />
                <span><span className="text-slate-700 font-semibold">38</span> battles active</span>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="text-slate-600 hover:text-slate-900 font-medium font-mono text-sm"
              >
                Log_In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-slate-900 text-white px-5 py-2 rounded-md hover:bg-slate-800 font-medium shadow-lg shadow-slate-200 transition-all hover:shadow-xl active:scale-95"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 h-[200px] w-[400px] rounded-full bg-purple-400 opacity-10 blur-[100px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-slate-400 font-mono mb-6">
              <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate('/')}>home</span>
              <ChevronRight className="w-3 h-3" />
              <span className="hover:text-blue-600 cursor-pointer transition-colors">battles</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-700">data-structures</span>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                    <Swords className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 font-mono tracking-tight">
                      Classic Duel{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        Speed Run
                      </span>
                    </h1>
                  </div>
                </div>
                <p className="text-slate-500 text-lg max-w-xl">
                  Race your opponent through 20 data structure challenges. First to solve wins. No second chances.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center space-x-6 bg-white rounded-xl border border-slate-200 px-6 py-4 shadow-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-slate-900">20</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Problems</div>
                </div>
                <div className="h-10 w-px bg-slate-100"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-blue-600">5</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Tiers</div>
                </div>
                <div className="h-10 w-px bg-slate-100"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-indigo-600">4K+</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Points</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tier Filter */}
      <section className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 py-3 overflow-x-auto">
            <button
              onClick={() => setSelectedTier('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedTier === 'all'
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              All Tiers
            </button>
            {tiers.map((tier) => (
              <button
                key={tier.key}
                onClick={() => setSelectedTier(tier.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${selectedTier === tier.key
                    ? `${tierConfig[tier.key].bgLight} ${tierConfig[tier.key].text} border ${tierConfig[tier.key].border}`
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <span>{tier.icon}</span>
                <span>{tier.label}</span>
                <span className="text-xs opacity-60">({tier.range})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Problems List */}
      <section className="py-8">
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={switchToSignup}
        />
        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSwitchToLogin={switchToLogin}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTier}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {filteredProblems.map((problem, index) => {
                const tc = tierConfig[problem.tier];
                const isHovered = hoveredProblem === problem.id;

                return (
                  <motion.div
                    key={problem.id}
                    custom={index}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    onMouseEnter={() => setHoveredProblem(problem.id)}
                    onMouseLeave={() => setHoveredProblem(null)}
                    className={`relative bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 cursor-pointer group hover:shadow-md ${tc.hoverBorder}`}
                  >
                    {/* Left tier indicator */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${tc.dot} transition-all ${isHovered ? 'w-1.5' : ''}`}></div>

                    <div className="flex items-center px-6 py-5">
                      {/* Problem Number */}
                      <div className={`w-10 h-10 rounded-lg ${tc.bgLight} border ${tc.border} flex items-center justify-center mr-5 shrink-0`}>
                        <span className={`font-bold font-mono text-sm ${tc.text}`}>
                          {String(problem.id).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Problem Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-lg font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {problem.title}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${tc.badge} shrink-0`}>
                            {problem.tierLabel}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <span className="flex items-center">
                            <Cpu className="w-3.5 h-3.5 mr-1.5" />
                            {problem.concept}
                          </span>
                          <span className="hidden md:flex items-center">
                            <Target className="w-3.5 h-3.5 mr-1.5" />
                            {problem.coreSkill}
                          </span>
                          <span className="hidden lg:flex items-center text-orange-500">
                            <Zap className="w-3.5 h-3.5 mr-1.5" />
                            {problem.pressureFactor}
                          </span>
                        </div>
                      </div>

                      {/* Right Side */}
                      <div className="flex items-center space-x-6 ml-4 shrink-0">
                        <div className="hidden md:flex items-center space-x-1.5 text-slate-400 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{problem.timeLimit}m</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-1.5 text-amber-600 text-sm font-mono">
                          <Star className="w-4 h-4" />
                          <span>{problem.points}pts</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowLoginModal(true)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isHovered
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                        >
                          <Play className="w-4 h-4" />
                          <span>Battle</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-slate-100"
                        >
                          <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center space-x-8 text-sm">
                              <div>
                                <span className="text-slate-400">Concept: </span>
                                <span className="text-slate-700 font-medium">{problem.concept}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Core Skill: </span>
                                <span className="text-slate-700 font-medium">{problem.coreSkill}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Pressure Factor: </span>
                                <span className="text-orange-600 font-medium">{problem.pressureFactor}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-slate-400">{problem.timeLimit} min limit</span>
                              <span className="text-xs text-amber-600 font-mono font-semibold">+{problem.points} pts</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Bottom CTA — same style as homepage */}
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
              &gt; READY_TO_DUEL?
            </h3>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-light">
              Pick any problem, get matched with an opponent, and race to solve it first.
              <br />The arena awaits your code.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-lg hover:bg-blue-50 font-bold text-lg transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Quick Match</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto text-white border border-slate-700 px-8 py-4 rounded-lg hover:bg-slate-800 font-medium text-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer — same as homepage */}
      <footer className="bg-slate-950 text-slate-500 py-12 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Swords className="w-4 h-4 text-blue-600" />
              <span className="text-white font-bold font-mono">CodeArena_</span>
              <span className="text-slate-600">•</span>
              <span>&copy; 2026 All rights reserved.</span>
            </div>
            <div className="flex space-x-6 font-mono">
              <span>System Status: <span className="text-green-500">Online</span></span>
              <span>v2.4.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
