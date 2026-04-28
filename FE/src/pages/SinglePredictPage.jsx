import { useEffect, useState } from "react";
import { getLabels, predictTitle } from "../api/classifierApi";
import ResultCard from "../components/ResultCard";
import TopKList from "../components/TopKList";
import FeedbackBox from "../components/FeedbackBox";

function SinglePredictPage() {
  const [title, setTitle] = useState("");
  const [result, setResult] = useState(null);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [labelsLoading, setLabelsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLabels() {
      setLabelsLoading(true);

      try {
        const data = await getLabels();
        setLabels(data.labels || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLabelsLoading(false);
      }
    }

    loadLabels();
  }, []);

  async function handlePredict() {
    const cleanedTitle = title.trim();

    if (!cleanedTitle) {
      setError("Vui lòng nhập tiêu đề cần phân loại.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await predictTitle(cleanedTitle);
      setResult(data);
    } catch (error) {
      setError(error.message || "Có lỗi xảy ra khi phân loại.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handlePredict();
    }
  }

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <h2>Phân loại tiêu đề tin tức</h2>
          <p>
            Nhập một tiêu đề tiếng Việt để hệ thống dự đoán chuyên mục phù hợp.
          </p>
        </div>
      </div>

      <section className="card input-card">
        <label htmlFor="title-input">Tiêu đề cần phân loại</label>

        <textarea
          id="title-input"
          rows="4"
          placeholder="Ví dụ: giao thông tắc nghẽn tại hà nội"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="input-footer">
          <span>{title.trim().length} ký tự</span>

          <button
            className="primary-button"
            onClick={handlePredict}
            disabled={loading || !title.trim()}
          >
            {loading ? "Đang phân loại..." : "Phân loại"}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </section>

      {loading && (
        <section className="card loading-card">
          <div className="spinner" />
          <span>Đang gửi tiêu đề đến backend và chờ model dự đoán...</span>
        </section>
      )}

      {result && (
        <div className="result-layout">
          <div className="result-left">
            <ResultCard result={result} />
          </div>

          <div className="result-right">
            <TopKList items={result.top_k} />
          </div>
        </div>
      )}

      {result && (
        <FeedbackBox
          result={result}
          labels={labels}
          labelsLoading={labelsLoading}
        />
      )}
    </div>
  );
}

export default SinglePredictPage;