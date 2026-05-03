from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from beanie import Document
from pydantic import Field


class ActivityLog(Document):
    id: Optional[str] = Field(default_factory=lambda: str(uuid4()), alias="_id")
    at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user_id: str | None = None
    action: str
    detail: str = ""

    class Settings:
        name = "activity_logs"
