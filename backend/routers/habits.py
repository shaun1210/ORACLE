from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List
import json

from database import get_db
from models import HabitItem as HabitItemModel
from repositories import HabitRepository

router = APIRouter(prefix="/habits", tags=["Habits"])

class HabitItemCreate(BaseModel):
    id: str
    title: str
    streak: int = 0
    completed_days: List[int] = []

class HabitItemResponse(BaseModel):
    id: str
    title: str
    streak: int
    completed_days: List[int]

    class Config:
        from_attributes = True


def habit_to_response(habit: HabitItemModel) -> HabitItemResponse:
    return HabitItemResponse(
        id=habit.id,
        title=habit.title,
        streak=habit.streak,
        completed_days=json.loads(habit.completed_days) if habit.completed_days else []
    )


@router.get("", response_model=List[HabitItemResponse])
async def get_habits(db: AsyncSession = Depends(get_db)):
    repo = HabitRepository(db)
    items = await repo.get_all()
    return [habit_to_response(h) for h in items]


@router.post("", response_model=HabitItemResponse)
async def add_habit(item: HabitItemCreate, db: AsyncSession = Depends(get_db)):
    repo = HabitRepository(db)
    db_item = HabitItemModel(
        id=item.id,
        title=item.title,
        streak=item.streak,
        completed_days=json.dumps(item.completed_days)
    )
    created = await repo.create(db_item)
    return habit_to_response(created)


@router.delete("/{item_id}")
async def delete_habit(item_id: str, db: AsyncSession = Depends(get_db)):
    repo = HabitRepository(db)
    success = await repo.delete(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"status": "success"}


@router.put("/{item_id}/toggle/{day_index}", response_model=HabitItemResponse)
async def toggle_habit_day(item_id: str, day_index: int, db: AsyncSession = Depends(get_db)):
    repo = HabitRepository(db)
    result = await repo.get_by_id(item_id) if hasattr(repo, 'get_by_id') else None
    
    # Get the habit directly
    from sqlalchemy import select
    result = await db.execute(select(HabitItemModel).where(HabitItemModel.id == item_id))
    habit = result.scalar_one_or_none()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    days = json.loads(habit.completed_days) if habit.completed_days else []
    if day_index in days:
        days.remove(day_index)
    else:
        days.append(day_index)
    
    habit.completed_days = json.dumps(days)
    habit.streak = len(days)
    updated = await repo.update(habit)
    return habit_to_response(updated)
