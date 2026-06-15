"""
Face Quality Assessment Module
================================
Evaluates face image quality BEFORE encoding to prevent storing
low-quality embeddings that degrade recognition accuracy.

Quality Factors:
    1. Blur detection (Laplacian variance)
    2. Brightness assessment (not too dark or washed out)
    3. Face size validation (large enough for reliable encoding)
    4. Contrast check (sufficient detail in the face)
    5. Overall composite quality score
"""

import cv2
import numpy as np
from PIL import Image

import config
from src.utils import get_logger

logger = get_logger(__name__)


class FaceQualityAssessor:
    """
    Evaluates face image quality on multiple dimensions.
    
    Prevents garbage-in-garbage-out: if a face crop is blurry,
    too dark, too small, or washed out, its embedding will be
    unreliable and should not be stored or matched.
    """
    
    def __init__(self):
        """Initialize quality assessor with configured thresholds."""
        self.min_blur = config.MIN_BLUR_SCORE
        self.min_brightness = config.MIN_BRIGHTNESS
        self.max_brightness = config.MAX_BRIGHTNESS
        self.min_face_pixels = config.MIN_FACE_PIXELS
        logger.info("FaceQualityAssessor initialized")
    
    def assess(self, face_image) -> dict:
        """
        Run all quality checks on a face image.
        
        Args:
            face_image: PIL Image or numpy array of the face crop.
            
        Returns:
            Dict with individual scores and overall pass/fail:
            {
                "blur_score": float,    # Laplacian variance (higher = sharper)
                "brightness": float,    # Average pixel value (0-255)
                "contrast": float,      # Std dev of pixel values
                "face_size": tuple,     # (width, height) in pixels
                "is_sharp": bool,
                "is_well_lit": bool,
                "is_large_enough": bool,
                "has_contrast": bool,
                "overall_pass": bool,
                "quality_score": float, # 0-1 composite score
                "issues": list,         # List of detected issues
            }
        """
        # Convert to numpy if PIL Image
        if isinstance(face_image, Image.Image):
            img_array = np.array(face_image)
        else:
            img_array = face_image.copy()
        
        # Convert to grayscale for analysis
        if len(img_array.shape) == 3:
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_array
        
        # Individual checks
        blur_score = self._check_blur(gray)
        brightness = self._check_brightness(gray)
        contrast = self._check_contrast(gray)
        face_size = (img_array.shape[1], img_array.shape[0])
        
        is_sharp = blur_score >= self.min_blur
        is_well_lit = self.min_brightness <= brightness <= self.max_brightness
        is_large_enough = min(face_size) >= self.min_face_pixels
        has_contrast = contrast >= 20.0
        
        # Collect issues
        issues = []
        if not is_sharp:
            issues.append(f"Blurry (score: {blur_score:.1f}, min: {self.min_blur})")
        if brightness < self.min_brightness:
            issues.append(f"Too dark (brightness: {brightness:.0f})")
        if brightness > self.max_brightness:
            issues.append(f"Too bright/washed out (brightness: {brightness:.0f})")
        if not is_large_enough:
            issues.append(f"Face too small ({face_size[0]}x{face_size[1]}px, min: {self.min_face_pixels}px)")
        if not has_contrast:
            issues.append(f"Low contrast (std: {contrast:.1f})")
        
        overall_pass = is_sharp and is_well_lit and is_large_enough and has_contrast
        
        # Composite quality score (0-1)
        quality_score = self._compute_composite_score(
            blur_score, brightness, contrast, face_size
        )
        
        return {
            "blur_score": blur_score,
            "brightness": brightness,
            "contrast": contrast,
            "face_size": face_size,
            "is_sharp": is_sharp,
            "is_well_lit": is_well_lit,
            "is_large_enough": is_large_enough,
            "has_contrast": has_contrast,
            "overall_pass": overall_pass,
            "quality_score": quality_score,
            "issues": issues,
        }
    
    def _check_blur(self, gray: np.ndarray) -> float:
        """
        Detect blur using Laplacian variance.
        
        The Laplacian operator highlights edges. Sharp images have
        strong edges (high variance). Blurry images have weak edges
        (low variance).
        
        Args:
            gray: Grayscale image.
            
        Returns:
            Laplacian variance score. Higher = sharper.
        """
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        return float(laplacian.var())
    
    def _check_brightness(self, gray: np.ndarray) -> float:
        """
        Check image brightness.
        
        Args:
            gray: Grayscale image.
            
        Returns:
            Average pixel intensity (0-255).
        """
        return float(np.mean(gray))
    
    def _check_contrast(self, gray: np.ndarray) -> float:
        """
        Check image contrast using standard deviation.
        
        Args:
            gray: Grayscale image.
            
        Returns:
            Standard deviation of pixel values.
        """
        return float(np.std(gray))
    
    def _compute_composite_score(self, blur: float, brightness: float, 
                                  contrast: float, size: tuple) -> float:
        """
        Compute a composite quality score from 0.0 to 1.0.
        
        Each factor is normalized to [0, 1] and weighted:
            - Blur: 40% weight (most important for embedding quality)
            - Brightness: 20%
            - Contrast: 20%
            - Size: 20%
        """
        # Normalize blur (0-500 range → 0-1, clamped)
        blur_norm = min(1.0, blur / 300.0)
        
        # Normalize brightness (penalize too dark or too bright)
        ideal_brightness = 127.5
        brightness_norm = max(0, 1.0 - abs(brightness - ideal_brightness) / ideal_brightness)
        
        # Normalize contrast (0-80 range → 0-1)
        contrast_norm = min(1.0, contrast / 60.0)
        
        # Normalize size (0-300 range → 0-1)
        min_dim = min(size)
        size_norm = min(1.0, min_dim / 200.0)
        
        # Weighted average
        score = (0.4 * blur_norm + 0.2 * brightness_norm + 
                 0.2 * contrast_norm + 0.2 * size_norm)
        
        return round(score, 3)
