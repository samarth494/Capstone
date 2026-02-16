import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  EyeOff, 
  Terminal, 
  Trophy, 
  Zap, 
  Cpu, 
  ChevronRight,
  Code,
  Swords,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, y: 30, transition: { duration: 0.4, ease: "easeIn" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.4 } }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.4 } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
  exit: { opacity: 0, x: 50, transition: { duration: 0.4 } }
};

export default function EventShowcasePage() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = React.useState(false);

  // Animation complete hone ke baad content show karo
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 3500); // 3.5 seconds animation

    return () => clearTimeout(timer);
  }, []);

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
        className="min-h-screen bg-slate-50 font-['JetBrains_Mono'] selection:bg-purple-200 selection:text-purple-900 overflow-x-hidden"
      >
      
      {/* Navbar - Light */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <motion.div whileHover={{ rotate: 360, transition: { duration: 0.8 } }}>
                <Swords className="w-6 h-6 text-purple-600" />
              </motion.div>
              <span className="text-xl font-bold text-slate-900 tracking-tighter">CodeArena_Events</span>
            </div>
            <div className="flex items-center space-x-6">
              <button onClick={() => navigate('/login')} className="text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">Log In</button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/signup')} 
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-slate-500/20"
              >
                Register
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Light */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-xs font-bold uppercase tracking-widest mb-8">
              <span className="w-2 h-2 rounded-full bg-purple-600 mr-2 animate-pulse"></span>
              Season 4 Finale
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight leading-tight font-mono">
              BLIND <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">CODING</span>
              <br />CHAMPIONSHIP
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-slate-600 text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              No syntax highlighting. No auto-complete. No visibility.
              <br />
              Just you, your memory, and the raw code.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(147, 51, 234, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/signup')} 
                className="px-8 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-all flex items-center justify-center shadow-xl shadow-purple-200"
              >
                Accept Challenge <ChevronRight className="w-5 h-5 ml-2" />
              </motion.button>

            </motion.div>
          </motion.div>
        </div>

        {/* Visual Element - Light/Clean container with dark code preview */}
        <div className="mt-20 relative max-w-5xl mx-auto px-4">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-purple-200/50 blur-[100px] rounded-full"
          ></motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 100, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.4, type: "spring" }}
            className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden perspective-1000"
          >
            <div className="flex items-center px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="ml-4 text-xs text-slate-400 font-mono font-bold tracking-wider">mission_critical.c</div>
            </div>
            <div className="p-12 relative bg-[#0f172a]"> {/* Keeping editor dark for contrast / realism */}
              <div className="absolute inset-0 bg-[#0f172a]/95 flex items-center justify-center z-10 backdrop-blur-[2px]">
                <div className="text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-slate-700"
                  >
                    <EyeOff className="w-10 h-10 text-slate-400" />
                  </motion.div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-slate-400 font-mono text-sm tracking-[0.2em] uppercase font-bold"
                  >
                    Visibility: Disabled
                  </motion.p>
                </div>
              </div>
              <pre className="text-sm font-mono text-slate-600 blur-sm select-none opacity-50">
                <code>
                  #include &lt;stdio.h&gt;{'\n'}
                  #include &lt;stdlib.h&gt;{'\n'}
                  {'\n'}
                  int main() {'{'}{'\n'}
                  {'  '}// The code is hidden.{'\n'}
                  {'  '}// Your mind is the compiler.{'\n'}
                  {'  '}return 0;{'\n'}
                  {'}'}
                </code>
              </pre>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rules Grid - Light */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            exit="exit"
            viewport={{ once: false, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 font-mono mb-4">Blind Coding Rules</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Strict conditions to ensure only the best prevail.</p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            exit="exit"
            viewport={{ once: false, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Cpu,
                title: "Memory Limit",
                desc: "Standard library functions only. No external documentation allowed. Pure algorithm implementation."
              },
              {
                icon:   Zap,
                title: "Single Compile",
                desc: "You get exactly one chance to compile. Warnings are treated as errors. Make it count."
              },
              {
                icon: Trophy,
                title: "Grand Prize",
                desc: "Winner takes home 5000 XP, the 'Daredevil' profile badge, and season championship points."
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                variants={scaleIn}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-purple-200 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 font-mono">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works - Light */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <motion.h2 
              initial="hidden"
              whileInView="visible"
              exit="exit"
              viewport={{ once: false }}
              variants={slideInLeft}
              className="text-4xl font-bold text-slate-900 mb-8 font-mono"
            >
              How It Works
            </motion.h2>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              exit="exit"
              viewport={{ once: false }}
              variants={staggerContainer}
              className="space-y-10"
            >
              {[
                { step: "01", title: "Registration", desc: "Sign up and join the lobby before the timer hits zero." },
                { step: "02", title: "Blackout", desc: "For 30 minutes, your editor goes dark. You can type, but you can't see." },
                { step: "03", title: "Revelation", desc: "At the buzzer, visibility returns. One compile. One run. Does it pass?" }
              ].map((s, i) => (
                <motion.div key={i} variants={fadeInUp} className="flex group">
                  <div className="mr-6 flex flex-col items-center">
                    <span className="text-3xl font-bold text-slate-200 font-mono group-hover:text-purple-600 transition-colors">{s.step}</span>
                    {i !== 2 && <div className="w-px h-full bg-slate-200 my-2"></div>}
                  </div>
                  <div className="pb-8">
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            exit="exit"
            viewport={{ once: false }}
            variants={slideInRight}
            className="flex-1"
          >
             <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl relative">
               <motion.div 
                 animate={{ y: [0, -5, 0] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute -top-4 -right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg"
               >
                 Live Preview
               </motion.div>
               
               <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                 <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Code className="w-5 h-5 text-purple-600" />
                 </div>
                 <div>
                   <div className="text-sm font-bold text-slate-900">Challenge: Reverse Linked List</div>
                   <div className="text-xs text-slate-500 font-mono">Difficulty: Hard</div>
                 </div>
               </div>

               <div className="font-mono text-sm space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-100">
                 <div className="text-slate-400 italic">// Write your solution below...</div>
                 <div className="text-purple-600 font-bold">struct Node* reverse(struct Node* head) {'{'}</div>
                 <div className="text-transparent select-none bg-slate-800 rounded relative overflow-hidden p-3 my-2">
                   <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-widest bg-slate-900">
                      Input Hidden
                   </div>
                   <span className="opacity-0">
                   {'  '}struct Node* prev = NULL;{'\n'}
                   {'  '}struct Node* current = head;{'\n'}
                   {'  '}struct Node* next = NULL;
                   </span>
                 </div>
                 <div className="text-purple-600 font-bold">{'}'}</div>
               </div>

               <div className="mt-6 flex gap-3">
                 <motion.button 
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-bold text-sm shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                 >
                    <Play className="w-4 h-4" /> Run Tests
                 </motion.button>
               </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* CTA - Light */}
      <section className="py-32 text-center px-4 bg-white border-t border-slate-200">
        <motion.div
           initial="hidden"
           whileInView="visible"
           exit="exit"
           viewport={{ once: false }}
           variants={scaleIn}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 font-mono tracking-tight">Ready to code in the dark?</h2>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')} 
            className="bg-purple-600 text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-purple-700 transition-all shadow-[0_10px_40px_-10px_rgba(147,51,234,0.5)]"
          >
            Register for Blind Coding
          </motion.button>
        </motion.div>
      </section>

      {/* Footer - Light */}
      <footer className="border-t border-slate-200 py-12 bg-slate-50 text-center text-slate-500 text-sm">
        <p>&copy; 2026 CodeArena. The darkness awaits.</p>
        <div className="mt-4 flex justify-center space-x-6">
          <a href="#" className="hover:text-purple-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-purple-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-purple-600 transition-colors">Support</a>
        </div>
      </footer>
      </motion.div>
    </>
  );
}
