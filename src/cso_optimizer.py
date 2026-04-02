import numpy as np
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.svm import LinearSVC
from transformers import Pipeline
from cso import CSO

def optimize_cso(X_train, y_train, P=6, Tmax=3):
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cache = {}

    def fitness(x):
        logC = float(x[0])
        C = 10 ** logC

        key = round(logC, 4)
        if key in cache:
            return -cache[key]

        clf = Pipeline([
            ("scaler", StandardScaler()),
            ("svm", LinearSVC(
                C=C,
                class_weight="balanced",
                max_iter=20000,
                random_state=42
            ))
        ])

        scores = cross_val_score(
            clf, X_train, y_train,
            cv=skf,
            scoring="f1_macro"
        )

        f1m = scores.mean()
        cache[key] = f1m

        print(f"C={C:.4f} -> {f1m:.4f}")
        return -f1m

    cso = CSO(
        fitness=fitness,
        P=P,
        n=1,
        bound=[(-2, 4)],
        Tmax=Tmax,
        verbose=True
    )

    cso.execute()

    best_logC = cso.best[0]
    best_C = 10 ** best_logC

    return best_C