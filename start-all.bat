@echo off 
echo ======================================== 
echo Starting Venus Enterprises Services 
echo ======================================== 
echo. 
echo Starting Python Chatbot Service (Port 8000)... 
start cmd /k "cd python-chatbot && python main.py" 
 
echo Starting Python Recommendation Service (Port 8001)... 
start cmd /k "cd python-recommendation && python main.py" 
 
echo Starting Backend Server (Port 5000)... 
start cmd /k "cd backend && npm run dev" 
 
echo Starting Frontend Server (Port 5174)... 
start cmd /k "cd frontend && npm run dev" 
 
echo. 
echo ======================================== 
echo All services started! 
echo Frontend: http://localhost:5174 
echo Backend: http://localhost:5000 
echo Chatbot: http://localhost:8000 
echo Recommendation: http://localhost:8001 
echo ======================================== 
