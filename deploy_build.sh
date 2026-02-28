#!/bin/bash
echo "Compiling health proxy..."
javac HealthProxy.java
echo "Cleaning workspace for deployment..."
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
echo "Build cleanup complete"
