# 🧠 Robust Face Recognition System

A production-grade face recognition system using deep neural networks (MTCNN + FaceNet/InceptionResnetV1) with a Streamlit web interface.

## ✨ Features

- **Face Detection** — MTCNN (Multi-task Cascaded Convolutional Networks)
- **Face Encoding** — InceptionResnetV1 (FaceNet) producing 512-D embeddings
- **Face Registration** — Register faces with data augmentation for robustness
- **Face Recognition** — Identify faces via cosine similarity / Euclidean distance
- **Live Camera** — Real-time webcam recognition with annotated bounding boxes
- **Web Interface** — Beautiful Streamlit dashboard with dark-mode design
- **Persistent Storage** — SQLite database for face embeddings

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Face Detection | MTCNN (3-stage cascaded CNN) |
| Face Encoding | InceptionResnetV1 (FaceNet) |
| Framework | PyTorch |
| Image Processing | OpenCV + Pillow |
| Database | SQLite |
| Web Interface | Streamlit |
| Math | NumPy + SciPy |

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the Web App

```bash
streamlit run app.py
```

### 3. Register Faces

1. Go to "📸 Register Face" in the sidebar
2. Enter the person's name
3. Upload one or more clear face photos
4. Click "Register Face"

### 4. Recognize Faces

1. Go to "🔍 Recognize Face"
2. Upload an image containing faces
3. View recognition results with confidence scores

## 📁 Project Structure

```
Face Recognition/
├── src/
│   ├── __init__.py          # Package init
│   ├── detector.py          # MTCNN face detection
│   ├── encoder.py           # FaceNet embedding generation
│   ├── recognizer.py        # Recognition pipeline
│   ├── database.py          # SQLite face database
│   ├── preprocessor.py      # Alignment & augmentation
│   ├── camera.py            # Webcam handler
│   └── utils.py             # Shared utilities
├── app.py                   # Streamlit web interface
├── config.py                # Central configuration
├── requirements.txt         # Python dependencies
├── data/known_faces/        # Registered face images
├── db/                      # SQLite database
├── logs/                    # Application logs
└── README.md                # This file
```

## ⚙️ Configuration

All hyperparameters are in `config.py`:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `RECOGNITION_THRESHOLD` | 0.85 | Cosine similarity threshold (0-1) |
| `DISTANCE_METRIC` | cosine | "cosine" or "euclidean" |
| `MTCNN_IMAGE_SIZE` | 160 | Face crop size in pixels |
| `MTCNN_MIN_FACE_SIZE` | 40 | Minimum detectable face size |
| `AUGMENTATION_ENABLED` | True | Enable data augmentation |
| `NUM_AUGMENTATIONS` | 5 | Augmented copies per image |

## 📖 How It Works

### 1. Face Detection (MTCNN)
MTCNN uses three cascaded neural networks:
- **P-Net**: Scans image at multiple scales, proposes candidate face regions
- **R-Net**: Refines bounding boxes, rejects false positives
- **O-Net**: Final detection + 5-point facial landmarks (eyes, nose, mouth)

### 2. Face Encoding (FaceNet/InceptionResnetV1)
- Takes a 160×160 aligned face image
- Passes through 22 Inception-ResNet blocks
- Outputs a 512-dimensional embedding vector
- Trained with triplet loss to cluster same-person embeddings

### 3. Face Comparison
- **Cosine Similarity**: Measures angle between embedding vectors (1 = identical)
- **Euclidean Distance**: Measures straight-line distance in 512-D space

### 4. Data Augmentation
Creates variations (brightness, contrast, rotation, blur, flip) to make
recognition robust across different conditions.

## 📜 License

MIT License
