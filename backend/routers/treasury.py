from fastapi import APIRouter
from models import TreasuryItem
from utils.database import load_data, save_data

router = APIRouter(prefix="/treasury", tags=["Treasury"])

@router.get("")
def get_treasury():
    return load_data().get("treasury", [])

@router.post("")
def add_treasury_item(item: TreasuryItem):
    data = load_data()
    if "treasury" not in data: data["treasury"] = []
    data["treasury"].append(item.model_dump())
    save_data(data)
    return {"status": "success", "item": item}

@router.delete("/{item_id}")
def delete_treasury_item(item_id: str):
    data = load_data()
    data["treasury"] = [item for item in data.get("treasury", []) if item["id"] != item_id]
    save_data(data)
    return {"status": "success"}
