import pandas as pd

df = pd.read_csv(r"my_data\train.csv")

# label cần xóa
remove_labels = [1, 5, 10, 12]

# lọc
df = df[~df["label"].isin(remove_labels)]

# tạo mapping mới
old_labels = sorted(df["label"].unique())
label_map = {old: new for new, old in enumerate(old_labels)}

# apply mapping
df["label"] = df["label"].map(label_map)

df.to_csv(r"my_data\train_remap.csv", index=False)

print(label_map)