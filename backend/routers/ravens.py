from fastapi import APIRouter
from models import RavenItem
from utils.database import load_data, save_data

router = APIRouter(prefix="/ravens", tags=["Ravens"])

@router.get("")
def get_ravens():
    return load_data().get("ravens", [])

@router.post("")
def add_raven(item: RavenItem):
    data = load_data()
    if "ravens" not in data: data["ravens"] = []
    data["ravens"].append(item.model_dump())
    save_data(data)
    return {"status": "success", "item": item}

@router.delete("/{item_id}")
def delete_raven(item_id: str):
    data = load_data()
    data["ravens"] = [item for item in data.get("ravens", []) if item["id"] != item_id]
    save_data(data)
    return {"status": "success"}
