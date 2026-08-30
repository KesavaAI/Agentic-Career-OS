@echo off
echo ===================================================
echo   Starting Agentic Career OS (ACOS)...
echo ===================================================
start cmd /k "cd backend && ..\.venv\Scripts\python.exe run.py"
start cmd /k "cd frontend && npm run dev"
echo Services starting! Backend: http://127.0.0.1:8000/docs | Frontend: http://localhost:5173
