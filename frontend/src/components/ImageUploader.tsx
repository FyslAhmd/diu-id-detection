import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, X, Cloud, FileImage, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDetect = () => {
    if (selectedFile) {
      onImageSelect(selectedFile);
    }
  };

  const clearSelection = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center transition-all duration-300 cursor-pointer
              ${isDragging
                ? 'border-purple-400 bg-purple-500/10 scale-[1.02]'
                : 'border-white/20 hover:border-purple-400/50 hover:bg-white/5'
              }
            `}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/4 w-20 sm:w-32 h-20 sm:h-32 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-24 sm:w-40 h-24 sm:h-40 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer relative z-10">
              <motion.div
                animate={isDragging ? { scale: 1.1, y: -10 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className="relative mb-4 sm:mb-6"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl sm:rounded-3xl blur-xl opacity-50" />
                  <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl">
                    <Cloud className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                  </div>
                </motion.div>

                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  {isDragging ? 'Drop here!' : 'Upload ID Card'}
                </h3>
                <p className="text-white/60 text-sm sm:text-base mb-3 sm:mb-4">
                  Drag & drop or tap to browse
                </p>

                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-white/40">
                  <FileImage className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Supports: JPG, PNG, WEBP</span>
                </div>
              </motion.div>
            </label>

            {/* Animated border */}
            {isDragging && (
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="absolute inset-0 rounded-3xl border-2 border-purple-400 animate-pulse" />
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            {/* Image container */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden glass-card">
              <motion.img
                src={preview}
                alt="Selected"
                className="w-full h-auto max-h-[300px] sm:max-h-[500px] object-contain mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              
              {/* Close button */}
              <motion.button
                onClick={clearSelection}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500/80 hover:bg-red-500 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full shadow-lg transition-all"
                disabled={isLoading}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.button>
            </div>
            
            {/* File info and detect button */}
            <motion.div 
              className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <Image className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-white/80 truncate max-w-[120px] sm:max-w-[200px]">{selectedFile?.name}</span>
                <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                  {((selectedFile?.size ?? 0) / 1024).toFixed(1)} KB
                </span>
              </div>
              
              <motion.button
                onClick={handleDetect}
                disabled={isLoading}
                className="relative group px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-semibold text-white text-sm sm:text-base shadow-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                  {isLoading ? 'Detecting...' : 'Detect ID Card'}
                </span>
                
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;
