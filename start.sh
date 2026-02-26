#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
JAR_PATH="$SCRIPT_DIR/backend/target/piuproject-1.0.0.jar"

if [ ! -f "$JAR_PATH" ]; then
    echo "[ERROR] JAR not found at: $JAR_PATH"
    exit 1
fi

pkill -9 -f "piuproject.*jar" 2>/dev/null
sleep 1

export SPRING_JPA_HIBERNATE_DDL_AUTO=update

trap '' TERM

setsid java -Xms128m -Xmx512m -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m \
    -Dserver.port=5000 \
    -Dspring.jpa.hibernate.ddl-auto=update \
    -jar "$JAR_PATH" &

BOOT_PID=$!
echo "[START] Spring Boot PID=$BOOT_PID starting on port 5000..."

while true; do
    if ! kill -0 $BOOT_PID 2>/dev/null; then
        echo "[START] Spring Boot exited, restarting..."
        sleep 2
        setsid java -Xms128m -Xmx512m -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m \
            -Dserver.port=5000 \
            -Dspring.jpa.hibernate.ddl-auto=update \
            -jar "$JAR_PATH" &
        BOOT_PID=$!
        echo "[START] Spring Boot restarted PID=$BOOT_PID"
    fi
    sleep 5
done
