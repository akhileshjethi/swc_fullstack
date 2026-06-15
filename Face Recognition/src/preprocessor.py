"""
Face Preprocessing Module (V2 — Accuracy Focused)
====================================================
Critical preprocessing that directly impacts recognition accuracy.

Key improvements over V1:
    1. CLAHE histogram equalization — normalizes lighting conditions
    2. Tensor-level augmentation — no re-detection needed (was the #1 accuracy bug)
    3. Image enhancement pipeline — color normalization, denoising
    4. Test-Time Augmentation — average multiple embeddings at inference

Why these matter:
    - CLAHE: A face in a dark room and the same face in sunlight produce
      wildly different pixel values. CLAHE normalizes the contrast locally,
      making embeddings more consistent across lighting conditions.
    
    - Tensor augmentation: V1 augmented PIL crops and re-detected faces in them.
      Augmented crops (blurred, rotated) often failed re-detection or produced
      poor crops, creating BAD embeddings that poisoned the average.
      V2 augments the face TENSOR directly — no re-detection needed.
"""

import random

import cv2
import numpy as np
import torch
from PIL import Image, ImageEnhance, ImageFilter

import config
from src.utils import get_logger

logger = get_logger(__name__)


class FacePreprocessor:
    """
    Enhanced face preprocessor for improved recognition accuracy.
    """
    
    def __init__(self):
        """Initialize the preprocessor with CLAHE."""
        self.target_size = (config.MTCNN_IMAGE_SIZE, config.MTCNN_IMAGE_SIZE)
        
        # Initialize CLAHE
        self.clahe = cv2.createCLAHE(
            clipLimit=config.CLAHE_CLIP_LIMIT,
            tileGridSize=config.CLAHE_GRID_SIZE
        )
        
        logger.info(
            f"FacePreprocessor V2 initialized | CLAHE={config.CLAHE_ENABLED} | "
            f"TTA={config.TTA_ENABLED}"
        )
    
    def enhance_image(self, image: Image.Image) -> Image.Image:
        """
        Apply preprocessing to improve face detection and encoding quality.
        
        Pipeline:
        1. CLAHE histogram equalization (normalize lighting)
        2. Slight denoising (reduce sensor noise)
        3. Color balance normalization
        
        This should be applied to the FULL image BEFORE face detection,
        so MTCNN detects faces in the enhanced image.
        
        Args:
            image: PIL Image (RGB).
            
        Returns:
            Enhanced PIL Image.
        """
        img_array = np.array(image)
        
        # Step 1: CLAHE on the L channel of LAB color space
        if config.CLAHE_ENABLED:
            img_array = self._apply_clahe(img_array)
        
        # Step 2: Light denoising (preserves edges, removes noise)
        img_array = cv2.fastNlMeansDenoisingColored(
            img_array, None, h=3, hColor=3,
            templateWindowSize=7, searchWindowSize=21
        )
        
        return Image.fromarray(img_array)
    
    def _apply_clahe(self, img_array: np.ndarray) -> np.ndarray:
        """
        Apply CLAHE to normalize contrast.
        
        Uses LAB color space:
        - L (Lightness) channel gets CLAHE equalization
        - A and B (color) channels are preserved
        
        This normalizes lighting without changing colors.
        """
        # Convert RGB to LAB
        lab = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
        
        # Apply CLAHE to L channel only
        lab[:, :, 0] = self.clahe.apply(lab[:, :, 0])
        
        # Convert back to RGB
        result = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        return result
    
    def align_face(self, image: Image.Image, landmarks: np.ndarray) -> Image.Image:
        """
        Align a face image using eye landmarks.
        
        Args:
            image: PIL Image of the face.
            landmarks: Array of shape (5, 2) with landmark coordinates.
                       
        Returns:
            Aligned PIL Image.
        """
        if landmarks is None or len(landmarks) < 2:
            return image
        
        left_eye = landmarks[0]
        right_eye = landmarks[1]
        
        delta_x = right_eye[0] - left_eye[0]
        delta_y = right_eye[1] - left_eye[1]
        angle = np.degrees(np.arctan2(delta_y, delta_x))
        
        center = ((left_eye[0] + right_eye[0]) / 2, 
                  (left_eye[1] + right_eye[1]) / 2)
        
        aligned = image.rotate(-angle, center=center, resample=Image.BICUBIC, expand=False)
        return aligned
    
    def augment_tensor(self, face_tensor: torch.Tensor, num_augmentations: int = None) -> list:
        """
        Generate augmented face tensors directly — NO re-detection needed.
        
        THIS IS THE CRITICAL FIX: V1 augmented PIL images and re-detected faces,
        which often failed. V2 augments the already-detected face tensor directly
        using operations that preserve face structure.
        
        Augmentations applied (tensor-level):
        - Horizontal flip (mirrors the face)
        - Brightness adjustment (simulates lighting)
        - Noise injection (simulates camera noise)
        - Slight color shift
        
        Args:
            face_tensor: Tensor of shape (3, 160, 160) from MTCNN.
            num_augmentations: Number of augmented copies. Defaults to config.
            
        Returns:
            List of augmented tensors (original + augmented).
        """
        num_aug = num_augmentations or config.NUM_AUGMENTATIONS
        augmented = [face_tensor.clone()]  # Always include original
        
        for _ in range(num_aug):
            aug_tensor = face_tensor.clone()
            
            # Randomly pick 1-2 augmentations
            transforms = random.sample([
                self._tensor_flip,
                self._tensor_brightness,
                self._tensor_noise,
                self._tensor_color_shift,
            ], k=random.randint(1, 2))
            
            for transform in transforms:
                aug_tensor = transform(aug_tensor)
            
            augmented.append(aug_tensor)
        
        logger.info(f"Generated {num_aug} augmented tensors (total: {len(augmented)})")
        return augmented
    
    def get_tta_tensors(self, face_tensor: torch.Tensor) -> list:
        """
        Generate Test-Time Augmentation (TTA) tensors.
        
        TTA improves recognition accuracy by encoding the same face
        with slight variations and AVERAGING the embeddings.
        The averaged embedding is more robust to noise.
        
        Args:
            face_tensor: Tensor of shape (3, 160, 160).
            
        Returns:
            List of tensors for TTA encoding.
        """
        tta_tensors = [face_tensor.clone()]  # Original
        
        if config.TTA_FLIP:
            # Horizontal flip
            flipped = torch.flip(face_tensor, dims=[2])  # Flip width dimension
            tta_tensors.append(flipped)
        
        return tta_tensors
    
    # ─── Tensor-Level Augmentations ──────────────────────────────────────
    
    def _tensor_flip(self, tensor: torch.Tensor) -> torch.Tensor:
        """Horizontal flip of face tensor."""
        return torch.flip(tensor, dims=[2])
    
    def _tensor_brightness(self, tensor: torch.Tensor) -> torch.Tensor:
        """Adjust brightness at tensor level."""
        factor = random.uniform(0.85, 1.15)
        return torch.clamp(tensor * factor, -1, 1)
    
    def _tensor_noise(self, tensor: torch.Tensor) -> torch.Tensor:
        """Add slight Gaussian noise."""
        noise = torch.randn_like(tensor) * 0.02
        return torch.clamp(tensor + noise, -1, 1)
    
    def _tensor_color_shift(self, tensor: torch.Tensor) -> torch.Tensor:
        """Slight per-channel color shift."""
        shifts = torch.FloatTensor(3, 1, 1).uniform_(-0.05, 0.05)
        return torch.clamp(tensor + shifts, -1, 1)
    
    # ─── Legacy PIL augmentation (kept for registration from files) ──────
    
    def augment(self, image: Image.Image, num_augmentations: int = None) -> list:
        """Legacy PIL augmentation — used only for display/saving, not encoding."""
        num_aug = num_augmentations or config.NUM_AUGMENTATIONS
        augmented = [image]
        
        for _ in range(num_aug):
            aug_img = image.copy()
            transforms = random.sample([
                self._adjust_brightness,
                self._adjust_contrast,
                self._horizontal_flip,
            ], k=random.randint(1, 2))
            
            for transform in transforms:
                aug_img = transform(aug_img)
            augmented.append(aug_img)
        
        return augmented
    
    def _adjust_brightness(self, image: Image.Image) -> Image.Image:
        factor = random.uniform(0.8, 1.2)
        return ImageEnhance.Brightness(image).enhance(factor)
    
    def _adjust_contrast(self, image: Image.Image) -> Image.Image:
        factor = random.uniform(0.85, 1.15)
        return ImageEnhance.Contrast(image).enhance(factor)
    
    def _horizontal_flip(self, image: Image.Image) -> Image.Image:
        if random.random() > 0.5:
            return image.transpose(Image.FLIP_LEFT_RIGHT)
        return image
