from pydantic import BaseModel
from typing import List, Optional


class ScheduleItemBase(BaseModel):
    id: str
    title: str
    date: str
    time: str
    duration: int
    is_busy: bool = False


class ScheduleItemCreate(ScheduleItemBase):
    pass


class ScheduleItemResponse(ScheduleItemBase):
    class Config:
        from_attributes = True


class TodoItemBase(BaseModel):
    id: str
    title: str
    completed: bool = False


class TodoItemCreate(TodoItemBase):
    pass


class TodoItemUpdate(BaseModel):
    completed: bool


class TodoItemResponse(TodoItemBase):
    class Config:
        from_attributes = True


class HabitItemBase(BaseModel):
    id: str
    title: str
    streak: int = 0
    completed_days: List[int] = []


class HabitItemCreate(HabitItemBase):
    pass


class HabitItemResponse(HabitItemBase):
    class Config:
        from_attributes = True


class TreasuryItemBase(BaseModel):
    id: str
    title: str
    amount: float
    type: str
    is_recurring: bool = False


class TreasuryItemCreate(TreasuryItemBase):
    pass


class TreasuryItemResponse(TreasuryItemBase):
    class Config:
        from_attributes = True


class CampaignSubtaskBase(BaseModel):
    title: str
    completed: bool = False


class CampaignSubtaskCreate(CampaignSubtaskBase):
    pass


class CampaignSubtaskResponse(CampaignSubtaskBase):
    id: str

    class Config:
        from_attributes = True


class CampaignItemBase(BaseModel):
    id: str
    title: str
    progress: int = 0
    subtasks: List[CampaignSubtaskCreate] = []


class CampaignItemCreate(CampaignItemBase):
    pass


class CampaignItemResponse(CampaignItemBase):
    subtasks: List[CampaignSubtaskResponse] = []

    class Config:
        from_attributes = True


class RavenItemBase(BaseModel):
    id: str
    message: str
    dispatch_time: str


class RavenItemCreate(RavenItemBase):
    pass


class RavenItemResponse(RavenItemBase):
    class Config:
        from_attributes = True


class ChatMessage(BaseModel):
    message: str
    history: List[dict] = []