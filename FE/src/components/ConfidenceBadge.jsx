import { getConfidenceText } from "../utils/format";

function ConfidenceBadge({ level }) {
  const className = `confidence-badge confidence-${level || "unknown"}`;

  return <span className={className}>{getConfidenceText(level)}</span>;
}

export default ConfidenceBadge;