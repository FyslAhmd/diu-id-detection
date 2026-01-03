import axios from 'axios';
import { DetectionResponse, HealthResponse } from '../types/detection';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Check API health status
 */
export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await api.get<HealthResponse>('/health');
  return response.data;
};

/**
 * Detect ID cards from uploaded image file
 */
export const detectFromFile = async (file: File): Promise<DetectionResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<DetectionResponse>('/detect', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Detect ID cards from base64 encoded image
 */
export const detectFromBase64 = async (base64Image: string): Promise<DetectionResponse> => {
  const response = await api.post<DetectionResponse>('/detect/base64', {
    image: base64Image,
  });

  return response.data;
};

export default api;
