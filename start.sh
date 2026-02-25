#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
JAR_PATH="$SCRIPT_DIR/backend/target/piuproject-1.0.0.jar"
DDL_AUTO="update"

if [ ! -f "$JAR_PATH" ]; then
    echo "[ERROR] JAR not found at: $JAR_PATH"
    echo "[ERROR] Trying alternative path..."
    JAR_PATH="/home/runner/workspace/backend/target/piuproject-1.0.0.jar"
    if [ ! -f "$JAR_PATH" ]; then
        echo "[ERROR] JAR not found. Cannot start."
        exit 1
    fi
fi

if [ -n "$DATABASE_URL" ]; then
    echo "[DB] DATABASE_URL is set, using remote database"
    DDL_AUTO="update"
elif [ -n "$PGHOST" ]; then
    echo "[DB] PGHOST is set, database will be configured by Spring Boot"
    DDL_AUTO="update"
else
    echo "[DB] No database configuration found"
    if command -v pg_ctl &> /dev/null; then
        echo "[DB] Trying local PostgreSQL fallback..."
        LOCAL_PG_DIR="/tmp/pgdata"
        LOCAL_PG_PORT="5433"

        if ! pg_isready -h localhost -p $LOCAL_PG_PORT -q 2>/dev/null; then
            if [ ! -f "$LOCAL_PG_DIR/PG_VERSION" ]; then
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
            env -u PGHOST -u PGPORT -u PGUSER -u PGPASSWORD -u PGDATABASE -u DATABASE_URL \
                pg_ctl -D "$LOCAL_PG_DIR" -l "$LOCAL_PG_DIR/logfile" start >/dev/null 2>&1
            sleep 2
            env -u PGHOST -u PGPORT -u PGUSER -u PGPASSWORD -u PGDATABASE -u DATABASE_URL \
                psql -h localhost -p $LOCAL_PG_PORT -U runner -d postgres -c "SELECT 1 FROM pg_database WHERE datname='piuproject'" -t 2>/dev/null | grep -q 1 || \
                env -u PGHOST -u PGPORT -u PGUSER -u PGPASSWORD -u PGDATABASE -u DATABASE_URL \
                    psql -h localhost -p $LOCAL_PG_PORT -U runner -d postgres -c "CREATE DATABASE piuproject" >/dev/null 2>&1
        fi
        export DATABASE_URL="postgresql://runner:runner@localhost:$LOCAL_PG_PORT/piuproject"
        unset PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE
        echo "[DB] Using local database on port $LOCAL_PG_PORT"
    else
        echo "[DB] WARNING: No database tools available, Spring Boot will configure from env"
    fi
fi

export PORT=5000
echo "[SPRING BOOT] Starting on port $PORT with ddl-auto=$DDL_AUTO..."
echo "[SPRING BOOT] JAR: $JAR_PATH"
echo "[SPRING BOOT] Working directory: $(pwd)"

exec java -Xms128m -Xmx384m -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m \
    -Dserver.port=$PORT \
    -Dspring.jpa.hibernate.ddl-auto=$DDL_AUTO \
    -jar "$JAR_PATH"
