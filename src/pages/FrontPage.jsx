import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Trophy, Users, Code, Zap, Target, Clock, TrendingUp } from 'lucide-react';

export default function Frontpage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { icon: Users, label: 'Active Users', value: '50K+' },
    { icon: Code, label: 'Problems', value: '2,500+' },
    { icon: Trophy, label: 'Battles Today', value: '1,200+' },
    { icon: TrendingUp, label: 'Success Rate', value: '78%' }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Swords className="w-8 h-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">CodeArena</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-gray-900">Problems</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Battles</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Leaderboard</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Community</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/signup')} className="text-gray-700 hover:text-gray-900 font-medium">Sign In</button>
              <button onClick={() => navigate('/signup')} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 font-medium">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-yellow-50 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Battle. Code. Conquer.
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Challenge developers worldwide in real-time coding battles. Sharpen your skills, climb the leaderboard, and become a coding champion.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 font-semibold text-lg flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Start Battle
            </button>
            <button className="bg-white text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold text-lg border border-gray-300">
              Practice Mode
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <stat.icon className="w-10 h-10 mx-auto text-orange-500 mb-3" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white border-b border-gray-200">
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why CodeArena?</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {features.map((feature, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all">
                      <feature.icon className="w-10 h-10 text-orange-500 mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Battles */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Battles</h3>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Winner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentBattles.map((battle, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {battle.player1} vs {battle.player2}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{battle.problem}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="text-orange-600 font-medium">{battle.winner}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{battle.time}</td>
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
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Problem Categories</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {problemCategories.map((category, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-semibold text-gray-900">{category.name}</h4>
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                        {category.count}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Difficulty: {category.difficulty}</p>
                    <button className="text-orange-500 hover:text-orange-600 font-medium text-sm">
                      View Problems →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'battles' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Battle Modes</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all text-center">
                  <Zap className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Quick Match</h4>
                  <p className="text-gray-600 text-sm mb-6">Get matched instantly with an opponent of similar skill level</p>
                  <button className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 font-medium">
                    Find Match
                  </button>
                </div>
                <div className="bg-white p-8 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all text-center">
                  <Trophy className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Tournament</h4>
                  <p className="text-gray-600 text-sm mb-6">Compete in bracket-style tournaments for glory and prizes</p>
                  <button className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 font-medium">
                    Join Tournament
                  </button>
                </div>
                <div className="bg-white p-8 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all text-center">
                  <Users className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Private Battle</h4>
                  <p className="text-gray-600 text-sm mb-6">Challenge your friends to a custom coding duel</p>
                  <button className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 font-medium">
                    Create Room
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-yellow-500 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Prove Your Skills?</h3>
          <p className="text-xl text-white mb-8 opacity-90">
            Join thousands of developers competing daily. Start your journey to the top today.
          </p>
          <button className="bg-white text-orange-500 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold text-lg">
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Swords className="w-6 h-6 text-orange-500" />
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
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2026 CodeArena. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}