import { useEffect, useState } from "react";
import { getHealth, getModelInfo } from "../api/classifierApi";

function ModelInfoPage() {
  const [health, setHealth] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadModelInfo() {
    setLoading(true);
    setError("");

    try {
      const [healthData, modelData] = await Promise.all([
        getHealth(),
        getModelInfo(),
      ]);

      setHealth(healthData);
      setModelInfo(modelData);
    } catch (error) {
      setError(error.message || "Không thể tải thông tin model.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadModelInfo();
  }, []);

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <h2>Thông tin model</h2>
          <p>
            Kiểm tra trạng thái backend, PhoBERT, model phân loại và các tham số
            inference đang sử dụng.
          </p>
        </div>

        <button className="secondary-button" onClick={loadModelInfo}>
          Tải lại
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <section className="card loading-card">
          <div className="spinner" />
          <span>Đang tải thông tin hệ thống...</span>
        </section>
      )}

      {!loading && health && modelInfo && (
        <>
          <section className="model-status-grid">
            <StatusCard
              title="Backend"
              value={health.status === "ok" ? "Online" : "Offline"}
              active={health.status === "ok"}
              description="Trạng thái API FastAPI"
            />

            <StatusCard
              title="Model"
              value={health.model_loaded ? "Loaded" : "Not loaded"}
              active={health.model_loaded}
              description="Trạng thái file svm_cso.joblib"
            />

            <StatusCard
              title="PhoBERT"
              value={health.phobert_loaded ? "Loaded" : "Not loaded"}
              active={health.phobert_loaded}
              description="Trạng thái tokenizer và PhoBERT"
            />

            <StatusCard
              title="Device"
              value={health.device || modelInfo.device || "-"}
              active={true}
              description="Thiết bị inference hiện tại"
            />
          </section>

          <div className="model-info-layout">
            <section className="card">
              <div className="section-header">
                <div>
                  <h2>Thông tin mô hình</h2>
                  <p>Thông tin model backend đang load để phân loại tiêu đề.</p>
                </div>
              </div>

              <div className="model-info-list">
                <InfoRow label="Tên model" value={modelInfo.model_name} />
                <InfoRow label="File model" value={modelInfo.model_file} />
                <InfoRow label="Version" value={modelInfo.version} />
                <InfoRow label="Số nhãn" value={modelInfo.num_labels} />
                <InfoRow label="Top-K" value={modelInfo.top_k} />
                <InfoRow label="Max length" value={modelInfo.max_length} />
                <InfoRow label="Device" value={modelInfo.device} />
              </div>
            </section>

            <section className="card">
              <div className="section-header">
                <div>
                  <h2>Trạng thái hệ thống</h2>
                  <p>Dữ liệu trả về từ endpoint health check.</p>
                </div>
              </div>

              <div className="health-json-box">
                <pre>{JSON.stringify(health, null, 2)}</pre>
              </div>
            </section>
          </div>

          <section className="card model-note-card">
            <h2>Ghi chú triển khai</h2>
            <p>
              Trang này chỉ dùng để kiểm tra thông tin model đang phục vụ
              inference. Quá trình train, tuning CSO, đánh giá dev/test được
              thực hiện riêng ở notebook.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

function StatusCard({ title, value, active, description }) {
  return (
    <div className={active ? "status-card status-card-ok" : "status-card status-card-bad"}>
      <div className="status-card-top">
        <span>{title}</span>
        <span className={active ? "status-dot status-dot-ok" : "status-dot status-dot-bad"} />
      </div>

      <strong>{value}</strong>
      <p>{description}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="model-info-row">
      <span>{label}</span>
      <strong>{value ?? "-"}</strong>
    </div>
  );
}

export default ModelInfoPage;