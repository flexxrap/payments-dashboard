from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class Act(Base):
    __tablename__ = "acts"

    id = Column(Integer, primary_key=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False, unique=True)
    is_sent = Column(Boolean, default=False, nullable=False)
    sent_at = Column(DateTime)
    is_signed = Column(Boolean, default=False, nullable=False)
    signed_at = Column(DateTime)
    status = Column(String, default="not_sent", nullable=False)
    manager_comment = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payment = relationship("Payment", back_populates="act")
