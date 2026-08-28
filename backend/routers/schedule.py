from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List

from database import get_db
from models import ScheduleItem as ScheduleItemModel
from repositories import ScheduleRepository

router = APIRouter(prefix="/schedule", tags=["Schedule"])

class ScheduleItemCreate(BaseModel):
    id: str
    title: str
    date: str
    time: str
    duration: int
    is_busy: bool = False

class ScheduleItemResponse(BaseModel):
    id: str
    title: str
    date: str
    time: str
    duration: int
    is_busy: bool

    class Config:
        from_attributes = True


@router.get("", response_model=List[ScheduleItemResponse])
async def get_schedule(db: AsyncSession = Depends(get_db)):
    repo = ScheduleRepository(db)
    items = await repo.get_all()
    return items


@router.post("", response_model=ScheduleItemResponse)
async def add_schedule_item(item: ScheduleItemCreate, db: AsyncSession = Depends(get_db)):
    repo = ScheduleRepository(db)
    db_item = ScheduleItemModel(**item.model_dump())
    created = await repo.create(db_item)
    return created


@router.delete("/{item_id}")
async def delete_schedule_item(item_id: str, db: AsyncSession = Depends(get_db)):
    repo = ScheduleRepository(db)
    success = await repo.delete(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"status": "success"}
