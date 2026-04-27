import pandas as pd

# Load dev data
df = pd.read_csv('UIT-ViON-Dataset-main/UIT-ViON_dev.csv')

print("Original dev label distribution:")
print(df['label'].value_counts().sort_index())

# Labels to remove
remove_labels = [1, 5, 10, 12]

# Filter out the rows
df_filtered = df[~df['label'].isin(remove_labels)]

print(f"Đã xóa {len(df) - len(df_filtered)} dòng thuộc labels {remove_labels} từ dev.")

# Create mapping for remaining labels (same as train)
old_labels = [0, 2, 3, 4, 6, 7, 8, 9, 11]
label_map = {old: new for new, old in enumerate(old_labels)}

print("Label mapping:", label_map)

# Apply mapping
df_filtered = df_filtered.copy()
df_filtered['label'] = df_filtered['label'].map(label_map)

# Save back
df_filtered.to_csv('UIT-ViON-Dataset-main/UIT-ViON_dev.csv', index=False)

print(f"Số dòng dev còn lại: {len(df_filtered)}")
print("New dev label distribution:")
print(df_filtered['label'].value_counts().sort_index())