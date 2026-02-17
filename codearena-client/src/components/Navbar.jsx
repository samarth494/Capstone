import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Swords, Terminal as TerminalIcon, LogOut, Menu, X, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ items = [], user = null, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) onLogout();
    else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 h-16 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate(user ? '/dashboard' : '/')}>
              <Swords className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900 font-mono tracking-tighter">CodeArena_</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 font-mono text-sm h-full">
              {items.map((item, index) => (
                <button 
                  key={index}
                  onClick={item.action} 
                  className={`group relative flex items-center h-full font-medium transition-colors ${
                    location.pathname === item.path ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 transition-transform duration-300 ease-out ${
                    location.pathname === item.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </button>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                // Authenticated View
                <div className="hidden md:flex items-center space-x-4">
                  <button
                      onClick={() => navigate(`/profile/${user._id}`)}
                      className="flex items-center space-x-2 text-sm text-slate-600 mr-4 hover:text-blue-600 transition-colors font-mono"
                  >
                      <TerminalIcon size={16} />
                      <span>{user.username}</span>
                  </button>
                  <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="flex items-center space-x-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium"
                  >
                      <LogOut size={18} />
                      <span>Logout</span>
                  </button>
                </div>
              ) : (
                // Public View
                <div className="hidden md:flex items-center space-x-4">
                  <button onClick={() => navigate('/login')} className="text-slate-600 hover:text-slate-900 font-medium font-mono text-sm">Log_In</button>
                  <button 
                    onClick={() => navigate('/signup')} 
                    className="bg-slate-900 text-white px-5 py-2 rounded-md hover:bg-slate-800 font-medium shadow-lg shadow-slate-200 transition-all hover:shadow-xl active:scale-95"
                  >
                    Get Started
                  </button>
                </div>
              )}

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
                            {items.map((item, idx) => (
                              <button 
                                key={idx}
                                onClick={() => { item.action(); setIsMenuOpen(false); }} 
                                className="block w-full text-left px-4 text-slate-600 hover:text-blue-600 transition-colors font-medium text-lg"
                              >
                                {item.label}
                              </button>
                            ))}
                        </div>
                        
                        <div className="h-px bg-slate-100 w-full my-6"></div>

                        <div className="px-2">
                          {user ? (
                            <div className="space-y-4">
                                <button onClick={() => navigate(`/profile/${user._id}`)} className="flex items-center justify-center w-full py-3 text-slate-600 font-bold border border-slate-200 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-all gap-2">
                                    <User size={18} /> Profile
                                </button>
                                <button onClick={handleLogout} className="flex items-center justify-center w-full py-3 text-red-600 font-bold border border-red-100 rounded-lg hover:bg-red-50 transition-all gap-2">
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => navigate('/login')} className="flex items-center justify-center py-3 text-slate-600 font-bold border border-slate-200 rounded-lg hover:border-slate-400 hover:text-slate-900 transition-all">
                                    Log_In
                                </button>
                                <button onClick={() => navigate('/signup')} className="flex items-center justify-center py-3 text-slate-900 font-bold border-2 border-slate-900 rounded-lg hover:bg-slate-50 transition-all">
                                    Sign_Up
                                </button>
                            </div>
                          )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full mx-4 transform transition-all scale-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Logout</h3>
                  <p className="text-slate-500 mb-6">
                      Are you sure you want to terminate your session?
                  </p>
                  <div className="flex justify-end gap-3">
                      <button
                          onClick={() => setShowLogoutConfirm(false)}
                          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                      >
                          Cancel
                      </button>
                      <button
                          onClick={handleLogout}
                          className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                          <LogOut size={16} />
                          <span>Logout</span>
                      </button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
}
