from sklearn.preprocessing import StandardScaler
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, f1_score, classification_report

def train_svm(X_train, y_train, C=1.0):
    clf = Pipeline([
    ("scaler", StandardScaler()),
    ("svm", LinearSVC(
        C=C,
        class_weight="balanced",
        max_iter=20000,
        random_state=42
    ))
])
    clf.fit(X_train, y_train)
    return clf

def evaluate(clf, X_test, y_test):
    y_pred = clf.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="macro")

    print("Accuracy:", acc)
    print("F1:", f1)
    print(classification_report(y_test, y_pred))