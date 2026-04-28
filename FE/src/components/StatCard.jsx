function StatCard({ title, value, description, type = "default" }) {
  return (
    <div className={`stat-card stat-card-${type}`}>
      <div className="stat-card-title">{title}</div>
      <div className="stat-card-value">{value}</div>
      {description && <div className="stat-card-desc">{description}</div>}
    </div>
  );
}

export default StatCard;