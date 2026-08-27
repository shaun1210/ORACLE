# ORACLE - Medieval Monarchy Productivity Planner

ORACLE is a productivity planner app themed around managing a medieval monarchy/dynasty. It includes a day planner/calendar, campaign management (milestones/subtasks), habit tracking (fealties/alliances), and a Royal Maester AI Chatbot that parses your realm data and offers dynamic suggestions in character.

## Project Structure
- `/backend`: FastAPI backend that exposes endpoints for schedule, todos, habits, campaigns, and AI features.
- `/frontend`: Vite + React + SCSS frontend with custom Game of Thrones-themed styling and ornate parchment designs.

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r ../requirements.txt
   ```
4. Configure environment variables:
   - Duplicate the `.env.example` file and rename it to `.env`.
   - Add your Gemini API key:
     ```env
     GEMINI_API_KEY="your-gemini-api-key-here"
     ```
5. Start the FastAPI development server:
   ```bash
   python main.py
   ```
   The backend will run on `http://127.0.0.1:8000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

---

## Git Conventions & Development Workflow
- **Ignore files**: The root `.gitignore` secures credentials (like `.env`), build files (`dist/`, `node_modules/`), Python caches, virtual environments (`venv/`), and local database files (`data.json`).
- **Data Persistence**: If `data.json` is missing, the backend automatically generates a clean template on startup.
- **Branches**: Please create a feature branch (`git checkout -b feature/your-feature-name`) before making any PRs.
