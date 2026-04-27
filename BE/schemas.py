from typing import List, Optional
from pydantic import BaseModel, Field


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
    top_k: List[TopKItem]


class BatchPredictResponse(BaseModel):
    results: List[PredictResponse]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    phobert_loaded: bool
    num_labels: int
    device: str