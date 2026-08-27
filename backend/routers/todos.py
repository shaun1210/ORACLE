from fastapi import APIRouter
from models import TodoItem
from utils.database import load_data, save_data

router = APIRouter(prefix="/todos", tags=["Todos"])

@router.get("")
def get_todos():
    return load_data().get("todos", [])

@router.post("")
def add_todo(item: TodoItem):
    data = load_data()
    data["todos"].append(item.model_dump())
    save_data(data)
    return {"status": "success", "item": item}

@router.delete("/{item_id}")
def delete_todo(item_id: str):
    data = load_data()
    data["todos"] = [item for item in data["todos"] if item["id"] != item_id]
    save_data(data)
    return {"status": "success"}

@router.put("/{item_id}")
def update_todo(item_id: str):
    data = load_data()
    for item in data["todos"]:
        if item["id"] == item_id:
            item["completed"] = not item.get("completed", False)
            break
    save_data(data)
    return {"status": "success"}
