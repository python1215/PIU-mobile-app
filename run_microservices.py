#!/usr/bin/env python3
"""
Microservices Application Starter
Starts both the Spring Boot backend (port 8080) and React frontend (port 5000)
"""

import subprocess
import os
import time
import signal
import sys
import threading

backend_process = None
frontend_process = None

def stream_output(process, prefix):
    """Stream process output with a prefix"""
    for line in iter(process.stdout.readline, ''):
        if line:
            print(f"[{prefix}] {line.rstrip()}")

def start_backend():
    """Start the Spring Boot backend"""
    global backend_process
    
    jar_path = "/home/runner/workspace/backend/target/piuproject-1.0.0.jar"
    
    if not os.path.exists(jar_path):
        print("ERROR: Backend JAR not found. Please build with 'mvn clean package -DskipTests'")
        return None
    
    print("Starting Spring Boot backend on port 8080...")
    backend_process = subprocess.Popen(
        ["java", "-jar", jar_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    # Start thread to stream backend output
    threading.Thread(target=stream_output, args=(backend_process, "BACKEND"), daemon=True).start()
    
    return backend_process

def start_frontend():
    """Start the React frontend"""
    global frontend_process
    
    print("Starting React frontend on port 5000...")
    frontend_process = subprocess.Popen(
        ["npx", "vite", "--host", "0.0.0.0", "--port", "5000"],
        cwd="/home/runner/workspace",
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    # Start thread to stream frontend output
    threading.Thread(target=stream_output, args=(frontend_process, "FRONTEND"), daemon=True).start()
    
    return frontend_process

def cleanup(sig=None, frame=None):
    """Clean up processes on exit"""
    print("\nShutting down services...")
    
    if frontend_process:
        frontend_process.terminate()
        try:
            frontend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            frontend_process.kill()
    
    if backend_process:
        backend_process.terminate()
        try:
            backend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            backend_process.kill()
    
    sys.exit(0)

def main():
    """Main entry point"""
    # Set up signal handlers
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)
    
    # Start backend first
    backend = start_backend()
    if not backend:
        sys.exit(1)
    
    # Give backend time to initialize
    print("Waiting for backend to initialize (8 seconds)...")
    time.sleep(8)
    
    # Start frontend
    frontend = start_frontend()
    if not frontend:
        cleanup()
        sys.exit(1)
    
    print("\n" + "="*60)
    print("PIU Microservices Application Running")
    print("="*60)
    print("Frontend (React): http://0.0.0.0:5000")
    print("Backend (Spring Boot): http://localhost:8080")
    print("API Proxy: /api/* -> http://localhost:8080/api/*")
    print("="*60 + "\n")
    
    # Keep the main process running
    try:
        while True:
            # Check if processes are still running
            if backend_process.poll() is not None:
                print("Backend process exited unexpectedly!")
                cleanup()
            if frontend_process.poll() is not None:
                print("Frontend process exited unexpectedly!")
                cleanup()
            time.sleep(1)
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()
