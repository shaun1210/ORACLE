from fastapi import APIRouter
from models import HabitItem
from utils.database import load_data, save_data

router = APIRouter(prefix="/habits", tags=["Habits"])

@router.get("")
def get_habits():
    return load_data().get("habits", [])

@router.post("")
def add_habit(item: HabitItem):
    data = load_data()
    data["habits"].append(item.model_dump())
    save_data(data)
    return {"status": "success", "item": item}

@router.delete("/{item_id}")
def delete_habit(item_id: str):
    data = load_data()
    data["habits"] = [item for item in data["habits"] if item["id"] != item_id]
    save_data(data)
    return {"status": "success"}

@router.put("/{item_id}/toggle/{day_index}")
def toggle_habit_day(item_id: str, day_index: int):
    data = load_data()
    for item in data["habits"]:
        if item["id"] == item_id:
            days = item.get("completed_days", [])
            if day_index in days:
                days.remove(day_index)
            else:
                days.append(day_index)
            item["completed_days"] = days
            item["streak"] = len(days) # simplified streak
            break
    save_data(data)
    return {"status": "success"}
