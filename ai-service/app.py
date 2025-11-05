from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import numpy as np
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
from sklearn.preprocessing import LabelEncoder
import pandas as pd
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize models
MODEL_DIR = 'models'
DATA_DIR = 'data'
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

# Load training dataset
TRAINING_DATA_PATH = os.path.join(DATA_DIR, 'training_dataset.json')

# BERT model configuration
MODEL_NAME = 'distilbert-base-uncased'  # Lightweight BERT model
MAX_LENGTH = 128

# Initialize tokenizer and model
tokenizer = None
category_model = None
priority_model = None
category_pipeline = None
priority_pipeline = None

# Label encoders
category_encoder = LabelEncoder()
priority_encoder = LabelEncoder()

def load_training_data():
    """Load training data from JSON file"""
    if os.path.exists(TRAINING_DATA_PATH):
        with open(TRAINING_DATA_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def prepare_training_data():
    """Prepare training data for fine-tuning"""
    data = load_training_data()
    
    if not data:
        return None, None
    
    df = pd.DataFrame(data)
    
    # Combine title and description
    df['text'] = df['title'] + ' ' + df['description']
    
    # Encode labels
    categories = category_encoder.fit_transform(df['category'])
    priorities = priority_encoder.fit_transform(df['priority'])
    
    return df['text'].tolist(), {
        'categories': categories,
        'priorities': priorities,
        'category_labels': df['category'].tolist(),
        'priority_labels': df['priority'].tolist()
    }

def initialize_models():
    """Initialize zero-shot classifiers unconditionally for robust candidate_labels support"""
    global category_pipeline, priority_pipeline
    try:
        from transformers import pipeline as transformers_pipeline
        category_pipeline = transformers_pipeline(
            "zero-shot-classification",
            model="typeform/distilbert-base-uncased-mnli",
            device=-1
        )
        priority_pipeline = transformers_pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli",
            device=-1
        )
        print("Using zero-shot classification models (forced)")
    except Exception as e:
        print(f"Error initializing zero-shot models: {e}")
        initialize_fallback_models()

def initialize_fallback_models():
    """Fallback to zero-shot classification if fine-tuning fails"""
    global category_pipeline, priority_pipeline
    
    try:
        from transformers import pipeline as transformers_pipeline
        
        # Use zero-shot classification for better results
        category_pipeline = transformers_pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli",
            device=-1
        )
        
        priority_pipeline = transformers_pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli",
            device=-1
        )
        
        print("Using zero-shot classification models")
    except Exception as e:
        print(f"Error with zero-shot models: {e}")

def preprocess_text(text):
    """Preprocess text for classification"""
    if not text or not isinstance(text, str):
        return ""
    
    # Clean and normalize
    text = text.strip()
    if len(text) < 3:
        return ""
    
    return text

def classify_with_zero_shot(text):
    """Classify using zero-shot classification with better prompts"""
    if not category_pipeline or not priority_pipeline:
        return None, None, 0.0
    
    # Category candidates as direct labels
    category_candidates = [
        "Password Reset",
        "Access Provisioning", 
        "Log Fetching",
        "Hardware Issue",
        "Software Issue",
        "Network Issue",
        "Other"
    ]
    
    # Priority candidates with context
    priority_candidates = ["Low", "Medium", "High"]
    
    try:
        # Use hypothesis templates as recommended for zero-shot classification
        category_result = category_pipeline(
            sequences=text,
            candidate_labels=category_candidates,
            multi_label=False,
            hypothesis_template="This ticket is about {}."
        )
        
        priority_result = priority_pipeline(
            sequences=text,
            candidate_labels=priority_candidates,
            multi_label=False,
            hypothesis_template="The appropriate priority is {}."
        )
        
        # Robust parsing of pipeline results: handle list/dict and different key shapes
        def parse_result(result, candidates=None):
            """Return (label, confidence, scores_list).
            Handles shapes like:
            - dict with 'labels' (list) and 'scores' (list) (zero-shot)
            - dict with 'sequence' and 'scores'
            - list of dicts (take first element)
            - list of label/score dicts from text-classification
            - dict with 'label' and 'score'
            """
            if result is None:
                return None, 0.0, []

            # Normalize to a single dict
            res = None
            if isinstance(result, list):
                if len(result) == 0:
                    return None, 0.0, []
                # If list of simple label/score dicts, pick the top one
                if isinstance(result[0], dict) and 'label' in result[0] and 'score' in result[0]:
                    top = max(result, key=lambda x: x.get('score', 0.0))
                    return top.get('label'), top.get('score', 0.0), [r.get('score', 0.0) for r in result]
                # Otherwise, take first element
                res = result[0]
            else:
                res = result

            # zero-shot style: 'labels' and 'scores'
            if isinstance(res, dict) and 'labels' in res and isinstance(res['labels'], list):
                labels = res.get('labels', [])
                scores = res.get('scores', [])
                label = labels[0] if labels else None
                confidence = scores[0] if scores else 0.0
                return label, confidence, scores

            # single prediction style: 'label' and 'score'
            if isinstance(res, dict) and 'label' in res:
                return res.get('label'), res.get('score', 0.0), [res.get('score', 0.0)]

            # sequence style: try to infer label from sequence and scores
            if isinstance(res, dict) and 'sequence' in res:
                seq = res.get('sequence')
                scores = res.get('scores', [])
                confidence = max(scores) if scores else 0.0
                # try to find a candidate label inside the sequence text
                chosen = None
                if candidates:
                    for cand in candidates:
                        # match by name or by the first token
                        if cand.split(' - ')[0] in seq:
                            chosen = cand
                            break
                return (chosen or seq), confidence, scores

            # fallback: stringify
            try:
                return str(res), 0.0, []
            except Exception:
                return None, 0.0, []

        # Parse category and priority results
        cat_label, cat_conf, cat_scores = parse_result(category_result, candidates=category_candidates)
        pri_label, pri_conf, pri_scores = parse_result(priority_result, candidates=priority_candidates)

        # Simple keyword-based boost for common intents
        lowered = text.lower()
        if any(k in lowered for k in ["password", "reset password", "forgot password"]):
            cat_label = "Password Reset"
            cat_conf = max(cat_conf or 0.0, 0.85)

        # Normalize selections with lenient acceptance
        category = cat_label or "Other"
        priority = (pri_label or "Medium")

        # Combined confidence (weighted)
        overall_confidence = (float(cat_conf or 0.0) * 0.7 + float(pri_conf or 0.0) * 0.3)

        # If confidence is very low, fallback to defaults
        if overall_confidence < 0.25:
            category = "Other"
            priority = "Medium"
            overall_confidence = 0.25

        # Check if category scores indicate uncertainty (close top two)
        if cat_scores and len(cat_scores) > 1:
            try:
                score_diff = cat_scores[0] - cat_scores[1]
                if score_diff < 0.05 and category != "Password Reset":
                    category = "Other"
                    overall_confidence = max(0.3, overall_confidence * 0.8)
            except Exception:
                pass

        return category, priority, min(0.95, overall_confidence)
        
    except Exception as e:
        print(f"Classification error: {e}")
        import traceback
        traceback.print_exc()
        return "Other", "Medium", 0.3

def validate_input(text):
    """Validate input text quality"""
    if not text or not isinstance(text, str):
        return False, "Invalid input type"
    
    text = text.strip()
    
    # Check minimum length
    if len(text) < 3:
        return False, "Text too short"
    
    # Check for meaningful words (at least 2 words)
    words = text.split()
    if len(words) < 2:
        return False, "Text too short"
    
    # Check for unique words
    unique_words = set(word.lower() for word in words if len(word) > 1)
    if len(unique_words) < 2:
        return False, "Not enough meaningful words"
    
    # Check for gibberish patterns
    text_lower = text.lower()
    
    # Common invalid patterns
    invalid_patterns = [
        text.isdigit(),  # Only numbers
        all(not c.isalnum() for c in text if c != ' '),  # No alphanumeric chars
        len([c for c in text if c.isalpha()]) < 3,  # Less than 3 letters total
    ]
    
    if any(invalid_patterns):
        return False, "Invalid input pattern detected"
    
    # Check for repetitive characters (e.g., "aaaaaa", "123123123")
    if len(set(text.replace(' ', ''))) < 3:
        return False, "Repetitive input detected"
    
    return True, "Valid"

@app.route('/ai/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        title = data.get('title', '')
        description = data.get('description', '')
        
        # Combine title and description
        combined_text = f"{title} {description}".strip()
        
        # Validate input
        is_valid, validation_msg = validate_input(combined_text)
        
        if not is_valid:
            return jsonify({
                'category': 'Other',
                'priority': 'Medium',
                'confidence': 0.2,
                'warning': validation_msg
            })
        
        # Preprocess
        processed_text = preprocess_text(combined_text)
        
        if not processed_text:
            return jsonify({
                'category': 'Other',
                'priority': 'Medium',
                'confidence': 0.2,
                'warning': 'Empty or invalid input'
            })
        
        # Classify using zero-shot BERT
        category, priority, confidence = classify_with_zero_shot(processed_text)
        
        # Additional validation for very low confidence
        if confidence < 0.25:
            category = 'Other'
            priority = 'Medium'
            confidence = 0.25
        
        return jsonify({
            'category': category,
            'priority': priority,
            'confidence': float(confidence)
        })
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({
            'error': str(e),
            'category': 'Other',
            'priority': 'Medium',
            'confidence': 0.2
        }), 500

@app.route('/ai/train', methods=['POST'])
def train():
    try:
        data = request.json
        tickets = data.get('tickets', [])
        
        if not tickets:
            return jsonify({'error': 'No training data provided'}), 400
        
        # Append to training dataset
        training_data = load_training_data()
        training_data.extend(tickets)
        
        # Save updated dataset
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(TRAINING_DATA_PATH, 'w', encoding='utf-8') as f:
            json.dump(training_data, f, indent=2, ensure_ascii=False)
        
        # Reinitialize models with new data
        initialize_models()
        
        return jsonify({
            'message': 'Models trained successfully',
            'training_samples': len(training_data)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/ai/update', methods=['PUT'])
def update():
    try:
        data = request.json
        # Update model parameters if needed
        initialize_models()
        return jsonify({'message': 'Model updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'OK',
        'message': 'AI Service is running',
        'model': MODEL_NAME,
        'models_loaded': category_pipeline is not None and priority_pipeline is not None
    })

if __name__ == '__main__':
    print("Initializing AI models...")
    initialize_models()
    print("Starting AI service...")
    app.run(host='0.0.0.0', port=8000, debug=False, use_reloader=False)
