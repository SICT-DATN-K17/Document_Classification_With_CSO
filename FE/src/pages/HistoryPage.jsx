import { useEffect, useMemo, useState } from "react";
import { deleteHistoryItem, getHistory } from "../api/classifierApi";
import ConfidenceBadge from "../components/ConfidenceBadge";
import {
  formatNumber,
  formatPercent,
  normalizeLabelName,
} from "../utils/format";

function HistoryPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [keyword, setKeyword] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState("all");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState("");

  async function loadHistory() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await getHistory(100, 0);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      setError(error.message || "Không thể tải lịch sử.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const title = String(item.title || "").toLowerCase();
      const labelName = String(item.label_name || "").toLowerCase();
      const search = keyword.trim().toLowerCase();

      const matchKeyword =
        !search || title.includes(search) || labelName.includes(search);

      const matchConfidence =
        confidenceFilter === "all" ||
        item.confidence_level === confidenceFilter;

      return matchKeyword && matchConfidence;
    });
  }, [items, keyword, confidenceFilter]);

  function getAlternativeLabel(item) {
    if (!item?.top_k || !Array.isArray(item.top_k) || item.top_k.length < 2) {
      return null;
    }

    const alternative = item.top_k.find(
      (label) => Number(label.label_id) !== Number(item.label_id)
    );

    return alternative || null;
  }

  async function handleDelete(historyId) {
    const ok = window.confirm("Bạn có chắc muốn xóa bản ghi lịch sử này?");
    if (!ok) return;

    setMessage("");
    setError("");

    try {
      await deleteHistoryItem(historyId);
      setItems((prev) => prev.filter((item) => item.id !== historyId));
      setTotal((prev) => Math.max(prev - 1, 0));

      if (selectedItem?.id === historyId) {
        setSelectedItem(null);
      }

      setMessage("Đã xóa bản ghi lịch sử.");
    } catch (error) {
      setError(error.message || "Không thể xóa bản ghi.");
    }
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
          <h2>Lịch sử phân loại</h2>
          <p>
            Theo dõi các tiêu đề đã được hệ thống phân loại và kiểm tra những
            kết quả có độ tin cậy thấp.
          </p>
        </div>

        <button className="secondary-button" onClick={loadHistory}>
          Tải lại
        </button>
      </div>

      <section className="card history-filter-card">
        <div className="history-filter-grid">
          <label>
            Tìm kiếm
            <input
              type="text"
              placeholder="Tìm theo tiêu đề hoặc nhãn..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </label>

          <label>
            Lọc mức tin cậy
            <select
              value={confidenceFilter}
              onChange={(event) => setConfidenceFilter(event.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
              <option value="uncertain">Dễ nhầm</option>
            </select>
          </label>
        </div>

        <div className="history-summary">
          <span>Tổng bản ghi: {total}</span>
          <span>Đang hiển thị: {filteredItems.length}</span>
        </div>
      </section>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="feedback-message">{message}</div>}

      {loading && (
        <section className="card loading-card">
          <div className="spinner" />
          <span>Đang tải lịch sử phân loại...</span>
        </section>
      )}

      {!loading && filteredItems.length === 0 && (
        <section className="card empty-card">
          <h3>Chưa có dữ liệu phù hợp</h3>
          <p>
            Hãy thử phân loại một vài tiêu đề hoặc thay đổi bộ lọc tìm kiếm.
          </p>
        </section>
      )}

      {!loading && filteredItems.length > 0 && (
        <section className="card">
          <div className="section-header">
            <div>
              <h2>Danh sách lịch sử</h2>
              <p>Click vào một dòng để xem chi tiết kết quả dự đoán.</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="result-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề</th>
                  <th>Nhãn dự đoán</th>
                  <th>Confidence</th>
                  <th>Mức tin cậy</th>
                  <th>Gợi ý nhãn khác</th>
                  <th>Thời gian</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => {
                  const alternative = getAlternativeLabel(item);

                  return (
                    <tr
                      key={item.id}
                      className={
                        selectedItem?.id === item.id ? "selected-row" : ""
                      }
                      onClick={() => setSelectedItem(item)}
                    >
                      <td>{item.id}</td>

                      <td className="title-cell">{item.title}</td>

                      <td>
                        <strong>{normalizeLabelName(item.label_name)}</strong>
                        <div className="muted-small">ID: {item.label_id}</div>
                      </td>

                      <td>
                        <strong>{formatPercent(item.confidence)}</strong>
                        <div className="muted-small">
                          {formatNumber(item.confidence)}
                        </div>
                      </td>

                      <td>
                        <ConfidenceBadge level={item.confidence_level} />
                      </td>

                      <td>
                        {alternative ? (
                           <>
                              <strong>{normalizeLabelName(alternative.label_name)}</strong>
                              <div className="muted-small">
                              {formatPercent(alternative.confidence)}
                              </div>
                           </>
                        ) : (
                           <span className="muted-small">Chưa lưu</span>
                        )}
                     </td>

                      <td>{formatDateTime(item.created_at)}</td>

                      <td>
                        <button
                          className="small-danger-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(item.id);
                          }}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selectedItem && (
        <section className="card history-detail-card">
          <div className="section-header">
            <div>
              <h2>Chi tiết bản ghi #{selectedItem.id}</h2>
              <p>Thông tin đầy đủ của một lần phân loại.</p>
            </div>

            <button
              className="secondary-button"
              onClick={() => setSelectedItem(null)}
            >
              Đóng
            </button>
          </div>

          <HistoryDetail item={selectedItem} />
        </section>
      )}
    </div>
  );
}

function HistoryDetail({ item }) {
  const alternative = getAlternativeLabelForDetail(item);

  return (
    <div className="detail-grid">
      <div className="detail-item detail-title">
        <span>Tiêu đề</span>
        <strong>{item.title}</strong>
      </div>

      <div className="detail-item">
        <span>Nhãn dự đoán</span>
        <strong>{normalizeLabelName(item.label_name)}</strong>
      </div>

      <div className="detail-item">
        <span>Label ID</span>
        <strong>{item.label_id}</strong>
      </div>

      <div className="detail-item">
        <span>Confidence</span>
        <strong>{formatPercent(item.confidence)}</strong>
      </div>

      <div className="detail-item">
        <span>Confidence raw</span>
        <strong>{formatNumber(item.confidence)}</strong>
      </div>

      <div className="detail-item">
        <span>Gợi ý nhãn khác</span>
        {alternative ? (
          <strong>
            {normalizeLabelName(alternative.label_name)}{" "}
            <span className="muted-inline">
              ({formatPercent(alternative.confidence)})
            </span>
          </strong>
        ) : (
          <strong>Chưa lưu top-k</strong>
        )}
      </div>

      <div className="detail-item">
        <span>Mức tin cậy</span>
        <ConfidenceBadge level={item.confidence_level} />
      </div>

      <div className="detail-item">
        <span>Thời gian</span>
        <strong>{formatDateTimeForDetail(item.created_at)}</strong>
      </div>

      <div className="detail-item detail-title">
        <span>Cảnh báo</span>
        <strong>{item.warning || "Không có cảnh báo"}</strong>
      </div>
    </div>
  );
}

function getAlternativeLabelForDetail(item) {
  if (!item?.top_k || !Array.isArray(item.top_k) || item.top_k.length < 2) {
    return null;
  }

  const alternative = item.top_k.find(
    (label) => Number(label.label_id) !== Number(item.label_id)
  );

  return alternative || null;
}

function formatDateTimeForDetail(value) {
  if (!value) return "-";

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("vi-VN");
  } catch {
    return value;
  }
}

export default HistoryPage;