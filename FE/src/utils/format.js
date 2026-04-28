export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "0%";
  }

  return `${Math.round(Number(value) * 100)}%`;
}

export function formatNumber(value, digits = 4) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  return Number(value).toFixed(digits);
}

export function getConfidenceText(level) {
  const map = {
    high: "Cao",
    medium: "Trung bình",
    low: "Thấp",
    uncertain: "Dễ nhầm",
  };

  return map[level] || "Không xác định";
}

export function normalizeLabelName(labelName) {
  if (!labelName) return "";

  return labelName.charAt(0).toUpperCase() + labelName.slice(1);
}