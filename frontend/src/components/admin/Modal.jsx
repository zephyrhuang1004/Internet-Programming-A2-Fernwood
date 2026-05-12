import { useEffect } from "react";
import { I } from "../Icons";

export function Modal({ open, onClose, children, wide = false, title }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="row between" style={{ alignItems: "flex-start", marginBottom: 6 }}>
            <h3 style={{ fontFamily: "var(--f-display)", fontSize: 24 }}>{title}</h3>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><I.close /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
