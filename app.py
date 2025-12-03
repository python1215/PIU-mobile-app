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

BACKEND_URL = "http://localhost:8080"
BACKEND_JAR_PATH = "/home/runner/workspace/backend/target/piuproject-1.0.0.jar"
BACKEND_STARTUP_TIMEOUT = 60

backend_process = None
backend_ready = False
backend_starting = False

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

def start_backend_async():
    """Start the Spring Boot backend service in background thread"""
    global backend_process, backend_ready, backend_starting
    
    if backend_starting or backend_ready:
        return
    
    backend_starting = True
    
    if not os.path.exists(BACKEND_JAR_PATH):
        print("[BACKEND] ERROR: JAR file not found at", BACKEND_JAR_PATH)
        backend_starting = False
        return
    
    try:
        resp = requests.get(f"{BACKEND_URL}/", timeout=2)
        print("[BACKEND] Already running!")
        backend_ready = True
        backend_starting = False
        return
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
    
    output_thread = threading.Thread(target=stream_output, args=(backend_process, "BACKEND"), daemon=True)
    output_thread.start()
    
    wait_for_backend()
    backend_starting = False

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

atexit.register(cleanup)

app = Flask(__name__, static_folder='dist', static_url_path='')
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

@app.before_request
def ensure_backend():
    """Start backend on first request if not already running"""
    global backend_ready, backend_starting
    if not backend_ready and not backend_starting:
        thread = threading.Thread(target=start_backend_async, daemon=True)
        thread.start()

@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
def proxy_api(path):
    """Proxy API requests to Spring Boot backend"""
    url = f"{BACKEND_URL}/api/{path}"
    
    if not backend_ready:
        for i in range(30):
            if backend_ready:
                break
            time.sleep(1)
    
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
        
        excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
        headers = [(name, value) for name, value in resp.raw.headers.items() if name.lower() not in excluded_headers]
        
        return Response(resp.content, resp.status_code, headers)
    
    except requests.exceptions.ConnectionError:
        return {"error": "Backend service unavailable", "message": "The API server is not responding"}, 503
    except requests.exceptions.Timeout:
        return {"error": "Request timeout", "message": "The API request timed out"}, 504

@app.route('/assets/<path:path>')
def serve_assets(path):
    """Serve static assets from dist/assets"""
    return send_from_directory('dist/assets', path)

@app.route('/health')
def health():
    """Health check endpoint"""
    backend_status = "unknown"
    try:
        resp = requests.get(f"{BACKEND_URL}/", timeout=5)
        backend_status = "healthy"
    except:
        backend_status = "unhealthy" if backend_ready else "starting"
    
    overall_status = "healthy" if backend_status == "healthy" else "degraded"
    
    return {
        "status": overall_status,
        "gateway": "healthy",
        "backend": backend_status,
        "backend_ready": backend_ready
    }

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_spa(path):
    """Serve React SPA - returns index.html for all non-API routes"""
    if path and os.path.exists(os.path.join('dist', path)):
        return send_from_directory('dist', path)
    
    return send_from_directory('dist', 'index.html')
