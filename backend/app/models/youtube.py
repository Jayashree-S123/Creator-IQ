from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class YouTubeConnection(Base):
    __tablename__ = "youtube_connections"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    channel_id = Column(String(100), nullable=False)
    channel_title = Column(String(255), nullable=True)

    access_token = Column(String(2048), nullable=False)
    refresh_token = Column(String(2048), nullable=True)
    token_type = Column(String(50), default="Bearer")

    expires_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )