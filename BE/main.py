# http://127.0.0.1:8000/docs
# uvicorn BE.main:app --reload --host 0.0.0.0 --port 8000

import os
import sys
import json
from contextlib import asynccontextmanager

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.preprocess import preprocess_list

from BE.schemas import (
    PredictRequest,
    BatchPredictRequest,
    PredictResponse,
    BatchPredictResponse,
    HealthResponse,
)

# =========================
# Cho phép import từ src/
# =========================
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT_DIR, "src")

if SRC_DIR not in sys.path:
    sys.path.append(SRC_DIR)

from embedder import load_phobert, embed_texts, device


# =========================
# Config path
# =========================
MODEL_PATH = os.path.join(ROOT_DIR, "models", "svm_cso.joblib")
PHOBERT_DIR = os.path.join(ROOT_DIR, "models", "phobert")
LABEL_MAP_PATH = os.path.join(ROOT_DIR, "src", "label_map.json")

BATCH_SIZE = 16
MAX_LENGTH = 128
TOP_K = 3
TEMPERATURE = 1.0


# =========================
# App state
# =========================
class AppState:
    model = None
    tokenizer = None
    phobert_model = None
    label_map = None


state = AppState()


# =========================
# Utility functions
# =========================
def load_label_map(path: str) -> dict[int, str]:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Không tìm thấy label_map.json tại: {path}")

    with open(path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    return {int(k): str(v) for k, v in raw.items()}


def softmax(scores, temperature: float = 1.0):
    scores = np.asarray(scores, dtype=float)

    temperature = max(float(temperature), 1e-8)
    scores = scores / temperature

    scores = scores - np.max(scores, axis=1, keepdims=True)
    exp_scores = np.exp(scores)

    return exp_scores / np.sum(exp_scores, axis=1, keepdims=True)


def get_confidence_scores(model, X):
    """
    Nếu model có predict_proba thì dùng xác suất thật.
    Nếu là LinearSVC thì dùng decision_function + softmax để lấy confidence xấp xỉ.
    """
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X)
        return np.asarray(probs)

    if not hasattr(model, "decision_function"):
        raise AttributeError("Model không có predict_proba hoặc decision_function.")

    scores = np.asarray(model.decision_function(X))

    if scores.ndim == 1:
        scores = np.vstack([-scores, scores]).T

    return softmax(scores, temperature=TEMPERATURE)


def predict_core(titles: list[str]):
    if isinstance(titles, str):
        titles = [titles]

    titles = [str(t).strip() for t in titles if str(t).strip()]
    titles_for_model = preprocess_list(titles)

    if len(titles) == 0:
        raise ValueError("Danh sách title rỗng.")

    # Dùng đúng embed_texts trong src/embedder.py của bạn:
    # mean pooling + normalize L2
    X = embed_texts(
        texts=titles_for_model,
        tokenizer=state.tokenizer,
        model=state.phobert_model,
        batch_size=BATCH_SIZE,
        max_length=MAX_LENGTH,
    )

    pred_ids = state.model.predict(X)
    probs = get_confidence_scores(state.model, X)

    classes = np.asarray(getattr(state.model, "classes_", sorted(state.label_map.keys())))
    top_k = min(TOP_K, len(classes))

    results = []

    for i, title in enumerate(titles):
        pred_id = int(pred_ids[i])

        pred_pos_arr = np.where(classes == pred_id)[0]
        if len(pred_pos_arr) == 0:
            pred_pos = int(np.argmax(probs[i]))
            pred_id = int(classes[pred_pos])
        else:
            pred_pos = int(pred_pos_arr[0])

        confidence = float(probs[i, pred_pos])

        order = np.argsort(probs[i])[::-1]

        top_items = []
        for idx in order[:top_k]:
            label_id = int(classes[idx])
            top_items.append({
                "label_id": label_id,
                "label_name": state.label_map.get(label_id, str(label_id)),
                "confidence": round(float(probs[i, idx]), 4),
            })

        top2_gap = None
        if len(order) >= 2:
            top2_gap = float(probs[i, order[0]] - probs[i, order[1]])

        results.append({
            "title": title,
            "label_id": pred_id,
            "label_name": state.label_map.get(pred_id, str(pred_id)),
            "confidence": round(confidence, 4),
            "top2_gap": None if top2_gap is None else round(top2_gap, 4),
            "top_k": top_items,
        })

    return results


# =========================
# Lifespan: load model 1 lần
# =========================
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Đang khởi động backend...")

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Không tìm thấy model tại: {MODEL_PATH}")

    state.model = joblib.load(MODEL_PATH)
    state.label_map = load_label_map(LABEL_MAP_PATH)

    state.tokenizer, state.phobert_model = load_phobert(PHOBERT_DIR)

    print("========== Backend ready ==========")
    print("MODEL_PATH:", MODEL_PATH)
    print("PHOBERT_DIR:", PHOBERT_DIR)
    print("LABEL_MAP_PATH:", LABEL_MAP_PATH)
    print("Device:", device)
    print("Num labels:", len(state.label_map))

    if hasattr(state.model, "C"):
        print("SVM C:", state.model.C)

    print("===================================")

    yield

    state.model = None
    state.tokenizer = None
    state.phobert_model = None
    state.label_map = None


app = FastAPI(
    title="Vietnamese News Classifier API",
    description="API phân loại tiêu đề tin tức tiếng Việt bằng PhoBERT + SVM CSO.",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# Routes
# =========================
@app.get("/")
def root():
    return {
        "message": "Vietnamese News Classifier API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", response_model=HealthResponse)
def health():
    return {
        "status": "ok",
        "model_loaded": state.model is not None,
        "phobert_loaded": state.phobert_model is not None,
        "num_labels": 0 if state.label_map is None else len(state.label_map),
        "device": str(device),
    }


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    try:
        results = predict_core([request.title])
        return results[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict-batch", response_model=BatchPredictResponse)
def predict_batch(request: BatchPredictRequest):
    try:
        results = predict_core(request.titles)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))