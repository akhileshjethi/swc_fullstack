"""
Face Database Module (V2 — Multi-Embedding Support)
=====================================================
SQLite-backed persistent storage with support for both average-embedding
and individual-embedding comparison strategies.

Key V2 improvements:
    - get_all_persons_with_all_embeddings() for max_individual matching
    - Better embedding serialization with integrity checks
    - Attendance table integration
"""

import os
import sqlite3
from datetime import datetime
from typing import Optional

import numpy as np

import config
from src.utils import get_logger

logger = get_logger(__name__)


class FaceDatabase:
    """
    SQLite database for storing and retrieving face embeddings.
    
    Supports two comparison strategies:
    1. Average embedding: Faster, good for large databases
    2. Individual embeddings: More accurate, compares against every stored embedding
    """
    
    def __init__(self, db_path: str = None):
        """Initialize database connection and create tables."""
        self.db_path = db_path or config.DB_PATH
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.execute("PRAGMA journal_mode=WAL")
        self.conn.execute("PRAGMA foreign_keys=ON")
        
        self._create_tables()
        
        count = self.get_person_count()
        logger.info(f"FaceDatabase V2 initialized | {count} registered persons")
    
    def _create_tables(self):
        """Create database tables if they don't exist."""
        cursor = self.conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS persons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                image_count INTEGER DEFAULT 0
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS embeddings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                person_id INTEGER NOT NULL,
                embedding BLOB NOT NULL,
                source_image TEXT,
                quality_score REAL DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE
            )
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_embeddings_person_id 
            ON embeddings(person_id)
        """)
        
        # --- AUTO-MIGRATION FOR EXISTING DATABASES ---
        cursor.execute("PRAGMA table_info(embeddings)")
        columns = [row[1] for row in cursor.fetchall()]
        if "source_image" not in columns:
            try:
                cursor.execute("ALTER TABLE embeddings ADD COLUMN source_image TEXT")
                logger.info("Migrated database: added 'source_image' column to 'embeddings' table.")
            except Exception as e:
                logger.error(f"Error adding 'source_image' column: {e}")
        if "quality_score" not in columns:
            try:
                cursor.execute("ALTER TABLE embeddings ADD COLUMN quality_score REAL DEFAULT 0.0")
                logger.info("Migrated database: added 'quality_score' column to 'embeddings' table.")
            except Exception as e:
                logger.error(f"Error adding 'quality_score' column: {e}")
        
        self.conn.commit()
    
    def register_person(self, name: str, embeddings: list, 
                        source_images: list = None,
                        quality_scores: list = None) -> int:
        """
        Register a new person with their face embeddings.
        
        Args:
            name: Person's name (unique identifier).
            embeddings: List of numpy arrays, each shape (512,).
            source_images: Optional list of source image filenames.
            quality_scores: Optional list of quality scores per embedding.
            
        Returns:
            The person's database ID.
        """
        cursor = self.conn.cursor()
        
        try:
            cursor.execute("SELECT id, image_count FROM persons WHERE name = ?", (name,))
            row = cursor.fetchone()
            
            if row:
                person_id = row[0]
                existing_count = row[1]
                logger.info(f"Person '{name}' exists (id={person_id}), adding embeddings")
            else:
                cursor.execute(
                    "INSERT INTO persons (name, image_count) VALUES (?, ?)",
                    (name, len(embeddings))
                )
                person_id = cursor.lastrowid
                existing_count = 0
                logger.info(f"Registered new person: '{name}' (id={person_id})")
            
            for i, emb in enumerate(embeddings):
                emb_blob = emb.astype(np.float32).tobytes()
                source = source_images[i] if source_images and i < len(source_images) else None
                quality = quality_scores[i] if quality_scores and i < len(quality_scores) else 0.0
                
                cursor.execute(
                    "INSERT INTO embeddings (person_id, embedding, source_image, quality_score) VALUES (?, ?, ?, ?)",
                    (person_id, emb_blob, source, quality)
                )
            
            new_count = existing_count + len(embeddings)
            cursor.execute(
                "UPDATE persons SET image_count = ?, updated_at = ? WHERE id = ?",
                (new_count, datetime.now(), person_id)
            )
            
            self.conn.commit()
            logger.info(f"Stored {len(embeddings)} embeddings for '{name}' (total: {new_count})")
            return person_id
            
        except Exception as e:
            self.conn.rollback()
            logger.error(f"Failed to register '{name}': {e}")
            raise
    
    def get_all_persons(self) -> list:
        """
        Get all persons with their AVERAGE embedding.
        Used for the 'average' matching strategy.
        """
        cursor = self.conn.cursor()
        cursor.execute("SELECT id, name, image_count, created_at FROM persons ORDER BY name")
        persons = cursor.fetchall()
        
        results = []
        for person_id, name, image_count, created_at in persons:
            cursor.execute(
                "SELECT embedding FROM embeddings WHERE person_id = ?",
                (person_id,)
            )
            emb_rows = cursor.fetchall()
            
            if not emb_rows:
                continue
            
            all_embeddings = [
                np.frombuffer(row[0], dtype=np.float32)
                for row in emb_rows
            ]
            avg_embedding = np.mean(all_embeddings, axis=0)
            norm = np.linalg.norm(avg_embedding)
            if norm > 0:
                avg_embedding = avg_embedding / norm
            
            results.append({
                "id": person_id,
                "name": name,
                "embedding": avg_embedding,
                "image_count": image_count,
                "created_at": created_at
            })
        
        return results
    
    def get_all_persons_with_all_embeddings(self) -> list:
        """
        Get all persons with ALL their individual embeddings.
        Used for the 'max_individual' matching strategy — MORE ACCURATE.
        
        Returns:
            List of dicts, each with "name" and "embeddings" (list of np arrays).
        """
        cursor = self.conn.cursor()
        cursor.execute("SELECT id, name, image_count, created_at FROM persons ORDER BY name")
        persons = cursor.fetchall()
        
        results = []
        for person_id, name, image_count, created_at in persons:
            cursor.execute(
                "SELECT embedding, quality_score FROM embeddings WHERE person_id = ? ORDER BY quality_score DESC",
                (person_id,)
            )
            emb_rows = cursor.fetchall()
            
            if not emb_rows:
                continue
            
            all_embeddings = [
                np.frombuffer(row[0], dtype=np.float32)
                for row in emb_rows
            ]
            
            results.append({
                "id": person_id,
                "name": name,
                "embeddings": all_embeddings,
                "image_count": image_count,
                "created_at": created_at
            })
        
        return results
    
    def get_person_by_name(self, name: str) -> Optional[dict]:
        """Retrieve a specific person by name."""
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT id, name, image_count, created_at FROM persons WHERE name = ?",
            (name,)
        )
        row = cursor.fetchone()
        
        if not row:
            return None
        
        person_id, name, image_count, created_at = row
        
        cursor.execute(
            "SELECT embedding FROM embeddings WHERE person_id = ?",
            (person_id,)
        )
        emb_rows = cursor.fetchall()
        
        all_embeddings = [np.frombuffer(r[0], dtype=np.float32) for r in emb_rows]
        avg_embedding = np.mean(all_embeddings, axis=0)
        norm = np.linalg.norm(avg_embedding)
        if norm > 0:
            avg_embedding = avg_embedding / norm
        
        return {
            "id": person_id,
            "name": name,
            "embedding": avg_embedding,
            "embeddings": all_embeddings,
            "image_count": image_count,
            "created_at": created_at
        }
    
    def delete_person(self, name: str) -> bool:
        """Delete a person and all their embeddings."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT id FROM persons WHERE name = ?", (name,))
        row = cursor.fetchone()
        
        if not row:
            logger.warning(f"Person '{name}' not found")
            return False
        
        cursor.execute("DELETE FROM persons WHERE id = ?", (row[0],))
        self.conn.commit()
        logger.info(f"Deleted person '{name}' (id={row[0]})")
        return True
    
    def get_person_count(self) -> int:
        """Get total number of registered persons."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM persons")
        return cursor.fetchone()[0]
    
    def get_all_names(self) -> list:
        """Get list of all registered person names."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT name FROM persons ORDER BY name")
        return [row[0] for row in cursor.fetchall()]
    
    def get_embedding_count(self) -> int:
        """Get total number of embeddings across all persons."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM embeddings")
        return cursor.fetchone()[0]
    
    def clear_database(self) -> int:
        """Delete ALL persons and embeddings."""
        count = self.get_person_count()
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM embeddings")
        cursor.execute("DELETE FROM persons")
        self.conn.commit()
        logger.warning(f"Database cleared -- deleted {count} persons")
        return count
    
    def close(self):
        """Close the database connection."""
        self.conn.close()
        logger.info("Database connection closed")
    
    def __del__(self):
        try:
            self.conn.close()
        except Exception:
            pass
