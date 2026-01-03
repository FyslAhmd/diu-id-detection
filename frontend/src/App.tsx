import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import WebcamCapture from './components/WebcamCapture';
import DetectionCanvas from './components/DetectionCanvas';
import ResultsPanel from './components/ResultsPanel';
import LoadingSpinner from './components/LoadingSpinner';
import { Detection, DetectionMode } from './types/detection';
import { checkHealth, detectFromFile, detectFromBase64 } from './services/api';
import { Upload, Camera, AlertCircle, X, Sparkles } from 'lucide-react';

// Particle background component - reduced count for mobile performance
const ParticleBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 hidden sm:block">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-500/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -1000],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

function App() {
  // State
  const [mode, setMode] = useState<DetectionMode>('upload');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoCapture, setIsAutoCapture] = useState(false);

  // Detection results
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [inferenceTime, setInferenceTime] = useState(0);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  // Check API health on mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const health = await checkHealth();
        setIsModelLoaded(health.model_loaded);
        if (!health.model_loaded) {
          setError('Model not loaded on server. Please check the backend.');
        } else {
          setError(null);
        }
      } catch (err) {
        setError('Cannot connect to API server. Please ensure the backend is running.');
        setIsModelLoaded(false);
      }
    };

    checkApiHealth();
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle file upload detection
  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      const result = await detectFromFile(file);

      if (result.success) {
        setDetections(result.detections);
        setInferenceTime(result.inference_time_ms);
        setImageWidth(result.image_width);
        setImageHeight(result.image_height);
      } else {
        setError(result.message || 'Detection failed');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run detection';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle webcam capture detection
  const handleWebcamCapture = useCallback(async (base64Image: string) => {
    setIsLoading(true);
    setError(null);
    setImageSrc(base64Image);

    try {
      const result = await detectFromBase64(base64Image);

      if (result.success) {
        setDetections(result.detections);
        setInferenceTime(result.inference_time_ms);
        setImageWidth(result.image_width);
        setImageHeight(result.image_height);
      } else {
        setError(result.message || 'Detection failed');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run detection';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleAutoCapture = useCallback(() => {
    setIsAutoCapture((prev) => !prev);
  }, []);

  const switchMode = (newMode: DetectionMode) => {
    setMode(newMode);
    setImageSrc(null);
    setDetections([]);
    setError(null);
    setIsAutoCapture(false);
  };

  return (
    <div className="min-h-screen relative">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Gradient orbs - responsive sizing */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-16 sm:-left-32 w-48 sm:w-96 h-48 sm:h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-16 sm:-right-32 w-48 sm:w-96 h-48 sm:h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] lg:w-[800px] h-[300px] sm:h-[500px] lg:h-[800px] bg-purple-900/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <Header isModelLoaded={isModelLoaded} />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-6 relative overflow-hidden"
            >
              <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-2xl p-3 sm:p-4 flex items-start gap-2 sm:gap-4">
                <div className="p-1.5 sm:p-2 bg-red-500/20 rounded-lg sm:rounded-xl flex-shrink-0">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-red-300 font-semibold text-sm sm:text-base">Connection Error</p>
                  <p className="text-red-400/80 text-xs sm:text-sm mt-1 break-words">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="p-1 hover:bg-red-500/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode Switcher */}
        <motion.div 
          className="flex justify-center mb-4 sm:mb-8 px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass rounded-xl sm:rounded-2xl p-1 sm:p-1.5 inline-flex w-full sm:w-auto">
            <motion.button
              onClick={() => switchMode('upload')}
              className={`relative flex items-center justify-center gap-2 sm:gap-3 flex-1 sm:flex-initial px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                mode === 'upload'
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
              whileHover={{ scale: mode === 'upload' ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {mode === 'upload' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg sm:rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Upload className="relative z-10 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="relative z-10">Upload</span>
              <span className="relative z-10 hidden sm:inline">Image</span>
            </motion.button>
            
            <motion.button
              onClick={() => switchMode('webcam')}
              className={`relative flex items-center justify-center gap-2 sm:gap-3 flex-1 sm:flex-initial px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                mode === 'webcam'
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
              whileHover={{ scale: mode === 'webcam' ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {mode === 'webcam' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg sm:rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Camera className="relative z-10 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="relative z-10">Camera</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Input */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg sm:rounded-xl">
                  {mode === 'upload' ? (
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  ) : (
                    <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {mode === 'upload' ? 'Upload ID Card' : 'Camera Feed'}
                </h2>
              </div>

              <AnimatePresence mode="wait">
                {mode === 'upload' ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <ImageUploader onImageSelect={handleFileSelect} isLoading={isLoading} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="webcam"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <WebcamCapture
                      onCapture={handleWebcamCapture}
                      isLoading={isLoading}
                      isAutoCapture={isAutoCapture}
                      onToggleAutoCapture={toggleAutoCapture}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Detection Result */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 glass-card rounded-3xl overflow-hidden"
                >
                  <LoadingSpinner message="Detecting ID cards..." />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!isLoading && imageSrc && detections.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-4 sm:mt-6 glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Detection Result</h2>
                  </div>
                  <DetectionCanvas
                    imageSrc={imageSrc}
                    detections={detections}
                    imageWidth={imageWidth}
                    imageHeight={imageHeight}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Column - Results Panel */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ResultsPanel
              detections={detections}
              inferenceTime={inferenceTime}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
            />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="relative z-10 mt-8 sm:mt-16 py-6 sm:py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4 sm:mb-8" />
          <p className="text-white/40 text-xs sm:text-sm">
            ID Card Detection • YOLOv11 • Thesis Project © 2026
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

export default App;
