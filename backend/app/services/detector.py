import time
import base64
import cv2
import numpy as np
import torch
from pathlib import Path
from typing import Tuple, List, Optional
from ultralytics import YOLO

from app.config import MODEL_PATH, CONFIDENCE_THRESHOLD, IOU_THRESHOLD
from app.models.schemas import Detection, BoundingBox, DetectionResponse


class IDCardDetector:
    """YOLO-based ID Card Detection Service"""
    
    def __init__(self):
        self.model: Optional[YOLO] = None
        self.model_path = MODEL_PATH
        self.class_names = {}
        
    def load_model(self) -> bool:
        """Load the YOLO model"""
        try:
            if not Path(self.model_path).exists():
                print(f"Model file not found: {self.model_path}")
                return False
            
            print(f"Loading model from: {self.model_path}")
            
            # For PyTorch 2.6+, we need to allow unsafe loading for YOLO models
            # This is safe since we trust the model file
            import torch.serialization
            original_load = torch.load
            
            def patched_load(*args, **kwargs):
                kwargs['weights_only'] = False
                return original_load(*args, **kwargs)
            
            torch.load = patched_load
            try:
                self.model = YOLO(self.model_path)
            finally:
                torch.load = original_load
            
            # Get class names from model
            if hasattr(self.model, 'names'):
                self.class_names = self.model.names
            else:
                self.class_names = {0: "id_card"}
                
            print(f"Model loaded successfully. Classes: {self.class_names}")
            return True
            
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    
    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.model is not None
    
    def preprocess_image(self, image_bytes: bytes) -> Tuple[np.ndarray, int, int]:
        """Convert image bytes to numpy array"""
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Failed to decode image")
        
        height, width = img.shape[:2]
        return img, width, height
    
    def decode_base64_image(self, base64_str: str) -> bytes:
        """Decode base64 image string to bytes"""
        # Remove data URL prefix if present
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        
        return base64.b64decode(base64_str)
    
    def detect(self, image: np.ndarray) -> Tuple[List[Detection], float]:
        """
        Run detection on image
        
        Args:
            image: OpenCV image (BGR format)
            
        Returns:
            Tuple of (list of detections, inference time in ms)
        """
        if not self.is_loaded():
            raise RuntimeError("Model not loaded")
        
        start_time = time.time()
        
        # Run inference
        results = self.model(
            image,
            conf=CONFIDENCE_THRESHOLD,
            iou=IOU_THRESHOLD,
            verbose=False
        )
        
        inference_time = (time.time() - start_time) * 1000  # Convert to ms
        
        detections = []
        
        if results and len(results) > 0:
            result = results[0]
            
            if result.boxes is not None and len(result.boxes) > 0:
                boxes = result.boxes
                
                for i in range(len(boxes)):
                    # Get box coordinates (xyxy format)
                    box = boxes.xyxy[i].cpu().numpy()
                    confidence = float(boxes.conf[i].cpu().numpy())
                    class_id = int(boxes.cls[i].cpu().numpy())
                    
                    # Get class name
                    class_name = self.class_names.get(class_id, f"class_{class_id}")
                    
                    detection = Detection(
                        bbox=BoundingBox(
                            x1=float(box[0]),
                            y1=float(box[1]),
                            x2=float(box[2]),
                            y2=float(box[3])
                        ),
                        confidence=confidence,
                        class_id=class_id,
                        class_name=class_name
                    )
                    detections.append(detection)
        
        return detections, inference_time
    
    def detect_from_bytes(self, image_bytes: bytes) -> DetectionResponse:
        """Run detection on image bytes"""
        try:
            img, width, height = self.preprocess_image(image_bytes)
            detections, inference_time = self.detect(img)
            
            return DetectionResponse(
                success=True,
                detections=detections,
                inference_time_ms=round(inference_time, 2),
                image_width=width,
                image_height=height,
                message=f"Detected {len(detections)} ID card(s)"
            )
            
        except Exception as e:
            return DetectionResponse(
                success=False,
                detections=[],
                inference_time_ms=0,
                image_width=0,
                image_height=0,
                message=str(e)
            )
    
    def detect_from_base64(self, base64_str: str) -> DetectionResponse:
        """Run detection on base64 encoded image"""
        try:
            image_bytes = self.decode_base64_image(base64_str)
            return self.detect_from_bytes(image_bytes)
        except Exception as e:
            return DetectionResponse(
                success=False,
                detections=[],
                inference_time_ms=0,
                image_width=0,
                image_height=0,
                message=f"Failed to decode base64 image: {e}"
            )


# Global detector instance
detector = IDCardDetector()
