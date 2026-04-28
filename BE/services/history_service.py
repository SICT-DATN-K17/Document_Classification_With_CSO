import json

from BE.database import get_connection

def save_prediction_history(result: dict) -> int:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    INSERT INTO prediction_history (
        title,
        label_id,
        label_name,
        confidence,
        top2_gap,
        confidence_level,
        warning,
        top_k_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        result["title"],
        result["label_id"],
        result["label_name"],
        result["confidence"],
        result.get("top2_gap"),
        result["confidence_level"],
        result.get("warning"),
        json.dumps(result.get("top_k", []), ensure_ascii=False),
    ))

    conn.commit()
    history_id = cur.lastrowid
    conn.close()

    return history_id


def get_history(limit: int = 50, offset: int = 0):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    SELECT *
    FROM prediction_history
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
    """, (limit, offset))

    rows = []

    for row in cur.fetchall():
        item = dict(row)

        top_k_json = item.pop("top_k_json", None)

        try:
            item["top_k"] = json.loads(top_k_json) if top_k_json else []
        except json.JSONDecodeError:
            item["top_k"] = []

        rows.append(item)

    cur.execute("SELECT COUNT(*) AS total FROM prediction_history")
    total = cur.fetchone()["total"]

    conn.close()

    return rows, total

def delete_history_item(history_id: int):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM prediction_history WHERE id = ?", (history_id,))
    conn.commit()

    deleted = cur.rowcount
    conn.close()

    return deleted > 0