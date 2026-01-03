from pydantic import BaseModel
from typing import List, Optional


class BoundingBox(BaseModel):
    """Bounding box coordinates"""
    x1: float
    y1: float
    x2: float
    y2: float


class Detection(BaseModel):
    """Single detection result"""
    bbox: BoundingBox
    confidence: float
    class_id: int
    class_name: str


class DetectionResponse(BaseModel):
    """Response from detection endpoint"""
    success: bool
    detections: List[Detection]
    inference_time_ms: float
    image_width: int
    image_height: int
    message: Optional[str] = None


class Base64ImageRequest(BaseModel):
    """Request body for base64 image detection"""
    image: str  # Base64 encoded image


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    model_loaded: bool
    model_path: str
