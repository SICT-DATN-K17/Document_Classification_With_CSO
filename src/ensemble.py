import numpy as np

def ensemble_predict(models, X):
    """
    models: list of trained models
    X: embedding
    """
    preds = []

    for model in models:
        preds.append(model.predict(X))

    preds = np.array(preds)  # shape: (n_models, n_samples)

    # voting (majority)
    final_preds = []
    for i in range(preds.shape[1]):
        values, counts = np.unique(preds[:, i], return_counts=True)
        final_preds.append(values[np.argmax(counts)])

    return np.array(final_preds)