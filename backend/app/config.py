from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://scrollar:scrollar@localhost:5432/scrollar"
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://scrollar:scrollar@localhost:5432/scrollar"

    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Auth
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 1 week

    # OpenRouter
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_MODEL: str = "anthropic/claude-sonnet-4-5"
    OPENROUTER_SITE_URL: str = "http://localhost:3000"
    OPENROUTER_SITE_NAME: str = "ScrollAr"

    # arXiv
    ARXIV_CATEGORIES: str = "cs.AI,cs.LG,cs.CV,stat.ML,cs.CL"
    ARXIV_FETCH_LIMIT: int = 100
    ARXIV_INGEST_INTERVAL_HOURS: int = 6

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Firebase
    FIREBASE_CREDENTIALS_JSON: str = ""  # entire service-account JSON as a single env var string

    # Admin
    ADMIN_EMAIL: str = ""  # email of the superuser account

    # Email (SMTP) — for password resets and error alerts
    SMTP_HOST: str = "smtp.zoho.in"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""        # Gmail address used to send
    SMTP_PASSWORD: str = ""    # Gmail App Password
    ALERT_EMAIL: str = ""      # where crash alerts are sent (your personal email)

    # App
    DEBUG: bool = False
    APP_VERSION: str = "0.1.0"

    @property
    def sync_db_url(self) -> str:
        # Render gives postgres:// but psycopg2 needs postgresql://
        url = self.DATABASE_URL_SYNC or self.DATABASE_URL
        url = url.replace("postgresql+asyncpg://", "postgresql://")
        url = url.replace("postgres://", "postgresql://")
        return url

    @property
    def arxiv_categories_list(self) -> list[str]:
        return [c.strip() for c in self.ARXIV_CATEGORIES.split(",")]

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
