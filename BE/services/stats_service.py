from BE.database import get_connection


def get_summary_stats():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) AS total FROM prediction_history")
    total_predictions = cur.fetchone()["total"]

    cur.execute("SELECT COUNT(*) AS total FROM feedback")
    total_feedback = cur.fetchone()["total"]

    cur.execute("""
    SELECT confidence_level, COUNT(*) AS count
    FROM prediction_history
    GROUP BY confidence_level
    """)

    confidence_counts = {
        "low": 0,
        "medium": 0,
        "high": 0,
        "uncertain": 0
    }

    for row in cur.fetchall():
        confidence_counts[row["confidence_level"]] = row["count"]

    cur.execute("""
    SELECT label_name, COUNT(*) AS count
    FROM prediction_history
    GROUP BY label_name
    ORDER BY count DESC
    LIMIT 1
    """)

    row = cur.fetchone()
    most_predicted_label = row["label_name"] if row else None

    conn.close()

    return {
        "total_predictions": total_predictions,
        "total_feedback": total_feedback,
        "low_confidence_count": confidence_counts.get("low", 0),
        "medium_confidence_count": confidence_counts.get("medium", 0),
        "high_confidence_count": confidence_counts.get("high", 0),
        "most_predicted_label": most_predicted_label,
    }


def get_label_stats():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    SELECT label_id, label_name, COUNT(*) AS count
    FROM prediction_history
    GROUP BY label_id, label_name
    ORDER BY count DESC
    """)

    rows = [dict(row) for row in cur.fetchall()]
    conn.close()

    return rows


def get_confidence_stats():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    SELECT confidence_level, COUNT(*) AS count
    FROM prediction_history
    GROUP BY confidence_level
    """)

    result = {
        "low": 0,
        "medium": 0,
        "high": 0
    }

    for row in cur.fetchall():
        level = row["confidence_level"]
        if level in result:
            result[level] = row["count"]

    conn.close()

    return result