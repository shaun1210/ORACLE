import os
import json
from fastapi import APIRouter
from google import genai
from models import ChatMessage
from utils.database import load_data

router = APIRouter(tags=["AI"])

@router.get("/analyze")
def analyze_schedule():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"suggestion": "Please set GEMINI_API_KEY in backend/.env to get AI suggestions.", "status": "warning"}
    
    data = load_data()
    schedule_str = json.dumps(data["schedule"], indent=2)
    
    client = genai.Client(api_key=api_key)
    
    prompt = (
        "You are an AI day planner agent. Analyze the following weekly schedule and identify any repetitive patterns or very busy days. "
        "Suggest shifting 1 or 2 tasks to free slots if appropriate to balance the workload. "
        f"Schedule data:\n{schedule_str}\n\n"
        "Provide a short, actionable suggestion in one paragraph."
    )
    
    generation_config = {
        'temperature': 1,
        'max_output_tokens': 65536,
        'top_p': 0.95,
        'thinking_level': 'high',
    }
    
    try:
        interaction = client.interactions.create(
            model='models/gemini-3-flash-preview',
            input=prompt,
            generation_config=generation_config,
        )
        return {"suggestion": interaction.output_text, "status": "success"}
    except Exception as e:
        return {"suggestion": f"Error analyzing schedule: {str(e)}", "status": "error"}

@router.get("/archive-report")
def generate_archive_report():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"report": "The royal archives are sealed. Set GEMINI_API_KEY in backend/.env.", "status": "warning"}
    
    data = load_data()
    all_data_str = json.dumps(data, indent=2)
    
    client = genai.Client(api_key=api_key)
    
    prompt = (
        "You are the Royal Maester, an AI advisor for a Medieval Monarchy planner app. "
        f"Review the ruler's entire realm data (schedule, campaigns/todos, and alliances/habits):\n{all_data_str}\n\n"
        "Write a 2-paragraph 'historical chronicle' summarizing their reign. "
        "Speak in an immersive medieval, Game of Thrones style tone. "
        "Praise their discipline (habits), note their ongoing campaigns (todos), and advise them on their schedule."
    )
    
    generation_config = {
        'temperature': 1,
        'max_output_tokens': 65536,
        'top_p': 0.95,
        'thinking_level': 'high',
    }
    
    try:
        interaction = client.interactions.create(
            model='models/gemini-3-flash-preview',
            input=prompt,
            generation_config=generation_config,
        )
        return {"report": interaction.output_text, "status": "success"}
    except Exception as e:
        return {"report": f"The raven was shot down. Error: {str(e)}", "status": "error"}

@router.post("/chat")
def chat_with_maester(msg: ChatMessage):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"reply": "The Maester is unavailable. Set GEMINI_API_KEY in backend/.env.", "status": "warning"}
    
    data = load_data()
    realm_context = json.dumps(data, indent=2)
    
    system_prompt = (
        "You are the Royal Maester, the wise AI advisor of ORACLE — a Medieval Monarchy-themed productivity planner app. "
        "You speak in an immersive, Game of Thrones-inspired medieval tone. You address the user as 'Your Grace'. "
        "You have access to the ruler's entire realm data (schedule, todos, habits, treasury, campaigns, ravens). "
        "Use this data to give personalized advice, answer questions about their realm, and help them plan. "
        "Keep responses concise (2-4 sentences) unless asked for detail. "
        f"\n\nCurrent Realm Data:\n{realm_context}"
    )
    
    client = genai.Client(api_key=api_key)
    
    # We serialize the history manually as part of the input since interactions.create takes a single input string
    history_str = ""
    for entry in msg.history:
        if entry.get("role") in ["user", "assistant"]:
            role = "Your Grace" if entry.get("role") == "user" else "Maester"
            history_str += f"{role}: {entry['content']}\n"
    
    full_prompt = f"{system_prompt}\n\nConversation History:\n{history_str}\nYour Grace: {msg.message}\nMaester:"
    
    generation_config = {
        'temperature': 1,
        'max_output_tokens': 65536,
        'top_p': 0.95,
        'thinking_level': 'high',
    }
    
    try:
        interaction = client.interactions.create(
            model='models/gemini-3-flash-preview',
            input=full_prompt,
            generation_config=generation_config,
        )
        return {"reply": interaction.output_text, "status": "success"}
    except Exception as e:
        return {"reply": f"A raven was shot down mid-flight. Error: {str(e)}", "status": "error"}
