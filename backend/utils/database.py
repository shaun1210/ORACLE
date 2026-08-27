import os
import json

DATA_FILE = "data.json"

def load_data():
    if not os.path.exists(DATA_FILE):
        default_data = {
            "schedule": [], 
            "todos": [], 
            "habits": [],
            "treasury": [],
            "campaigns": [],
            "ravens": []
        }
        save_data(default_data)
        return default_data
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)
