export function EmptyState({ icon, title, body }) {
  return (
    <div className="empty">
      {icon && <div className="art">{icon}</div>}
      <h3>{title}</h3>
      {body && <p>{body}</p>}
    </div>
  );
}
