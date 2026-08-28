from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

def gen_uuid():
    return str(uuid.uuid4())

class ScheduleItem(Base):
    __tablename__ = "schedule_items"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String, nullable=False)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    duration = Column(Integer, nullable=False)
    is_busy = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TodoItem(Base):
    __tablename__ = "todo_items"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class HabitItem(Base):
    __tablename__ = "habit_items"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String, nullable=False)
    streak = Column(Integer, default=0)
    completed_days = Column(Text, default="[]")  # JSON array as text
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TreasuryItem(Base):
    __tablename__ = "treasury_items"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # 'income' or 'expense'
    is_recurring = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CampaignItem(Base):
    __tablename__ = "campaign_items"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String, nullable=False)
    progress = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    subtasks = relationship("CampaignSubtask", back_populates="campaign", cascade="all, delete-orphan")

class CampaignSubtask(Base):
    __tablename__ = "campaign_subtasks"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    campaign_id = Column(String, ForeignKey("campaign_items.id"), nullable=False)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    campaign = relationship("CampaignItem", back_populates="subtasks")

class RavenItem(Base):
    __tablename__ = "raven_items"
    
    id = Column(String, primary_key=True, default=gen_uuid)
    message = Column(Text, nullable=False)
    dispatch_time = Column(String, nullable=False)  # ISO string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)