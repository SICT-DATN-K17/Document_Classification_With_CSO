import os
import numpy as np
from sklearn.model_selection import train_test_split


def get_or_create_split(
    X,
    y,
    save_dir,
    test_size=0.2,
    random_state=42
):
    os.makedirs(save_dir, exist_ok=True)

    paths = {
        "X_train": f"{save_dir}/X_train.npy",
        "X_test": f"{save_dir}/X_test.npy",
        "y_train": f"{save_dir}/y_train.npy",
        "y_test": f"{save_dir}/y_test.npy",
    }

    # Nếu đã có → load
    if all(os.path.exists(p) for p in paths.values()):
        print("✅ Loaded cached split")

        return (
            np.load(paths["X_train"]),
            np.load(paths["X_test"]),
            np.load(paths["y_train"]),
            np.load(paths["y_test"]),
        )

    # Nếu chưa có → tạo mới
    print("⚡ Creating train/test split...")

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        stratify=y,
        random_state=random_state
    )

    np.save(paths["X_train"], X_train)
    np.save(paths["X_test"], X_test)
    np.save(paths["y_train"], y_train)
    np.save(paths["y_test"], y_test)

    print("✅ Saved split:")
    print(f"Train: {X_train.shape}")
    print(f"Test : {X_test.shape}")

    return X_train, X_test, y_train, y_test