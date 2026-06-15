"""
Camera Module
==============
Handles webcam capture for real-time face recognition.

Uses OpenCV's VideoCapture to stream frames from the webcam,
processes each frame through the recognition pipeline, and
overlays bounding boxes with identity labels.
"""

import time

import cv2
import numpy as np
from PIL import Image

import config
from src.recognizer import FaceRecognizer
from src.utils import format_confidence, get_logger

logger = get_logger(__name__, log_file=f"{config.LOG_DIR}/camera.log")


class CameraFeed:
    """
    Real-time webcam face recognition.
    
    Captures frames from the webcam, runs the face recognition
    pipeline, and displays results with annotated bounding boxes.
    
    Frame Processing Pipeline:
        1. Capture BGR frame from webcam via OpenCV
        2. Convert BGR → RGB (OpenCV uses BGR, PIL/PyTorch use RGB)
        3. Convert to PIL Image for MTCNN compatibility
        4. Run recognition pipeline
        5. Draw bounding boxes and labels on the original frame
        6. Display annotated frame
    """
    
    def __init__(self, recognizer: FaceRecognizer = None):
        """
        Initialize the camera feed.
        
        Args:
            recognizer: FaceRecognizer instance. If None, one will be created.
        """
        self.recognizer = recognizer or FaceRecognizer()
        self.cap = None
        self.is_running = False
        
        logger.info("CameraFeed initialized")
    
    def start(self, camera_index: int = None, process_every_n: int = 3):
        """
        Start the live recognition feed.
        
        Performance optimization: We don't run the full neural network
        on every frame. Instead, we process every Nth frame and reuse
        results for intermediate frames. This gives smooth video while
        keeping GPU/CPU load manageable.
        
        Args:
            camera_index: Webcam device index. Defaults to config value.
            process_every_n: Run recognition every N frames. Higher = faster
                           display but less responsive recognition.
        """
        cam_idx = camera_index if camera_index is not None else config.CAMERA_INDEX
        
        self.cap = cv2.VideoCapture(cam_idx)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, config.CAMERA_WIDTH)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config.CAMERA_HEIGHT)
        self.cap.set(cv2.CAP_PROP_FPS, config.CAMERA_FPS)
        
        if not self.cap.isOpened():
            logger.error(f"Failed to open camera at index {cam_idx}")
            raise RuntimeError(f"Cannot open camera {cam_idx}")
        
        logger.info(f"Camera started | index={cam_idx} | process_every={process_every_n}")
        self.is_running = True
        
        frame_count = 0
        last_results = []
        fps_counter = 0
        fps_start = time.time()
        current_fps = 0
        
        try:
            while self.is_running:
                ret, frame = self.cap.read()
                if not ret:
                    logger.warning("Failed to read frame from camera")
                    break
                
                frame_count += 1
                
                # Calculate FPS
                fps_counter += 1
                elapsed = time.time() - fps_start
                if elapsed >= 1.0:
                    current_fps = fps_counter / elapsed
                    fps_counter = 0
                    fps_start = time.time()
                
                # Process every Nth frame
                if frame_count % process_every_n == 0:
                    # Convert BGR (OpenCV) → RGB (PIL)
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    pil_image = Image.fromarray(rgb_frame)
                    
                    # Run recognition
                    last_results = self.recognizer.recognize(pil_image)
                
                # Draw results on frame
                annotated = self._draw_results(frame, last_results, current_fps)
                
                # Display
                cv2.imshow("Face Recognition - Press 'q' to quit", annotated)
                
                # Handle key presses
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q') or key == 27:  # q or ESC
                    break
                elif key == ord('s'):  # Screenshot
                    self._save_screenshot(annotated)
        
        except KeyboardInterrupt:
            logger.info("Camera feed interrupted by user")
        
        finally:
            self.stop()
    
    def capture_frame(self) -> Image.Image:
        """
        Capture a single frame from the webcam.
        
        Returns:
            PIL Image of the captured frame, or None on failure.
        """
        if self.cap is None:
            self.cap = cv2.VideoCapture(config.CAMERA_INDEX)
        
        ret, frame = self.cap.read()
        if not ret:
            return None
        
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        return Image.fromarray(rgb_frame)
    
    def _draw_results(self, frame: np.ndarray, results: list, fps: float = 0) -> np.ndarray:
        """
        Draw bounding boxes and labels on a frame.
        
        Args:
            frame: BGR image (numpy array from OpenCV).
            results: List of recognition results from the pipeline.
            fps: Current frames per second for display.
            
        Returns:
            Annotated frame.
        """
        annotated = frame.copy()
        
        for result in results:
            box = result["box"]
            x1, y1, x2, y2 = [int(coord) for coord in box]
            
            # Choose color based on recognition status
            if result["is_known"]:
                color = config.BBOX_COLOR_KNOWN
                label = f"{result['name']} ({format_confidence(result['confidence'])})"
            else:
                color = config.BBOX_COLOR_UNKNOWN
                label = f"Unknown ({format_confidence(result['confidence'])})"
            
            # Draw bounding box
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, config.BBOX_THICKNESS)
            
            # Draw label background
            (text_w, text_h), baseline = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, config.FONT_SCALE, config.FONT_THICKNESS
            )
            cv2.rectangle(
                annotated, 
                (x1, y1 - text_h - baseline - 10), 
                (x1 + text_w + 10, y1),
                color, -1  # Filled rectangle
            )
            
            # Draw label text
            cv2.putText(
                annotated, label,
                (x1 + 5, y1 - baseline - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                config.FONT_SCALE,
                (255, 255, 255),  # White text
                config.FONT_THICKNESS
            )
        
        # Draw FPS counter
        cv2.putText(
            annotated, f"FPS: {fps:.1f}",
            (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2
        )
        
        # Draw person count
        known = sum(1 for r in results if r["is_known"])
        total = len(results)
        cv2.putText(
            annotated, f"Faces: {total} | Known: {known}",
            (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1
        )
        
        return annotated
    
    def _save_screenshot(self, frame: np.ndarray):
        """Save a screenshot of the current frame."""
        from src.utils import get_timestamp
        filename = f"{config.DATA_DIR}/screenshot_{get_timestamp()}.jpg"
        cv2.imwrite(filename, frame)
        logger.info(f"Screenshot saved: {filename}")
    
    def stop(self):
        """Stop the camera feed and release resources."""
        self.is_running = False
        if self.cap is not None:
            self.cap.release()
            self.cap = None
        cv2.destroyAllWindows()
        logger.info("Camera feed stopped")
