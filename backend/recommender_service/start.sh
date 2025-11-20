#!/bin/bash
echo "Starting Python Recommender Service..."
echo ""
echo "Make sure you have installed dependencies first:"
echo "  pip install -r requirements.txt"
echo ""
python3 -m uvicorn app:app --reload --port 5000

