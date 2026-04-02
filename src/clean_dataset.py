import pandas as pd
import os

def clean_dataset(input_path, output_path):
    df = pd.read_csv(input_path)

    print("Original:", df.shape)

    df = df[["title", "label"]].copy()

   #  Rename cho đúng pipeline
    df.columns = ["title", "label"]

   #  Clean cơ bản
    df["title"] = df["title"].fillna("").astype(str)
    df["label"] = df["label"].astype(int)

   #  Remove dòng lỗi
    df = df[df["title"].str.strip() != ""]

    #  Remove duplicate
    df = df.drop_duplicates(subset=["title"])

    print("Cleaned:", df.shape)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False, encoding="utf-8-sig")

    print("Saved to:", output_path)