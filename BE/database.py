import sqlite3
from pathlib import Path

DB_PATH = Path("BE/app.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def add_column_if_not_exists(cur, table_name: str, column_name: str, column_def: str):
    """
    Thêm cột mới nếu bảng đã tồn tại từ trước.
    Tránh lỗi khi app.db cũ chưa có top_k_json.
    """
    cur.execute(f"PRAGMA table_info({table_name})")
    columns = [row["name"] for row in cur.fetchall()]

    if column_name not in columns:
        cur.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_def}")


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS prediction_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        label_id INTEGER NOT NULL,
        label_name TEXT NOT NULL,
        confidence REAL NOT NULL,
        top2_gap REAL,
        confidence_level TEXT NOT NULL,
        warning TEXT,
        top_k_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Nếu app.db đã được tạo trước đó, bảng prediction_history có thể chưa có top_k_json.
    # Dòng này giúp cập nhật bảng cũ mà không cần xóa database.
    add_column_if_not_exists(
        cur=cur,
        table_name="prediction_history",
        column_name="top_k_json",
        column_def="TEXT"
    )

    cur.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        history_id INTEGER,
        title TEXT NOT NULL,
        predicted_label_id INTEGER NOT NULL,
        correct_label_id INTEGER,
        is_correct INTEGER NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(history_id) REFERENCES prediction_history(id)
    )
    """)

    conn.commit()
    conn.close()