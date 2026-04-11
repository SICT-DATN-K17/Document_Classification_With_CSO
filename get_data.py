import pandas as pd

df = pd.read_csv(r"D:\DATN_Kaggle\UIT-ViON-Dataset-main\UIT-ViON_test.csv")

df = df[["title"]]

df.to_csv(r"D:\DATN_Kaggle\data\data_test.csv", index=False)