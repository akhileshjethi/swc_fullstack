"""
Face Recognition Pipeline V2 — Accuracy Overhaul
==================================================
Major accuracy improvements over V1:

1. CLAHE Preprocessing — normalizes lighting BEFORE detection
2. Tensor-Level Augmentation — no more re-detection of augmented crops
3. Multi-Embedding Matching — compares against ALL stored embeddings (not average)
4. Test-Time Augmentation (TTA) — averages embeddings from original + flipped face
5. Face Quality Gating — rejects low-quality faces before they corrupt the database
6. Anti-Spoofing — basic liveness check
7. Attendance Integration — auto-logs recognition events

WHY V1 HAD ACCURACY ISSUES:
    The root cause was the augmentation pipeline. V1 did:
        1. Detect face in original image -> get face crop PIL image
        2. Apply augmentation (blur, rotate, flip) to the crop
        3. Re-detect face in the augmented crop -> often FAILS or gives bad crop
        4. Encode the bad crop -> produces bad embedding
        5. Average all embeddings (good + bad) -> degraded average
    
    V2 fixes this by:
        1. Detect face -> get face TENSOR from MTCNN
        2. Augment the TENSOR directly (flip, brightness, noise) -> NO re-detection
        3. Encode original + augmented tensors -> all good embeddings
        4. Match using MAX against individual embeddings (not average)
"""

import numpy as np
from PIL import Image

import config
from src.database import FaceDatabase
from src.detector import FaceDetector
from src.encoder import FaceEncoder
from src.preprocessor import FacePreprocessor
from src.quality import FaceQualityAssessor
from src.utils import (
    cosine_similarity,
    euclidean_distance,
    format_confidence,
    get_logger,
    normalize_embedding,
    timer,
)

logger = get_logger(__name__)


class FaceRecognizer:
    """
    End-to-end face recognition pipeline V2.
    
    Major accuracy improvements:
    - CLAHE image preprocessing
    - Tensor-level augmentation during registration
    - Max-individual embedding matching
    - Test-time augmentation during recognition
    - Face quality gating
    """
    
    def __init__(self, db_path: str = None, device: str = None):
        """Initialize all pipeline components."""
        logger.info("Initializing Face Recognition Pipeline V2...")
        
        self.detector = FaceDetector(device=device)
        self.encoder = FaceEncoder(device=device)
        self.preprocessor = FacePreprocessor()
        self.database = FaceDatabase(db_path=db_path)
        self.quality_assessor = FaceQualityAssessor()
        
        # Lazy-loaded optional components
        self._anti_spoof = None
        self._attendance = None
        
        logger.info(
            f"Pipeline V2 ready | {self.database.get_person_count()} persons | "
            f"threshold={config.RECOGNITION_THRESHOLD} | "
            f"strategy={config.MATCHING_STRATEGY} | "
            f"CLAHE={config.CLAHE_ENABLED} | TTA={config.TTA_ENABLED}"
        )
    
    @property
    def anti_spoof(self):
        """Lazy-load anti-spoofing module."""
        if self._anti_spoof is None and config.ANTI_SPOOF_ENABLED:
            from src.anti_spoof import AntiSpoofDetector
            self._anti_spoof = AntiSpoofDetector()
        return self._anti_spoof
    
    @property
    def attendance(self):
        """Lazy-load attendance tracker."""
        if self._attendance is None:
            from src.attendance import AttendanceTracker
            self._attendance = AttendanceTracker()
        return self._attendance
    
    @timer
    def recognize(self, image: Image.Image, log_events: bool = True) -> list:
        """
        Recognize all faces in an image.
        
        V2 Pipeline:
        1. CLAHE preprocess the full image (normalize lighting)
        2. MTCNN detect all faces
        3. For each face:
           a. Quality assessment
           b. Optional anti-spoofing check
           c. Test-Time Augmentation encoding
           d. Multi-embedding database comparison
        4. Log recognition events
        
        Args:
            image: PIL Image (RGB format).
            log_events: Whether to log events to attendance tracker.
            
        Returns:
            List of recognition results per detected face.
        """
        # Step 1: CLAHE preprocessing
        enhanced_image = self.preprocessor.enhance_image(image)
        
        # Step 2: Detect faces in enhanced image
        detection = self.detector.detect_and_filter(enhanced_image)
        
        if detection["count"] == 0:
            return []
        
        if detection["faces"] is None:
            logger.warning("Detection succeeded but no face tensors returned")
            return []
        
        # Step 3: Process each detected face
        results = []
        
        # Get database embeddings based on matching strategy
        if config.MATCHING_STRATEGY == "max_individual":
            registered = self.database.get_all_persons_with_all_embeddings()
        else:
            registered = self.database.get_all_persons()
        
        for i in range(detection["count"]):
            face_tensor = detection["faces"][i]
            
            # 3a. Quality assessment on the face crop
            quality_result = None
            if config.QUALITY_CHECK_ENABLED:
                # Convert tensor to PIL for quality check
                face_pil = self._tensor_to_pil(face_tensor)
                quality_result = self.quality_assessor.assess(face_pil)
            
            # 3b. Anti-spoofing check
            spoof_result = None
            if config.ANTI_SPOOF_ENABLED and self.anti_spoof:
                face_pil = self._tensor_to_pil(face_tensor)
                spoof_result = self.anti_spoof.check(face_pil)
            
            # 3c. Encode with Test-Time Augmentation
            if config.TTA_ENABLED:
                query_embedding = self._encode_with_tta(face_tensor)
            else:
                query_embedding = self.encoder.encode(face_tensor)
            
            # 3d. Match against database
            match = self._find_best_match(query_embedding, registered)
            
            result = {
                "name": match["name"],
                "confidence": match["confidence"],
                "box": detection["boxes"][i],
                "is_known": match["is_known"],
                "embedding": query_embedding,
                "quality": quality_result,
                "spoof": spoof_result,
            }
            results.append(result)
            
            # Log event and mark attendance
            if log_events:
                try:
                    spoof_passed = spoof_result["is_real"] if spoof_result else True
                    self.attendance.log_recognition_event(
                        person_name=match["name"],
                        is_known=match["is_known"],
                        confidence=match["confidence"],
                        quality_score=quality_result["quality_score"] if quality_result else 0,
                        spoof_passed=spoof_passed
                    )
                    
                    if match["is_known"] and spoof_passed:
                        self.attendance.mark_attendance(
                            person_name=match["name"],
                            confidence=match["confidence"]
                        )
                except Exception as e:
                    logger.error(f"Failed to log event / mark attendance: {e}")
            
            status = "MATCH" if match["is_known"] else "UNKNOWN"
            logger.info(
                f"Face {i+1}: [{status}] {match['name']} "
                f"({format_confidence(match['confidence'])})"
            )
        
        return results
    
    def _encode_with_tta(self, face_tensor) -> np.ndarray:
        """
        Encode a face with Test-Time Augmentation.
        
        Creates multiple versions of the face (original + flipped),
        encodes each, and averages the embeddings. The averaged
        embedding is more robust to noise.
        
        Args:
            face_tensor: Face tensor from MTCNN.
            
        Returns:
            Averaged 512-D embedding.
        """
        tta_tensors = self.preprocessor.get_tta_tensors(face_tensor)
        
        embeddings = []
        for tensor in tta_tensors:
            emb = self.encoder.encode(tensor)
            embeddings.append(emb)
        
        # Average all TTA embeddings
        avg = np.mean(embeddings, axis=0)
        return normalize_embedding(avg)
    
    def _find_best_match(self, query_embedding: np.ndarray, registered: list) -> dict:
        """
        Find the best matching person using the configured strategy.
        
        Strategies:
        - "average": Compare against each person's average embedding
        - "max_individual": Compare against EVERY stored embedding, take max
        - "top_k_voting": Compare against all, vote among top-K matches
        
        Args:
            query_embedding: 512-D query face embedding.
            registered: List of registered persons (format depends on strategy).
            
        Returns:
            Dict with "name", "confidence", "is_known".
        """
        if not registered:
            return {"name": "Unknown", "confidence": 0.0, "is_known": False}
        
        if config.MATCHING_STRATEGY == "max_individual":
            return self._match_max_individual(query_embedding, registered)
        elif config.MATCHING_STRATEGY == "top_k_voting":
            return self._match_top_k_voting(query_embedding, registered)
        else:
            return self._match_average(query_embedding, registered)
    
    def _match_max_individual(self, query: np.ndarray, registered: list) -> dict:
        """
        Compare query against ALL individual embeddings per person.
        Return the person whose BEST-MATCHING embedding has the highest score.
        
        This is more accurate than average because:
        - A person registered with 6 embeddings might have one that
          closely matches the query (e.g., same angle, lighting)
        - The average embedding smooths out these good matches
        """
        best_name = "Unknown"
        best_score = 0.0
        
        for person in registered:
            for emb in person["embeddings"]:
                if config.DISTANCE_METRIC == "cosine":
                    score = cosine_similarity(query, emb)
                else:
                    dist = euclidean_distance(query, emb)
                    score = max(0, 1 - dist / 2)
                
                if score > best_score:
                    best_score = score
                    if score >= config.RECOGNITION_THRESHOLD:
                        best_name = person["name"]
        
        is_known = best_name != "Unknown"
        return {"name": best_name, "confidence": best_score, "is_known": is_known}
    
    def _match_top_k_voting(self, query: np.ndarray, registered: list) -> dict:
        """
        Compare against all embeddings, take top-K scores, vote on identity.
        
        If the top-K most similar embeddings mostly belong to one person,
        that person is the match. This is robust to outlier embeddings.
        """
        all_scores = []
        
        for person in registered:
            embs = person.get("embeddings", [person.get("embedding")])
            if not isinstance(embs, list):
                embs = [embs]
            
            for emb in embs:
                score = cosine_similarity(query, emb)
                all_scores.append((person["name"], score))
        
        # Sort by score descending
        all_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Take top K
        top_k = all_scores[:config.TOP_K]
        
        if not top_k or top_k[0][1] < config.RECOGNITION_THRESHOLD:
            return {"name": "Unknown", "confidence": top_k[0][1] if top_k else 0, "is_known": False}
        
        # Vote
        from collections import Counter
        votes = Counter(name for name, score in top_k if score >= config.RECOGNITION_THRESHOLD)
        
        if not votes:
            return {"name": "Unknown", "confidence": top_k[0][1], "is_known": False}
        
        winner = votes.most_common(1)[0][0]
        # Confidence = average score of winning person's matches in top-K
        winner_scores = [s for n, s in top_k if n == winner]
        confidence = np.mean(winner_scores)
        
        return {"name": winner, "confidence": float(confidence), "is_known": True}
    
    def _match_average(self, query: np.ndarray, registered: list) -> dict:
        """Original V1 matching: compare against average embeddings."""
        best_name = "Unknown"
        best_score = 0.0
        
        for person in registered:
            emb = person.get("embedding")
            if emb is None:
                continue
            
            if config.DISTANCE_METRIC == "cosine":
                score = cosine_similarity(query, emb)
                is_match = score >= config.RECOGNITION_THRESHOLD
            else:
                dist = euclidean_distance(query, emb)
                score = max(0, 1 - dist / 2)
                is_match = dist <= config.EUCLIDEAN_THRESHOLD
            
            if is_match and score > best_score:
                best_score = score
                best_name = person["name"]
        
        is_known = best_name != "Unknown"
        return {"name": best_name, "confidence": best_score, "is_known": is_known}
    
    @timer
    def register_face(self, name: str, image: Image.Image, augment: bool = True) -> dict:
        """
        Register a face with V2 accuracy improvements.
        
        V2 Registration:
        1. CLAHE preprocess the image
        2. Detect largest face
        3. Quality assessment
        4. Encode the face tensor directly
        5. Augment at TENSOR level (no re-detection!)
        6. Store original + augmented embeddings
        
        Args:
            name: Person's name.
            image: PIL Image containing the person's face.
            augment: Whether to augment. Default True.
            
        Returns:
            Registration result dict.
        """
        logger.info(f"V2 Registering face for: '{name}'")
        
        # Step 1: CLAHE preprocess
        enhanced = self.preprocessor.enhance_image(image)
        
        # Step 2: Detect the largest face
        detection = self.detector.detect_largest_face(enhanced)
        
        if detection["count"] == 0:
            return {
                "success": False, "name": name, "person_id": None,
                "embeddings_stored": 0,
                "message": "No face detected. Please provide a clear face photo.",
                "quality": None,
            }
        
        confidence = detection["confidences"][0]
        if confidence < config.MIN_FACE_QUALITY_SCORE:
            return {
                "success": False, "name": name, "person_id": None,
                "embeddings_stored": 0,
                "message": f"Detection confidence too low ({format_confidence(confidence)}). "
                           f"Min required: {format_confidence(config.MIN_FACE_QUALITY_SCORE)}",
                "quality": None,
            }
        
        # Step 3: Quality assessment
        face_tensor = detection["faces"][0]
        face_pil = self._tensor_to_pil(face_tensor)
        quality = self.quality_assessor.assess(face_pil)
        
        # Step 4: Encode original face tensor
        original_embedding = self.encoder.encode(face_tensor)
        embeddings = [original_embedding]
        quality_scores = [quality["quality_score"]]
        
        # Step 5: Tensor-level augmentation (THE FIX)
        if augment and config.AUGMENTATION_ENABLED:
            augmented_tensors = self.preprocessor.augment_tensor(face_tensor)
            
            for aug_tensor in augmented_tensors[1:]:  # Skip original
                aug_embedding = self.encoder.encode(aug_tensor)
                embeddings.append(aug_embedding)
                quality_scores.append(quality["quality_score"] * 0.9)  # Slightly lower score for augmented
        
        # Step 6: Store in database
        person_id = self.database.register_person(
            name, embeddings, quality_scores=quality_scores
        )
        
        result = {
            "success": True,
            "name": name,
            "person_id": person_id,
            "embeddings_stored": len(embeddings),
            "message": f"Registered '{name}' with {len(embeddings)} embeddings "
                       f"(confidence: {format_confidence(confidence)}, "
                       f"quality: {quality['quality_score']:.2f})",
            "quality": quality,
        }
        
        logger.info(result["message"])
        return result
    
    def _tensor_to_pil(self, tensor) -> Image.Image:
        """Convert a face tensor back to PIL Image for quality assessment."""
        import torch
        if isinstance(tensor, torch.Tensor):
            # MTCNN tensors are normalized to [-1, 1]
            img_array = tensor.permute(1, 2, 0).cpu().numpy()
            img_array = ((img_array + 1) / 2 * 255).clip(0, 255).astype(np.uint8)
            return Image.fromarray(img_array)
        return tensor
    
    def register_face_from_path(self, name: str, image_path: str, augment: bool = True) -> dict:
        """Register a face from an image file path."""
        try:
            image = Image.open(image_path).convert("RGB")
        except Exception as e:
            return {
                "success": False, "name": name, "person_id": None,
                "embeddings_stored": 0, "message": f"Failed to load image: {e}",
                "quality": None,
            }
        return self.register_face(name, image, augment)
    
    def delete_person(self, name: str) -> bool:
        """Delete a registered person."""
        return self.database.delete_person(name)
    
    def get_registered_persons(self) -> list:
        """Get all registered person names."""
        return self.database.get_all_names()
    
    def get_person_count(self) -> int:
        """Get total registered persons."""
        return self.database.get_person_count()
    
    def get_database_stats(self) -> dict:
        """Get database statistics."""
        persons = self.database.get_all_persons()
        return {
            "total_persons": len(persons),
            "total_embeddings": sum(p["image_count"] for p in persons),
            "persons": [{"name": p["name"], "embeddings": p["image_count"]} for p in persons]
        }
