import json
import os
import numpy as np
from sklearn.svm import LinearSVC
from sklearn.metrics import f1_score
from cso import CSO


def save_fitness_cache(cache, save_path):
    if save_path is None:
        return
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    serializable_cache = {str(k): v for k, v in cache.items()}
    with open(save_path, "w", encoding="utf-8") as f:
        json.dump(serializable_cache, f, ensure_ascii=False, indent=2)


def load_fitness_cache(save_path):
    if save_path is None or not os.path.exists(save_path):
        return {}
    with open(save_path, "r", encoding="utf-8") as f:
        raw_cache = json.load(f)
    return {float(k): v for k, v in raw_cache.items()}


def optimize_cso(
    X_train,
    y_train,
    X_dev,
    y_dev,
    cache_path=None,
    P=8,
    Tmax=5,
    sample_size=100000,
    random_state=42
):
    # lấy subset train để tối ưu nhanh hơn
    if len(X_train) > sample_size:
        rng = np.random.default_rng(random_state)
        idx = rng.choice(len(X_train), sample_size, replace=False)
        X_opt = X_train[idx]
        y_opt = y_train[idx]
    else:
        X_opt, y_opt = X_train, y_train

    print(f"[CSO] Using {len(X_opt)} train samples for optimization")
    print(f"[CSO] Using {len(X_dev)} dev samples for evaluation")

    cache = load_fitness_cache(cache_path)

    def fitness(x):
        logC = float(x[0])
        C = 10 ** logC

        key = round(logC, 4)
        if key in cache:
            return -cache[key]

        clf = LinearSVC(
            C=C,
            max_iter=20000,
            random_state=random_state
        )

        clf.fit(X_opt, y_opt)
        y_pred_dev = clf.predict(X_dev)

        f1m = f1_score(y_dev, y_pred_dev, average="macro")
        cache[key] = f1m

        print(f"logC={logC:.4f} | C={C:.6f} -> dev_f1_macro={f1m:.4f}")

        save_fitness_cache(cache, cache_path)
        return -f1m

    cso = CSO(
        fitness=fitness,
        P=P,
        n=1,
        pa=0.25,
        beta=1.5,
        bound=[(-3, 4)],
        Tmax=Tmax,
        verbose=True,
        random_state=random_state
    )

    cso.execute()

    best_logC = float(cso.best[0])
    best_C = 10 ** best_logC

    print(f"[CSO] Best logC = {best_logC:.4f}")
    print(f"[CSO] Best C = {best_C:.6f}")

    return best_C