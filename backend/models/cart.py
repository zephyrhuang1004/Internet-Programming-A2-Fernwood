from datetime import datetime, timezone
from typing import Optional

from beanie import Document
from pydantic import BaseModel, Field


class CartItem(BaseModel):
    product_id: str
    qty: int


class Cart(Document):
    """Cart's _id IS the user_id — one cart per user."""
    id: Optional[str] = Field(default=None, alias="_id")
    items: list[CartItem] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "carts"
