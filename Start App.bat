@echo off
echo Starting development server...

start cmd /k npm run dev

timeout /t 5 >nul

start http://localhost:5173
