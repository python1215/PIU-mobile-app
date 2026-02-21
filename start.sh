#!/bin/bash
set -e

JAR_PATH="/home/runner/workspace/backend/target/piuproject-1.0.0.jar"
LOCAL_PG_DIR="/tmp/pgdata"
LOCAL_PG_PORT="5433"

test_remote_db() {
    if [ -z "$DATABASE_URL" ]; then
        return 1
    fi
    psql "$DATABASE_URL" -c "SELECT 1" >/dev/null 2>&1
    return $?
}

start_local_postgres() {
    echo "[LOCAL DB] Checking local PostgreSQL..."
    
    if pg_isready -h localhost -p $LOCAL_PG_PORT -q 2>/dev/null; then
        echo "[LOCAL DB] Already running"
        return 0
    fi

    if [ ! -f "$LOCAL_PG_DIR/PG_VERSION" ]; then
        echo "[LOCAL DB] Initializing..."
        env -u PGHOST -u PGPORT -u PGUSER -u PGPASSWORD -u PGDATABASE -u DATABASE_URL \
            initdb -D "$LOCAL_PG_DIR" -U runner --auth=trust >/dev/null 2>&1
        cat >> "$LOCAL_PG_DIR/postgresql.conf" <<EOF
port = $LOCAL_PG_PORT
listen_addresses = 'localhost'
unix_socket_directories = '/tmp'
shared_buffers = 16MB
work_mem = 2MB
max_connections = 10
EOF
    fi

    echo "[LOCAL DB] Starting..."
    env -u PGHOST -u PGPORT -u PGUSER -u PGPASSWORD -u PGDATABASE -u DATABASE_URL \
        pg_ctl -D "$LOCAL_PG_DIR" -l "$LOCAL_PG_DIR/logfile" start >/dev/null 2>&1

    for i in $(seq 1 10); do
        if pg_isready -h localhost -p $LOCAL_PG_PORT -q 2>/dev/null; then
            break
        fi
        sleep 1
    done

    env -u PGHOST -u PGPORT -u PGUSER -u PGPASSWORD -u PGDATABASE -u DATABASE_URL \
        psql -h localhost -p $LOCAL_PG_PORT -U runner -d postgres -c "SELECT 1 FROM pg_database WHERE datname='piuproject'" -t 2>/dev/null | grep -q 1 || \
        env -u PGHOST -u PGPORT -u PGUSER -u PGPASSWORD -u PGDATABASE -u DATABASE_URL \
            psql -h localhost -p $LOCAL_PG_PORT -U runner -d postgres -c "CREATE DATABASE piuproject" >/dev/null 2>&1

    echo "[LOCAL DB] Ready on port $LOCAL_PG_PORT"
    return 0
}

echo "[DB] Testing remote database..."
if test_remote_db; then
    echo "[DB] Remote database is available!"
    export ACTIVE_DATABASE_URL="$DATABASE_URL"
else
    echo "[DB] Remote database unavailable, starting local fallback..."
    start_local_postgres
    export ACTIVE_DATABASE_URL="postgresql://runner:runner@localhost:$LOCAL_PG_PORT/piuproject"
    export DATABASE_URL="$ACTIVE_DATABASE_URL"
fi

echo "[SPRING BOOT] Starting on port 5000..."
exec java -Xms128m -Xmx384m -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m \
    -jar "$JAR_PATH"
