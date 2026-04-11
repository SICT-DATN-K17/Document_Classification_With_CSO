import numpy as np
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.svm import LinearSVC
from cso import CSO

def optimize_cso(
    X_train,
    y_train,
    # P=4,
    # Tmax=2,
    P=8,
    Tmax=5,
    # sample_size=50000  # chỉ lấy subset
    sample_size=100000
):
    
    # lấy subset
    
    if len(X_train) > sample_size:
        idx = np.random.choice(len(X_train), sample_size, replace=False)
        X_opt = X_train[idx]
        y_opt = y_train[idx]
    else:
        X_opt, y_opt = X_train, y_train

    print(f"[CSO] Using {len(X_opt)} samples for optimization")

    # GIẢM CV
    skf = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)

    cache = {}

    def fitness(x):
        logC = float(x[0])
        C = 10 ** logC

        key = round(logC, 3)
        if key in cache:
            return -cache[key]

        clf = LinearSVC(
            C=C,
            class_weight="balanced",
            max_iter=20000,
            dual=False
        )

        scores = cross_val_score(
            clf,
            X_opt,
            y_opt,
            cv=skf,
            scoring="f1_macro",
            n_jobs=-1  # chạy đa luồng
        )

        f1m = scores.mean()
        cache[key] = f1m

        print(f"C={C:.4f} -> {f1m:.4f}")
        return -f1m

    cso = CSO(
        fitness=fitness,
        P=P,
        n=1,
        # bound=[(-2, 3)],  # thu nhỏ search space
        bound=[(-3, 4)], # mở rộng search space
        Tmax=Tmax,
        verbose=True
    )

    cso.execute()

    best_logC = cso.best[0]
    best_C = 10 ** best_logC

    print(f"[CSO] Best C = {best_C:.4f}")
    return best_C


# import numpy as np
# from sklearn.model_selection import cross_val_score, StratifiedKFold
# from sklearn.svm import LinearSVC
# from src.cso import CSO

# def optimize_cso(X_train, y_train, P=6, Tmax=3):
#     skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
#     cache = {}

#     def fitness(x):
#         logC = float(x[0])
#         C = 10 ** logC

#         key = round(logC, 4)
#         if key in cache:
#             return -cache[key]

#         clf = LinearSVC(
#             C=C,
#             class_weight="balanced",
#             max_iter=5000
#         )

#         scores = cross_val_score(
#             clf, X_train, y_train,
#             cv=skf,
#             scoring="f1_macro"
#         )

#         f1m = scores.mean()
#         cache[key] = f1m

#         print(f"C={C:.4f} -> {f1m:.4f}")
#         return -f1m

#     cso = CSO(
#         fitness=fitness,
#         P=P,
#         n=1,
#         bound=[(-2, 4)],
#         Tmax=Tmax,
#         verbose=True
#     )

#     cso.execute()

#     best_logC = cso.best[0]
#     best_C = 10 ** best_logC

#     return best_C