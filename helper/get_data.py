import pandas as pd

df = pd.read_csv(r"data\train.csv")

df = df[["title"]]

df.to_csv(r"data\trained_data.csv", index=False)