import pandas as pd

def load_data(path):
    df = pd.read_csv(path)

    print("Columns:", df.columns.tolist())

    # ===== CHECK =====
    if "title" not in df.columns:
        raise ValueError("Missing column: title")
    if "label" not in df.columns:
        raise ValueError("Missing column: label")

    # ===== TEXT =====
    texts = df["title"].fillna("").astype(str).tolist()

    # ===== LABEL =====
    labels = df["label"].astype(int).values

    print("Loaded samples:", len(texts))

    return texts, labels