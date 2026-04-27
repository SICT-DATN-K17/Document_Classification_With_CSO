import pandas as pd

# Load original data
df = pd.read_csv('UIT-ViON-Dataset-main/UIT-ViON_train.csv')

print("Original label distribution:")
print(df['label'].value_counts().sort_index())

# Labels to remove
remove_labels = [1, 5, 10, 12]

# Filter out the rows
df_filtered = df[~df['label'].isin(remove_labels)]

print(f"Đã xóa {len(df) - len(df_filtered)} dòng thuộc labels {remove_labels}.")

# Create mapping for remaining labels
old_labels = sorted(df_filtered['label'].unique())
label_map = {old: new for new, old in enumerate(old_labels)}

print("Label mapping:", label_map)

# Apply mapping
df_filtered['label'] = df_filtered['label'].map(label_map)

# Save back to original file
df_filtered.to_csv('UIT-ViON-Dataset-main/UIT-ViON_train.csv', index=False)

print(f"Số dòng còn lại: {len(df_filtered)}")
print("New label distribution:")
print(df_filtered['label'].value_counts().sort_index())