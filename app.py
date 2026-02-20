"""
PIU Project - Spring Boot Launcher with Direct Static File Serving
"""
import os
import subprocess
import threading
import time
import fcntl
import requests as http_requests
from flask import Flask, request, Response, send_from_directory, send_file
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
BACKEND_URL = "http://localhost:8080"
JAR_PATH = "/home/runner/workspace/backend/target/piuproject-1.0.0.jar"
LOCK_FILE = "/tmp/spring_boot.lock"
READY_FILE = "/tmp/spring_boot_ready"
_backend_ready_cache = False

def is_backend_running():
    try:
        resp = http_requests.get(BACKEND_URL, timeout=3)
        return resp.status_code < 500
    except:
        return False

def check_backend_ready():
    global _backend_ready_cache
    if _backend_ready_cache:
        return True
    if os.path.exists(READY_FILE) or is_backend_running():
        _backend_ready_cache = True
        return True
    return False

def mark_ready():
    try:
        with open(READY_FILE, 'w') as f:
            f.write('ready')
    except:
        pass

def start_backend():
    if is_backend_running():
        print("[SPRING BOOT] Already running!")
        mark_ready()
        return

    lock_fd = None
    try:
        lock_fd = open(LOCK_FILE, 'w')
        fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        lock_fd.write(str(os.getpid()))
        lock_fd.flush()
    except (IOError, OSError):
        print("[SPRING BOOT] Another process is starting it, waiting...")
        for i in range(180):
            if is_backend_running():
                print("[SPRING BOOT] Ready (started by another process)!")
                mark_ready()
                return
            time.sleep(1)
        print("[SPRING BOOT] Timed out waiting for other process")
        return

    try:
        if is_backend_running():
            print("[SPRING BOOT] Already running!")
            mark_ready()
            return

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

        for i in range(180):
            if is_backend_running():
                print("[SPRING BOOT] Ready!")
                mark_ready()
                return
            if i % 10 == 0:
                print(f"[SPRING BOOT] Waiting... ({i}s)")
            time.sleep(1)

        print("[SPRING BOOT] Failed to start within 180s")
    finally:
        if lock_fd:
            try:
                fcntl.flock(lock_fd, fcntl.LOCK_UN)
                lock_fd.close()
            except:
                pass

def warm_up_database():
    """Wake up Neon database before Spring Boot starts."""
    import psycopg2
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("[DB WARMUP] No DATABASE_URL found, skipping")
        return
    
    print("[DB WARMUP] Waking up database...")
    for i in range(30):
        try:
            conn = psycopg2.connect(db_url, connect_timeout=10)
            cur = conn.cursor()
            cur.execute('SELECT 1')
            cur.close()
            conn.close()
            print(f"[DB WARMUP] Database is awake! (attempt {i+1})")
            return
        except Exception as e:
            if i % 5 == 0:
                print(f"[DB WARMUP] Waiting for database... (attempt {i+1}/30)")
            time.sleep(3)
    print("[DB WARMUP] Could not wake database after 30 attempts, continuing anyway...")

try:
    os.remove(READY_FILE)
except:
    pass

warmup_thread = threading.Thread(target=lambda: (warm_up_database(), start_backend()), daemon=True)
warmup_thread.start()

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(os.path.join(DIST_DIR, 'assets'), filename)

@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
def proxy_api(path):
    if not check_backend_ready():
        for _ in range(30):
            if check_backend_ready():
                break
            time.sleep(1)
        if not check_backend_ready():
            return {"error": "Backend starting", "message": "Server is starting up, please try again in a moment."}, 503

    url = f"{BACKEND_URL}/api/{path}"
    if request.query_string:
        url += f"?{request.query_string.decode()}"

    req_headers = {k: v for k, v in request.headers if k.lower() != 'host'}
    req_data = request.get_data()
    req_cookies = request.cookies

    max_retries = 2
    for attempt in range(max_retries + 1):
        try:
            resp = http_requests.request(
                method=request.method,
                url=url,
                headers=req_headers,
                data=req_data,
                cookies=req_cookies,
                allow_redirects=False,
                timeout=60
            )

            if resp.status_code == 500 and attempt < max_retries:
                try:
                    body = resp.json()
                    err_msg = str(body.get('message', '') or body.get('error', ''))
                    if 'EntityManager' in err_msg or 'JDBC' in err_msg or 'Connection' in err_msg:
                        time.sleep(2)
                        continue
                except:
                    pass

            excluded = {'content-encoding', 'transfer-encoding', 'connection'}
            headers = {k: v for k, v in resp.headers.items() if k.lower() not in excluded}

            return Response(resp.content, status=resp.status_code, headers=headers)
        except Exception as e:
            if attempt < max_retries:
                time.sleep(2)
                continue
            return {"error": "Backend unavailable", "message": str(e)}, 503

@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(UPLOAD_DIR, filename)

@app.route('/health')
def health():
    return {"status": "healthy", "backend_ready": check_backend_ready()}

@app.route('/')
def serve_index():
    return send_file(os.path.join(DIST_DIR, 'index.html'))

@app.route('/<path:path>')
def serve_spa(path):
    file_path = os.path.join(DIST_DIR, path)
    if os.path.isfile(file_path):
        return send_from_directory(DIST_DIR, path)
    return send_file(os.path.join(DIST_DIR, 'index.html'))
