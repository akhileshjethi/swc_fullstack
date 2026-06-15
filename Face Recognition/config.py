"""
Central Configuration for Face Recognition System
===================================================
All tunable hyperparameters and paths are defined here.
"""

import os
import torch

# ─── Paths ───────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
KNOWN_FACES_DIR = os.path.join(DATA_DIR, "known_faces")
DB_DIR = os.path.join(BASE_DIR, "db")
DB_PATH = os.path.join(DB_DIR, "faces.db")
LOG_DIR = os.path.join(BASE_DIR, "logs")
MODEL_CACHE_DIR = os.path.join(BASE_DIR, "models")

# ─── Device Auto-Detection ──────────────────────────────────────────────
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# ─── Face Detection (MTCNN) ─────────────────────────────────────────────
MTCNN_IMAGE_SIZE = 160          # Output face crop size (pixels)
MTCNN_MARGIN = 40               # Margin around detected face (pixels) — increased for better context
MTCNN_MIN_FACE_SIZE = 30        # Minimum detectable face size (pixels) — lowered to catch more faces
MTCNN_THRESHOLDS = [0.6, 0.7, 0.7]  # P-Net, R-Net, O-Net confidence thresholds
MTCNN_KEEP_ALL = True           # Detect all faces in frame (vs only largest)
MTCNN_SELECTION_METHOD = "probability"  # How to select faces when keep_all=False

# ─── Face Encoding (InceptionResnetV1 / FaceNet) ────────────────────────
ENCODER_PRETRAINED = "vggface2"  # Pre-trained dataset: "vggface2" or "casia-webface"
EMBEDDING_DIM = 512              # Dimensionality of face embedding vector

# ─── Recognition ─────────────────────────────────────────────────────────
RECOGNITION_THRESHOLD = 0.55     # Cosine similarity threshold — LOWERED for better recall
DISTANCE_METRIC = "cosine"       # "cosine" or "euclidean"
EUCLIDEAN_THRESHOLD = 1.1        # Euclidean distance threshold (lower = stricter)

# Matching strategy: "max_individual" compares against ALL stored embeddings
# per person and takes the MAX score. Much more accurate than "average".
MATCHING_STRATEGY = "max_individual"  # "average" or "max_individual" or "top_k_voting"
TOP_K = 3                        # For top_k_voting: how many embeddings to consider

# ─── Image Preprocessing ─────────────────────────────────────────────────
CLAHE_ENABLED = True             # Contrast-Limited Adaptive Histogram Equalization
CLAHE_CLIP_LIMIT = 2.0           # CLAHE clip limit
CLAHE_GRID_SIZE = (8, 8)         # CLAHE tile grid size

# ─── Test-Time Augmentation (TTA) ────────────────────────────────────────
TTA_ENABLED = True               # Enable TTA during recognition for better accuracy
TTA_FLIP = True                  # Include horizontal flip
TTA_NUM_CROPS = 1                # Number of slightly-shifted crops (1 = center only)

# ─── Registration Augmentation ────────────────────────────────────────────
AUGMENTATION_ENABLED = True      # Enable tensor-level augmentation during registration
NUM_AUGMENTATIONS = 3            # Number of augmented tensor copies per image
MIN_FACE_QUALITY_SCORE = 0.85    # Minimum detection confidence to accept a face

# ─── Face Quality Assessment ─────────────────────────────────────────────
QUALITY_CHECK_ENABLED = True
MIN_BLUR_SCORE = 50.0            # Minimum Laplacian variance (higher = sharper)
MIN_BRIGHTNESS = 40              # Minimum average brightness (0-255)
MAX_BRIGHTNESS = 220             # Maximum average brightness (0-255)
MIN_FACE_PIXELS = 80             # Minimum face size in pixels (width or height)

# ─── Anti-Spoofing ───────────────────────────────────────────────────────
ANTI_SPOOF_ENABLED = True
SPOOF_TEXTURE_THRESHOLD = 10.0   # LBP texture variance threshold
SPOOF_COLOR_THRESHOLD = 15.0     # Color distribution analysis threshold

# ─── Attendance ──────────────────────────────────────────────────────────
ATTENDANCE_COOLDOWN_MINUTES = 30  # Min minutes between attendance marks for same person

# ─── Camera ──────────────────────────────────────────────────────────────
CAMERA_INDEX = 0                 # Webcam device index
CAMERA_FPS = 30                  # Target frames per second
CAMERA_WIDTH = 1280              # Capture width
CAMERA_HEIGHT = 720              # Capture height

# ─── UI / Display ────────────────────────────────────────────────────────
BBOX_COLOR_KNOWN = (0, 255, 0)       # Green for recognized faces
BBOX_COLOR_UNKNOWN = (0, 0, 255)     # Red for unknown faces
BBOX_THICKNESS = 2
FONT_SCALE = 0.7
FONT_THICKNESS = 2


def ensure_directories():
    """Create all required directories if they don't exist."""
    for directory in [DATA_DIR, KNOWN_FACES_DIR, DB_DIR, LOG_DIR, MODEL_CACHE_DIR]:
        os.makedirs(directory, exist_ok=True)


# Auto-create directories on import
ensure_directories()
