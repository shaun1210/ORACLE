from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import json

from models import (
    ScheduleItem, TodoItem, HabitItem, TreasuryItem,
    CampaignItem, CampaignSubtask, RavenItem,
    FoodEntry, FitnessGoal
)


class ScheduleRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> List[ScheduleItem]:
        result = await self.session.execute(select(ScheduleItem))
        return result.scalars().all()

    async def create(self, item: ScheduleItem) -> ScheduleItem:
        self.session.add(item)
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def delete(self, item_id: str) -> bool:
        result = await self.session.execute(
            delete(ScheduleItem).where(ScheduleItem.id == item_id)
        )
        await self.session.commit()
        return result.rowcount > 0


class TodoRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> List[TodoItem]:
        result = await self.session.execute(select(TodoItem))
        return result.scalars().all()

    async def create(self, item: TodoItem) -> TodoItem:
        self.session.add(item)
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def delete(self, item_id: str) -> bool:
        result = await self.session.execute(
            delete(TodoItem).where(TodoItem.id == item_id)
        )
        await self.session.commit()
        return result.rowcount > 0

    async def toggle_completed(self, item_id: str) -> Optional[TodoItem]:
        result = await self.session.execute(select(TodoItem).where(TodoItem.id == item_id))
        item = result.scalar_one_or_none()
        if item:
            item.completed = not item.completed
            await self.session.commit()
            await self.session.refresh(item)
        return item


class HabitRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> List[HabitItem]:
        result = await self.session.execute(select(HabitItem))
        return result.scalars().all()

    async def get_by_id(self, habit_id: str) -> Optional[HabitItem]:
        result = await self.session.execute(select(HabitItem).where(HabitItem.id == habit_id))
        return result.scalar_one_or_none()

    async def create(self, item: HabitItem) -> HabitItem:
        self.session.add(item)
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def update(self, item: HabitItem) -> HabitItem:
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def delete(self, item_id: str) -> bool:
        result = await self.session.execute(
            delete(HabitItem).where(HabitItem.id == item_id)
        )
        await self.session.commit()
        return result.rowcount > 0


class TreasuryRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> List[TreasuryItem]:
        result = await self.session.execute(select(TreasuryItem))
        return result.scalars().all()

    async def create(self, item: TreasuryItem) -> TreasuryItem:
        self.session.add(item)
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def delete(self, item_id: str) -> bool:
        result = await self.session.execute(
            delete(TreasuryItem).where(TreasuryItem.id == item_id)
        )
        await self.session.commit()
        return result.rowcount > 0


class CampaignRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> List[CampaignItem]:
        result = await self.session.execute(select(CampaignItem))
        return result.scalars().all()

    async def get_by_id(self, campaign_id: str) -> Optional[CampaignItem]:
        result = await self.session.execute(
            select(CampaignItem).where(CampaignItem.id == campaign_id)
        )
        return result.scalar_one_or_none()

    async def create(self, item: CampaignItem) -> CampaignItem:
        self.session.add(item)
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def update(self, item: CampaignItem) -> CampaignItem:
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def delete(self, item_id: str) -> bool:
        result = await self.session.execute(
            delete(CampaignItem).where(CampaignItem.id == item_id)
        )
        await self.session.commit()
        return result.rowcount > 0

    async def add_subtask(self, campaign_id: str, subtask: CampaignSubtask) -> CampaignSubtask:
        subtask.campaign_id = campaign_id
        self.session.add(subtask)
        await self.session.commit()
        await self.session.refresh(subtask)
        return subtask

    async def update_subtask(self, subtask: CampaignSubtask) -> CampaignSubtask:
        await self.session.commit()
        await self.session.refresh(subtask)
        return subtask

    async def delete_subtask(self, subtask_id: str) -> bool:
        result = await self.session.execute(
            delete(CampaignSubtask).where(CampaignSubtask.id == subtask_id)
        )
        await self.session.commit()
        return result.rowcount > 0


class RavenRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> List[RavenItem]:
        result = await self.session.execute(select(RavenItem))
        return result.scalars().all()

    async def create(self, item: RavenItem) -> RavenItem:
        self.session.add(item)
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def delete(self, item_id: str) -> bool:
        result = await self.session.execute(
            delete(RavenItem).where(RavenItem.id == item_id)
        )
        await self.session.commit()
        return result.rowcount > 0


class FoodEntryRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> List[FoodEntry]:
        result = await self.session.execute(select(FoodEntry))
        return result.scalars().all()

    async def get_by_date(self, date: str) -> List[FoodEntry]:
        result = await self.session.execute(
            select(FoodEntry).where(FoodEntry.date == date)
        )
        return result.scalars().all()

    async def create(self, item: FoodEntry) -> FoodEntry:
        self.session.add(item)
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def delete(self, item_id: str) -> bool:
        result = await self.session.execute(
            delete(FoodEntry).where(FoodEntry.id == item_id)
        )
        await self.session.commit()
        return result.rowcount > 0


class FitnessGoalRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_current(self) -> Optional[FitnessGoal]:
        result = await self.session.execute(select(FitnessGoal).order_by(FitnessGoal.created_at.desc()))
        return result.scalars().first()

    async def create(self, item: FitnessGoal) -> FitnessGoal:
        self.session.add(item)
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def update(self, item: FitnessGoal) -> FitnessGoal:
        await self.session.commit()
        await self.session.refresh(item)
        return item