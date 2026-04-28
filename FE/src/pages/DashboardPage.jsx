import { useEffect, useMemo, useState } from "react";
import {
  getConfidenceStats,
  getLabelStats,
  getStatsSummary,
} from "../api/classifierApi";
import StatCard from "../components/StatCard";
import { normalizeLabelName } from "../utils/format";

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [labelStats, setLabelStats] = useState([]);
  const [confidenceStats, setConfidenceStats] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [summaryData, labelData, confidenceData] = await Promise.all([
        getStatsSummary(),
        getLabelStats(),
        getConfidenceStats(),
      ]);

      setSummary(summaryData);
      setLabelStats(labelData.items || []);
      setConfidenceStats(confidenceData);
    } catch (error) {
      setError(error.message || "Không thể tải dữ liệu thống kê.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const maxLabelCount = useMemo(() => {
    if (!labelStats || labelStats.length === 0) return 1;

    return Math.max(...labelStats.map((item) => Number(item.count || 0)), 1);
  }, [labelStats]);

  const confidenceItems = useMemo(() => {
    if (!confidenceStats) return [];

    return [
      {
        key: "high",
        label: "Cao",
        count: confidenceStats.high || 0,
        className: "confidence-bar-high",
      },
      {
        key: "medium",
        label: "Trung bình",
        count: confidenceStats.medium || 0,
        className: "confidence-bar-medium",
      },
      {
        key: "low",
        label: "Thấp",
        count: confidenceStats.low || 0,
        className: "confidence-bar-low",
      },
      {
        key: "uncertain",
        label: "Dễ nhầm",
        count: confidenceStats.uncertain || 0,
        className: "confidence-bar-uncertain",
      },
    ];
  }, [confidenceStats]);

  const maxConfidenceCount = useMemo(() => {
    if (confidenceItems.length === 0) return 1;

    return Math.max(...confidenceItems.map((item) => item.count), 1);
  }, [confidenceItems]);

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <h2>Thống kê hệ thống</h2>
          <p>
            Theo dõi tổng quan số lượt phân loại, phân bố nhãn và mức độ tin
            cậy của model.
          </p>
        </div>

        <button className="secondary-button" onClick={loadDashboard}>
          Tải lại
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <section className="card loading-card">
          <div className="spinner" />
          <span>Đang tải dữ liệu thống kê...</span>
        </section>
      )}

      {!loading && summary && (
        <>
          <section className="stats-grid">
            <StatCard
              title="Tổng lượt phân loại"
              value={summary.total_predictions ?? 0}
              description="Số tiêu đề đã được backend xử lý"
              type="primary"
            />

            <StatCard
              title="Tổng feedback"
              value={summary.total_feedback ?? 0}
              description="Số góp ý đúng/sai từ người dùng"
              type="info"
            />

            <StatCard
              title="Nhãn xuất hiện nhiều nhất"
              value={summary.most_predicted_label || "Chưa có"}
              description="Nhãn được model dự đoán nhiều nhất"
              type="default"
            />

            <StatCard
              title="Confidence thấp"
              value={summary.low_confidence_count ?? 0}
              description="Các kết quả nên kiểm tra lại"
              type="danger"
            />

            <StatCard
              title="Confidence trung bình"
              value={summary.medium_confidence_count ?? 0}
              description="Kết quả có độ chắc chắn vừa phải"
              type="warning"
            />

            <StatCard
              title="Confidence cao"
              value={summary.high_confidence_count ?? 0}
              description="Kết quả tương đối ổn định"
              type="success"
            />
          </section>

          <div className="dashboard-layout">
            <section className="card">
              <div className="section-header">
                <div>
                  <h2>Phân bố dự đoán theo nhãn</h2>
                  <p>Số lần mỗi nhãn được model dự đoán trong lịch sử.</p>
                </div>
              </div>

              {labelStats.length === 0 ? (
                <div className="empty-chart">
                  Chưa có dữ liệu nhãn. Hãy phân loại một vài tiêu đề trước.
                </div>
              ) : (
                <div className="bar-list">
                  {labelStats.map((item) => {
                    const width = Math.round(
                      (Number(item.count || 0) / maxLabelCount) * 100
                    );

                    return (
                      <div className="bar-item" key={item.label_id}>
                        <div className="bar-row">
                          <div>
                            <strong>
                              {normalizeLabelName(item.label_name)}
                            </strong>
                            <div className="muted-small">
                              Label ID: {item.label_id}
                            </div>
                          </div>

                          <span className="bar-count">{item.count}</span>
                        </div>

                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="card">
              <div className="section-header">
                <div>
                  <h2>Phân bố mức tin cậy</h2>
                  <p>Thống kê số lượng kết quả theo confidence level.</p>
                </div>
              </div>

              {!confidenceStats ? (
                <div className="empty-chart">Chưa có dữ liệu confidence.</div>
              ) : (
                <div className="confidence-chart">
                  {confidenceItems.map((item) => {
                    const width = Math.round(
                      (Number(item.count || 0) / maxConfidenceCount) * 100
                    );

                    return (
                      <div className="confidence-chart-item" key={item.key}>
                        <div className="bar-row">
                          <strong>{item.label}</strong>
                          <span className="bar-count">{item.count}</span>
                        </div>

                        <div className="progress-track">
                          <div
                            className={`progress-fill ${item.className}`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;