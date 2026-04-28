import { useMemo, useState } from "react";
import { predictBatch } from "../api/classifierApi";
import ConfidenceBadge from "../components/ConfidenceBadge";
import WarningBox from "../components/WarningBox";
import {
  formatNumber,
  formatPercent,
  normalizeLabelName,
} from "../utils/format";

function BatchPredictPage() {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const titles = useMemo(() => {
    return inputText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }, [inputText]);

  async function handlePredictBatch() {
    if (titles.length === 0) {
      setError("Vui lòng nhập ít nhất một tiêu đề.");
      return;
    }

    setLoading(true);
    setError("");
    setCopyMessage("");
    setResults([]);

    try {
      const data = await predictBatch(titles);
      setResults(data.results || []);
    } catch (error) {
      setError(error.message || "Có lỗi xảy ra khi phân loại hàng loạt.");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setInputText("");
    setResults([]);
    setError("");
    setCopyMessage("");
  }

  async function handleCopyJson() {
    if (results.length === 0) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(results, null, 2));
      setCopyMessage("Đã copy kết quả JSON.");
    } catch {
      setCopyMessage("Không thể copy kết quả.");
    }
  }

  function getAlternativeLabel(item) {
    if (!item?.top_k || item.top_k.length < 2) {
      return null;
    }

    const alternative = item.top_k.find(
      (label) => label.label_id !== item.label_id
    );

    return alternative || null;
  }

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <h2>Phân loại hàng loạt</h2>
          <p>
            Nhập nhiều tiêu đề tin tức, mỗi dòng là một tiêu đề. Hệ thống sẽ
            phân loại toàn bộ danh sách.
          </p>
        </div>
      </div>

      <section className="card input-card">
        <label htmlFor="batch-input">Danh sách tiêu đề</label>

        <textarea
          id="batch-input"
          rows="8"
          placeholder={`Ví dụ:
giá vàng tăng mạnh hôm nay
đội tuyển việt nam thắng thái lan
công nghệ ai phát triển nhanh`}
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
        />

        <div className="input-footer">
          <span>{titles.length} tiêu đề hợp lệ</span>

          <div className="button-group">
            <button
              className="secondary-button"
              onClick={handleClear}
              disabled={loading || !inputText.trim()}
            >
              Xóa
            </button>

            <button
              className="primary-button"
              onClick={handlePredictBatch}
              disabled={loading || titles.length === 0}
            >
              {loading ? "Đang phân loại..." : "Phân loại hàng loạt"}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
      </section>

      {loading && (
        <section className="card loading-card">
          <div className="spinner" />
          <span>Đang xử lý {titles.length} tiêu đề...</span>
        </section>
      )}

      {results.length > 0 && (
        <section className="card">
          <div className="section-header">
            <div>
              <h2>Kết quả phân loại</h2>
              <p>
                Đã phân loại {results.length} tiêu đề. Các kết quả confidence
                thấp nên được kiểm tra lại.
              </p>
            </div>

            <button className="secondary-button" onClick={handleCopyJson}>
              Copy JSON
            </button>
          </div>

          {copyMessage && <div className="feedback-message">{copyMessage}</div>}

          <div className="table-wrapper">
            <table className="result-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tiêu đề</th>
                  <th>Nhãn dự đoán</th>
                  <th>Confidence</th>
                  <th>Mức chắc chắn</th>
                  <th>Gợi ý nhãn khác</th>
                  <th>Cảnh báo</th>
                </tr>
              </thead>

              <tbody>
                {results.map((item, index) => {
                  const alternative = getAlternativeLabel(item);

                  return (
                    <tr key={`${item.title}-${index}`}>
                      <td>{index + 1}</td>

                      <td className="title-cell">{item.title}</td>

                      <td>
                        <strong>{normalizeLabelName(item.label_name)}</strong>
                        <div className="muted-small">
                          ID: {item.label_id}
                        </div>
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
                            <strong>
                              {normalizeLabelName(alternative.label_name)}
                            </strong>
                            <div className="muted-small">
                              {formatPercent(alternative.confidence)}
                            </div>
                          </>
                        ) : (
                          <span className="muted-small">Không có</span>
                        )}
                      </td>

                      <td>
                        {item.warning ? (
                          <span className="table-warning">Có cảnh báo</span>
                        ) : (
                          <span className="table-ok">Ổn</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="batch-warning-list">
            {results
              .filter((item) => item.warning)
              .map((item, index) => (
                <WarningBox
                  key={`${item.title}-warning-${index}`}
                  message={`${item.title}: ${item.warning}`}
                />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default BatchPredictPage;