"""
Attendance Tracking Module
============================
Tracks face recognition events as attendance records.

Features:
    - Mark attendance via face recognition
    - Cooldown period to prevent duplicate entries
    - Daily attendance reports
    - Export to CSV
    - Per-person attendance history
"""

import csv
import os
import sqlite3
from datetime import datetime, timedelta
from typing import Optional

import config
from src.utils import get_logger

logger = get_logger(__name__)


class AttendanceTracker:
    """
    SQLite-backed attendance tracking system.
    
    Integrates with the face recognition pipeline to automatically
    log attendance when a known person is recognized.
    """
    
    def __init__(self, db_path: str = None):
        """
        Initialize attendance tracker.
        
        Args:
            db_path: Path to the faces database (shares DB with FaceDatabase).
        """
        self.db_path = db_path or config.DB_PATH
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.execute("PRAGMA journal_mode=WAL")
        self.cooldown_minutes = config.ATTENDANCE_COOLDOWN_MINUTES
        
        self._create_tables()
        logger.info(f"AttendanceTracker initialized | cooldown={self.cooldown_minutes}min")
    
    def _create_tables(self):
        """Create attendance tables."""
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                person_name TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                confidence REAL,
                method TEXT DEFAULT 'face_recognition',
                notes TEXT
            )
        """)
        
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS recognition_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                person_name TEXT,
                is_known INTEGER,
                confidence REAL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                quality_score REAL,
                spoof_check_passed INTEGER
            )
        """)
        
        self.conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_attendance_person 
            ON attendance(person_name)
        """)
        self.conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_attendance_timestamp 
            ON attendance(timestamp)
        """)
        
        self.conn.commit()
    
    def mark_attendance(self, person_name: str, confidence: float = 0.0,
                        notes: str = None) -> dict:
        """
        Mark attendance for a recognized person.
        
        Respects cooldown period to prevent duplicate entries.
        
        Args:
            person_name: Name of the recognized person.
            confidence: Recognition confidence score.
            notes: Optional notes.
            
        Returns:
            Dict with result: {"success": bool, "message": str, "already_marked": bool}
        """
        # Check cooldown
        cutoff = datetime.now() - timedelta(minutes=self.cooldown_minutes)
        cutoff_str = cutoff.strftime("%Y-%m-%d %H:%M:%S")
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT timestamp FROM attendance WHERE person_name = ? AND timestamp > ? ORDER BY timestamp DESC LIMIT 1",
            (person_name, cutoff_str)
        )
        recent = cursor.fetchone()
        
        if recent:
            return {
                "success": False,
                "message": f"Attendance already marked for '{person_name}' at {recent[0]}",
                "already_marked": True
            }
        
        # Mark attendance
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute(
            "INSERT INTO attendance (person_name, timestamp, confidence, notes) VALUES (?, ?, ?, ?)",
            (person_name, timestamp, confidence, notes)
        )
        self.conn.commit()
        
        logger.info(f"Attendance marked for '{person_name}' (confidence: {confidence:.2f})")
        return {
            "success": True,
            "message": f"Attendance marked for '{person_name}'",
            "already_marked": False
        }
    
    def log_recognition_event(self, person_name: str, is_known: bool,
                               confidence: float, quality_score: float = 0.0,
                               spoof_passed: bool = True):
        """
        Log every recognition event (for analytics).
        
        Args:
            person_name: Recognized name or "Unknown".
            is_known: Whether the person was identified.
            confidence: Similarity score.
            quality_score: Face quality score.
            spoof_passed: Whether anti-spoof check passed.
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.conn.execute(
            """INSERT INTO recognition_log 
               (person_name, is_known, confidence, timestamp, quality_score, spoof_check_passed)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (person_name, int(is_known), confidence, timestamp, quality_score, int(spoof_passed))
        )
        self.conn.commit()
    
    def get_today_attendance(self) -> list:
        """Get today's attendance records."""
        today = datetime.now().strftime("%Y-%m-%d")
        cursor = self.conn.cursor()
        cursor.execute(
            """SELECT person_name, timestamp, confidence, notes 
               FROM attendance 
               WHERE DATE(timestamp) = ? 
               ORDER BY timestamp DESC""",
            (today,)
        )
        return [
            {"name": row[0], "time": row[1], "confidence": row[2], "notes": row[3]}
            for row in cursor.fetchall()
        ]
    
    def get_attendance_by_date(self, date_str: str) -> list:
        """Get attendance for a specific date (format: YYYY-MM-DD)."""
        cursor = self.conn.cursor()
        cursor.execute(
            """SELECT person_name, timestamp, confidence, notes 
               FROM attendance 
               WHERE DATE(timestamp) = ? 
               ORDER BY timestamp""",
            (date_str,)
        )
        return [
            {"name": row[0], "time": row[1], "confidence": row[2], "notes": row[3]}
            for row in cursor.fetchall()
        ]
    
    def get_person_attendance_history(self, person_name: str, days: int = 30) -> list:
        """Get attendance history for a specific person."""
        cutoff = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d %H:%M:%S")
        cursor = self.conn.cursor()
        cursor.execute(
            """SELECT timestamp, confidence, notes 
               FROM attendance 
               WHERE person_name = ? AND timestamp > ?
               ORDER BY timestamp DESC""",
            (person_name, cutoff)
        )
        return [
            {"time": row[0], "confidence": row[1], "notes": row[2]}
            for row in cursor.fetchall()
        ]
    
    def get_attendance_stats(self, days: int = 7) -> dict:
        """Get attendance statistics for the last N days."""
        cutoff = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d %H:%M:%S")
        cursor = self.conn.cursor()
        
        # Total entries
        cursor.execute(
            "SELECT COUNT(*) FROM attendance WHERE timestamp > ?", (cutoff,)
        )
        total = cursor.fetchone()[0]
        
        # Unique persons
        cursor.execute(
            "SELECT COUNT(DISTINCT person_name) FROM attendance WHERE timestamp > ?",
            (cutoff,)
        )
        unique = cursor.fetchone()[0]
        
        # Per-day breakdown
        cursor.execute(
            """SELECT DATE(timestamp) as day, COUNT(*) as count, 
                      COUNT(DISTINCT person_name) as unique_count
               FROM attendance 
               WHERE timestamp > ?
               GROUP BY DATE(timestamp) 
               ORDER BY day DESC""",
            (cutoff,)
        )
        daily = [
            {"date": row[0], "total": row[1], "unique": row[2]}
            for row in cursor.fetchall()
        ]
        
        # Recognition log stats
        cursor.execute(
            """SELECT COUNT(*) as total,
                      SUM(CASE WHEN is_known = 1 THEN 1 ELSE 0 END) as known,
                      AVG(confidence) as avg_confidence,
                      SUM(CASE WHEN spoof_check_passed = 0 THEN 1 ELSE 0 END) as spoof_attempts,
                      AVG(CASE WHEN quality_score > 0 THEN quality_score ELSE NULL END) as avg_quality
               FROM recognition_log WHERE timestamp > ?""",
            (cutoff,)
        )
        log_row = cursor.fetchone()
        
        return {
            "period_days": days,
            "total_entries": total,
            "unique_persons": unique,
            "daily_breakdown": daily,
            "recognition_total": log_row[0] or 0,
            "recognition_known": log_row[1] or 0,
            "avg_confidence": round(log_row[2] or 0, 3) if log_row[2] else 0.0,
            "spoof_attempts": log_row[3] or 0,
            "avg_quality": round(log_row[4] or 0.0, 3) if log_row[4] else 0.0,
        }
    
    def export_csv(self, filepath: str, days: int = 30) -> str:
        """Export attendance to CSV file."""
        cutoff = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d %H:%M:%S")
        cursor = self.conn.cursor()
        cursor.execute(
            """SELECT person_name, timestamp, confidence, method, notes 
               FROM attendance 
               WHERE timestamp > ?
               ORDER BY timestamp DESC""",
            (cutoff,)
        )
        rows = cursor.fetchall()
        
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["Name", "Timestamp", "Confidence", "Method", "Notes"])
            writer.writerows(rows)
        
        logger.info(f"Exported {len(rows)} attendance records to {filepath}")
        return filepath
    
    def close(self):
        """Close database connection."""
        self.conn.close()
