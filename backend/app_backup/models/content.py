from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class Content(Base):
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    title = Column(String(255), nullable=False)

    platform = Column(
        String(50),
        nullable=False
    )

    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    saves = Column(Integer, default=0)

    watch_time = Column(Float, default=0)

    reach = Column(Integer, default=0)

    engagement_rate = Column(
        Float,
        default=0
    )

    published_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )