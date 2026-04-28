function WarningBox({ message }) {
  if (!message) return null;

  return (
    <div className="warning-box">
      <strong>⚠️ Cảnh báo:</strong>
      <span>{message}</span>
    </div>
  );
}

export default WarningBox;