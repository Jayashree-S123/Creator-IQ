from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Growth(Base):
    __tablename__ = "growth"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    platform = Column(
        String(50),
        nullable=False
    )

    followers = Column(
        Integer,
        default=0
    )

    views = Column(
        Integer,
        default=0
    )

    engagement = Column(
        Integer,
        default=0
    )

    recorded_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
