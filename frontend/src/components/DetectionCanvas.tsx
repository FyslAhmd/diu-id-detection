import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Detection } from '../types/detection';

interface DetectionCanvasProps {
  imageSrc: string;
  detections: Detection[];
  imageWidth: number;
  imageHeight: number;
}

const COLORS = [
  { primary: '#8B5CF6', secondary: '#A78BFA', glow: 'rgba(139, 92, 246, 0.5)' }, // purple
  { primary: '#10B981', secondary: '#34D399', glow: 'rgba(16, 185, 129, 0.5)' }, // green
  { primary: '#F59E0B', secondary: '#FBBF24', glow: 'rgba(245, 158, 11, 0.5)' }, // amber
  { primary: '#EF4444', secondary: '#F87171', glow: 'rgba(239, 68, 68, 0.5)' }, // red
  { primary: '#3B82F6', secondary: '#60A5FA', glow: 'rgba(59, 130, 246, 0.5)' }, // blue
  { primary: '#EC4899', secondary: '#F472B6', glow: 'rgba(236, 72, 153, 0.5)' }, // pink
];

const DetectionCanvas: React.FC<DetectionCanvasProps> = ({
  imageSrc,
  detections,
  imageWidth,
  imageHeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const containerWidth = container.clientWidth;
      const aspectRatio = img.width / img.height;
      const displayWidth = containerWidth;
      const displayHeight = containerWidth / aspectRatio;

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      const scaleX = displayWidth / imageWidth;
      const scaleY = displayHeight / imageHeight;

      // Draw image
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

      // Draw detections with animations
      detections.forEach((detection, index) => {
        const colors = COLORS[index % COLORS.length];
        const { bbox, confidence, class_name } = detection;

        const x1 = bbox.x1 * scaleX;
        const y1 = bbox.y1 * scaleY;
        const x2 = bbox.x2 * scaleX;
        const y2 = bbox.y2 * scaleY;
        const width = x2 - x1;
        const height = y2 - y1;

        // Glow effect
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 20;

        // Main bounding box
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, width, height);

        // Reset shadow
        ctx.shadowBlur = 0;

        // Semi-transparent fill
        ctx.fillStyle = `${colors.primary}15`;
        ctx.fillRect(x1, y1, width, height);

        // Draw corner accents
        const cornerLength = Math.min(25, width / 4, height / 4);
        const cornerWidth = 4;

        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = cornerWidth;
        ctx.lineCap = 'round';

        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(x1, y1 + cornerLength);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x1 + cornerLength, y1);
        ctx.stroke();

        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(x2 - cornerLength, y1);
        ctx.lineTo(x2, y1);
        ctx.lineTo(x2, y1 + cornerLength);
        ctx.stroke();

        // Bottom-left corner
        ctx.beginPath();
        ctx.moveTo(x1, y2 - cornerLength);
        ctx.lineTo(x1, y2);
        ctx.lineTo(x1 + cornerLength, y2);
        ctx.stroke();

        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(x2 - cornerLength, y2);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2, y2 - cornerLength);
        ctx.stroke();

        // Label with gradient background
        const label = `${class_name.toUpperCase()} ${(confidence * 100).toFixed(0)}%`;
        const fontSize = displayWidth < 400 ? 11 : 14;
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        const textMetrics = ctx.measureText(label);
        const labelHeight = displayWidth < 400 ? 22 : 28;
        const labelPadding = displayWidth < 400 ? 8 : 12;
        const labelWidth = textMetrics.width + labelPadding * 2;

        // Label background with gradient
        const gradient = ctx.createLinearGradient(x1, y1 - labelHeight, x1 + labelWidth, y1);
        gradient.addColorStop(0, colors.primary);
        gradient.addColorStop(1, colors.secondary);
        
        // Rounded rectangle for label
        const radius = 8;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x1 + radius, y1 - labelHeight);
        ctx.lineTo(x1 + labelWidth - radius, y1 - labelHeight);
        ctx.quadraticCurveTo(x1 + labelWidth, y1 - labelHeight, x1 + labelWidth, y1 - labelHeight + radius);
        ctx.lineTo(x1 + labelWidth, y1 - radius);
        ctx.quadraticCurveTo(x1 + labelWidth, y1, x1 + labelWidth - radius, y1);
        ctx.lineTo(x1 + radius, y1);
        ctx.quadraticCurveTo(x1, y1, x1, y1 - radius);
        ctx.lineTo(x1, y1 - labelHeight + radius);
        ctx.quadraticCurveTo(x1, y1 - labelHeight, x1 + radius, y1 - labelHeight);
        ctx.closePath();
        ctx.fill();

        // Label text
        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x1 + labelPadding, y1 - labelHeight / 2);
      });
    };
    img.src = imageSrc;
  }, [imageSrc, detections, imageWidth, imageHeight]);

  return (
    <motion.div 
      ref={containerRef} 
      className="w-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden glass-card p-1.5 sm:p-2">
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-xl sm:rounded-2xl"
        />
        
        {/* Detection count badge */}
        {detections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full shadow-lg"
          >
            <span className="text-white text-sm sm:text-base font-bold">{detections.length}</span>
            <span className="text-white/80 text-xs sm:text-sm">detected</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DetectionCanvas;
