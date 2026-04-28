import ConfidenceBadge from "./ConfidenceBadge";
import WarningBox from "./WarningBox";
import { formatNumber, formatPercent, normalizeLabelName } from "../utils/format";

function ResultCard({ result }) {
  if (!result) return null;

  return (
    <section className="card result-card">
      <div className="section-header">
        <div>
          <h2>Kết quả dự đoán</h2>
          <p>Thông tin nhãn mà model dự đoán cho tiêu đề đã nhập.</p>
        </div>

        <ConfidenceBadge level={result.confidence_level} />
      </div>

      <div className="prediction-main">
        <div>
          <span className="muted-label">Nhãn dự đoán</span>
          <h3>{normalizeLabelName(result.label_name)}</h3>
        </div>

        <div className="confidence-score">
          {formatPercent(result.confidence)}
        </div>
      </div>

      <div className="result-grid">
        <div className="result-item">
          <span>Label ID</span>
          <strong>{result.label_id}</strong>
        </div>

        <div className="result-item">
          <span>Confidence</span>
          <strong>{formatNumber(result.confidence)}</strong>
        </div>

        <div className="result-item">
          <span>Top2 gap</span>
          <strong>{formatNumber(result.top2_gap)}</strong>
        </div>

        <div className="result-item">
          <span>Thời gian xử lý</span>
          <strong>{result.processing_time_ms ?? "-"} ms</strong>
        </div>

        <div className="result-item">
          <span>Model version</span>
          <strong>{result.model_version || "-"}</strong>
        </div>
      </div>

      <WarningBox message={result.warning} />
    </section>
  );
}

export default ResultCard;