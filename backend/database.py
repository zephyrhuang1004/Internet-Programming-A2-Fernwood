import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from config import settings
from models.user import User
from models.refresh_token import RefreshToken
from models.product import Product
from models.cart import Cart
from models.order import Order
from models.activity_log import ActivityLog


_client: AsyncIOMotorClient | None = None


async def init_db() -> None:
    global _client
    _client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=10_000,
    )
    db = _client[settings.DB_NAME]
    await init_beanie(
        database=db,
        document_models=[User, RefreshToken, Product, Cart, Order, ActivityLog],
    )


async def close_db() -> None:
    global _client
    if _client:
        _client.close()
        _client = None
