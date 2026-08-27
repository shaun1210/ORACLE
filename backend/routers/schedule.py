from fastapi import APIRouter
from models import ScheduleItem
from utils.database import load_data, save_data

router = APIRouter(prefix="/schedule", tags=["Schedule"])

@router.get("")
def get_schedule():
    return load_data().get("schedule", [])

@router.post("")
def add_schedule_item(item: ScheduleItem):
    data = load_data()
    data["schedule"].append(item.model_dump())
    save_data(data)
    return {"status": "success", "item": item}

@router.delete("/{item_id}")
def delete_schedule_item(item_id: str):
    data = load_data()
    data["schedule"] = [item for item in data["schedule"] if item["id"] != item_id]
    save_data(data)
    return {"status": "success"}
