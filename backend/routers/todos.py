from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List

from database import get_db
from models import TodoItem as TodoItemModel
from repositories import TodoRepository

router = APIRouter(prefix="/todos", tags=["Todos"])

class TodoItemCreate(BaseModel):
    id: str
    title: str
    completed: bool = False

class TodoItemUpdate(BaseModel):
    completed: bool

class TodoItemResponse(BaseModel):
    id: str
    title: str
    completed: bool

    class Config:
        from_attributes = True


@router.get("", response_model=List[TodoItemResponse])
async def get_todos(db: AsyncSession = Depends(get_db)):
    repo = TodoRepository(db)
    items = await repo.get_all()
    return items


@router.post("", response_model=TodoItemResponse)
async def add_todo(item: TodoItemCreate, db: AsyncSession = Depends(get_db)):
    repo = TodoRepository(db)
    db_item = TodoItemModel(**item.model_dump())
    created = await repo.create(db_item)
    return created


@router.delete("/{item_id}")
async def delete_todo(item_id: str, db: AsyncSession = Depends(get_db)):
    repo = TodoRepository(db)
    success = await repo.delete(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"status": "success"}


@router.put("/{item_id}", response_model=TodoItemResponse)
async def update_todo(item_id: str, db: AsyncSession = Depends(get_db)):
    repo = TodoRepository(db)
    item = await repo.toggle_completed(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
