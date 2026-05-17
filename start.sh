#!/bin/bash

echo "Starting Library App..."
echo ""

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL not found. Please install MySQL first."
    exit 1
fi

# Start backend in background
echo "🚀 Starting backend server..."
cd backend
bun run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
bun run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers running!"
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Handle cleanup
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM EXIT

# Wait for processes
wait
