"""Person 3 (Cart) — implement these. All currently raise NotImplementedError → HTTP 501."""


async def get_cart(user_id):
    raise NotImplementedError("Person 3: implement get_cart")


async def add_item(user_id, product_id, qty: int):
    raise NotImplementedError("Person 3: implement add_item (merge qty if line exists)")


async def update_qty(user_id, product_id, qty: int):
    raise NotImplementedError("Person 3: implement update_qty (qty<=0 removes line)")


async def remove_item(user_id, product_id):
    raise NotImplementedError("Person 3: implement remove_item")


async def clear(user_id):
    raise NotImplementedError("Person 3: implement clear (empty items array)")
