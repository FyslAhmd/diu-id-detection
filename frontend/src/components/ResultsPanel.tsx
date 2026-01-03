import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Detection } from '../types/detection';
import { Clock, Target, Layers, TrendingUp, Award } from 'lucide-react';

interface ResultsPanelProps {
  detections: Detection[];
  inferenceTime: number;
  imageWidth: number;
  imageHeight: number;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  detections,
  inferenceTime,
  imageWidth,
  imageHeight,
}) => {
  const avgConfidence =
    detections.length > 0
      ? detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length
      : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const statsData = [
    {
      icon: Target,
      label: 'Detections',
      value: detections.length,
      gradient: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400'
    },
    {
      icon: TrendingUp,
      label: 'Confidence',
      value: `${(avgConfidence * 100).toFixed(1)}%`,
      gradient: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400'
    },
    {
      icon: Clock,
      label: 'Inference',
      value: `${inferenceTime.toFixed(0)}ms`,
      gradient: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400'
    },
    {
      icon: Layers,
      label: 'Resolution',
      value: `${imageWidth}×${imageHeight}`,
      gradient: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 h-fit"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg sm:rounded-xl">
          <Award className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white">Detection Results</h3>
      </div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {statsData.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className={`${stat.bgColor} rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5`}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className={`flex items-center gap-1.5 sm:gap-2 ${stat.textColor} mb-1 sm:mb-2`}>
              <stat.icon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider opacity-80">{stat.label}</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Detections List */}
      <AnimatePresence mode="wait">
        {detections.length > 0 ? (
          <motion.div
            key="detections-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h4 className="text-xs sm:text-sm font-semibold text-white/60 uppercase tracking-wider">Detected Objects</h4>
              <span className="text-[10px] sm:text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 sm:py-1 rounded-full">
                {detections.length} found
              </span>
            </div>
            
            <motion.div 
              className="space-y-2 sm:space-y-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-1 sm:pr-2"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {detections.map((detection, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative flex items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all duration-300"
                  whileHover={{ x: 5 }}
                >
                  {/* Index badge */}
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm sm:text-base font-bold">{index + 1}</span>
                  </div>
                  
                  {/* Detection info */}
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-white text-sm sm:text-base capitalize truncate">
                      {detection.class_name.replace('_', ' ')}
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/50 mt-0.5 sm:mt-1 hidden sm:block">
                      ({Math.round(detection.bbox.x1)}, {Math.round(detection.bbox.y1)}) → 
                      ({Math.round(detection.bbox.x2)}, {Math.round(detection.bbox.y2)})
                    </p>
                  </div>
                  
                  {/* Confidence bar */}
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {(detection.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-12 sm:w-20 h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${detection.confidence * 100}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="no-detections"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 sm:py-12"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block p-4 sm:p-6 bg-white/5 rounded-full mb-3 sm:mb-4"
            >
              <Target className="h-8 w-8 sm:h-12 sm:w-12 text-white/30" />
            </motion.div>
            <p className="text-white/60 font-medium text-sm sm:text-base">No ID cards detected</p>
            <p className="text-white/40 text-xs sm:text-sm mt-1 sm:mt-2 px-4">
              Upload an image or use the camera to start
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResultsPanel;
