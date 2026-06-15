"""
Face Recognition System - Core Package
========================================
A robust face recognition system using deep neural networks.

Modules:
    detector      - MTCNN-based face detection
    encoder       - InceptionResnetV1 (FaceNet) face encoding
    preprocessor  - Face alignment and augmentation
    database      - SQLite-backed face database
    recognizer    - End-to-end recognition pipeline
    camera        - Webcam capture handler
    utils         - Shared utility functions
"""

__version__ = "1.0.0"
__author__ = "Akhilesh"
