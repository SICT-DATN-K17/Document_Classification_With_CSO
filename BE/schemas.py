from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


# =========================
# Predict schemas
# =========================

class PredictRequest(BaseModel):
    title: str = Field(..., min_length=1, description="Tiêu đề cần phân loại")


class BatchPredictRequest(BaseModel):
    titles: List[str] = Field(..., min_length=1, description="Danh sách tiêu đề cần phân loại")


class TopKItem(BaseModel):
    label_id: int
    label_name: str
    confidence: float


class PredictResponse(BaseModel):
    title: str
    label_id: int
    label_name: str
    confidence: float
    top2_gap: Optional[float]
    confidence_level: str
    warning: Optional[str]
    top_k: List[TopKItem]
    processing_time_ms: Optional[float] = None
    model_version: Optional[str] = None


class BatchPredictResponse(BaseModel):
    results: List[PredictResponse]


# =========================
# System schemas
# =========================

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    phobert_loaded: bool
    num_labels: int
    device: str


class ModelInfoResponse(BaseModel):
    model_name: str
    model_file: str
    version: str
    num_labels: int
    top_k: int
    max_length: int
    device: str


class LabelItem(BaseModel):
    label_id: int
    label_name: str


class LabelsResponse(BaseModel):
    labels: List[LabelItem]


# =========================
# History schemas
# =========================

class HistoryItem(BaseModel):
    id: int
    title: str
    label_id: int
    label_name: str
    confidence: float
    top2_gap: Optional[float]
    confidence_level: str
    warning: Optional[str]
    created_at: datetime


class HistoryListResponse(BaseModel):
    items: List[HistoryItem]
    total: int


# =========================
# Feedback schemas
# =========================

class FeedbackRequest(BaseModel):
    history_id: Optional[int] = None
    title: str
    predicted_label_id: int
    correct_label_id: Optional[int] = None
    is_correct: bool
    note: Optional[str] = None


class FeedbackResponse(BaseModel):
    message: str
    feedback_id: int


class FeedbackItem(BaseModel):
    id: int
    history_id: Optional[int]
    title: str
    predicted_label_id: int
    correct_label_id: Optional[int]
    is_correct: bool
    note: Optional[str]
    created_at: datetime


class FeedbackListResponse(BaseModel):
    items: List[FeedbackItem]
    total: int


# =========================
# Stats schemas
# =========================

class StatsSummaryResponse(BaseModel):
    total_predictions: int
    total_feedback: int
    low_confidence_count: int
    medium_confidence_count: int
    high_confidence_count: int
    most_predicted_label: Optional[str]


class LabelStatsItem(BaseModel):
    label_id: int
    label_name: str
    count: int


class LabelStatsResponse(BaseModel):
    items: List[LabelStatsItem]


class ConfidenceStatsResponse(BaseModel):
    low: int
    medium: int
    high: int