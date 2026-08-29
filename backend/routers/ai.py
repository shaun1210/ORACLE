import os
import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from google import genai
from schemas import ChatMessage

from database import get_db
from repositories import (
    ScheduleRepository, TodoRepository, HabitRepository,
    TreasuryRepository, CampaignRepository, RavenRepository,
    FoodEntryRepository, FitnessGoalRepository
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
    
    food_repo = FoodEntryRepository(db)
    goal_repo = FitnessGoalRepository(db)
    food_entries = await food_repo.get_all()
    fitness_goal = await goal_repo.get_current()
    
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
        "fitness": {
            "goal": {"daily_calories": fitness_goal.daily_calories, "daily_protein": fitness_goal.daily_protein, "daily_carbs": fitness_goal.daily_carbs} if fitness_goal else None,
            "recent_entries": [{"name": f.name, "calories": f.calories, "protein": f.protein, "carbs": f.carbs, "date": f.date, "meal_type": f.meal_type} for f in food_entries[-30:]],
        },
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
        "You have access to the ruler's entire realm data (schedule, todos, habits, treasury, campaigns, ravens, and nutrition/fitness). "
        "Use this data to give personalized advice, answer questions about their realm, help them plan, and advise on their diet and fitness. "
        "Keep responses concise (2-4 sentences) unless asked for detail. "
        f"\n\nCurrent Realm Data:\n{realm_context}"
    )
    
    client = genai.Client(api_key=api_key)
    
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


@router.get("/habit-plan")
async def generate_habit_plan(db: AsyncSession = Depends(get_db)):
    """Generate a smart habit execution plan based on current habits and schedule."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"plan": "Set GEMINI_API_KEY in backend/.env for smart habit plans.", "status": "warning"}
    
    data = await get_realm_data(db)
    context = json.dumps(data, indent=2)
    
    client = genai.Client(api_key=api_key)
    
    prompt = (
        "You are the Royal Maester, an AI habit coach in a Medieval Monarchy planner app. "
        f"Here is the ruler's realm data:\n{context}\n\n"
        "Analyze their habits (called 'Alliances & Fealties'), completed_days, streaks, and schedule. "
        "Generate a SMART WEEKLY HABIT EXECUTION PLAN. For each habit, provide:\n"
        "1. A specific day/time recommendation to practice it based on their schedule gaps\n"
        "2. A streak-building strategy (start small, build up)\n"
        "3. A motivational medieval-themed encouragement\n\n"
        "Format your response as a JSON array of objects with keys: habit, recommendation, strategy, motivation. "
        "Return ONLY the JSON array, no markdown fences."
    )
    
    generation_config = {
        'temperature': 0.8,
        'max_output_tokens': 65536,
        'top_p': 0.9,
        'thinking_level': 'high',
    }
    
    try:
        interaction = client.interactions.create(
            model='models/gemini-3-flash-preview',
            input=prompt,
            generation_config=generation_config,
        )
        raw = interaction.output_text.strip()
        # Try to parse as JSON
        try:
            plan = json.loads(raw)
            return {"plan": plan, "status": "success"}
        except json.JSONDecodeError:
            # If not valid JSON, return as text
            return {"plan": raw, "status": "success"}
    except Exception as e:
        return {"plan": f"The Maester's scrolls are scattered. Error: {str(e)}", "status": "error"}


@router.get("/treasury-insights")
async def generate_treasury_insights(db: AsyncSession = Depends(get_db)):
    """Analyze treasury data and provide financial insights."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"insights": "Set GEMINI_API_KEY in backend/.env for treasury insights.", "status": "warning"}
    
    data = await get_realm_data(db)
    treasury_str = json.dumps(data["treasury"], indent=2)
    
    client = genai.Client(api_key=api_key)
    
    prompt = (
        "You are the Royal Treasurer in a Medieval Monarchy planner app. "
        f"Here is the realm's treasury ledger:\n{treasury_str}\n\n"
        "Analyze the income and expenses. Provide:\n"
        "1. A brief financial summary (2 sentences)\n"
        "2. Top 3 spending categories\n"
        "3. One actionable savings suggestion\n"
        "4. Monthly burn rate estimate\n\n"
        "Format as JSON with keys: summary, topSpending, suggestion, burnRate. "
        "Return ONLY the JSON, no markdown fences."
    )
    
    generation_config = {
        'temperature': 0.7,
        'max_output_tokens': 65536,
        'top_p': 0.9,
    }
    
    try:
        interaction = client.interactions.create(
            model='models/gemini-3-flash-preview',
            input=prompt,
            generation_config=generation_config,
        )
        raw = interaction.output_text.strip()
        try:
            insights = json.loads(raw)
            return {"insights": insights, "status": "success"}
        except json.JSONDecodeError:
            return {"insights": raw, "status": "success"}
    except Exception as e:
        return {"insights": f"The treasury scrolls are lost. Error: {str(e)}", "status": "error"}
