from pydantic import BaseModel
from typing import List

class ScheduleItem(BaseModel):
    id: str
    title: str
    date: str
    time: str
    duration: int # minutes
    is_busy: bool = False

class TodoItem(BaseModel):
    id: str
    title: str
    completed: bool = False

class HabitItem(BaseModel):
    id: str
    title: str
    streak: int = 0
    completed_days: List[int] = []

class TreasuryItem(BaseModel):
    id: str
    title: str
    amount: float
    type: str # 'income' or 'expense'
    is_recurring: bool = False

class CampaignSubtask(BaseModel):
    title: str
    completed: bool = False

class CampaignItem(BaseModel):
    id: str
    title: str
    progress: int = 0
    subtasks: List[CampaignSubtask] = []

class RavenItem(BaseModel):
    id: str
    message: str
    dispatch_time: str # ISO string

class ChatMessage(BaseModel):
    message: str
    history: list = []
