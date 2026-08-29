from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from models import FoodEntry as FoodEntryModel, FitnessGoal as FitnessGoalModel
from repositories import FoodEntryRepository, FitnessGoalRepository

router = APIRouter(prefix="/fitness", tags=["Fitness"])


class FoodEntryCreate(BaseModel):
    id: str
    name: str
    calories: float
    protein: float = 0
    carbs: float = 0
    date: str
    meal_type: str = "other"


class FoodEntryResponse(BaseModel):
    id: str
    name: str
    calories: float
    protein: float
    carbs: float
    date: str
    meal_type: str

    class Config:
        from_attributes = True


class FitnessGoalCreate(BaseModel):
    daily_calories: float
    daily_protein: float = 150
    daily_carbs: float = 250


class FitnessGoalResponse(BaseModel):
    id: str
    daily_calories: float
    daily_protein: float
    daily_carbs: float

    class Config:
        from_attributes = True


@router.get("/entries", response_model=List[FoodEntryResponse])
async def get_food_entries(date: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    repo = FoodEntryRepository(db)
    if date:
        items = await repo.get_by_date(date)
    else:
        items = await repo.get_all()
    return items


@router.post("/entries", response_model=FoodEntryResponse)
async def add_food_entry(item: FoodEntryCreate, db: AsyncSession = Depends(get_db)):
    repo = FoodEntryRepository(db)
    db_item = FoodEntryModel(**item.model_dump())
    created = await repo.create(db_item)
    return created


@router.delete("/entries/{item_id}")
async def delete_food_entry(item_id: str, db: AsyncSession = Depends(get_db)):
    repo = FoodEntryRepository(db)
    success = await repo.delete(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Food entry not found")
    return {"status": "success"}


@router.get("/goals", response_model=Optional[FitnessGoalResponse])
async def get_fitness_goal(db: AsyncSession = Depends(get_db)):
    repo = FitnessGoalRepository(db)
    goal = await repo.get_current()
    return goal


@router.post("/goals", response_model=FitnessGoalResponse)
async def set_fitness_goal(item: FitnessGoalCreate, db: AsyncSession = Depends(get_db)):
    repo = FitnessGoalRepository(db)
    db_item = FitnessGoalModel(**item.model_dump())
    created = await repo.create(db_item)
    return created


@router.put("/goals", response_model=FitnessGoalResponse)
async def update_fitness_goal(item: FitnessGoalCreate, db: AsyncSession = Depends(get_db)):
    repo = FitnessGoalRepository(db)
    current = await repo.get_current()
    if current:
        current.daily_calories = item.daily_calories
        current.daily_protein = item.daily_protein
        current.daily_carbs = item.daily_carbs
        updated = await repo.update(current)
        return updated
    else:
        db_item = FitnessGoalModel(**item.model_dump())
        created = await repo.create(db_item)
        return created
