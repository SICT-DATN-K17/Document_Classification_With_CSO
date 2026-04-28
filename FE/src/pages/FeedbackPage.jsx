import { useEffect, useMemo, useState } from "react";
import { getFeedbackList, getLabels } from "../api/classifierApi";
import { normalizeLabelName } from "../utils/format";

function FeedbackPage() {
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [labels, setLabels] = useState([]);
  const [total, setTotal] = useState(0);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadFeedback() {
    setLoading(true);
    setError("");

    try {
      const [feedbackData, labelsData] = await Promise.all([
        getFeedbackList(100, 0),
        getLabels(),
      ]);

      setFeedbackItems(feedbackData.items || []);
      setTotal(feedbackData.total || 0);
      setLabels(labelsData.labels || []);
    } catch (error) {
      setError(error.message || "Không thể tải dữ liệu feedback.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  const labelMap = useMemo(() => {
    const map = {};

    labels.forEach((label) => {
      map[Number(label.label_id)] = label.label_name;
    });

    return map;
  }, [labels]);

  const filteredItems = useMemo(() => {
    return feedbackItems.filter((item) => {
      const title = String(item.title || "").toLowerCase();
      const note = String(item.note || "").toLowerCase();
      const search = keyword.trim().toLowerCase();

      const isCorrect = normalizeIsCorrect(item.is_correct);

      const matchKeyword =
        !search || title.includes(search) || note.includes(search);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "correct" && isCorrect) ||
        (statusFilter === "wrong" && !isCorrect);

      return matchKeyword && matchStatus;
    });
  }, [feedbackItems, keyword, statusFilter]);

  const correctCount = useMemo(() => {
    return feedbackItems.filter((item) => normalizeIsCorrect(item.is_correct))
      .length;
  }, [feedbackItems]);

  const wrongCount = useMemo(() => {
    return feedbackItems.filter((item) => !normalizeIsCorrect(item.is_correct))
      .length;
  }, [feedbackItems]);

  function getLabelName(labelId) {
    if (labelId === null || labelId === undefined) return "Không có";

    return labelMap[Number(labelId)] || `Label ${labelId}`;
  }

  function formatDateTime(value) {
    if (!value) return "-";

    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;

      return date.toLocaleString("vi-VN");
    } catch {
      return value;
    }
  }

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <h2>Feedback người dùng</h2>
          <p>
            Theo dõi các góp ý đúng/sai để đánh giá lỗi dự đoán và phục vụ nâng
            cấp model sau này.
          </p>
        </div>

        <button className="secondary-button" onClick={loadFeedback}>
          Tải lại
        </button>
      </div>

      <section className="feedback-stats-grid">
        <div className="feedback-stat-card">
          <span>Tổng feedback</span>
          <strong>{total}</strong>
        </div>

        <div className="feedback-stat-card feedback-stat-success">
          <span>Dự đoán đúng</span>
          <strong>{correctCount}</strong>
        </div>

        <div className="feedback-stat-card feedback-stat-danger">
          <span>Dự đoán sai</span>
          <strong>{wrongCount}</strong>
        </div>
      </section>

      <section className="card history-filter-card">
        <div className="history-filter-grid">
          <label>
            Tìm kiếm
            <input
              type="text"
              placeholder="Tìm theo tiêu đề hoặc ghi chú..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </label>

          <label>
            Lọc trạng thái
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="correct">Dự đoán đúng</option>
              <option value="wrong">Dự đoán sai</option>
            </select>
          </label>
        </div>

        <div className="history-summary">
          <span>Tổng feedback: {total}</span>
          <span>Đang hiển thị: {filteredItems.length}</span>
        </div>
      </section>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <section className="card loading-card">
          <div className="spinner" />
          <span>Đang tải danh sách feedback...</span>
        </section>
      )}

      {!loading && filteredItems.length === 0 && (
        <section className="card empty-card">
          <h3>Chưa có feedback phù hợp</h3>
          <p>
            Hãy gửi feedback từ màn hình phân loại hoặc thay đổi bộ lọc tìm
            kiếm.
          </p>
        </section>
      )}

      {!loading && filteredItems.length > 0 && (
        <section className="card">
          <div className="section-header">
            <div>
              <h2>Danh sách feedback</h2>
              <p>
                Các feedback này có thể dùng để kiểm tra lỗi và bổ sung dữ liệu
                cải thiện model.
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="result-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề</th>
                  <th>Nhãn dự đoán</th>
                  <th>Nhãn đúng</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th>Thời gian</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => {
                  const isCorrect = normalizeIsCorrect(item.is_correct);

                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>

                      <td className="title-cell">{item.title}</td>

                      <td>
                        <strong>
                          {normalizeLabelName(
                            getLabelName(item.predicted_label_id)
                          )}
                        </strong>
                        <div className="muted-small">
                          ID: {item.predicted_label_id}
                        </div>
                      </td>

                      <td>
                        {item.correct_label_id !== null &&
                        item.correct_label_id !== undefined ? (
                          <>
                            <strong>
                              {normalizeLabelName(
                                getLabelName(item.correct_label_id)
                              )}
                            </strong>
                            <div className="muted-small">
                              ID: {item.correct_label_id}
                            </div>
                          </>
                        ) : (
                          <span className="muted-small">Không có</span>
                        )}
                      </td>

                      <td>
                        {isCorrect ? (
                          <span className="feedback-status feedback-status-correct">
                            Đúng
                          </span>
                        ) : (
                          <span className="feedback-status feedback-status-wrong">
                            Sai
                          </span>
                        )}
                      </td>

                      <td className="note-cell">
                        {item.note || <span className="muted-small">Không có</span>}
                      </td>

                      <td>{formatDateTime(item.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function normalizeIsCorrect(value) {
  return value === true || value === 1 || value === "1";
}

export default FeedbackPage;