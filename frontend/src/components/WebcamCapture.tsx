import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { Camera, CameraOff, RefreshCw, Play, Pause, Zap } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  isLoading: boolean;
  isAutoCapture: boolean;
  onToggleAutoCapture: () => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  onCapture,
  isLoading,
  isAutoCapture,
  onToggleAutoCapture,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isCapturing, setIsCapturing] = useState(false);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode,
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, []);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      setIsCapturing(true);
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
      setTimeout(() => setIsCapturing(false), 200);
    }
  }, [onCapture]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutoCapture && !isLoading && hasPermission) {
      interval = setInterval(() => {
        capture();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoCapture, isLoading, hasPermission, capture]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (hasPermission === null) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col sm:flex-row items-center justify-center h-48 sm:h-72 glass-card rounded-2xl sm:rounded-3xl gap-3 sm:gap-4 p-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Camera className="h-8 w-8 sm:h-12 sm:w-12 text-purple-400" />
        </motion.div>
        <p className="text-sm sm:text-base text-white/60 text-center">Checking camera permissions...</p>
      </motion.div>
    );
  }

  if (hasPermission === false) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-48 sm:h-72 glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-red-500/20 p-4 sm:p-6 rounded-full mb-4 sm:mb-6"
        >
          <CameraOff className="h-8 w-8 sm:h-12 sm:w-12 text-red-400" />
        </motion.div>
        <p className="text-white font-semibold text-base sm:text-lg mb-1 sm:mb-2">Camera Access Denied</p>
        <p className="text-white/60 text-xs sm:text-sm text-center max-w-md px-4">
          Please allow camera access in your browser settings to use the live detection feature.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
        {/* Webcam feed */}
        <div className="relative bg-black rounded-2xl sm:rounded-3xl overflow-hidden">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-auto"
          />
          
          {/* Scanning overlay */}
          <AnimatePresence>
            {isAutoCapture && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                {/* Scan line */}
                <motion.div
                  className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                  style={{ boxShadow: '0 0 20px #a855f7, 0 0 40px #a855f7' }}
                  animate={{ top: ['0%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                
                {/* Corner brackets */}
                <div className="absolute top-4 left-4 sm:top-8 sm:left-8 w-8 h-8 sm:w-16 sm:h-16 border-l-2 sm:border-l-4 border-t-2 sm:border-t-4 border-purple-500 rounded-tl-lg" />
                <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-8 h-8 sm:w-16 sm:h-16 border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-purple-500 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 w-8 h-8 sm:w-16 sm:h-16 border-l-2 sm:border-l-4 border-b-2 sm:border-b-4 border-purple-500 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-8 h-8 sm:w-16 sm:h-16 border-r-2 sm:border-r-4 border-b-2 sm:border-b-4 border-purple-500 rounded-br-lg" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Capture flash effect */}
          <AnimatePresence>
            {isCapturing && (
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-white pointer-events-none"
              />
            )}
          </AnimatePresence>
          
          {/* Auto-detecting badge */}
          <AnimatePresence>
            {isAutoCapture && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </motion.div>
                <span className="text-white text-xs sm:text-sm font-semibold">Auto</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Controls overlay */}
          <div className="absolute bottom-3 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:gap-4">
            {/* Switch camera */}
            <motion.button
              onClick={toggleCamera}
              className="p-2.5 sm:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Switch camera"
            >
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </motion.button>
            
            {/* Capture button */}
            <motion.button
              onClick={capture}
              disabled={isLoading}
              className="relative p-4 sm:p-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-2xl disabled:opacity-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Capture"
            >
              <Camera className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 sm:border-4 border-purple-400"
                animate={{ scale: [1, 1.3], opacity: [1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.button>
            
            {/* Auto capture toggle */}
            <motion.button
              onClick={onToggleAutoCapture}
              className={`p-2.5 sm:p-4 backdrop-blur-md rounded-full border transition-all ${
                isAutoCapture
                  ? 'bg-green-500/30 border-green-400/50 hover:bg-green-500/40'
                  : 'bg-white/10 border-white/20 hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={isAutoCapture ? 'Stop auto capture' : 'Start auto capture'}
            >
              {isAutoCapture ? (
                <Pause className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
              ) : (
                <Play className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <motion.p 
        className="text-center text-white/50 text-xs sm:text-sm mt-3 sm:mt-4 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Position your ID card within the camera frame
      </motion.p>
    </motion.div>
  );
};

export default WebcamCapture;
