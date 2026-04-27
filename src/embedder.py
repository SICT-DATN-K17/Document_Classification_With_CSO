import os
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModel

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def load_phobert(model_dir: str):
    if os.path.exists(model_dir):
        print("Load model từ local...")
        tokenizer = AutoTokenizer.from_pretrained(model_dir, use_fast=False)
        model = AutoModel.from_pretrained(model_dir).to(device)
    else:
        print("Download model từ HuggingFace...")
        tokenizer = AutoTokenizer.from_pretrained("vinai/phobert-base", use_fast=False)
        model = AutoModel.from_pretrained("vinai/phobert-base").to(device)

        os.makedirs(model_dir, exist_ok=True)
        tokenizer.save_pretrained(model_dir)
        model.save_pretrained(model_dir)

    model.eval()
    return tokenizer, model


def mean_pool(last_hidden_state, attention_mask):
    mask = attention_mask.unsqueeze(-1).float()
    return (last_hidden_state * mask).sum(1) / mask.sum(1)


def embed_texts(texts, tokenizer, model, batch_size=16, max_length=128):
    all_embs = []

    with torch.no_grad():
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]

            inputs = tokenizer(
                batch,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=max_length
            ).to(device)

            outputs = model(**inputs)
            pooled = mean_pool(outputs.last_hidden_state, inputs["attention_mask"])

            # Giữ normalize như pipeline cũ của bạn
            pooled = torch.nn.functional.normalize(pooled, p=2, dim=1)

            all_embs.append(pooled.cpu().numpy())

    return np.vstack(all_embs)


# import os
# import torch
# import numpy as np
# from transformers import AutoTokenizer, AutoModel

# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# # def load_phobert(model_dir):
# #     if os.path.exists(model_dir):
# #         tokenizer = AutoTokenizer.from_pretrained(model_dir, use_fast=False)
# #         model = AutoModel.from_pretrained(model_dir).to(device)
# #     else:
# #         tokenizer = AutoTokenizer.from_pretrained("vinai/phobert-base", use_fast=False)
# #         model = AutoModel.from_pretrained("vinai/phobert-base").to(device)

# #         tokenizer.save_pretrained(model_dir)
# #         model.save_pretrained(model_dir)

# #     model.eval()
# #     return tokenizer, model

# def load_phobert(model_dir):
#     if os.path.exists(model_dir):
#         print("Load model từ local...")
#         tokenizer = AutoTokenizer.from_pretrained(model_dir, use_fast=False)
#         model = AutoModel.from_pretrained(model_dir).to(device)
#     else:
#         print("Download model từ HuggingFace...")
#         tokenizer = AutoTokenizer.from_pretrained("vinai/phobert-base", use_fast=False)
#         model = AutoModel.from_pretrained("vinai/phobert-base").to(device)

#         os.makedirs(model_dir, exist_ok=True)

#         tokenizer.save_pretrained(model_dir)
#         model.save_pretrained(model_dir)

#     model.eval()
#     return tokenizer, model

# def mean_pool(last_hidden_state, attention_mask):
#     mask = attention_mask.unsqueeze(-1).float()
#     return (last_hidden_state * mask).sum(1) / mask.sum(1)

# def embed_texts(texts, tokenizer, model, batch_size=16, max_length=128):
#     all_embs = []

#     with torch.no_grad():
#         for i in range(0, len(texts), batch_size):
#             batch = texts[i:i+batch_size]

#             inputs = tokenizer(
#                 batch,
#                 return_tensors="pt",
#                 padding=True,
#                 truncation=True,
#                 max_length=max_length
#             ).to(device)

#             outputs = model(**inputs)
#             pooled = mean_pool(outputs.last_hidden_state, inputs["attention_mask"])

#             pooled = torch.nn.functional.normalize(pooled, p=2, dim=1)

#             all_embs.append(pooled.cpu().numpy())

#     return np.vstack(all_embs)