from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List

from database import get_db
from models import RavenItem as RavenItemModel
from repositories import RavenRepository

router = APIRouter(prefix="/ravens", tags=["Ravens"])

class RavenItemCreate(BaseModel):
    id: str
    message: str
    dispatch_time: str

class RavenItemResponse(BaseModel):
    id: str
    message: str
    dispatch_time: str

    class Config:
        from_attributes = True


@router.get("", response_model=List[RavenItemResponse])
async def get_ravens(db: AsyncSession = Depends(get_db)):
    repo = RavenRepository(db)
    items = await repo.get_all()
    return items


@router.post("", response_model=RavenItemResponse)
async def add_raven(item: RavenItemCreate, db: AsyncSession = Depends(get_db)):
    repo = RavenRepository(db)
    db_item = RavenItemModel(**item.model_dump())
    created = await repo.create(db_item)
    return created


@router.delete("/{item_id}")
async def delete_raven(item_id: str, db: AsyncSession = Depends(get_db)):
    repo = RavenRepository(db)
    success = await repo.delete(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"status": "success"}
