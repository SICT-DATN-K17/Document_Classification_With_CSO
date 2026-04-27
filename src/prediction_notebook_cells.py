# =========================
# CELL 1: Import phần dự đoán
# =========================
import joblib
import pandas as pd

from embedder import load_phobert, embed_texts
from predictor import load_predictor_assets, predict_titles


# =========================
# CELL 2: Load model + PhoBERT + label map
# Chạy cell này sau khi đã train và lưu svm_cso.joblib
# =========================
BASE_DIR = "/kaggle/working/models"
PHOBERT_DIR = f"{BASE_DIR}/phobert"
CSO_MODEL_PATH = f"{BASE_DIR}/svm_cso.joblib"
LABEL_MAP_PATH = "/kaggle/input/your-data/label_map.json"

model, label_map, tokenizer, phobert_model = load_predictor_assets(
    model_path=CSO_MODEL_PATH,
    label_map_path=LABEL_MAP_PATH,
    phobert_dir=PHOBERT_DIR,
    load_phobert_fn=load_phobert,
)

print("Loaded model:", CSO_MODEL_PATH)
print("Số nhãn:", len(label_map))
print(label_map)


# =========================
# CELL 3: Dự đoán 1 tiêu đề
# =========================
one_title = "Apple ra mắt mẫu iPhone mới với nhiều nâng cấp về camera"

result_one = predict_titles(
    titles=one_title,
    model=model,
    tokenizer=tokenizer,
    phobert_model=phobert_model,
    embed_texts_fn=embed_texts,
    label_map=label_map,
    top_k=3,
    batch_size=32,
    temperature=1.0,
)

display(result_one)


# =========================
# CELL 4: Dự đoán nhiều tiêu đề
# =========================
titles = [
    "Đội tuyển Việt Nam giành chiến thắng trong trận đấu kịch tính",
    "Giá vàng trong nước tiếp tục tăng mạnh",
    "Các nhà khoa học phát hiện hành tinh có khả năng tồn tại sự sống",
    "Bộ Giáo dục công bố lịch thi tốt nghiệp mới",
]

result_many = predict_titles(
    titles=titles,
    model=model,
    tokenizer=tokenizer,
    phobert_model=phobert_model,
    embed_texts_fn=embed_texts,
    label_map=label_map,
    top_k=3,
    batch_size=32,
    temperature=1.0,
)

display(result_many)


# =========================
# CELL 5: Nhập thủ công nhiều tiêu đề trong notebook
# Mỗi dòng là 1 tiêu đề, nhập dòng rỗng để kết thúc
# =========================
input_titles = []
print("Nhập từng tiêu đề, Enter dòng trống để dừng:")
while True:
    s = input("Tiêu đề: ").strip()
    if s == "":
        break
    input_titles.append(s)

if len(input_titles) > 0:
    result_input = predict_titles(
        titles=input_titles,
        model=model,
        tokenizer=tokenizer,
        phobert_model=phobert_model,
        embed_texts_fn=embed_texts,
        label_map=label_map,
        top_k=3,
        batch_size=32,
        temperature=1.0,
    )
    display(result_input)
else:
    print("Chưa nhập tiêu đề nào.")
