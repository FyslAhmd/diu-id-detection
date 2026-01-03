import axios from 'axios';
import { DetectionResponse, HealthResponse } from '../types/detection';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Health check
export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await api.get('/health');
  return response.data;
};

// Detect from file upload
export const detectFromFile = async (file: File): Promise<DetectionResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/detect', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Detect from base64 image (for webcam)
export const detectFromBase64 = async (base64Image: string): Promise<DetectionResponse> => {
  const response = await api.post('/detect/base64', {
    image: base64Image,
  });

  return response.data;
};

// Analytics Types
export interface PeriodStats {
  period: string;
  start_date: string;
  end_date: string;
  admin_count: number;
  student_count: number;
  teacher_count: number;
  total_detections: number;
  request_count: number;
  avg_inference_time_ms: number;
}

export interface DailyData {
  date: string;
  admin_count: number;
  student_count: number;
  teacher_count: number;
  total_detections: number;
  request_count: number;
}

export interface DailyBreakdown {
  days: number;
  data: DailyData[];
}

export interface ClassStats {
  count: number;
  percentage: number;
}

export interface ClassDistribution {
  admin: ClassStats;
  student: ClassStats;
  teacher: ClassStats;
  total: number;
}

export interface RecentDetection {
  id: number;
  timestamp: string;
  admin_count: number;
  student_count: number;
  teacher_count: number;
  total_count: number;
  source: string;
  inference_time: number;
}

export interface RecentDetections {
  detections: RecentDetection[];
  count: number;
}

export interface TodayStats {
  date: string;
  admin_count: number;
  student_count: number;
  teacher_count: number;
  total_detections: number;
  request_count: number;
  avg_inference_time_ms: number;
}

// Analytics API Functions
export const getStats = async (period: string = 'today'): Promise<PeriodStats> => {
  const response = await api.get(`/analytics/stats?period=${period}`);
  return response.data;
};

export const getDailyBreakdown = async (period: string = 'week'): Promise<DailyBreakdown> => {
  const response = await api.get(`/analytics/daily?period=${period}`);
  return response.data;
};

export const getClassDistribution = async (period: string = 'all'): Promise<ClassDistribution> => {
  const response = await api.get(`/analytics/distribution?period=${period}`);
  return response.data;
};

export const getRecentDetections = async (limit: number = 10): Promise<RecentDetections> => {
  const response = await api.get(`/analytics/recent?limit=${limit}`);
  return response.data;
};

export const getTodayStats = async (): Promise<TodayStats> => {
  const response = await api.get('/analytics/today');
  return response.data;
};
