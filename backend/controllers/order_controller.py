"""Person 4 (Checkout & Orders) — implement these. All raise NotImplementedError → HTTP 501.

Use constants.TAX_RATE / FREE_SHIP_AT / FLAT_SHIP for totals math.
"""
from datetime import datetime, timezone
from fastapi import HTTPException
from pymongo import ReturnDocument

from models.order import Order, OrderItem, ShippingAddress, Payment
from models.cart import Cart
from models.product import Product
import constants #for TAX_RATE, FREE_SHIP_AT, FLAT_SHIP

STATUS_FLOW = ["Processing", "Shipped", "Delivered"]


async def list_my_orders(user_id: str):
    orders = await Order.find(Order.user_id == user_id).to_list()
    return orders


async def get_order(order_id, user):
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != str(user.id) and user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return order


async def place_order(user, shipping_payload: dict, card_raw: str):
    # 1. Strip card - never store raw PAN
    digits = card_raw.replace(" ", "")
    last4 = digits[-4:]
    masked = "•••• •••• •••• " + last4
    if digits.startswith("4"):
        brand = "Visa"
    elif digits.startswith("5"):
        brand = "Mastercard"
    else:
        brand = "Amex"
    payment = Payment(brand=brand, last4=last4, masked=masked)

    # 2. Get user's cart
    cart = await Cart.get(str(user.id))
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # 3. Build order items + compute subtotal
    order_items = []
    subtotal = 0
    for cart_item in cart.items:
        product = await Product.get(cart_item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {cart_item.product_id} not found")
        order_items.append(OrderItem(
            product_id=cart_item.product_id,
            qty=cart_item.qty,
            unit_price=product.price,
        ))
        subtotal += product.price * cart_item.qty

    # 4. Compute totals
    tax = round(subtotal * constants.TAX_RATE)
    shipping_fee = 0 if subtotal >= constants.FREE_SHIP_AT else constants.FLAT_SHIP
    total = subtotal + tax + shipping_fee

    # 5. Atomically decrement stock — roll back on failure
    decremented = []
    try:
        for item in order_items:
            result = await Product.get_motor_collection().find_one_and_update(
                {"_id": item.product_id, "stock": {"$gte": item.qty}},
                {"$inc": {"stock": -item.qty}},
                return_document=ReturnDocument.AFTER,
            )
            if result is None:
                raise HTTPException(status_code=409, detail=f"Insufficient stock for product {item.product_id}")
            decremented.append(item)
    except HTTPException:
        # Roll back any already-decremented stock
        for d in decremented:
            await Product.get_motor_collection().update_one(
                {"_id": d.product_id},
                {"$inc": {"stock": d.qty}},
            )
        raise

    # 6. Build shipping address
    shipping = ShippingAddress(**shipping_payload)

    # 7. Create and save order
    order = Order(
        user_id=str(user.id),
        items=order_items,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        tax=tax,
        total=total,
        status="Processing",
        placed_at=datetime.now(timezone.utc),
        shipping=shipping,
        payment=payment,
    )
    await order.insert()

    # 8. Clear the cart
    cart.items = []
    cart.updated_at = datetime.now(timezone.utc)
    await cart.save()

    return {"_id": str(order.id)}


async def admin_update_status(order_id: str, new_status: str):
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    current_index = STATUS_FLOW.index(order.status) if order.status in STATUS_FLOW else -1
    new_index = STATUS_FLOW.index(new_status) if new_status in STATUS_FLOW else -1

    if new_index == -1:
        raise HTTPException(status_code=400, detail=f"Invalid status: {new_status}")
    if new_index != current_index + 1:
        raise HTTPException(status_code=400, detail=f"Invalid transition: {order.status} → {new_status}")

    order.status = new_status
    await order.save()
    return order