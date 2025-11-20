from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings
import os

# Get DATABASE_URL from environment or settings
database_url = os.getenv("DATABASE_URL") or settings.DATABASE_URL

# Ensure we have a valid DATABASE_URL
if not database_url or database_url.strip() == "":
    raise ValueError(
        "DATABASE_URL environment variable is not set or is empty. "
        "Please set it in Railway dashboard: Variables → DATABASE_URL"
    )

# Convert postgresql:// to postgresql+asyncpg:// for async support
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)

# Create async engine
engine = create_async_engine(
    database_url,
    echo=settings.DEBUG
)

# Create async session
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Dependency to get database session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
