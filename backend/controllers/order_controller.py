"""Person 4 (Checkout & Orders) — implement these. All stubs raise NotImplementedError → 501.

Use constants.TAX_RATE / FREE_SHIP_AT / FLAT_SHIP for totals math.
The `admin_update_status` method is shared with Person 5 and is implemented here.
"""
from typing import Any

from fastapi import HTTPException

from controllers.admin_controller import _log, _serialize_order
from models.order import Order


async def list_my_orders(user_id):
    raise NotImplementedError("Person 4: implement list_my_orders")


async def get_order(order_id, user):
    raise NotImplementedError("Person 4: implement get_order (owner OR admin)")


async def place_order(user, shipping_payload: dict, card_raw: str):
    raise NotImplementedError(
        "Person 4: implement place_order — strip card to {brand,last4,masked}, "
        "compute totals, decrement stock atomically, clear cart"
    )


# ---------------------------------------------------------------------------
# Admin status transition (state machine: Processing → Shipped → Delivered)
# ---------------------------------------------------------------------------

_NEXT_STATUS = {
    "Processing": "Shipped",
    "Shipped": "Delivered",
}


async def admin_update_status(order_id, new_status: str, actor=None) -> dict[str, Any]:
    if new_status not in ("Processing", "Shipped", "Delivered"):
        raise HTTPException(status_code=400, detail="Invalid status")

    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    expected_next = _NEXT_STATUS.get(order.status)
    if order.status == new_status:
        return _serialize_order(order)
    if expected_next != new_status:
        raise HTTPException(
            status_code=400,
            detail=f"Illegal transition: {order.status} → {new_status}",
        )

    old = order.status
    order.status = new_status
    await order.save()
    await _log(
        actor.id if actor else None,
        "order.status_changed",
        f"Order {order.id}: {old} → {new_status}",
    )
    return _serialize_order(order)
