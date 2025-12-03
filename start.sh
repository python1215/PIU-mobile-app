#!/bin/bash

# Start the Spring Boot backend in the background
echo "Starting Spring Boot backend..."
cd /home/runner/workspace/backend
java -jar target/piuproject-1.0.0.jar &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend to start on port 8080..."
sleep 10

# Start the React frontend
echo "Starting React frontend..."
cd /home/runner/workspace
npx vite --host 0.0.0.0 --port 5000

# Cleanup
kill $BACKEND_PID 2>/dev/null
