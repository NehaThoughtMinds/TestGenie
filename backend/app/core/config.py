from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "TestGenie AI"
    OPEN_API_KEY: str
    ALLOWED_ORIGINS: list[str] = ["*"]
    MAX_TOKENS: int = 4096
    MODEL: str = "gpt-4o-mini"

    class Config:
        env_file = ".env"

settings = Settings()