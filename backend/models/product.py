from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from beanie import Document
from pydantic import Field


class Product(Document):
    id: Optional[str] = Field(default_factory=lambda: str(uuid4()), alias="_id")
    name: str
    category: str
    material: str
    price: int
    stock: int = 0
    reserved_stock: int = 0
    img: str = ""
    tagline: str = ""
    palette: str = "Sand"
    version: int = 0
    deleted_at: datetime | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "products"
