from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import CORS_ORIGINS, MODEL_PATH
from app.models.schemas import DetectionResponse, Base64ImageRequest, HealthResponse
from app.services.detector import detector


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup: Load the model
    print("Starting ID Card Detection API...")
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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
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
async def detect_from_file(file: UploadFile = File(...)):
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
    
    return result


@app.post("/detect/base64", response_model=DetectionResponse, tags=["Detection"])
async def detect_from_base64(request: Base64ImageRequest):
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
    
    return result
