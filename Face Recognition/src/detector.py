"""
Face Detection Module V2
=========================
MTCNN face detection with improved robustness.

V2 improvements:
    - Better error handling for edge cases
    - Support for enhanced (CLAHE-preprocessed) images
    - Improved face crop extraction with padding
"""

import numpy as np
import torch
from PIL import Image
from facenet_pytorch import MTCNN

import config
from src.utils import get_logger, timer

logger = get_logger(__name__)


class FaceDetector:
    """
    MTCNN-based face detector V2.
    """
    
    def __init__(self, device: str = None):
        """Initialize the MTCNN face detector."""
        self.device = torch.device(device or config.DEVICE)
        
        self.mtcnn = MTCNN(
            image_size=config.MTCNN_IMAGE_SIZE,
            margin=config.MTCNN_MARGIN,
            min_face_size=config.MTCNN_MIN_FACE_SIZE,
            thresholds=config.MTCNN_THRESHOLDS,
            keep_all=config.MTCNN_KEEP_ALL,
            device=self.device,
            post_process=True,
            selection_method=config.MTCNN_SELECTION_METHOD,
        )
        
        logger.info(
            f"FaceDetector V2 | device={self.device} | "
            f"margin={config.MTCNN_MARGIN} | min_face={config.MTCNN_MIN_FACE_SIZE}px"
        )
    
    @timer
    def detect_faces(self, image: Image.Image) -> dict:
        """
        Detect all faces in an image.
        
        Args:
            image: PIL Image (RGB format).
            
        Returns:
            Detection results dict.
        """
        try:
            boxes, confidences, landmarks = self.mtcnn.detect(image, landmarks=True)
        except Exception as e:
            logger.error(f"MTCNN detection failed: {e}")
            return self._empty_result()
        
        if boxes is None:
            return self._empty_result()
        
        # Get cropped & aligned face tensors
        try:
            faces = self.mtcnn(image)
        except Exception as e:
            logger.error(f"MTCNN face cropping failed: {e}")
            return self._empty_result()
        
        if faces is None:
            return self._empty_result()
        
        if faces.dim() == 3:
            faces = faces.unsqueeze(0)
        
        num_faces = len(boxes)
        
        # Ensure boxes and faces count match
        if len(faces) != num_faces:
            # Take the minimum
            num_faces = min(len(faces), len(boxes))
            boxes = boxes[:num_faces]
            confidences = confidences[:num_faces]
            if landmarks is not None:
                landmarks = landmarks[:num_faces]
            faces = faces[:num_faces]
        
        logger.info(f"Detected {num_faces} face(s)")
        
        return {
            "boxes": np.array(boxes),
            "confidences": np.array(confidences),
            "landmarks": np.array(landmarks) if landmarks is not None else np.array([]),
            "faces": faces,
            "count": num_faces
        }
    
    def detect_and_filter(self, image: Image.Image, min_confidence: float = None) -> dict:
        """Detect faces and filter out low-confidence detections."""
        min_conf = min_confidence or config.MIN_FACE_QUALITY_SCORE
        results = self.detect_faces(image)
        
        if results["count"] == 0:
            return results
        
        mask = results["confidences"] >= min_conf
        
        filtered_count = int(mask.sum())
        if filtered_count == 0:
            return self._empty_result()
        
        filtered = {
            "boxes": results["boxes"][mask],
            "confidences": results["confidences"][mask],
            "landmarks": results["landmarks"][mask] if len(results["landmarks"]) > 0 else np.array([]),
            "faces": results["faces"][mask] if results["faces"] is not None else None,
            "count": filtered_count
        }
        
        rejected = results["count"] - filtered_count
        if rejected > 0:
            logger.info(f"Filtered {rejected} low-confidence face(s)")
        
        return filtered
    
    def detect_largest_face(self, image: Image.Image) -> dict:
        """Detect only the largest face in an image."""
        results = self.detect_and_filter(image)
        
        if results["count"] == 0:
            return results
        
        boxes = results["boxes"]
        areas = (boxes[:, 2] - boxes[:, 0]) * (boxes[:, 3] - boxes[:, 1])
        largest_idx = np.argmax(areas)
        
        return {
            "boxes": boxes[largest_idx:largest_idx+1],
            "confidences": results["confidences"][largest_idx:largest_idx+1],
            "landmarks": results["landmarks"][largest_idx:largest_idx+1] if len(results["landmarks"]) > 0 else np.array([]),
            "faces": results["faces"][largest_idx:largest_idx+1] if results["faces"] is not None else None,
            "count": 1
        }
    
    def get_face_crops(self, image: Image.Image) -> list:
        """Get cropped face images as PIL Images."""
        results = self.detect_and_filter(image)
        crops = []
        
        if results["count"] == 0:
            return crops
        
        img_array = np.array(image)
        
        for box in results["boxes"]:
            x1, y1, x2, y2 = [int(coord) for coord in box]
            x1 = max(0, x1)
            y1 = max(0, y1)
            x2 = min(img_array.shape[1], x2)
            y2 = min(img_array.shape[0], y2)
            
            crop = img_array[y1:y2, x1:x2]
            if crop.size > 0:
                crops.append(Image.fromarray(crop))
        
        return crops
    
    def _empty_result(self) -> dict:
        """Return empty detection result."""
        return {
            "boxes": np.array([]),
            "confidences": np.array([]),
            "landmarks": np.array([]),
            "faces": None,
            "count": 0
        }
