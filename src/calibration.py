import joblib
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import log_loss


def fit_calibrated_svm(base_clf, X_dev, y_dev, method="sigmoid"):
    calibrator = CalibratedClassifierCV(base_clf, method=method, cv="prefit")
    calibrator.fit(X_dev, y_dev)
    return calibrator


def predict_with_confidence(calibrator, X):
    y_pred = calibrator.predict(X)
    y_proba = calibrator.predict_proba(X)
    confidence = y_proba.max(axis=1)
    return y_pred, y_proba, confidence


def save_calibrator(calibrator, save_path):
    joblib.dump(calibrator, save_path)
    print("Saved calibrator:", save_path)


def evaluate_calibration(calibrator, X, y):
    y_proba = calibrator.predict_proba(X)
    return log_loss(y, y_proba)