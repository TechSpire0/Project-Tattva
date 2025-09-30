# backend/app/models/edna.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base  # use your Base import

class EdnaSequence(Base):
    __tablename__ = "edna_sequences"

    id = Column(Integer, primary_key=True, index=True)
    header = Column(Text, nullable=False)
    sequence = Column(Text, nullable=False)
    metadata = Column(JSONB, default={})

    # workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=True)
    # uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    # uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
