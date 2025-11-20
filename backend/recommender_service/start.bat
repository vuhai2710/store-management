@echo off
echo Starting Python Recommender Service...
echo.
echo Make sure you have installed dependencies first:
echo   pip install -r requirements.txt
echo.
python -m uvicorn app:app --reload --port 5000
pause

