import numpy as np
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import Normalizer
from sklearn.svm import LinearSVC
from cso import CSO

def optimize_cso(
    X_train,
    y_train,
    P=8,
    Tmax=5,
    sample_size=100000,
    random_state=42
):
   
    # lấy subset để tối ưu nhanh hơn
    if len(X_train) > sample_size:
        rng = np.random.default_rng(random_state)
        idx = rng.choice(len(X_train), sample_size, replace=False)
        X_opt = X_train[idx]
        y_opt = y_train[idx]
    else:
        X_opt, y_opt = X_train, y_train

    print(f"[CSO] Using {len(X_opt)} samples for optimization")

    skf = StratifiedKFold(n_splits=3, shuffle=True, random_state=random_state)
    cache = {}

    def fitness(x):
        logC = float(x[0])
        C = 10 ** logC

        key = round(logC, 4)
        if key in cache:
            return -cache[key]

        clf = Pipeline([
            ("norm", Normalizer()),
            ("svm", LinearSVC(
                C=C,
                class_weight=None,
                max_iter=20000,
                random_state=random_state
            ))
        ])

        scores = cross_val_score(
            clf,
            X_opt,
            y_opt,
            cv=skf,
            scoring="f1_macro",
            n_jobs=-1 # chạy đa luồng
        )

        f1m = scores.mean()
        cache[key] = f1m

        print(f"logC={logC:.4f} | C={C:.6f} -> f1_macro={f1m:.4f}")
        return -f1m

    cso = CSO(
        fitness=fitness,
        P=P,
        n=1,
        bound=[(-3, 4)], # mở rộng search space
        Tmax=Tmax,
        verbose=True
    )

    cso.execute()

    best_logC = float(cso.best[0])
    best_C = 10 ** best_logC

    print(f"[CSO] Best logC = {best_logC:.4f}")
    print(f"[CSO] Best C = {best_C:.6f}")

    return best_C