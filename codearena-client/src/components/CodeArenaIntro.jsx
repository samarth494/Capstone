import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sword } from 'lucide-react';

const CodeArenaIntro = ({ onComplete }) => {
  const [stage, setStage] = useState('start');

  useEffect(() => {
    let mounted = true;
    const sequence = async () => {
      // 1. Start: Swords fly in
      await new Promise(r => setTimeout(r, 100));
      if (!mounted) return;
      setStage('clash');

      // 2. Clash moment: Swords cross
      await new Promise(r => setTimeout(r, 1000));
      if (!mounted) return;
      setStage('text'); // Show text

      // 3. Hold and Reveal
      await new Promise(r => setTimeout(r, 1000));
      if (!mounted) return;
      
      // 4. Trigger Layout Transition
      onComplete();
    };
    sequence();
    return () => { mounted = false; };
  }, [onComplete]);

  // Framer Motion variants for cleaner code
  const containerVariants = {
    start: { opacity: 0 },
    clash: { opacity: 1 },
    text: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50"
      initial="start"
      animate={stage}
      exit={{ opacity: 0, transition: { duration: 0.5 } }} 
    >
      <div className="relative flex items-center justify-center">
        <div className="flex items-center space-x-4">
            
            {/* The Logo Container (transitioning using layoutId) */}
            <motion.div 
                layoutId="logo-icon"
                className="relative w-24 h-24 flex items-center justify-center text-blue-600"
            >
               {/* Left Sword (pointing top-right in cross) */}
               <motion.div
                  initial={{ x: -60, y: 60, opacity: 0, rotate: -45 }}
                  animate={stage !== 'start' ? { x: 0, y: 0, opacity: 1, rotate: 0 } : {}}
                  transition={{ type: "spring", stiffness: 100, damping: 12, duration: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center"
               >
                 {/* Single Sword Icon, rotated to form one half of X */}
                 <Sword size={64} absoluteStrokeWidth className="transform scale-x-[-1]" />
               </motion.div>

               {/* Right Sword (pointing top-left in cross) */}
               <motion.div
                  initial={{ x: 60, y: 60, opacity: 0, rotate: 45 }}
                  animate={stage !== 'start' ? { x: 0, y: 0, opacity: 1, rotate: 0 } : {}}
                  transition={{ type: "spring", stiffness: 100, damping: 12, duration: 0.8, delay: 0.1 }}
                  className="absolute inset-0 flex items-center justify-center"
               >
                 <Sword size={64} absoluteStrokeWidth />
               </motion.div>

               {/* Add a subtle clash effect (spark or flash) */}
                 {stage === 'clash' && (
                    <motion.div
                        className="absolute w-12 h-12 bg-blue-400 rounded-full blur-xl opacity-0"
                        animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.5, 1] }}
                        transition={{ duration: 0.4 }}
                    />
                 )}
            </motion.div>

            {/* Text Reveal */}
            <div className="overflow-hidden">
                <motion.h1
                    layoutId="logo-text"
                    initial={{ width: 0, opacity: 0, x: -20 }}
                    animate={stage === 'text' || stage === 'finish' ? { width: 'auto', opacity: 1, x: 0 } : { width: 0, opacity: 0, x: -20 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="text-6xl font-bold text-slate-900 font-mono tracking-tighter whitespace-nowrap"
                >
                    CodeArena_
                </motion.h1>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CodeArenaIntro;

