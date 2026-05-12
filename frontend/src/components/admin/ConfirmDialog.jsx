import { Modal } from "./Modal";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onCancel}>
      <h3 style={{ fontFamily: "var(--f-display)", fontSize: 24 }}>{title}</h3>
      {message && <p className="muted" style={{ fontSize: 14, marginTop: 10, lineHeight: 1.5 }}>{message}</p>}
      <div className="row" style={{ justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
        <button type="button" className="btn ghost" onClick={onCancel}>{cancelLabel}</button>
        <button
          type="button"
          className={`btn ${destructive ? "danger" : "clay"}`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
