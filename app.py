from flask import Flask, render_template, request, jsonify
import os
from werkzeug.utils import secure_filename
from utils.preprocessing import extract_frames, preprocess_frame
from utils.prediction import predict_deepfake, predict_fake_news
from utils.nlp_processing import preprocess_text
import uuid

app = Flask(__name__)

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB limit
app.config['ALLOWED_EXTENSIONS'] = {'mp4', 'avi', 'mov', 'mkv', 'txt'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_content():
    if 'file' not in request.files and 'text' not in request.form:
        return jsonify({'error': 'No content provided'}), 400
    
    # Handle video upload (deepfake detection)
    if 'file' in request.files:
        file = request.files['file']
        if file.filename != '' and allowed_file(file.filename):
            return analyze_video(file)
    
    # Handle text input (fake news detection)
    if 'text' in request.form:
        text = request.form['text']
        if text.strip():
            return analyze_text(text)
    
    return jsonify({'error': 'Invalid input'}), 400

def analyze_video(file):
    # Create unique filename
    unique_id = str(uuid.uuid4())
    filename = secure_filename(f"{unique_id}_{file.filename}")
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    try:
        frames = extract_frames(filepath)
        predictions = []
        for frame in frames:
            processed_frame = preprocess_frame(frame)
            prediction = predict_deepfake(processed_frame)
            predictions.append(prediction)
        
        avg_prediction = sum(predictions) / len(predictions)
        is_deepfake = avg_prediction > 0.5
        
        return jsonify({
            'type': 'video',
            'result': 'deepfake' if is_deepfake else 'real',
            'confidence': float(avg_prediction),
            'frame_count': len(predictions)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

def analyze_text(text):
    try:
        processed_text = preprocess_text(text)
        prediction, confidence = predict_fake_news(processed_text)
        
        return jsonify({
            'type': 'text',
            'result': 'fake' if prediction == 1 else 'real',
            'confidence': float(confidence),
            'text_snippet': text[:100] + '...' if len(text) > 100 else text
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True)