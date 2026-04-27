import pandas as pd
import json
import sys
sys.path.append('src')
from preprocess import preprocess_list
from embedder import load_phobert, embed_texts
import joblib
import numpy as np
from sklearn.metrics import classification_report

# Load test data
test_df = pd.read_csv('my_data/test_remap.csv')
titles = test_df['title'].tolist()
true_labels = test_df['label'].tolist()

# Preprocess
titles_proc = preprocess_list(titles)

# Load model and embedder
model = joblib.load('models/svm_cso.joblib')
tokenizer, phobert_model = load_phobert('models/phobert')

# Embed
X = embed_texts(titles_proc, tokenizer, phobert_model, batch_size=16, max_length=128)

# Predict
pred_labels = model.predict(X)

# Load label map
with open('src/label_map.json', 'r', encoding='utf-8') as f:
    label_map = json.load(f)
label_names = [label_map[str(i)] for i in sorted(label_map.keys())]

print('Classification Report:')
print(classification_report(true_labels, pred_labels, target_names=label_names))