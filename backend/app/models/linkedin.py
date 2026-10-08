from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database import Base


class LinkedInConnection(Base):
    __tablename__ = "linkedin_connections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)

    access_token = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=True)

    linkedin_member_id = Column(String, nullable=True)

    oauth_state = Column(String, nullable=True, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )