"""Person 5 (Admin) — implement these. All raise NotImplementedError → HTTP 501."""


async def kpi_dashboard():
    raise NotImplementedError("Person 5: implement kpi_dashboard (today orders, week revenue, low stock, active users)")


async def list_users(query: str | None):
    raise NotImplementedError("Person 5: implement list_users")


async def update_user_role(user_id, role: str):
    raise NotImplementedError("Person 5: implement update_user_role (admin/customer)")


async def delete_user(user_id):
    raise NotImplementedError("Person 5: implement delete_user (cascade carts; cannot delete admins)")


async def list_orders(filters: dict):
    raise NotImplementedError("Person 5: implement list_orders (status/date filters)")


async def list_activity(filters: dict):
    raise NotImplementedError("Person 5: implement list_activity")


async def analytics_overview():
    raise NotImplementedError("Person 5: implement analytics_overview (30-day revenue, by status, by category, by country)")
