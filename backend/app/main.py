from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from typing import Optional

from app.config import CORS_ORIGINS, MODEL_PATH
from app.models.schemas import DetectionResponse, Base64ImageRequest, HealthResponse
from app.services.detector import detector
from app.database import get_db, init_db
from app.services.analytics import AnalyticsService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup: Initialize database and load model
    print("Starting ID Card Detection API...")
    print("Initializing database...")
    init_db()
    print("Database initialized successfully.")
    
    if not detector.load_model():
        print("WARNING: Failed to load model. Detection endpoints will not work.")
    yield
    # Shutdown
    print("Shutting down ID Card Detection API...")


app = FastAPI(
    title="ID Card Detection API",
    description="API for detecting ID cards using YOLOv11",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS - Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint"""
    return {
        "message": "ID Card Detection API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="ok" if detector.is_loaded() else "degraded",
        model_loaded=detector.is_loaded(),
        model_path=MODEL_PATH
    )


@app.post("/detect", response_model=DetectionResponse, tags=["Detection"])
async def detect_from_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Detect ID cards from uploaded image file
    
    - **file**: Image file (JPEG, PNG, etc.)
    
    Returns detection results with bounding boxes and confidence scores
    """
    if not detector.is_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read file contents
    contents = await file.read()
    
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    
    # Run detection
    result = detector.detect_from_bytes(contents)
    
    if not result.success:
        raise HTTPException(status_code=500, detail=result.message)
    
    # Record detection analytics
    if result.detections:
        AnalyticsService.record_detection(
            db=db,
            detections=[d.model_dump() for d in result.detections],
            inference_time_ms=result.inference_time_ms,
            source="upload"
        )
    
    return result


@app.post("/detect/base64", response_model=DetectionResponse, tags=["Detection"])
async def detect_from_base64(
    request: Base64ImageRequest,
    db: Session = Depends(get_db)
):
    """
    Detect ID cards from base64 encoded image
    
    - **image**: Base64 encoded image string
    
    Returns detection results with bounding boxes and confidence scores
    """
    if not detector.is_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if not request.image:
        raise HTTPException(status_code=400, detail="Image data required")
    
    # Run detection
    result = detector.detect_from_base64(request.image)
    
    if not result.success:
        raise HTTPException(status_code=500, detail=result.message)
    
    # Record detection analytics
    if result.detections:
        AnalyticsService.record_detection(
            db=db,
            detections=[d.model_dump() for d in result.detections],
            inference_time_ms=result.inference_time_ms,
            source="webcam"
        )
    
    return result


# ==================== ANALYTICS ENDPOINTS ====================

@app.get("/analytics/stats", tags=["Analytics"])
async def get_stats(
    period: str = Query("week", description="Period: today, week, month, year, all"),
    db: Session = Depends(get_db)
):
    """
    Get aggregated detection statistics for a time period.
    
    - **period**: Time period (today, week, month, year, all)
    """
    valid_periods = ["today", "week", "month", "year", "all"]
    if period not in valid_periods:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid period. Must be one of: {valid_periods}"
        )
    
    return AnalyticsService.get_stats_by_period(db, period)


@app.get("/analytics/daily", tags=["Analytics"])
async def get_daily_breakdown(
    days: int = Query(7, ge=1, le=365, description="Number of days"),
    db: Session = Depends(get_db)
):
    """
    Get daily breakdown of detections.
    
    - **days**: Number of days to retrieve (1-365)
    """
    return {
        "days": days,
        "data": AnalyticsService.get_daily_breakdown(db, days)
    }


@app.get("/analytics/distribution", tags=["Analytics"])
async def get_class_distribution(db: Session = Depends(get_db)):
    """
    Get overall class distribution (admin, student, teacher percentages).
    """
    return AnalyticsService.get_class_distribution(db)


@app.get("/analytics/recent", tags=["Analytics"])
async def get_recent_detections(
    limit: int = Query(10, ge=1, le=100, description="Number of records"),
    db: Session = Depends(get_db)
):
    """
    Get recent detection records.
    
    - **limit**: Number of records to retrieve (1-100)
    """
    return {
        "limit": limit,
        "records": AnalyticsService.get_recent_detections(db, limit)
    }


@app.get("/analytics/today", tags=["Analytics"])
async def get_today_stats(db: Session = Depends(get_db)):
    """
    Get today's detection statistics.
    """
    stats = AnalyticsService.get_today_stats(db)
    
    if not stats:
        return {
            "date": str(date.today()),
            "admin_count": 0,
            "student_count": 0,
            "teacher_count": 0,
            "total_detections": 0,
            "request_count": 0,
            "avg_inference_time_ms": 0
        }
    
    return {
        "date": stats.date.isoformat(),
        "admin_count": stats.admin_count,
        "student_count": stats.student_count,
        "teacher_count": stats.teacher_count,
        "total_detections": stats.total_detections,
        "request_count": stats.request_count,
        "avg_inference_time_ms": stats.avg_inference_time_ms
    }


# Import date for today endpoint
from datetime import date
