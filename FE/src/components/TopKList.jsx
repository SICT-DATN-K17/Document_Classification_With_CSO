import { formatPercent, normalizeLabelName } from "../utils/format";

function TopKList({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Top 3 nhãn gần nhất</h2>
          <p>Các nhãn có xác suất cao nhất theo model.</p>
        </div>
      </div>

      <div className="topk-list">
        {items.map((item) => {
          const percent = Math.round(item.confidence * 100);

          return (
            <div className="topk-item" key={item.label_id}>
              <div className="topk-row">
                <span className="topk-label">
                  {normalizeLabelName(item.label_name)}
                </span>
                <span className="topk-percent">
                  {formatPercent(item.confidence)}
                </span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TopKList;