from tensorflow.keras.models import load_model
import numpy as np
import os
from transformers import pipeline

# Load deepfake model
# def load_deepfake_model():
#     model_path = os.path.join('static', 'models', 'deepfake_model.h5')
#     return load_model(model_path)
# In utils/prediction.py, replace the load_model function with:
def load_deepfake_model():
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
    
    # Create a simple placeholder model
    model = Sequential([
        Conv2D(32, (3,3), activation='relu', input_shape=(224,224,3)),
        MaxPooling2D(2,2),
        Flatten(),
        Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy')
    return model

def predict_deepfake(frame):
    model = load_deepfake_model()
    prediction = model.predict(frame)
    return prediction[0][0]

# Load fake news model (using a placeholder - in reality you'd use a trained model)
fake_news_classifier = None

def load_fake_news_model():
    global fake_news_classifier
    if fake_news_classifier is None:
        # Using a pre-trained transformer model as an example
        fake_news_classifier = pipeline(
            "text-classification", 
            model="distilbert-base-uncased-finetuned-sst-2-english"
        )
    return fake_news_classifier

def predict_fake_news(text):
    classifier = load_fake_news_model()
    result = classifier(text)[0]
    prediction = 1 if result['label'] == 'NEGATIVE' else 0  # Just an example mapping
    confidence = result['score']
    return prediction, confidence