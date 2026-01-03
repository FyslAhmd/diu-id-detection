from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional
from ..db_models import DetectionRecord, DailyStats


class AnalyticsService:
    """Service for recording and querying detection analytics"""
    
    @staticmethod
    def record_detection(
        db: Session,
        detections: List[Dict],
        inference_time_ms: float,
        source: str = "upload"
    ) -> DetectionRecord:
        """
        Record a detection event and update daily stats.
        
        Args:
            db: Database session
            detections: List of detection results with class_name
            inference_time_ms: Time taken for inference
            source: 'upload' or 'webcam'
        """
        # Count detections by class
        admin_count = sum(1 for d in detections if d.get('class_name', '').lower() == 'admin')
        student_count = sum(1 for d in detections if d.get('class_name', '').lower() == 'student')
        teacher_count = sum(1 for d in detections if d.get('class_name', '').lower() == 'teacher')
        total_count = len(detections)
        
        # Create detection record
        record = DetectionRecord(
            detected_at=datetime.utcnow(),
            date=date.today(),
            admin_count=admin_count,
            student_count=student_count,
            teacher_count=teacher_count,
            total_count=total_count,
            source=source,
            inference_time_ms=int(inference_time_ms)
        )
        db.add(record)
        
        # Update daily stats
        AnalyticsService._update_daily_stats(
            db, admin_count, student_count, teacher_count, 
            total_count, int(inference_time_ms)
        )
        
        db.commit()
        db.refresh(record)
        return record
    
    @staticmethod
    def _update_daily_stats(
        db: Session,
        admin_count: int,
        student_count: int,
        teacher_count: int,
        total_count: int,
        inference_time_ms: int
    ):
        """Update or create daily stats record"""
        today = date.today()
        
        daily_stats = db.query(DailyStats).filter(DailyStats.date == today).first()
        
        if daily_stats:
            # Update existing record
            daily_stats.admin_count += admin_count
            daily_stats.student_count += student_count
            daily_stats.teacher_count += teacher_count
            daily_stats.total_detections += total_count
            daily_stats.request_count += 1
            
            # Calculate running average of inference time
            total_requests = daily_stats.request_count
            daily_stats.avg_inference_time_ms = int(
                (daily_stats.avg_inference_time_ms * (total_requests - 1) + inference_time_ms) / total_requests
            )
        else:
            # Create new record for today
            daily_stats = DailyStats(
                date=today,
                admin_count=admin_count,
                student_count=student_count,
                teacher_count=teacher_count,
                total_detections=total_count,
                request_count=1,
                avg_inference_time_ms=inference_time_ms
            )
            db.add(daily_stats)
    
    @staticmethod
    def get_today_stats(db: Session) -> Optional[DailyStats]:
        """Get today's statistics"""
        return db.query(DailyStats).filter(DailyStats.date == date.today()).first()
    
    @staticmethod
    def get_stats_by_period(
        db: Session,
        period: str = "week"
    ) -> Dict:
        """
        Get aggregated stats for a period.
        
        Args:
            period: 'today', 'week', 'month', 'year', 'all'
        """
        today = date.today()
        
        if period == "today":
            start_date = today
        elif period == "week":
            start_date = today - timedelta(days=7)
        elif period == "month":
            start_date = today - timedelta(days=30)
        elif period == "year":
            start_date = today - timedelta(days=365)
        else:  # all
            start_date = date(2000, 1, 1)
        
        stats = db.query(
            func.sum(DailyStats.admin_count).label('admin_count'),
            func.sum(DailyStats.student_count).label('student_count'),
            func.sum(DailyStats.teacher_count).label('teacher_count'),
            func.sum(DailyStats.total_detections).label('total_detections'),
            func.sum(DailyStats.request_count).label('request_count'),
            func.avg(DailyStats.avg_inference_time_ms).label('avg_inference_time')
        ).filter(DailyStats.date >= start_date).first()
        
        return {
            "period": period,
            "start_date": start_date.isoformat(),
            "end_date": today.isoformat(),
            "admin_count": stats.admin_count or 0,
            "student_count": stats.student_count or 0,
            "teacher_count": stats.teacher_count or 0,
            "total_detections": stats.total_detections or 0,
            "request_count": stats.request_count or 0,
            "avg_inference_time_ms": round(stats.avg_inference_time or 0, 2)
        }
    
    @staticmethod
    def get_daily_breakdown(
        db: Session,
        days: int = 7
    ) -> List[Dict]:
        """Get daily breakdown for the last N days"""
        start_date = date.today() - timedelta(days=days - 1)
        
        records = db.query(DailyStats).filter(
            DailyStats.date >= start_date
        ).order_by(DailyStats.date.asc()).all()
        
        # Create a dict for quick lookup
        stats_by_date = {r.date: r for r in records}
        
        # Fill in missing days with zeros
        result = []
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            if current_date in stats_by_date:
                r = stats_by_date[current_date]
                result.append({
                    "date": current_date.isoformat(),
                    "admin_count": r.admin_count,
                    "student_count": r.student_count,
                    "teacher_count": r.teacher_count,
                    "total_detections": r.total_detections,
                    "request_count": r.request_count
                })
            else:
                result.append({
                    "date": current_date.isoformat(),
                    "admin_count": 0,
                    "student_count": 0,
                    "teacher_count": 0,
                    "total_detections": 0,
                    "request_count": 0
                })
        
        return result
    
    @staticmethod
    def get_class_distribution(db: Session) -> Dict:
        """Get overall class distribution percentages"""
        stats = db.query(
            func.sum(DailyStats.admin_count).label('admin'),
            func.sum(DailyStats.student_count).label('student'),
            func.sum(DailyStats.teacher_count).label('teacher'),
            func.sum(DailyStats.total_detections).label('total')
        ).first()
        
        total = stats.total or 0
        
        if total == 0:
            return {
                "admin": {"count": 0, "percentage": 0},
                "student": {"count": 0, "percentage": 0},
                "teacher": {"count": 0, "percentage": 0},
                "total": 0
            }
        
        return {
            "admin": {
                "count": stats.admin or 0,
                "percentage": round((stats.admin or 0) / total * 100, 2)
            },
            "student": {
                "count": stats.student or 0,
                "percentage": round((stats.student or 0) / total * 100, 2)
            },
            "teacher": {
                "count": stats.teacher or 0,
                "percentage": round((stats.teacher or 0) / total * 100, 2)
            },
            "total": total
        }
    
    @staticmethod
    def get_recent_detections(
        db: Session,
        limit: int = 10
    ) -> List[Dict]:
        """Get recent detection records"""
        records = db.query(DetectionRecord).order_by(
            desc(DetectionRecord.detected_at)
        ).limit(limit).all()
        
        return [
            {
                "id": r.id,
                "detected_at": r.detected_at.isoformat(),
                "admin_count": r.admin_count,
                "student_count": r.student_count,
                "teacher_count": r.teacher_count,
                "total_count": r.total_count,
                "source": r.source,
                "inference_time_ms": r.inference_time_ms
            }
            for r in records
        ]
