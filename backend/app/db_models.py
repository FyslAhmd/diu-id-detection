from sqlalchemy import Column, Integer, String, DateTime, Date, func
from sqlalchemy.sql import expression
from datetime import datetime, date
from .database import Base


class DetectionRecord(Base):
    """
    Stores individual detection events.
    Each row = one detection API call with counts per class.
    """
    __tablename__ = "detection_records"

    id = Column(Integer, primary_key=True, index=True)
    
    # Timestamp of detection
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    date = Column(Date, default=date.today, index=True)
    
    # Counts per class for this detection
    admin_count = Column(Integer, default=0)
    student_count = Column(Integer, default=0)
    teacher_count = Column(Integer, default=0)
    total_count = Column(Integer, default=0)
    
    # Detection metadata
    source = Column(String, default="upload")  # 'upload' or 'webcam'
    inference_time_ms = Column(Integer, default=0)
    
    def __repr__(self):
        return f"<DetectionRecord {self.id}: {self.total_count} detections at {self.detected_at}>"


class DailyStats(Base):
    """
    Aggregated daily statistics.
    Updated after each detection for quick querying.
    """
    __tablename__ = "daily_stats"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, index=True)
    
    # Total counts for the day
    admin_count = Column(Integer, default=0)
    student_count = Column(Integer, default=0)
    teacher_count = Column(Integer, default=0)
    total_detections = Column(Integer, default=0)
    
    # Number of detection requests
    request_count = Column(Integer, default=0)
    
    # Average inference time
    avg_inference_time_ms = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<DailyStats {self.date}: {self.total_detections} total>"
