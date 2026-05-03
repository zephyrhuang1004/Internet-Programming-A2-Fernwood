"""Person 4 (Checkout & Orders) — implement these. All raise NotImplementedError → HTTP 501.

Use constants.TAX_RATE / FREE_SHIP_AT / FLAT_SHIP for totals math.
"""


async def list_my_orders(user_id):
    raise NotImplementedError("Person 4: implement list_my_orders")


async def get_order(order_id, user):
    raise NotImplementedError("Person 4: implement get_order (owner OR admin)")


async def place_order(user, shipping_payload: dict, card_raw: str):
    raise NotImplementedError(
        "Person 4: implement place_order — strip card to {brand,last4,masked}, "
        "compute totals, decrement stock atomically, clear cart"
    )


async def admin_update_status(order_id, new_status: str):
    raise NotImplementedError("Person 4 / 5: implement admin_update_status (Processing→Shipped→Delivered)")
