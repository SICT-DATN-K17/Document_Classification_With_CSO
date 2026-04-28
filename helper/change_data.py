import pandas as pd

df = pd.read_csv(r"D:\DATN_Kaggle\my_data\UIT-ViON_dev.csv")

df = df[~df["label"].isin([1, 5, 10, 12])]

df.to_csv(r"D:\DATN_Kaggle\my_data\dev.csv", index=False)