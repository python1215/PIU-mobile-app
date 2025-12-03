#!/bin/bash

# PIU Microservices Startup Script
# Starts Spring Boot backend (port 8080) and React frontend (port 5000)

echo "=== PIU Microservices Startup ==="

# Kill any existing processes
pkill -f "piuproject-1.0.0.jar" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start Spring Boot backend
echo "Starting Spring Boot backend on port 8080..."
cd /home/runner/workspace/backend
java -jar target/piuproject-1.0.0.jar &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "Waiting for backend to initialize..."
sleep 15

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "ERROR: Backend failed to start"
    exit 1
fi

echo "Backend started successfully!"

# Start React frontend (this will block and keep the script running)
echo "Starting React frontend on port 5000..."
cd /home/runner/workspace
exec npx vite --host 0.0.0.0 --port 5000
