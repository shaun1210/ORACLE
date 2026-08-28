from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from models import CampaignItem as CampaignItemModel, CampaignSubtask as CampaignSubtaskModel
from repositories import CampaignRepository

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

class CampaignSubtaskCreate(BaseModel):
    title: str
    completed: bool = False

class CampaignSubtaskResponse(BaseModel):
    id: str
    title: str
    completed: bool

    class Config:
        from_attributes = True

class CampaignItemCreate(BaseModel):
    id: str
    title: str
    progress: int = 0
    subtasks: List[CampaignSubtaskCreate] = []

class CampaignItemResponse(BaseModel):
    id: str
    title: str
    progress: int
    subtasks: List[CampaignSubtaskResponse] = []

    class Config:
        from_attributes = True


def campaign_to_response(campaign: CampaignItemModel) -> CampaignItemResponse:
    return CampaignItemResponse(
        id=campaign.id,
        title=campaign.title,
        progress=campaign.progress,
        subtasks=[
            CampaignSubtaskResponse(id=s.id, title=s.title, completed=s.completed)
            for s in campaign.subtasks
        ]
    )


@router.get("", response_model=List[CampaignItemResponse])
async def get_campaigns(db: AsyncSession = Depends(get_db)):
    repo = CampaignRepository(db)
    items = await repo.get_all()
    return [campaign_to_response(c) for c in items]


@router.post("", response_model=CampaignItemResponse)
async def add_campaign(item: CampaignItemCreate, db: AsyncSession = Depends(get_db)):
    repo = CampaignRepository(db)
    db_item = CampaignItemModel(id=item.id, title=item.title, progress=item.progress)
    created = await repo.create(db_item)
    
    for subtask_data in item.subtasks:
        subtask = CampaignSubtaskModel(title=subtask_data.title, completed=subtask_data.completed)
        await repo.add_subtask(created.id, subtask)
    
    # Refresh to get subtasks
    updated = await repo.get_by_id(created.id)
    return campaign_to_response(updated)


@router.delete("/{item_id}")
async def delete_campaign(item_id: str, db: AsyncSession = Depends(get_db)):
    repo = CampaignRepository(db)
    success = await repo.delete(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"status": "success"}


@router.put("/{item_id}/subtask/{subtask_index}", response_model=CampaignItemResponse)
async def toggle_campaign_subtask(item_id: str, subtask_index: int, db: AsyncSession = Depends(get_db)):
    repo = CampaignRepository(db)
    campaign = await repo.get_by_id(item_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if 0 <= subtask_index < len(campaign.subtasks):
        subtask = campaign.subtasks[subtask_index]
        subtask.completed = not subtask.completed
        await repo.update_subtask(subtask)
        
        # Recalculate progress
        completed_count = sum(1 for st in campaign.subtasks if st.completed)
        campaign.progress = int((completed_count / len(campaign.subtasks)) * 100) if campaign.subtasks else 0
        await repo.update(campaign)
    
    updated = await repo.get_by_id(item_id)
    return campaign_to_response(updated)


@router.post("/{item_id}/subtask", response_model=CampaignItemResponse)
async def add_campaign_subtask(item_id: str, subtask: CampaignSubtaskCreate, db: AsyncSession = Depends(get_db)):
    repo = CampaignRepository(db)
    campaign = await repo.get_by_id(item_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    new_subtask = CampaignSubtaskModel(title=subtask.title, completed=subtask.completed)
    await repo.add_subtask(item_id, new_subtask)
    
    # Recalculate progress
    completed_count = sum(1 for st in campaign.subtasks if st.completed)
    campaign.progress = int((completed_count / len(campaign.subtasks)) * 100) if campaign.subtasks else 0
    await repo.update(campaign)
    
    updated = await repo.get_by_id(item_id)
    return campaign_to_response(updated)


@router.delete("/{item_id}/subtask/{subtask_index}", response_model=CampaignItemResponse)
async def delete_campaign_subtask(item_id: str, subtask_index: int, db: AsyncSession = Depends(get_db)):
    repo = CampaignRepository(db)
    campaign = await repo.get_by_id(item_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if 0 <= subtask_index < len(campaign.subtasks):
        subtask = campaign.subtasks[subtask_index]
        await repo.delete_subtask(subtask.id)
        
        # Recalculate progress
        completed_count = sum(1 for st in campaign.subtasks if st.completed)
        campaign.progress = int((completed_count / len(campaign.subtasks)) * 100) if campaign.subtasks else 0
        await repo.update(campaign)
    
    updated = await repo.get_by_id(item_id)
    return campaign_to_response(updated)
