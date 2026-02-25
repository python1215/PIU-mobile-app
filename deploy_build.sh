#!/bin/bash
echo "Cleaning workspace for deployment..."
rm -rf .git
rm -rf node_modules
rm -rf .pythonlibs
rm -rf .cache
rm -rf .config/.vscode-server
rm -rf .local/state
rm -rf .upm
rm -rf __pycache__
rm -rf backend/src
rm -rf src
rm -rf dist
rm -rf frontend
rm -rf attached_assets
rm -rf uploads
rm -rf static
rm -f vite.config.mjs
rm -f tailwind.config.js
rm -f postcss.config.js
rm -f index.html
rm -f pyproject.toml
rm -f uv.lock
rm -f package-lock.json
rm -f package.json
rm -f app.py
rm -f models.py
rm -f main.py
rm -f gunicorn_config.py
rm -f gunicorn.conf.py
echo "Build cleanup complete"
