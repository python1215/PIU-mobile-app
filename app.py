"""
PIU Project - Spring Boot Launcher with Direct Static File Serving
"""
import os
import subprocess
import threading
import time
import requests
from flask import Flask, request, Response, send_from_directory, send_file
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
BACKEND_URL = "http://localhost:8080"
JAR_PATH = "/home/runner/workspace/backend/target/piuproject-1.0.0.jar"
backend_ready = False

def start_backend():
    global backend_ready
    
    try:
        requests.get(BACKEND_URL, timeout=2)
        backend_ready = True
        print("[SPRING BOOT] Already running!")
        return
    except:
        pass
    
    if not os.path.exists(JAR_PATH):
        print(f"[ERROR] JAR not found: {JAR_PATH}")
        return
    
    print("[SPRING BOOT] Starting on port 8080...")
    process = subprocess.Popen(
        ["java", "-jar", JAR_PATH],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    def stream():
        for line in iter(process.stdout.readline, ''):
            if line:
                print(f"[SPRING] {line.rstrip()}")
    
    threading.Thread(target=stream, daemon=True).start()
    
    for i in range(90):
        try:
            resp = requests.get(BACKEND_URL, timeout=2)
            if resp.status_code < 500:
                backend_ready = True
                print("[SPRING BOOT] Ready!")
                return
        except:
            pass
        if i % 10 == 0:
            print(f"[SPRING BOOT] Waiting... ({i}s)")
        time.sleep(1)

thread = threading.Thread(target=start_backend, daemon=True)
thread.start()

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    """Serve static assets directly from dist/assets"""
    return send_from_directory(os.path.join(DIST_DIR, 'assets'), filename)

@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
def proxy_api(path):
    """Proxy API requests to Spring Boot backend"""
    global backend_ready
    
    if not backend_ready:
        for _ in range(60):
            if backend_ready:
                break
            time.sleep(1)
        if not backend_ready:
            return {"error": "Backend starting", "message": "Server is starting up, please try again in a moment."}, 503
    
    url = f"{BACKEND_URL}/api/{path}"
    if request.query_string:
        url += f"?{request.query_string.decode()}"
    
    try:
        resp = requests.request(
            method=request.method,
            url=url,
            headers={k: v for k, v in request.headers if k.lower() != 'host'},
            data=request.get_data(),
            cookies=request.cookies,
            allow_redirects=False,
            timeout=30
        )
        
        excluded = {'content-encoding', 'transfer-encoding', 'connection'}
        headers = {k: v for k, v in resp.headers.items() if k.lower() not in excluded}
        
        return Response(resp.content, status=resp.status_code, headers=headers)
    except Exception as e:
        return {"error": "Backend unavailable", "message": str(e)}, 503

@app.route('/health')
def health():
    """Health check endpoint"""
    return {"status": "healthy", "backend_ready": backend_ready}

@app.route('/')
def serve_index():
    """Serve index.html for root"""
    return send_file(os.path.join(DIST_DIR, 'index.html'))

@app.route('/<path:path>')
def serve_spa(path):
    """Serve React SPA - check for static file, otherwise return index.html"""
    file_path = os.path.join(DIST_DIR, path)
    if os.path.isfile(file_path):
        return send_from_directory(DIST_DIR, path)
    return send_file(os.path.join(DIST_DIR, 'index.html'))
