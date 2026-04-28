import { useEffect, useMemo, useState } from "react";
import { getLabels } from "../api/classifierApi";
import { getLabelDescription } from "../utils/labelDescriptions";
import { normalizeLabelName } from "../utils/format";

function LabelsPage() {
  const [labels, setLabels] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [selectedLabel, setSelectedLabel] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadLabels() {
    setLoading(true);
    setError("");

    try {
      const data = await getLabels();
      setLabels(data.labels || []);
    } catch (error) {
      setError(error.message || "Không thể tải danh sách nhãn.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLabels();
  }, []);

  const filteredLabels = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return labels.filter((label) => {
      const meta = getLabelDescription(label.label_id);

      const labelId = String(label.label_id);
      const labelName = String(label.label_name || "").toLowerCase();
      const description = String(meta.description || "").toLowerCase();
      const examples = String(meta.examples || "").toLowerCase();

      return (
        !search ||
        labelId.includes(search) ||
        labelName.includes(search) ||
        description.includes(search) ||
        examples.includes(search)
      );
    });
  }, [labels, keyword]);

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <h2>Danh sách nhãn</h2>
          <p>
            Tra cứu các nhãn mà model đang sử dụng để phân loại tiêu đề tin tức
            tiếng Việt.
          </p>
        </div>

        <button className="secondary-button" onClick={loadLabels}>
          Tải lại
        </button>
      </div>

      <section className="card labels-filter-card">
        <label>
          Tìm kiếm nhãn
          <input
            type="text"
            placeholder="Tìm theo tên nhãn, ID, mô tả hoặc ví dụ..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </label>

        <div className="history-summary">
          <span>Tổng số nhãn: {labels.length}</span>
          <span>Đang hiển thị: {filteredLabels.length}</span>
        </div>
      </section>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <section className="card loading-card">
          <div className="spinner" />
          <span>Đang tải danh sách nhãn...</span>
        </section>
      )}

      {!loading && filteredLabels.length === 0 && (
        <section className="card empty-card">
          <h3>Không tìm thấy nhãn phù hợp</h3>
          <p>Hãy thử thay đổi từ khóa tìm kiếm.</p>
        </section>
      )}

      {!loading && filteredLabels.length > 0 && (
        <div className="labels-layout">
          <section className="labels-grid">
            {filteredLabels.map((label) => {
              const meta = getLabelDescription(label.label_id);
              const active = selectedLabel?.label_id === label.label_id;

              return (
                <button
                  key={label.label_id}
                  className={active ? "label-card label-card-active" : "label-card"}
                  onClick={() => setSelectedLabel(label)}
                >
                  <div className="label-card-top">
                    <span className="label-id">ID {label.label_id}</span>
                    <span className="label-name">
                      {normalizeLabelName(label.label_name)}
                    </span>
                  </div>

                  <p>{meta.description}</p>

                  <div className="label-examples">
                    <span>Ví dụ:</span> {meta.examples}
                  </div>
                </button>
              );
            })}
          </section>

          <section className="card label-detail-card">
            {selectedLabel ? (
              <LabelDetail label={selectedLabel} />
            ) : (
              <div className="label-empty-detail">
                <h3>Chọn một nhãn</h3>
                <p>
                  Click vào một nhãn bên trái để xem mô tả chi tiết và ví dụ
                  minh họa.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function LabelDetail({ label }) {
  const meta = getLabelDescription(label.label_id);

  return (
    <>
      <div className="section-header">
        <div>
          <h2>{normalizeLabelName(label.label_name)}</h2>
          <p>Thông tin chi tiết của nhãn được chọn.</p>
        </div>

        <span className="label-detail-id">ID {label.label_id}</span>
      </div>

      <div className="label-detail-content">
        <div className="detail-item detail-title">
          <span>Mô tả</span>
          <strong>{meta.description}</strong>
        </div>

        <div className="detail-item detail-title">
          <span>Ví dụ từ khóa / chủ đề</span>
          <strong>{meta.examples}</strong>
        </div>

        <div className="detail-item detail-title">
          <span>Cách dùng trong hệ thống</span>
          <strong>
            Nhãn này được dùng làm kết quả dự đoán cho API /predict và
            /predict-batch. Người dùng cũng có thể chọn nhãn này khi gửi
            feedback sửa nhãn.
          </strong>
        </div>
      </div>
    </>
  );
}

export default LabelsPage;