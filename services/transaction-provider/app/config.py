"""Environment-based configuration for transaction provider."""

import os
from enum import Enum
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class ProviderType(str, Enum):
    """Available transaction provider implementations."""

    PRO_SPORTS = "pro_sports"
    FIXTURE = "fixture"
    DISABLED = "disabled"


class Settings(BaseSettings):
    """Application configuration."""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    # Environment
    env: str = os.getenv("ENV", "development")
    debug: bool = env == "development"

    # Provider selection
    transaction_provider: ProviderType = ProviderType(
        os.getenv("TRANSACTION_PROVIDER", "fixture")
    )

    # Pro Sports Transactions provider settings
    unflare_service_url: str | None = os.getenv("UNFLARE_SERVICE_URL")
    unflare_timeout_ms: int = int(os.getenv("UNFLARE_TIMEOUT_MS", "60000"))

    # Provider timeout (maximum time to wait for transaction lookup)
    provider_timeout_seconds: int = int(os.getenv("PROVIDER_TIMEOUT_SECONDS", "30"))

    # Fixture data location
    fixture_data_path: str = os.getenv(
        "FIXTURE_DATA_PATH", "/Users/hadenhiles/Repos/PuckTree/data/fixtures"
    )


# Global settings instance
settings = Settings()
