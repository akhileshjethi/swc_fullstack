"""
Utility Functions
==================
Shared helper functions used across the face recognition system.
"""

import logging
import os
import sys
import time
from datetime import datetime
from functools import wraps

import numpy as np

# ─── Console Unicode Safety on Windows ──────────────────────────────────
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(errors="backslashreplace")
        sys.stderr.reconfigure(errors="backslashreplace")
    except Exception:
        pass


# ─── Logger Setup ────────────────────────────────────────────────────────

def get_logger(name: str, log_file: str = None) -> logging.Logger:
    """
    Create a configured logger instance.
    
    Args:
        name: Logger name (typically __name__ of the calling module).
        log_file: Optional path to a log file.
        
    Returns:
        Configured logging.Logger instance.
    """
    logger = logging.getLogger(name)
    
    if logger.handlers:
        return logger  # Avoid duplicate handlers
    
    logger.setLevel(logging.DEBUG)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_fmt = logging.Formatter(
        "[%(asctime)s] %(levelname)-8s %(name)-20s | %(message)s",
        datefmt="%H:%M:%S"
    )
    console_handler.setFormatter(console_fmt)
    logger.addHandler(console_handler)
    
    # File handler (if log_file specified)
    if log_file:
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setLevel(logging.DEBUG)
        file_fmt = logging.Formatter(
            "[%(asctime)s] %(levelname)-8s %(name)-25s | %(funcName)-20s | %(message)s"
        )
        file_handler.setFormatter(file_fmt)
        logger.addHandler(file_handler)
    
    return logger


# ─── Timing Decorator ───────────────────────────────────────────────────

def timer(func):
    """Decorator to measure and log function execution time."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        logger = get_logger("timer")
        logger.debug(f"{func.__name__} completed in {elapsed:.4f}s")
        return result
    return wrapper


# ─── Embedding Math ─────────────────────────────────────────────────────

def cosine_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
    """
    Compute cosine similarity between two embedding vectors.
    
    Cosine similarity measures the cosine of the angle between two vectors.
    A value of 1.0 means identical direction (same face), 0.0 means orthogonal
    (completely different), and -1.0 means opposite.
    
    Args:
        embedding1: First 512-D face embedding vector.
        embedding2: Second 512-D face embedding vector.
        
    Returns:
        Cosine similarity score in range [-1, 1].
    """
    dot_product = np.dot(embedding1, embedding2)
    norm1 = np.linalg.norm(embedding1)
    norm2 = np.linalg.norm(embedding2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return float(dot_product / (norm1 * norm2))


def euclidean_distance(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
    """
    Compute Euclidean (L2) distance between two embedding vectors.
    
    Euclidean distance measures the straight-line distance in 512-dimensional
    space. Lower values indicate more similar faces.
    
    Args:
        embedding1: First 512-D face embedding vector.
        embedding2: Second 512-D face embedding vector.
        
    Returns:
        Euclidean distance (always >= 0).
    """
    return float(np.linalg.norm(embedding1 - embedding2))


def normalize_embedding(embedding: np.ndarray) -> np.ndarray:
    """
    L2-normalize an embedding vector to unit length.
    
    Normalization ensures that cosine similarity equals the dot product,
    simplifying and speeding up comparisons.
    
    Args:
        embedding: Raw embedding vector.
        
    Returns:
        Unit-length embedding vector.
    """
    norm = np.linalg.norm(embedding)
    if norm == 0:
        return embedding
    return embedding / norm


# ─── Image Validation ────────────────────────────────────────────────────

VALID_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}

def is_valid_image(filepath: str) -> bool:
    """Check if a file has a valid image extension."""
    _, ext = os.path.splitext(filepath)
    return ext.lower() in VALID_IMAGE_EXTENSIONS


def get_timestamp() -> str:
    """Return current timestamp as a formatted string."""
    return datetime.now().strftime("%Y-%m-%d_%H-%M-%S")


def format_confidence(score: float) -> str:
    """Format a confidence score as a percentage string."""
    return f"{score * 100:.1f}%"
