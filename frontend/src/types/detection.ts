/**
 * Type definitions for ID Card Detection
 */

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  bbox: BoundingBox;
  confidence: number;
  class_id: number;
  class_name: string;
}

export interface DetectionResponse {
  success: boolean;
  detections: Detection[];
  inference_time_ms: number;
  image_width: number;
  image_height: number;
  message?: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  model_path: string;
}

export type DetectionMode = 'upload' | 'webcam' | 'analytics';
