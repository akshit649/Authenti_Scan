import cv2
import numpy as np
import ffmpeg
import os
from typing import List

def extract_frames(video_path: str, frame_count: int = 30) -> List[np.ndarray]:
    """Extract frames evenly from video"""
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frames = []
    
    # Calculate frame indices to extract
    indices = np.linspace(0, total_frames - 1, min(frame_count, total_frames), dtype=int)
    
    for i in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = cap.read()
        if ret:
            frames.append(frame)
    
    cap.release()
    return frames

def preprocess_frame(frame: np.ndarray, target_size: tuple = (224, 224)) -> np.ndarray:
    """Preprocess frame for model input"""
    # Resize
    frame = cv2.resize(frame, target_size)
    # Normalize
    frame = frame.astype('float32') / 255.0
    # Expand dimensions for model input
    frame = np.expand_dims(frame, axis=0)
    return frame