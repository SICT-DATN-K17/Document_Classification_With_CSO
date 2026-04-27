# import os
# import numpy as np

# def save_embeddings(X, y, save_dir):
#     os.makedirs(save_dir, exist_ok=True)

#     np.save(f"{save_dir}/X.npy", X)
#     np.save(f"{save_dir}/y.npy", y)

#     print("Saved embeddings:")
#     print(f"   X: {X.shape}")
#     print(f"   y: {y.shape}")


# def load_embeddings(save_dir):
#     X_path = f"{save_dir}/X.npy"
#     y_path = f"{save_dir}/y.npy"

#     if not os.path.exists(X_path) or not os.path.exists(y_path):
#         return None, None

#     X = np.load(X_path)
#     y = np.load(y_path)

#     print("Loaded cached embeddings:")
#     print(f"   X: {X.shape}")
#     print(f"   y: {y.shape}")

#     return X, y


# def get_or_create_embeddings(
#     texts,
#     labels,
#     embed_fn,
#     tokenizer,
#     model,
#     save_dir
# ):
#     X, y = load_embeddings(save_dir)

#     if X is not None:
#         return X, y

#     print("Creating embeddings... (first time only)")
#     X = embed_fn(texts, tokenizer, model)
#     y = np.array(labels)

#     save_embeddings(X, y, save_dir)

#     return X, y

import os
import numpy as np


def save_embeddings(X, y, save_dir, split_name):
    os.makedirs(save_dir, exist_ok=True)

    np.save(f"{save_dir}/{split_name}_X.npy", X)
    np.save(f"{save_dir}/{split_name}_y.npy", y)

    print(f"Saved {split_name} embeddings:")
    print(f"   X: {X.shape}")
    print(f"   y: {y.shape}")


def load_embeddings(save_dir, split_name):
    X_path = f"{save_dir}/{split_name}_X.npy"
    y_path = f"{save_dir}/{split_name}_y.npy"

    if not os.path.exists(X_path) or not os.path.exists(y_path):
        return None, None

    X = np.load(X_path)
    y = np.load(y_path)

    print(f"Loaded cached {split_name} embeddings:")
    print(f"   X: {X.shape}")
    print(f"   y: {y.shape}")

    return X, y


def get_or_create_embeddings(
    texts,
    labels,
    embed_fn,
    tokenizer,
    model,
    save_dir,
    split_name
):
    X, y = load_embeddings(save_dir, split_name)

    if X is not None:
        return X, y

    print(f"Creating {split_name} embeddings... (first time only)")
    X = embed_fn(texts, tokenizer, model)
    y = np.array(labels)

    save_embeddings(X, y, save_dir, split_name)
    return X, y