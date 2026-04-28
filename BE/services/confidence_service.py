def get_confidence_info(confidence: float, top2_gap: float | None):
    """
    Trả về mức độ tin cậy và cảnh báo cho frontend.
    """

    if confidence < 0.4:
        return {
            "confidence_level": "low",
            "warning": "Độ tin cậy thấp, nên kiểm tra lại kết quả."
        }

    if top2_gap is not None and top2_gap < 0.1:
        return {
            "confidence_level": "uncertain",
            "warning": "Hai nhãn gần nhất có xác suất khá sát nhau, kết quả dễ nhầm."
        }

    if confidence < 0.65:
        return {
            "confidence_level": "medium",
            "warning": None
        }

    return {
        "confidence_level": "high",
        "warning": None
    }