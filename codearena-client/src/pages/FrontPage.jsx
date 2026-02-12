import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Trophy, Users, Code, Zap, Target, Clock, TrendingUp } from 'lucide-react';

export default function Frontpage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { icon: Users, label: 'Active Nodes', value: '50K+' },
    { icon: Code, label: 'Challenges Deployed', value: '2,500+' },
    { icon: Trophy, label: 'Compiles Today', value: '1,200+' },
    { icon: TrendingUp, label: 'System Uptime', value: '99.9%' }
  ];



  const features = [
    {
      icon: Swords,
      title: 'Real-Time Battles',
      description: 'Challenge developers worldwide in live coding duels with instant feedback and rankings.'
    },
    {
      icon: Target,
      title: 'Skill-Based Matching',
      description: 'Our algorithm pairs you with opponents of similar skill level for fair competition.'
    },
    {
      icon: Clock,
      title: 'Timed Challenges',
      description: 'Race against the clock to solve problems faster than your opponent.'
    },
    {
      icon: Trophy,
      title: 'Leaderboards & Rewards',
      description: 'Climb the ranks, earn achievements, and unlock exclusive badges.'
    }
  ];

  const recentBattles = [
    { player1: 'alex_dev', player2: 'sarah_codes', problem: 'Two Sum', winner: 'alex_dev', time: '2m 34s' },
    { player1: 'mike_js', player2: 'jenny_py', problem: 'Binary Search', winner: 'jenny_py', time: '1m 52s' },
    { player1: 'code_ninja', player2: 'dev_master', problem: 'Valid Parentheses', winner: 'code_ninja', time: '3m 12s' }
  ];

  const problemCategories = [
    { name: 'Arrays', count: 450, difficulty: 'Easy to Hard' },
    { name: 'Dynamic Programming', count: 320, difficulty: 'Medium to Hard' },
    { name: 'Trees & Graphs', count: 380, difficulty: 'Easy to Hard' },
    { name: 'String Manipulation', count: 290, difficulty: 'Easy to Medium' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Swords className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900 font-mono tracking-tighter">CodeArena_</h1>
            </div>
            <nav className="hidden md:flex space-x-8 font-mono text-sm">
              <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">./Prob</a>
              <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">./Battle</a>
              <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">./Leaderboard</a>
              <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">./Community</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/login')} className="text-gray-700 hover:text-gray-900 font-medium">Sign In</button>
              <button onClick={() => navigate('/signup')} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 font-medium">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-slate-50 py-20 px-4 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto z-10 relative">
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 font-mono tracking-tight">
            <span className="text-blue-600 mr-2">&gt;</span>INIT_BATTLE_MODE()<span className="animate-pulse">_</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-mono leading-relaxed">
            Real-time 1v1. Syntax highlights on. Compilation errors off.<br />
            <span className="text-blue-600">const</span> winner = <span className="text-blue-600">await</span> code.execute();
          </p>
          <div className="flex justify-center space-x-6">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-sm hover:bg-blue-700 font-mono text-lg flex items-center shadow-lg hover:translate-y-1 transition-all">
              <Zap className="w-5 h-5 mr-3" />
              Start_Battle
            </button>
            <button className="bg-white text-slate-800 px-8 py-4 rounded-sm hover:bg-slate-50 font-mono text-lg border-2 border-slate-200 hover:border-blue-400 transition-colors">
              cd /practice
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center group hover:bg-white p-4 rounded transition-all">
                <stat.icon className="w-8 h-8 mx-auto text-slate-500 group-hover:text-blue-600 mb-3 transition-colors" />
                <div className="text-2xl font-bold text-slate-900 font-mono">{stat.value}</div>
                <div className="text-slate-500 text-sm font-mono mt-1 text-xs uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'problems', 'battles'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 font-medium border-b-2 transition-colors ${activeTab === tab
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'overview' && (
            <div className="space-y-12">
              {/* Features Grid */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Why CodeArena?</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {features.map((feature, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                      <feature.icon className="w-10 h-10 text-blue-600 mb-4" />
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h4>
                      <p className="text-slate-500 text-sm">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Battles */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Recent Battles</h3>
                <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200 font-mono text-xs">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Battle_ID</th>
                        <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Target_Problem</th>
                        <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Winner</th>
                        <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Exec_Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-sm">
                      {recentBattles.map((battle, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                            <span className="text-slate-500">&lt;</span>{battle.player1}<span className="text-slate-500">/&gt;</span> vs <span className="text-slate-500">&lt;</span>{battle.player2}<span className="text-slate-500">/&gt;</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-blue-600">{battle.problem}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-green-600 font-medium">{battle.winner}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">{battle.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'problems' && (
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Problem Categories</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {problemCategories.map((category, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-semibold text-slate-900">{category.name}</h4>
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {category.count}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mb-4">Difficulty: {category.difficulty}</p>
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      View Problems →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'battles' && (
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Battle Modes</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-center">
                  <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-slate-900 mb-2">Quick Match</h4>
                  <p className="text-slate-500 text-sm mb-6">Get matched instantly with an opponent of similar skill level</p>
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                    Find Match
                  </button>
                </div>
                <div className="bg-white p-8 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-center">
                  <Trophy className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-slate-900 mb-2">Tournament</h4>
                  <p className="text-slate-500 text-sm mb-6">Compete in bracket-style tournaments for glory and prizes</p>
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                    Join Tournament
                  </button>
                </div>
                <div className="bg-white p-8 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-center">
                  <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-slate-900 mb-2">Private Battle</h4>
                  <p className="text-slate-500 text-sm mb-6">Challenge your friends to a custom coding duel</p>
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                    Create Room
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h3 className="text-3xl font-bold text-white mb-6 font-mono">
            &gt; READY_TO_DEPLOY?
          </h3>
          <p className="text-xl text-slate-500 mb-8 max-w-2xl mx-auto font-mono">
            Join the network. 0 compilations failed.
          </p>
          <button onClick={() => navigate('/signup')} className="bg-white text-orange-500 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold text-lg">
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Swords className="w-6 h-6 text-blue-600" />
                <span className="text-white font-bold text-lg">CodeArena</span>
              </div>
              <p className="text-sm">The ultimate platform for competitive coding battles.</p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Problems</a></li>
                <li><a href="#" className="hover:text-white">Battles</a></li>
                <li><a href="#" className="hover:text-white">Leaderboard</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2026 CodeArena. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}