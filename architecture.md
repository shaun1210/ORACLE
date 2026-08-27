# AI Day Planner Architecture

## Overview
This application is an AI-driven day planner that allows users to input their weekly schedule, learn from repetitive patterns, suggest task shifting based on availability, and track habits and to-dos.

## Technology Stack
- **Frontend**: React.js (built with Vite), providing a responsive, dynamic UI for the calendar, habit tracker, and to-do list.
- **Backend**: FastAPI (Python), providing a high-performance RESTful API.
- **Data Storage**: JSON files for lightweight, serverless data persistence.
- **AI Agent**: LangChain with Gemini integrations to analyze schedule patterns, propose task shifting, and generate notifications.

## System Components

### 1. Frontend (React.js)
- **Calendar View**: Displays the weekly and daily schedule.
- **Task Management**: Interface for managing to-dos.
- **Habit Tracker**: Interface for logging and tracking daily habits.
- **Notification Center**: Displays alerts and suggestions from the AI agent (e.g., suggesting a task shift).

### 2. Backend (FastAPI)
- **Schedule Endpoints**: CRUD operations for schedule entries.
- **To-Do & Habit Endpoints**: CRUD operations for to-dos and habits.
- **AI Agent Integration**: API routes that trigger LangChain to analyze the current data and return suggestions.
- **Storage Service**: Reads/writes JSON files (e.g., `schedule.json`, `todos.json`, `habits.json`).

### 3. AI Agent (LangChain)
- **Pattern Recognition**: Analyzes historical schedule data to identify repetitive tasks.
- **Task Shifting**: Looks at current schedule load and suggests moving uncompleted tasks to free slots.
- **User Approval Flow**: The agent's suggestions are sent to the frontend for user approval before modifying the data.

## Data Flow
1. **User Input**: User adds a week's schedule via React frontend.
2. **API Request**: Frontend sends data to FastAPI backend.
3. **Data Persistence**: Backend saves the data to a JSON file.
4. **AI Analysis**: Periodically or on-demand, FastAPI sends schedule data to the LangChain agent.
5. **Smart Suggestions**: The LangChain agent processes the data and returns suggestions (e.g., "Shift Task A to Thursday at 3 PM").
6. **Notification**: Suggestions are returned to the frontend.
7. **Approval**: User approves the suggestion, which triggers an update API call to apply the change in the JSON store.
