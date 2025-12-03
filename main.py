import subprocess
import os
import time
import signal
import sys

def start_microservices():
    """Start both the Spring Boot backend and React frontend"""
    
    # Start Spring Boot backend
    print("Starting Spring Boot backend on port 8080...")
    backend_process = subprocess.Popen(
        ["java", "-jar", "backend/target/piuproject-1.0.0.jar"],
        cwd="/home/runner/workspace",
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )
    
    # Give backend time to start
    print("Waiting for backend to initialize...")
    time.sleep(8)
    
    # Start React frontend
    print("Starting React frontend on port 5000...")
    frontend_process = subprocess.Popen(
        ["npx", "vite", "--host", "0.0.0.0", "--port", "5000"],
        cwd="/home/runner/workspace",
        stdout=sys.stdout,
        stderr=sys.stderr
    )
    
    def signal_handler(sig, frame):
        print("\nShutting down services...")
        frontend_process.terminate()
        backend_process.terminate()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Wait for frontend to finish
    try:
        frontend_process.wait()
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    start_microservices()
