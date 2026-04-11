import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# ===== DATA =====
DATA_PATH = os.path.join(BASE_DIR, r"/kaggle/input/datasets/thunguyen203/train-data-ver2/data_test.csv")

# ===== MODEL DIR =====
MODEL_DIR = os.path.join(BASE_DIR, "models")

PHOBERT_DIR = os.path.join(MODEL_DIR, "phobert")
EMBED_DIR = os.path.join(MODEL_DIR, "embeddings")
SVM_DIR = os.path.join(MODEL_DIR, "svm")
CACHE_DIR = os.path.join(MODEL_DIR, "cache")
USE_NORMALIZER = True

# ===== PARAM =====
TEST_SIZE = 0.2
RANDOM_STATE = 42

BATCH_SIZE = 32
MAX_LENGTH = 128

# ===== CSO =====
# CSO_P = 6
# CSO_TMAX = 3

CSO_P = 8
CSO_TMAX = 5