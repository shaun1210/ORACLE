import os
import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from google import genai
from schemas import ChatMessage

from database import get_db
from repositories import (
    ScheduleRepository, TodoRepository, HabitRepository,
    TreasuryRepository, CampaignRepository, RavenRepository
)

router = APIRouter(tags=["AI"])


async def get_realm_data(db: AsyncSession = Depends(get_db)):
    """Fetch all realm data for AI analysis."""
    schedule_repo = ScheduleRepository(db)
    todo_repo = TodoRepository(db)
    habit_repo = HabitRepository(db)
    treasury_repo = TreasuryRepository(db)
    campaign_repo = CampaignRepository(db)
    raven_repo = RavenRepository(db)
    
    schedule = await schedule_repo.get_all()
    todos = await todo_repo.get_all()
    habits = await habit_repo.get_all()
    treasury = await treasury_repo.get_all()
    campaigns = await campaign_repo.get_all()
    ravens = await raven_repo.get_all()
    
    import json as json_lib
    def habit_to_dict(h):
        return {
            "id": h.id,
            "title": h.title,
            "streak": h.streak,
            "completed_days": json_lib.loads(h.completed_days) if h.completed_days else []
        }
    
    def campaign_to_dict(c):
        return {
            "id": c.id,
            "title": c.title,
            "progress": c.progress,
            "subtasks": [{"id": s.id, "title": s.title, "completed": s.completed} for s in c.subtasks]
        }
    
    return {
        "schedule": [{"id": s.id, "title": s.title, "date": s.date, "time": s.time, "duration": s.duration, "is_busy": s.is_busy} for s in schedule],
        "todos": [{"id": t.id, "title": t.title, "completed": t.completed} for t in todos],
        "habits": [habit_to_dict(h) for h in habits],
        "treasury": [{"id": tr.id, "title": tr.title, "amount": tr.amount, "type": tr.type, "is_recurring": tr.is_recurring} for tr in treasury],
        "campaigns": [campaign_to_dict(c) for c in campaigns],
        "ravens": [{"id": r.id, "message": r.message, "dispatch_time": r.dispatch_time} for r in ravens],
    }


@router.get("/analyze")
async def analyze_schedule(db: AsyncSession = Depends(get_db)):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"suggestion": "Please set GEMINI_API_KEY in backend/.env to get AI suggestions.", "status": "warning"}
    
    data = await get_realm_data(db)
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
async def generate_archive_report(db: AsyncSession = Depends(get_db)):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"report": "The royal archives are sealed. Set GEMINI_API_KEY in backend/.env.", "status": "warning"}
    
    data = await get_realm_data(db)
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
async def chat_with_maester(msg: ChatMessage, db: AsyncSession = Depends(get_db)):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"reply": "The Maester is unavailable. Set GEMINI_API_KEY in backend/.env.", "status": "warning"}
    
    data = await get_realm_data(db)
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
