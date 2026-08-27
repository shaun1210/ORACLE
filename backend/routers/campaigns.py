from fastapi import APIRouter
from models import CampaignItem, CampaignSubtask
from utils.database import load_data, save_data

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.get("")
def get_campaigns():
    return load_data().get("campaigns", [])

@router.post("")
def add_campaign(item: CampaignItem):
    data = load_data()
    if "campaigns" not in data: data["campaigns"] = []
    data["campaigns"].append(item.model_dump())
    save_data(data)
    return {"status": "success", "item": item}

@router.delete("/{item_id}")
def delete_campaign(item_id: str):
    data = load_data()
    data["campaigns"] = [item for item in data.get("campaigns", []) if item["id"] != item_id]
    save_data(data)
    return {"status": "success"}

@router.put("/{item_id}/subtask/{subtask_index}")
def toggle_campaign_subtask(item_id: str, subtask_index: int):
    data = load_data()
    for item in data.get("campaigns", []):
        if item["id"] == item_id:
            subtasks = item.get("subtasks", [])
            if 0 <= subtask_index < len(subtasks):
                subtasks[subtask_index]["completed"] = not subtasks[subtask_index].get("completed", False)
                
                # Recalculate progress
                completed_count = sum(1 for st in subtasks if st.get("completed", False))
                item["progress"] = int((completed_count / len(subtasks)) * 100) if subtasks else 0
            break
    save_data(data)
    return {"status": "success"}

@router.post("/{item_id}/subtask")
def add_campaign_subtask(item_id: str, subtask: CampaignSubtask):
    data = load_data()
    for item in data.get("campaigns", []):
        if item["id"] == item_id:
            subtasks = item.get("subtasks", [])
            subtasks.append(subtask.model_dump())
            item["subtasks"] = subtasks
            
            # Recalculate progress
            completed_count = sum(1 for st in subtasks if st.get("completed", False))
            item["progress"] = int((completed_count / len(subtasks)) * 100) if subtasks else 0
            break
    save_data(data)
    return {"status": "success"}

@router.delete("/{item_id}/subtask/{subtask_index}")
def delete_campaign_subtask(item_id: str, subtask_index: int):
    data = load_data()
    for item in data.get("campaigns", []):
        if item["id"] == item_id:
            subtasks = item.get("subtasks", [])
            if 0 <= subtask_index < len(subtasks):
                subtasks.pop(subtask_index)
                item["subtasks"] = subtasks
                
                # Recalculate progress
                completed_count = sum(1 for st in subtasks if st.get("completed", False))
                item["progress"] = int((completed_count / len(subtasks)) * 100) if subtasks else 0
            break
    save_data(data)
    return {"status": "success"}
