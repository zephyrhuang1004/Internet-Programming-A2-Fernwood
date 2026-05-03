"""Idempotent demo seed script. Run from backend/ with venv: python seed.py"""
import asyncio
from datetime import datetime, timezone

from database import init_db, close_db
from controllers.auth_controller import hash_password
from models.user import User
from models.product import Product


SEED_PRODUCTS = [
    {"name": "Hollis Lounge Chair",   "category": "Seating", "price": 1280, "stock": 8,  "material": "Bouclé",     "img": "1555041469-a586c61ea9bc", "tagline": "Cloud-soft bouclé, low and wide.",         "palette": "Oat"},
    {"name": "Marlow Sofa 3-Seat",    "category": "Seating", "price": 3450, "stock": 3,  "material": "Linen",      "img": "1567016432779-094069958ea5", "tagline": "Deep seat, loose cushions, weekday naps.", "palette": "Clay"},
    {"name": "Aster Dining Table",    "category": "Tables",  "price": 2190, "stock": 5,  "material": "Solid oak",  "img": "1615529182904-14819c35db37", "tagline": "Seats six. Has one perfect dent already.", "palette": "Honey"},
    {"name": "Alder Bookshelf",       "category": "Storage", "price": 1180, "stock": 7,  "material": "Solid oak",  "img": "1594620302200-9a762244a156", "tagline": "Five shelves. Adjustable. Infinite books.","palette": "Honey"},
    {"name": "Poppy Pendant",         "category": "Lighting","price": 540,  "stock": 12, "material": "Brass",      "img": "1513506003901-1e6a229e2d15", "tagline": "A warm circle over the table.",            "palette": "Brass"},
    {"name": "Linden Bed Frame Queen","category": "Bedroom", "price": 2480, "stock": 4,  "material": "Solid oak",  "img": "1505693416388-ac5ce068fe85", "tagline": "Low platform, rounded corners.",           "palette": "Honey"},
    {"name": "Oat Wool Rug 200×300",  "category": "Rugs & Textiles", "price": 820, "stock": 11, "material": "Wool", "img": "1600607687939-ce8a6c25118c", "tagline": "Hand-loomed, barefoot-ready.",          "palette": "Oat"},
    {"name": "Field Throw",           "category": "Rugs & Textiles", "price": 180, "stock": 32, "material": "Wool", "img": "1586023492125-27b2c045efd7", "tagline": "Heavy, fringed, perfect on couches.",   "palette": "Moss"},
]


async def upsert_admin() -> None:
    if await User.find_one(User.email == "admin@fernwood.co"):
        print("admin already exists")
        return
    h, salt = hash_password("admin123")
    await User(name="Admin", email="admin@fernwood.co", role="admin",
               password_hash=h, password_salt=salt,
               joined_at=datetime.now(timezone.utc),
               updated_at=datetime.now(timezone.utc)).insert()
    print("admin created")


async def upsert_demo_customer() -> None:
    if await User.find_one(User.email == "ivy@example.com"):
        print("ivy already exists")
        return
    h, salt = hash_password("password")
    await User(name="Ivy Chen", email="ivy@example.com", role="customer",
               password_hash=h, password_salt=salt,
               joined_at=datetime.now(timezone.utc),
               updated_at=datetime.now(timezone.utc)).insert()
    print("customer ivy created")


async def upsert_products() -> None:
    for p in SEED_PRODUCTS:
        if await Product.find_one(Product.name == p["name"]):
            continue
        await Product(
            name=p["name"], category=p["category"], material=p["material"],
            price=p["price"], stock=p["stock"], reserved_stock=0,
            img=p["img"], tagline=p["tagline"], palette=p["palette"],
            version=1, deleted_at=None,
            created_at=datetime.now(timezone.utc),
        ).insert()
        print(f"product inserted: {p['name']}")


async def main() -> None:
    await init_db()
    try:
        await upsert_admin()
        await upsert_demo_customer()
        await upsert_products()
    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(main())
