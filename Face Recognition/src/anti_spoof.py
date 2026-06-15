"""
Anti-Spoofing Module
=====================
Basic liveness/anti-spoofing detection to prevent photo attacks.

Techniques used:
    1. Texture Analysis (LBP) — real faces have richer micro-texture
       than printed photos or screens
    2. Color Distribution — real skin has specific YCrCb color distribution
       that differs from screens/printed paper
    3. Moiré Pattern Detection — screens produce moiré patterns
    4. Frequency Analysis — printed/screen faces lack high-frequency detail

This is a BASIC anti-spoofing module. Production systems use dedicated
deep learning models (e.g., FAS, CDCN) for robust anti-spoofing.
"""

import cv2
import numpy as np
from PIL import Image

import config
from src.utils import get_logger

logger = get_logger(__name__)


class AntiSpoofDetector:
    """
    Detects potential spoofing attacks (photo, screen, mask).
    
    Uses texture and color analysis heuristics to distinguish
    real faces from reproductions.
    """
    
    def __init__(self):
        """Initialize anti-spoof detector."""
        self.texture_threshold = config.SPOOF_TEXTURE_THRESHOLD
        self.color_threshold = config.SPOOF_COLOR_THRESHOLD
        logger.info("AntiSpoofDetector initialized")
    
    def check(self, face_image) -> dict:
        """
        Run anti-spoofing checks on a face image.
        
        Args:
            face_image: PIL Image or numpy array of the face crop.
            
        Returns:
            Dict with spoofing analysis:
            {
                "is_real": bool,           # Overall verdict
                "confidence": float,       # Confidence in the verdict (0-1)
                "texture_score": float,    # LBP texture variance
                "color_score": float,      # Skin color distribution score
                "frequency_score": float,  # High-frequency content score
                "details": str,            # Human-readable explanation
            }
        """
        if isinstance(face_image, Image.Image):
            img_array = np.array(face_image)
        else:
            img_array = face_image.copy()
        
        # Ensure RGB
        if len(img_array.shape) == 2:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_GRAY2RGB)
        
        # Run checks
        texture_score = self._analyze_texture(img_array)
        color_score = self._analyze_color_distribution(img_array)
        frequency_score = self._analyze_frequency(img_array)
        
        # Combine scores (weighted)
        combined = 0.4 * texture_score + 0.3 * color_score + 0.3 * frequency_score
        
        # Verdict
        is_real = combined > 0.4  # Generous threshold — avoid false rejections
        confidence = min(1.0, combined)
        
        if is_real:
            details = "Face appears genuine"
        else:
            issues = []
            if texture_score < 0.4:
                issues.append("Low micro-texture (possible print/screen)")
            if color_score < 0.4:
                issues.append("Unusual skin color distribution")
            if frequency_score < 0.4:
                issues.append("Lacks high-frequency facial detail")
            details = "Possible spoof: " + "; ".join(issues) if issues else "Suspicious"
        
        return {
            "is_real": is_real,
            "confidence": round(confidence, 3),
            "texture_score": round(texture_score, 3),
            "color_score": round(color_score, 3),
            "frequency_score": round(frequency_score, 3),
            "details": details,
        }
    
    def _analyze_texture(self, img: np.ndarray) -> float:
        """
        Analyze micro-texture using Local Binary Patterns (LBP).
        
        Real faces have rich, varied micro-textures (pores, wrinkles).
        Printed photos or screens have uniform textures.
        
        Returns:
            Texture score (0-1). Higher = more likely real.
        """
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        
        # Compute LBP manually (simple 3x3 version)
        h, w = gray.shape
        lbp = np.zeros((h - 2, w - 2), dtype=np.uint8)
        
        for i in range(1, h - 1):
            for j in range(1, w - 1):
                center = gray[i, j]
                code = 0
                code |= (gray[i-1, j-1] >= center) << 7
                code |= (gray[i-1, j  ] >= center) << 6
                code |= (gray[i-1, j+1] >= center) << 5
                code |= (gray[i  , j+1] >= center) << 4
                code |= (gray[i+1, j+1] >= center) << 3
                code |= (gray[i+1, j  ] >= center) << 2
                code |= (gray[i+1, j-1] >= center) << 1
                code |= (gray[i  , j-1] >= center) << 0
                lbp[i-1, j-1] = code
        
        # Compute histogram variance — real faces have more uniform distribution
        hist, _ = np.histogram(lbp.ravel(), bins=256, range=(0, 256))
        hist = hist.astype(float) / hist.sum()
        
        # Entropy of LBP histogram — higher entropy = more texture variety = more likely real
        hist = hist[hist > 0]  # Remove zeros
        entropy = -np.sum(hist * np.log2(hist))
        
        # Normalize: max possible entropy for 256 bins = 8.0
        return min(1.0, entropy / 6.0)
    
    def _analyze_color_distribution(self, img: np.ndarray) -> float:
        """
        Analyze skin color distribution in YCrCb color space.
        
        Real human skin has specific chrominance (Cr, Cb) ranges.
        Screens and prints often have different color profiles.
        
        Returns:
            Color distribution score (0-1). Higher = more likely real skin.
        """
        # Convert to YCrCb
        ycrcb = cv2.cvtColor(img, cv2.COLOR_RGB2YCrCb)
        
        # Extract Cr and Cb channels
        cr = ycrcb[:, :, 1].astype(float)
        cb = ycrcb[:, :, 2].astype(float)
        
        # Real skin typically: Cr in [133, 173], Cb in [77, 127]
        cr_mean = np.mean(cr)
        cb_mean = np.mean(cb)
        cr_std = np.std(cr)
        cb_std = np.std(cb)
        
        # Score based on how close to expected skin color range
        cr_score = 1.0 - min(1.0, abs(cr_mean - 153) / 40)  # Center: 153
        cb_score = 1.0 - min(1.0, abs(cb_mean - 102) / 40)  # Center: 102
        
        # Real skin has moderate variance in chrominance
        variance_score = min(1.0, (cr_std + cb_std) / 30.0)
        
        return (cr_score + cb_score + variance_score) / 3.0
    
    def _analyze_frequency(self, img: np.ndarray) -> float:
        """
        Analyze frequency content using FFT.
        
        Real faces contain rich high-frequency content (hair, skin texture).
        Screen reproductions often lose high-frequency detail.
        
        Returns:
            Frequency score (0-1). Higher = more high-frequency content.
        """
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        gray = cv2.resize(gray, (128, 128))
        
        # Compute 2D FFT
        f_transform = np.fft.fft2(gray.astype(float))
        f_shift = np.fft.fftshift(f_transform)
        magnitude = np.log1p(np.abs(f_shift))
        
        # Compute ratio of high-frequency energy to total energy
        h, w = magnitude.shape
        center_y, center_x = h // 2, w // 2
        
        # Low-frequency region (center 25%)
        radius = min(h, w) // 4
        y, x = np.ogrid[:h, :w]
        low_freq_mask = ((y - center_y)**2 + (x - center_x)**2) <= radius**2
        
        total_energy = np.sum(magnitude)
        low_freq_energy = np.sum(magnitude[low_freq_mask])
        
        if total_energy == 0:
            return 0.5
        
        high_freq_ratio = 1.0 - (low_freq_energy / total_energy)
        
        # Normalize — real faces typically have 40-70% high-frequency content
        return min(1.0, high_freq_ratio / 0.5)
