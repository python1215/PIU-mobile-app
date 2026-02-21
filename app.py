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
LOCAL_PG_DIR = "/tmp/pgdata"
LOCAL_PG_PORT = "5433"
_backend_ready_cache = False
_active_database_url = None

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
        boot_env = os.environ.copy()
        boot_env['PORT'] = '8080'
        if _active_database_url:
            boot_env['DATABASE_URL'] = _active_database_url
            boot_env['SPRING_JPA_HIBERNATE_DDL_AUTO'] = 'update'
            print(f"[SPRING BOOT] Using database: {_active_database_url.split('@')[0].split('//')[0]}//***@{_active_database_url.split('@')[-1] if '@' in _active_database_url else _active_database_url}")

        process = subprocess.Popen(
            ["java", "-Xms128m", "-Xmx384m", "-XX:+UseSerialGC", "-XX:MaxMetaspaceSize=128m", "-jar", JAR_PATH],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            env=boot_env
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

def test_remote_database():
    """Test if the remote DATABASE_URL is reachable."""
    try:
        import psycopg2
    except ImportError:
        return False

    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return False

    try:
        conn = psycopg2.connect(db_url, connect_timeout=10)
        cur = conn.cursor()
        cur.execute('SELECT 1')
        cur.close()
        conn.close()
        return True
    except Exception:
        return False

def start_local_postgres():
    """Start a local PostgreSQL instance as fallback."""
    global _active_database_url
    local_db_url = f"postgresql://runner:runner@localhost:{LOCAL_PG_PORT}/piuproject"

    try:
        import psycopg2
        conn = psycopg2.connect(local_db_url, connect_timeout=5)
        cur = conn.cursor()
        cur.execute('SELECT 1')
        cur.close()
        conn.close()
        print("[LOCAL DB] Local PostgreSQL already running")
        _active_database_url = local_db_url
        return True
    except Exception:
        pass

    print("[LOCAL DB] Starting local PostgreSQL...")

    clean_env = {k: v for k, v in os.environ.items()
                 if k not in ('PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE', 'DATABASE_URL')}

    if not os.path.exists(os.path.join(LOCAL_PG_DIR, 'PG_VERSION')):
        result = subprocess.run(
            ['initdb', '-D', LOCAL_PG_DIR, '-U', 'runner', '--auth=trust'],
            capture_output=True, text=True, env=clean_env
        )
        if result.returncode != 0:
            print(f"[LOCAL DB] initdb failed: {result.stderr}")
            return False

        with open(os.path.join(LOCAL_PG_DIR, 'postgresql.conf'), 'a') as f:
            f.write(f"\nport = {LOCAL_PG_PORT}\n")
            f.write("listen_addresses = 'localhost'\n")
            f.write("unix_socket_directories = '/tmp'\n")
            f.write("shared_buffers = 16MB\n")
            f.write("work_mem = 2MB\n")
            f.write("max_connections = 10\n")

    result = subprocess.run(
        ['pg_ctl', '-D', LOCAL_PG_DIR, '-l', os.path.join(LOCAL_PG_DIR, 'logfile'), 'start'],
        capture_output=True, text=True, env=clean_env
    )
    if result.returncode != 0:
        print(f"[LOCAL DB] pg_ctl start failed: {result.stderr}")
        return False

    print("[LOCAL DB] PostgreSQL started, waiting for it to be ready...")
    time.sleep(2)

    import psycopg2
    for attempt in range(5):
        try:
            conn = psycopg2.connect(
                f"postgresql://runner@localhost:{LOCAL_PG_PORT}/postgres",
                connect_timeout=5
            )
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute("SELECT 1 FROM pg_database WHERE datname='piuproject'")
            if not cur.fetchone():
                cur.execute("CREATE DATABASE piuproject")
                print("[LOCAL DB] Database 'piuproject' created")
            else:
                print("[LOCAL DB] Database 'piuproject' already exists")
            cur.close()
            conn.close()
            _active_database_url = local_db_url
            print(f"[LOCAL DB] Ready at {local_db_url}")
            return True
        except Exception as e:
            print(f"[LOCAL DB] Waiting... attempt {attempt+1}/5: {e}")
            time.sleep(2)

    print("[LOCAL DB] Failed to start local PostgreSQL")
    return False

def prepare_database():
    """Try remote database first, fall back to local."""
    global _active_database_url

    db_url = os.environ.get('DATABASE_URL')
    if db_url:
        print("[DB] Testing remote database...")
        if test_remote_database():
            print("[DB] Remote database is available!")
            _active_database_url = db_url
            return
        else:
            print("[DB] Remote database unavailable, starting local fallback...")
    else:
        print("[DB] No DATABASE_URL set, starting local database...")

    if start_local_postgres():
        print("[DB] Local database ready")
    else:
        print("[DB] WARNING: No database available, backend may have limited functionality")

try:
    os.remove(READY_FILE)
except:
    pass

warmup_thread = threading.Thread(target=lambda: (prepare_database(), start_backend()), daemon=True)
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
