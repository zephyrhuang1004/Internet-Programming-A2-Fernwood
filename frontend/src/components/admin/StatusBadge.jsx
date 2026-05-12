const COLOR = {
  Processing: "amber",
  Shipped: "clay",
  Delivered: "moss",
};

export function StatusBadge({ status }) {
  return <span className={`badge ${COLOR[status] || ""}`}>{status}</span>;
}
