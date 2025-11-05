# AI Service - Ticket Classification with BERT

Python Flask microservice for NLP-based ticket classification using BERT transformers.

## Features

- **BERT-based Classification**: Uses DistilBERT for efficient text classification
- **Zero-shot Learning**: Can classify tickets without fine-tuning
- **Input Validation**: Detects and handles invalid/gibberish input
- **Large Training Dataset**: Includes 50+ training examples
- **Confidence Scoring**: Provides accurate confidence scores

## Project structure

Current folder/file layout for this repository:

```text
app.py
README.md
requirements.txt
data/
  data.py
  training_dataset.json
models/
src/
```

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Ensure training data exists:

   - The service will automatically load `data/training_dataset.json`
   - Contains 50+ labeled examples for training

3. Run the service:

```bash
python app.py
```

The service will run on `http://localhost:8000`

## Model Architecture

- **Base Model**: DistilBERT (distilbert-base-uncased)
- **Zero-shot Model**: BART-large-MNLI (fallback)
- **Classification**: Multi-label classification for category and priority

## API Endpoints

- `POST /ai/predict` - Predict ticket category and priority

  ```json
  {
    "title": "I need to reset my password",
    "description": "I forgot my password"
  }
  ```

  Response:

  ```json
  {
    "category": "Password Reset",
    "priority": "Medium",
    "confidence": 0.85
  }
  ```

- `POST /ai/train` - Train the model with new data
- `PUT /ai/update` - Update model parameters
- `GET /health` - Health check

## Input Validation

The service validates input and handles:

- Too short text (< 3 characters)
- Gibberish/nonsensical input
- Invalid patterns (only numbers, only symbols)
- Low confidence scores (< 0.25 defaults to "Other")

## Training Dataset

The dataset includes examples for:

- Password Reset (10+ examples)
- Access Provisioning (10+ examples)
- Log Fetching (10+ examples)
- Hardware Issue (10+ examples)
- Software Issue (10+ examples)
- Network Issue (10+ examples)
- Other (5+ examples)

## Confidence Thresholds

- **High Confidence (> 0.7)**: Strong prediction
- **Medium Confidence (0.4-0.7)**: Acceptable prediction
- **Low Confidence (< 0.4)**: Defaults to "Other" category

## Performance

- **Accuracy**: Improved with BERT vs. TF-IDF
- **Response Time**: ~500ms-1s per prediction
- **Memory Usage**: ~500MB (with DistilBERT)
