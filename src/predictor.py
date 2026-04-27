import json
import os
import joblib
import numpy as np
import pandas as pd


def load_label_map(label_map_path):
    with open(label_map_path, "r", encoding="utf-8") as f:
        label_map = json.load(f)
    # label_map thường có dạng {"0": "công nghệ", ...}
    return {int(k): v for k, v in label_map.items()}


def _ensure_list(texts):
    if isinstance(texts, str):
        return [texts]
    if isinstance(texts, (list, tuple, np.ndarray, pd.Series)):
        return [str(x) for x in texts]
    raise TypeError("texts phải là str hoặc list/tuple các tiêu đề")


def _embed_for_predict(texts, tokenizer, phobert_model, embed_texts_fn, batch_size=32):
    """
    Gọi hàm embed_texts của project theo cách linh hoạt để tránh lệch signature.
    Project của bạn đang dùng: embed_texts + load_phobert trong embed_data.ipynb.
    """
    try:
        return embed_texts_fn(
            texts=texts,
            tokenizer=tokenizer,
            model=phobert_model,
            batch_size=batch_size,
        )
    except TypeError:
        try:
            return embed_texts_fn(texts, tokenizer, phobert_model, batch_size=batch_size)
        except TypeError:
            return embed_texts_fn(texts, tokenizer, phobert_model)


def _softmax(scores, temperature=1.0):
    scores = np.asarray(scores, dtype=float)
    temperature = max(float(temperature), 1e-8)
    scores = scores / temperature
    scores = scores - np.max(scores, axis=1, keepdims=True)
    exp_scores = np.exp(scores)
    return exp_scores / np.sum(exp_scores, axis=1, keepdims=True)


def _decision_scores(model, X):
    """
    LinearSVC không có predict_proba. Ta lấy decision_function để tạo confidence xấp xỉ.
    Với bài toán binary, sklearn trả vector 1 chiều nên cần chuyển thành 2 cột.
    """
    scores = model.decision_function(X)
    scores = np.asarray(scores)

    if scores.ndim == 1:
        scores = np.vstack([-scores, scores]).T

    return scores


def predict_titles(
    titles,
    model,
    tokenizer,
    phobert_model,
    embed_texts_fn,
    label_map,
    top_k=3,
    batch_size=32,
    temperature=1.0,
):
    """
    Dự đoán 1 hoặc nhiều tiêu đề.

    Parameters
    ----------
    titles : str | list[str]
        Một tiêu đề hoặc nhiều tiêu đề.
    model : sklearn model
        Model đã train, ví dụ svm_cso.joblib.
    tokenizer, phobert_model : object
        PhoBERT tokenizer và model từ load_phobert(...).
    embed_texts_fn : callable
        Hàm embed_texts của project.
    label_map : dict[int, str]
        Map id nhãn -> tên nhãn.
    top_k : int
        Số nhãn top-k muốn hiển thị.
    temperature : float
        Nhiệt độ softmax. Chỉ ảnh hưởng confidence xấp xỉ, không đổi nhãn dự đoán.

    Returns
    -------
    pd.DataFrame
        Gồm tiêu đề, label_id, label_name, confidence, top_k, top2_gap.
    """
    texts = _ensure_list(titles)
    X = _embed_for_predict(texts, tokenizer, phobert_model, embed_texts_fn, batch_size=batch_size)

    pred_ids = model.predict(X)
    scores = _decision_scores(model, X)

    # Thứ tự cột score ứng với model.classes_
    classes = np.asarray(getattr(model, "classes_", sorted(label_map.keys())))
    probs = _softmax(scores, temperature=temperature)

    rows = []
    top_k = max(1, min(int(top_k), len(classes)))

    for i, text in enumerate(texts):
        order = np.argsort(probs[i])[::-1]
        pred_id = int(pred_ids[i])

        # confidence của đúng nhãn mà model predict, không nhất thiết là order[0] nếu class order lạ
        pred_pos = int(np.where(classes == pred_id)[0][0])
        confidence = float(probs[i, pred_pos])

        top_items = []
        for idx in order[:top_k]:
            label_id = int(classes[idx])
            top_items.append({
                "label_id": label_id,
                "label_name": label_map.get(label_id, str(label_id)),
                "confidence": round(float(probs[i, idx]), 4),
            })

        top2_gap = None
        if len(order) >= 2:
            top2_gap = float(probs[i, order[0]] - probs[i, order[1]])

        rows.append({
            "title": text,
            "pred_label_id": pred_id,
            "pred_label_name": label_map.get(pred_id, str(pred_id)),
            "confidence": round(confidence, 4),
            "top2_gap": None if top2_gap is None else round(top2_gap, 4),
            "top_k": top_items,
        })

    return pd.DataFrame(rows)


def load_predictor_assets(
    model_path,
    label_map_path,
    phobert_dir,
    load_phobert_fn,
):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Không tìm thấy model: {model_path}")
    if not os.path.exists(label_map_path):
        raise FileNotFoundError(f"Không tìm thấy label_map: {label_map_path}")

    model = joblib.load(model_path)
    label_map = load_label_map(label_map_path)
    tokenizer, phobert_model = load_phobert_fn(phobert_dir)
    return model, label_map, tokenizer, phobert_model
