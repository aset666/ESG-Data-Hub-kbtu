from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://esg_user:esg_password@db:5432/esg_data_hub"
    secret_key: str = "change-me-in-production-please-use-a-long-random-string"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours
    cors_origins: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
