from BE.database import get_connection


def save_feedback(data: dict) -> int:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    INSERT INTO feedback (
        history_id,
        title,
        predicted_label_id,
        correct_label_id,
        is_correct,
        note
    )
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        data.get("history_id"),
        data["title"],
        data["predicted_label_id"],
        data.get("correct_label_id"),
        1 if data["is_correct"] else 0,
        data.get("note"),
    ))

    conn.commit()
    feedback_id = cur.lastrowid
    conn.close()

    return feedback_id


def get_feedback_list(limit: int = 50, offset: int = 0):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    SELECT *
    FROM feedback
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
    """, (limit, offset))

    rows = [dict(row) for row in cur.fetchall()]

    cur.execute("SELECT COUNT(*) AS total FROM feedback")
    total = cur.fetchone()["total"]

    conn.close()

    return rows, total