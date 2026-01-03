import { memo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Cpu, CheckCircle2, Loader2 } from 'lucide-react';

interface HeaderProps {
  isModelLoaded: boolean;
}

const Header = memo<HeaderProps>(({ isModelLoaded }) => {
  return (
    <header className="relative z-20">
      {/* Subtle top glow */}
      <div className="absolute inset-x-0 top-0 h-20 sm:h-32 bg-gradient-to-b from-purple-600/10 to-transparent pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <nav className="flex items-center justify-between gap-2">
          {/* Logo Section */}
          <motion.div 
            className="flex items-center gap-2 sm:gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Logo Icon */}
            <div className="relative group flex-shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg sm:rounded-xl blur opacity-40 group-hover:opacity-60 transition duration-300" />
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
                <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            
            {/* Title */}
            <div className="flex flex-col min-w-0">
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent truncate">
                ID Card Detector
              </h1>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                <Cpu className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs text-white/50 font-medium tracking-wide truncate">
                  YOLOv11 • AI
                </span>
              </div>
            </div>
          </motion.div>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-shrink-0"
          >
            <div className={`
              flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-full 
              border backdrop-blur-sm transition-all duration-300
              ${isModelLoaded 
                ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                : 'bg-amber-500/10 border-amber-500/20'
              }
            `}>
              {isModelLoaded ? (
                <>
                  <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-emerald-400">Ready</span>
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 hidden sm:block" />
                </>
              ) : (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-spin" />
                  <span className="text-xs sm:text-sm font-medium text-amber-400">Loading</span>
                </>
              )}
            </div>
          </motion.div>
        </nav>
      </div>
      
      {/* Separator line */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
