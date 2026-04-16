#!/bin/bash
set -e

echo "[BUILD] Installing frontend dependencies..."
npm install

echo "[BUILD] Building frontend (dist/)..."
npx vite build

echo "[BUILD] Building Spring Boot backend JAR..."
cd backend
mvn clean package -DskipTests -q
cd ..

if [ ! -f "backend/target/piuproject-1.0.0.jar" ]; then
    echo "[BUILD][ERROR] Backend JAR was not produced at backend/target/piuproject-1.0.0.jar"
    exit 1
fi

echo "[BUILD] Compiling HealthProxy..."
javac HealthProxy.java

echo "[BUILD] Cleaning workspace for deployment (preserving dist, HealthProxy, and backend JAR)..."
rm -rf .git
rm -rf node_modules
rm -rf .cache
rm -rf .config/.vscode-server
rm -rf .local/state
rm -rf backend/src
rm -rf src
rm -f vite.config.mjs
rm -f tailwind.config.js
rm -f postcss.config.js
rm -f index.html
rm -f package-lock.json
rm -f package.json

echo "[BUILD] Build complete. Ready for deployment."
