from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score, f1_score, classification_report


def train_svm(X_train, y_train, C=1.0, random_state=42):
    clf = LinearSVC(
        C=C,
        max_iter=20000,
        random_state=random_state
    )
    clf.fit(X_train, y_train)
    return clf


def evaluate(clf, X, y, name="Eval"):
    y_pred = clf.predict(X)

    acc = accuracy_score(y, y_pred)
    f1 = f1_score(y, y_pred, average="macro")

    print(f"===== {name} =====")
    print("Accuracy:", acc)
    print("F1:", f1)
    print(classification_report(y, y_pred))

    return {
        "accuracy": acc,
        "macro_f1": f1,
        "y_pred": y_pred
    }


# def train_svm(X_train, y_train, C=1.0):
#     clf = Pipeline([
#         ("norm", Normalizer()),
#         ("svm", LinearSVC(
#             C=C,
#             class_weight=None,
#             max_iter=20000,
#             random_state=42
#         ))
#     ])
#     clf.fit(X_train, y_train)
#     return clf

# def evaluate(clf, X_test, y_test):
#     y_pred = clf.predict(X_test)

#     acc = accuracy_score(y_test, y_pred)
#     f1 = f1_score(y_test, y_pred, average="macro")

#     print("Accuracy:", acc)
#     print("F1:", f1)
#     print(classification_report(y_test, y_pred))