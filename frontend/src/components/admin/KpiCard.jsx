export function KpiCard({ label, value, hint, large = false }) {
  return (
    <div className="card kpi">
      <div className="kpi-label mono muted">{label}</div>
      <div className="kpi-value" style={{ fontSize: large ? 40 : 30 }}>{value}</div>
      {hint != null && <div className="kpi-hint">{hint}</div>}
    </div>
  );
}
