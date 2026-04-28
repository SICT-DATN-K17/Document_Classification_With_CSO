const API_BASE_URL = "http://127.0.0.1:8000";

async function handleResponse(response, defaultMessage) {
  if (!response.ok) {
    let errorMessage = defaultMessage;

    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // Nếu response không phải JSON thì giữ message mặc định
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export async function predictTitle(title) {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    throw new Error("Không thể phân loại tiêu đề.");
  }

  return res.json();
}

export async function predictBatch(titles) {
  const res = await fetch(`${API_BASE_URL}/predict-batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ titles }),
  });

  if (!res.ok) {
    throw new Error("Không thể phân loại hàng loạt.");
  }

  return res.json();
}

export async function getLabels() {
  const res = await fetch(`${API_BASE_URL}/labels`);
  return res.json();
}

export async function getHistory(limit = 100, offset = 0) {
  const response = await fetch(
    `${API_BASE_URL}/history?limit=${limit}&offset=${offset}`
  );

  return handleResponse(response, "Không thể tải lịch sử phân loại.");
}

export async function deleteHistoryItem(historyId) {
  const response = await fetch(`${API_BASE_URL}/history/${historyId}`, {
    method: "DELETE",
  });

  return handleResponse(response, "Không thể xóa lịch sử.");
}

export async function sendFeedback(data) {
  const res = await fetch(`${API_BASE_URL}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function getStatsSummary() {
  const res = await fetch(`${API_BASE_URL}/stats/summary`);
  return res.json();
}

export async function getLabelStats() {
  const res = await fetch(`${API_BASE_URL}/stats/labels`);
  return res.json();
}

export async function getConfidenceStats() {
  const res = await fetch(`${API_BASE_URL}/stats/confidence`);
  return res.json();
}

export async function getModelInfo() {
  const res = await fetch(`${API_BASE_URL}/model-info`);
  return res.json();
}

export async function getHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}

export async function getFeedbackList(limit = 100, offset = 0) {
  const response = await fetch(
    `${API_BASE_URL}/feedback?limit=${limit}&offset=${offset}`
  );

  return handleResponse(response, "Không thể tải danh sách feedback.");
}

export async function getModelInfo() {
  const response = await fetch(`${API_BASE_URL}/model-info`);
  return handleResponse(response, "Không thể tải thông tin model.");
}