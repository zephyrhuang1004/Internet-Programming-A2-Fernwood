import { Link, useParams } from "react-router-dom";
import { I } from "../components/Icons";

export default function OrderConfirmPage() {
  const { id } = useParams();
  return (
    <div className="page narrow" style={{ textAlign: "center", maxWidth: 640 }}>
      <div className="confirm-burst"><I.check /></div>
      <div className="mono muted">ORDER {id} · CONFIRMED</div>
      <h2 style={{ marginTop: 10, marginBottom: 10 }}>Thank you.<br />Your order is on its way.</h2>
      <div className="muted" style={{ maxWidth: 440, margin: "0 auto", fontSize: 14 }}>
        We've sent a receipt to your email. Your furniture will be hand-packed and shipped within 5–7 days.
      </div>
      <div className="row" style={{ justifyContent: "center", gap: 10, marginTop: 24 }}>
        <Link className="btn ghost" to={`/orders/${id}`}>View order details</Link>
        <Link className="btn clay" to="/products">Continue shopping <I.arrow /></Link>
      </div>
    </div>
  );
}
