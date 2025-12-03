"""
PIU Microservices Gateway
Flask application that serves React SPA and proxies API calls to Spring Boot backend
"""

import os
import subprocess
import time
import threading
import requests
import atexit
from flask import Flask, request, Response, send_from_directory
from werkzeug.middleware.proxy_fix import ProxyFix

# Configuration
BACKEND_URL = "http://localhost:8080"
BACKEND_JAR_PATH = "/home/runner/workspace/backend/target/piuproject-1.0.0.jar"
BACKEND_STARTUP_TIMEOUT = 60  # seconds

# Global process reference
backend_process = None
backend_ready = False

def stream_output(process, name):
    """Stream process output to console"""
    try:
        for line in iter(process.stdout.readline, ''):
            if line:
                print(f"[{name}] {line.rstrip()}")
    except:
        pass

def wait_for_backend():
    """Wait for backend to be ready"""
    global backend_ready
    
    for i in range(BACKEND_STARTUP_TIMEOUT):
        try:
            resp = requests.get(f"{BACKEND_URL}/", timeout=2)
            backend_ready = True
            print("[BACKEND] Ready and accepting connections!")
            return True
        except:
            if i % 10 == 0:
                print(f"[BACKEND] Waiting for startup... ({i}s)")
            time.sleep(1)
    
    print("[BACKEND] Startup timeout reached, but continuing...")
    return False

def start_backend():
    """Start the Spring Boot backend service"""
    global backend_process, backend_ready
    
    if not os.path.exists(BACKEND_JAR_PATH):
        print("[BACKEND] ERROR: JAR file not found at", BACKEND_JAR_PATH)
        return False
    
    # Check if already running
    try:
        resp = requests.get(f"{BACKEND_URL}/", timeout=2)
        print("[BACKEND] Already running!")
        backend_ready = True
        return True
    except:
        pass
    
    print("[BACKEND] Starting Spring Boot on port 8080...")
    backend_process = subprocess.Popen(
        ["java", "-jar", BACKEND_JAR_PATH],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    # Stream output in background thread
    thread = threading.Thread(target=stream_output, args=(backend_process, "BACKEND"), daemon=True)
    thread.start()
    
    return wait_for_backend()

def cleanup():
    """Cleanup backend process on shutdown"""
    global backend_process
    if backend_process:
        print("[BACKEND] Shutting down...")
        backend_process.terminate()
        try:
            backend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            backend_process.kill()

# Register cleanup handler
atexit.register(cleanup)

# Start backend EAGERLY at module load time (before Flask handles any requests)
print("=" * 60)
print("PIU Microservices Gateway Initializing...")
print("=" * 60)

if not start_backend():
    print("[WARNING] Backend may not be fully ready")

print("\n" + "=" * 60)
print("Gateway Initialized!")
print("  Main Gateway: http://0.0.0.0:5000")
print("  Backend API: http://localhost:8080")
print("  React SPA: Served from /dist folder")
print("=" * 60 + "\n")

# Create Flask app AFTER backend is started
app = Flask(__name__, static_folder='dist', static_url_path='')
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Proxy all /api/* requests to Spring Boot backend
@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
def proxy_api(path):
    """Proxy API requests to Spring Boot backend"""
    url = f"{BACKEND_URL}/api/{path}"
    
    try:
        resp = requests.request(
            method=request.method,
            url=url,
            headers={key: value for key, value in request.headers if key.lower() != 'host'},
            data=request.get_data(),
            cookies=request.cookies,
            allow_redirects=False,
            timeout=30,
            params=request.args
        )
        
        # Build response
        excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
        headers = [(name, value) for name, value in resp.raw.headers.items() if name.lower() not in excluded_headers]
        
        return Response(resp.content, resp.status_code, headers)
    
    except requests.exceptions.ConnectionError:
        return {"error": "Backend service unavailable", "message": "The API server is not responding"}, 503
    except requests.exceptions.Timeout:
        return {"error": "Request timeout", "message": "The API request timed out"}, 504

# Serve static assets
@app.route('/assets/<path:path>')
def serve_assets(path):
    """Serve static assets from dist/assets"""
    return send_from_directory('dist/assets', path)

# Health check endpoint
@app.route('/health')
def health():
    """Health check endpoint that validates backend readiness"""
    backend_status = "unknown"
    try:
        resp = requests.get(f"{BACKEND_URL}/", timeout=5)
        backend_status = "healthy"
    except:
        backend_status = "unhealthy"
    
    overall_status = "healthy" if backend_status == "healthy" else "degraded"
    
    return {
        "status": overall_status,
        "gateway": "healthy",
        "backend": backend_status,
        "backend_ready": backend_ready
    }

# Serve React SPA for all other routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_spa(path):
    """Serve React SPA - returns index.html for all non-API routes"""
    # Check if file exists in dist folder
    if path and os.path.exists(os.path.join('dist', path)):
        return send_from_directory('dist', path)
    
    # Return index.html for SPA routing
    return send_from_directory('dist', 'index.html')
