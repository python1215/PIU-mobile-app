#!/bin/bash
echo "Cleaning workspace for deployment..."
rm -rf .git
rm -rf node_modules
rm -rf .pythonlibs
rm -rf .local/state
rm -rf __pycache__
rm -rf backend/src
rm -rf src
rm -rf dist
rm -rf frontend
rm -rf attached_assets
rm -rf uploads
rm -rf static
rm -rf vite.config.mjs
rm -rf tailwind.config.js
rm -rf postcss.config.js
rm -rf index.html
rm -rf pyproject.toml
rm -rf uv.lock
rm -rf package-lock.json
rm -rf package.json
rm -f app.py
rm -f models.py
rm -f main.py
echo "Build cleanup complete"
