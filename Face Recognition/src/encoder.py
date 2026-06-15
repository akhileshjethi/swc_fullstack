"""
Face Encoding Module V2
========================
InceptionResnetV1 (FaceNet) face encoding with improved robustness.

V2 improvements:
    - Better error handling
    - Direct tensor encoding without re-detection
    - Batch encoding optimization
"""

import numpy as np
import torch
from PIL import Image
from facenet_pytorch import InceptionResnetV1

import config
from src.utils import get_logger, normalize_embedding, timer

logger = get_logger(__name__)


class FaceEncoder:
    """
    FaceNet-based face encoder V2.
    """
    
    def __init__(self, device: str = None):
        """Initialize the FaceNet encoder."""
        self.device = torch.device(device or config.DEVICE)
        
        logger.info(f"Loading InceptionResnetV1 (pretrained={config.ENCODER_PRETRAINED})...")
        
        self.model = InceptionResnetV1(
            pretrained=config.ENCODER_PRETRAINED,
            device=self.device
        ).eval()
        
        logger.info(f"FaceEncoder V2 ready | device={self.device}")
    
    @timer
    @torch.no_grad()
    def encode(self, face_tensor: torch.Tensor) -> np.ndarray:
        """
        Generate an embedding from a face tensor.
        
        Args:
            face_tensor: Tensor of shape (3, 160, 160) or (1, 3, 160, 160).
            
        Returns:
            Normalized 512-D embedding as numpy array.
        """
        if face_tensor.dim() == 3:
            face_tensor = face_tensor.unsqueeze(0)
        
        face_tensor = face_tensor.to(self.device)
        
        embedding = self.model(face_tensor)
        embedding_np = embedding.cpu().numpy().flatten()
        embedding_np = normalize_embedding(embedding_np)
        
        return embedding_np
    
    @torch.no_grad()
    def encode_batch(self, face_tensors: torch.Tensor) -> np.ndarray:
        """
        Generate embeddings for a batch of face tensors.
        
        Args:
            face_tensors: Tensor of shape (N, 3, 160, 160).
            
        Returns:
            Numpy array of shape (N, 512).
        """
        if face_tensors is None or len(face_tensors) == 0:
            return np.array([])
        
        face_tensors = face_tensors.to(self.device)
        embeddings = self.model(face_tensors)
        embeddings_np = embeddings.cpu().numpy()
        
        # Normalize each embedding
        norms = np.linalg.norm(embeddings_np, axis=1, keepdims=True)
        norms[norms == 0] = 1
        embeddings_np = embeddings_np / norms
        
        logger.info(f"Batch encoded {len(embeddings_np)} faces")
        return embeddings_np
    
    @torch.no_grad()
    def encode_pil_image(self, face_image: Image.Image, detector=None) -> np.ndarray:
        """
        Encode a PIL Image (detects face first, then encodes).
        
        Args:
            face_image: PIL Image containing a face.
            detector: FaceDetector instance.
            
        Returns:
            512-D embedding or None if no face detected.
        """
        if detector is None:
            from src.detector import FaceDetector
            detector = FaceDetector(device=str(self.device))
        
        result = detector.detect_largest_face(face_image)
        
        if result["count"] == 0:
            logger.warning("No face detected in image")
            return None
        
        return self.encode(result["faces"][0])
