import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Code, User, Mail, Lock, Check, ArrowRight, Shield } from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreed: false
  });

  const [focusedField, setFocusedField] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-['JetBrains_Mono'] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[#F8FAFC]"></div>
      </div>

      <div className="w-full max-w-6xl shadow-xl rounded-2xl bg-white border border-slate-200 relative z-10 flex flex-col md:flex-row overflow-hidden">

        {/* Left Side - Visual / Branding */}
        <div className="hidden md:flex flex-col justify-between w-5/12 bg-slate-50 p-10 border-r border-slate-200 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200 text-blue-600">
                <Terminal size={24} strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CodeBattle</h1>
            </div>
            <p className="text-blue-600 text-sm font-medium tracking-wide">COMPETE. CODE. CONQUER.</p>
          </div>

          <div className="my-12 relative group">
            <div className="relative bg-white rounded-lg border border-slate-200 p-6 font-mono text-sm leading-relaxed overflow-hidden shadow-sm">
              <div className="flex gap-1.5 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="text-slate-500">
                <span className="text-purple-600">class</span> <span className="text-yellow-600">Player</span> <span className="text-slate-800">{'{'}</span>
                <br />
                &nbsp;&nbsp;<span className="text-purple-600">constructor</span>(<span className="text-orange-600">username</span>) <span className="text-slate-800">{'{'}</span>
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-600">this</span>.username = username;
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-600">this</span>.rank = <span className="text-green-600">'Novice'</span>;
                <br />
                &nbsp;&nbsp;<span className="text-slate-800">{'}'}</span>
                <br />
                <br />
                &nbsp;&nbsp;<span className="text-blue-600">joinBattle</span>() <span className="text-slate-800">{'{'}</span>
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-400">// Ready to dominate?</span>
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-600">return</span> <span className="text-blue-600">true</span>;
                <br />
                &nbsp;&nbsp;<span className="text-slate-800">{'}'}</span>
                <br />
                <span className="text-slate-800">{'}'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600">
                <Code size={16} />
              </div>
              <span>Join 50K+ developers</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600">
                <Shield size={16} />
              </div>
              <span>Anti-cheat protected</span>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-white relative">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Initialize Account</h2>
            <p className="text-slate-500">Enter your credentials to access the arena.</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>

            {/* Username */}
            <div className="relative group">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Username</label>
              <div className={`relative flex items-center bg-slate-50 border rounded-lg transition-all duration-300 ${focusedField === 'username' ? 'border-blue-600 ring-1 ring-blue-600 bg-white' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="pl-4 text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent text-slate-900 p-3.5 focus:outline-none placeholder-slate-400 font-medium"
                  placeholder="codewarrior_01"
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative group">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
              <div className={`relative flex items-center bg-slate-50 border rounded-lg transition-all duration-300 ${focusedField === 'email' ? 'border-blue-600 ring-1 ring-blue-600 bg-white' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="pl-4 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent text-slate-900 p-3.5 focus:outline-none placeholder-slate-400 font-medium"
                  placeholder="dev@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Password */}
              <div className="relative group">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Password</label>
                <div className={`relative flex items-center bg-slate-50 border rounded-lg transition-all duration-300 ${focusedField === 'password' ? 'border-blue-600 ring-1 ring-blue-600 bg-white' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="pl-4 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent text-slate-900 p-3.5 focus:outline-none placeholder-slate-400 font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative group">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Confirm Info</label>
                <div className={`relative flex items-center bg-slate-50 border rounded-lg transition-all duration-300 ${focusedField === 'confirm' ? 'border-blue-600 ring-1 ring-blue-600 bg-white' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="pl-4 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent text-slate-900 p-3.5 focus:outline-none placeholder-slate-400 font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  name="agreed"
                  id="agreed"
                  checked={formData.agreed}
                  onChange={handleInputChange}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:border-blue-600 checked:bg-blue-600 transition-all"
                />
                <Check size={14} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <label htmlFor="agreed" className="text-sm text-slate-600 cursor-pointer select-none">
                I agree to the <span className="text-blue-600 hover:underline">Rules</span> & <span className="text-blue-600 hover:underline">Fair Play Policy</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full group relative flex items-center justify-center gap-3 p-4 mt-6 bg-blue-600 rounded-lg text-white font-bold text-lg tracking-wide hover:bg-blue-700 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span>CREATE ACCOUNT</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Log in to Terminal
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
