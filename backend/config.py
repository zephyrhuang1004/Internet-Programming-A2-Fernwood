from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    MONGODB_URI: str
    DB_NAME: str = "fernwood"
    JWT_SECRET: str
    JWT_ALG: str = "HS256"
    ACCESS_TTL_MIN: int = 30
    REFRESH_TTL_DAYS: int = 30
    ENV: str = "dev"
    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
