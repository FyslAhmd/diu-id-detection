# ID Card Detection Demo App - Project Plan

## Project Overview

A full-stack web application demonstrating **YOLOv11-based ID Card Detection** for thesis demonstration. The application allows users to upload images or use their webcam for real-time ID card detection.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
│  • React 18 + TypeScript + Vite                             │
│  • Tailwind CSS for styling                                 │
│  • React Webcam for camera access                           │
│  • Canvas API for bounding box visualization                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI)                        │
│  • FastAPI (Python async web framework)                     │
│  • Ultralytics YOLO library                                 │
│  • OpenCV for image processing                              │
│  • Uvicorn ASGI server                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     YOLO MODEL                               │
│  • YOLOv11m trained on ID card dataset                      │
│  • 75 epochs training                                       │
│  • Best weights checkpoint                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
React/
├── frontend/                         # React Frontend Application
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx           # App header with navigation
│   │   │   ├── ImageUploader.tsx    # Image upload component
│   │   │   ├── WebcamCapture.tsx    # Webcam capture component
│   │   │   ├── DetectionCanvas.tsx  # Canvas for drawing detections
│   │   │   ├── ResultsPanel.tsx     # Detection results display
│   │   │   └── LoadingSpinner.tsx   # Loading indicator
│   │   ├── services/
│   │   │   └── api.ts               # API service for backend calls
│   │   ├── types/
│   │   │   └── detection.ts         # TypeScript type definitions
│   │   ├── App.tsx                  # Main application component
│   │   ├── App.css                  # App-specific styles
│   │   ├── index.css                # Global styles with Tailwind
│   │   └── main.tsx                 # React entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                          # FastAPI Backend Application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI application entry
│   │   ├── config.py                # Configuration settings
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py           # Pydantic request/response models
│   │   └── services/
│   │       ├── __init__.py
│   │       └── detector.py          # YOLO detection service
│   ├── requirements.txt             # Python dependencies
│   └── run.py                       # Server startup script
│
├── models/                           # Model files directory
│   └── (symlink or copy of .pt file)
│
├── runs_detect_id_card_yolo11m_75epochs_weights_best.pt  # YOLO model
├── FYDP.pdf                          # Thesis document
└── PROJECT_PLAN.md                   # This file
```

---

## Features

### Core Features (MVP)

| Feature | Description | Component |
|---------|-------------|-----------|
| **Image Upload** | Upload ID card images via drag-drop or file picker | `ImageUploader.tsx` |
| **Detection Visualization** | Draw bounding boxes on detected ID cards | `DetectionCanvas.tsx` |
| **Confidence Scores** | Display detection confidence percentages | `ResultsPanel.tsx` |
| **Live Camera** | Real-time webcam ID card detection | `WebcamCapture.tsx` |

### Additional Features (Post-MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| Detection History | Log previous detection sessions | Medium |
| Export Cropped ID | Download cropped ID card region | Medium |
| Model Metrics | Show inference time, FPS | Low |
| Dark Mode | Toggle dark/light theme | Low |

---

## API Endpoints

### Backend API (FastAPI)

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `GET` | `/` | Health check | - | `{"status": "ok"}` |
| `GET` | `/health` | Detailed health | - | `{"status": "ok", "model": "loaded"}` |
| `POST` | `/detect` | Detect from image | `multipart/form-data` (image file) | `DetectionResponse` |
| `POST` | `/detect/base64` | Detect from base64 | `{"image": "base64..."}` | `DetectionResponse` |

### Response Schema

```json
{
  "success": true,
  "detections": [
    {
      "bbox": [x1, y1, x2, y2],
      "confidence": 0.95,
      "class_id": 0,
      "class_name": "id_card"
    }
  ],
  "inference_time_ms": 45.2,
  "image_size": [640, 480]
}
```

---

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **react-webcam** - Webcam access

### Backend
- **Python 3.10+** - Runtime
- **FastAPI** - Web framework
- **Ultralytics** - YOLO library
- **OpenCV** - Image processing
- **Uvicorn** - ASGI server
- **Pillow** - Image handling

---

## Development Setup

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- pip or conda

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python run.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend (.env)**
```
MODEL_PATH=../runs_detect_id_card_yolo11m_75epochs_weights_best.pt
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:5173
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:8000
```

---

## Implementation Phases

### Phase 1: Project Setup ✅
- [x] Create project plan
- [x] Set up backend with FastAPI
- [x] Set up frontend with React + Vite
- [x] Configure Tailwind CSS

### Phase 2: Backend Development ✅
- [x] Create YOLO detector service
- [x] Implement `/detect` endpoint
- [x] Implement `/detect/base64` endpoint
- [x] Add CORS configuration
- [ ] Test with sample images

### Phase 3: Frontend Development ✅
- [x] Create basic layout & header
- [x] Implement image upload component
- [x] Create detection canvas for visualization
- [x] Build results panel
- [x] Add webcam capture component

### Phase 4: Integration & Testing
- [x] Connect frontend to backend API
- [ ] Test image upload flow
- [ ] Test webcam detection flow
- [x] Handle error states
- [ ] Optimize performance

### Phase 5: Polish & Deploy
- [x] Add loading states
- [x] Improve UI/UX
- [x] Add responsive design
- [ ] Write documentation
- [ ] Prepare for thesis demo

---

## Commands Reference

### Development
```bash
# Start backend (from backend/)
python run.py

# Start frontend (from frontend/)
npm run dev

# Build frontend for production
npm run build
```

### Testing
```bash
# Test backend endpoint
curl -X POST -F "file=@test_image.jpg" http://localhost:8000/detect
```

---

## Notes

- The YOLO model file is approximately 50MB
- Frontend runs on port 5173 (Vite default)
- Backend runs on port 8000 (FastAPI default)
- Webcam requires HTTPS in production (localhost exempt)

---

*Last Updated: January 3, 2026*
