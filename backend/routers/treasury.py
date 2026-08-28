from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List

from database import get_db
from models import TreasuryItem as TreasuryItemModel
from repositories import TreasuryRepository

router = APIRouter(prefix="/treasury", tags=["Treasury"])

class TreasuryItemCreate(BaseModel):
    id: str
    title: str
    amount: float
    type: str
    is_recurring: bool = False

class TreasuryItemResponse(BaseModel):
    id: str
    title: str
    amount: float
    type: str
    is_recurring: bool

    class Config:
        from_attributes = True


@router.get("", response_model=List[TreasuryItemResponse])
async def get_treasury(db: AsyncSession = Depends(get_db)):
    repo = TreasuryRepository(db)
    items = await repo.get_all()
    return items


@router.post("", response_model=TreasuryItemResponse)
async def add_treasury_item(item: TreasuryItemCreate, db: AsyncSession = Depends(get_db)):
    repo = TreasuryRepository(db)
    db_item = TreasuryItemModel(**item.model_dump())
    created = await repo.create(db_item)
    return created


@router.delete("/{item_id}")
async def delete_treasury_item(item_id: str, db: AsyncSession = Depends(get_db)):
    repo = TreasuryRepository(db)
    success = await repo.delete(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"status": "success"}
