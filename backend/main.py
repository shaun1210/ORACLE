from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager

from routers import schedule, todos, habits, treasury, campaigns, ravens, ai, fitness
from database import init_db

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="ORACLE API", 
    description="Backend for ORACLE: The Medieval Monarchy Planner",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "ORACLE API"}

# Include routers
app.include_router(schedule.router)
app.include_router(todos.router)
app.include_router(habits.router)
app.include_router(treasury.router)
app.include_router(campaigns.router)
app.include_router(ravens.router)
app.include_router(ai.router)
app.include_router(fitness.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
