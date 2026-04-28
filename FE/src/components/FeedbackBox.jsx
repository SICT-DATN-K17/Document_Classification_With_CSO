import { useState } from "react";
import { sendFeedback } from "../api/classifierApi";

function FeedbackBox({ result, labels }) {
  const [mode, setMode] = useState(null);
  const [correctLabelId, setCorrectLabelId] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  if (!result) return null;

  async function handleCorrect() {
    setSubmitting(true);
    setMessage("");

    try {
      await sendFeedback({
        title: result.title,
        predicted_label_id: result.label_id,
        correct_label_id: result.label_id,
        is_correct: true,
        note: "Người dùng xác nhận kết quả đúng",
      });

      setMessage("Đã lưu feedback: kết quả đúng.");
      setMode("correct");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleWrongSubmit() {
    if (!correctLabelId) {
      setMessage("Vui lòng chọn nhãn đúng.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      await sendFeedback({
        title: result.title,
        predicted_label_id: result.label_id,
        correct_label_id: Number(correctLabelId),
        is_correct: false,
        note: note || "Người dùng báo kết quả sai",
      });

      setMessage("Đã lưu feedback: kết quả sai và nhãn đúng.");
      setMode("submitted-wrong");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card feedback-box">
      <div className="section-header">
        <div>
          <h2>Feedback kết quả</h2>
          <p>Góp ý của bạn giúp cải thiện model trong các lần nâng cấp sau.</p>
        </div>
      </div>

      <div className="feedback-actions">
        <button
          className="secondary-button success-button"
          onClick={handleCorrect}
          disabled={submitting}
        >
          Kết quả đúng
        </button>

        <button
          className="secondary-button danger-button"
          onClick={() => {
            setMode("wrong");
            setMessage("");
          }}
          disabled={submitting}
        >
          Kết quả sai
        </button>
      </div>

      {mode === "wrong" && (
        <div className="wrong-feedback-form">
          <label>
            Chọn nhãn đúng
            <select
              value={correctLabelId}
              onChange={(event) => setCorrectLabelId(event.target.value)}
            >
              <option value="">-- Chọn nhãn --</option>

              {labels.map((label) => (
                <option key={label.label_id} value={label.label_id}>
                  {label.label_id} - {label.label_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Ghi chú
            <textarea
              rows="3"
              placeholder="Ví dụ: Tiêu đề này liên quan đến giao thông, nên thuộc nhóm tin tức..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>

          <button
            className="primary-button"
            onClick={handleWrongSubmit}
            disabled={submitting}
          >
            {submitting ? "Đang gửi..." : "Gửi feedback"}
          </button>
        </div>
      )}

      {message && <div className="feedback-message">{message}</div>}
    </section>
  );
}

export default FeedbackBox;