import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Base directory - backend folder
BASE_DIR = Path(__file__).resolve().parent.parent

# Model configuration - model is now in backend folder
DEFAULT_MODEL_PATH = BASE_DIR / "runs_detect_id_card_yolo11m_75epochs_weights_best.pt"
MODEL_PATH = os.getenv("MODEL_PATH", str(DEFAULT_MODEL_PATH))

# Server configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))

# CORS configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

# Detection configuration
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", 0.5))
IOU_THRESHOLD = float(os.getenv("IOU_THRESHOLD", 0.45))
