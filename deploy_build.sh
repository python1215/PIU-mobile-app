#!/bin/bash
echo "Cleaning workspace for deployment..."
rm -rf .git
rm -rf node_modules
rm -rf .local/state
rm -rf __pycache__
rm -rf backend/src
rm -rf src
rm -rf frontend
rm -rf attached_assets
rm -rf uploads
rm -rf vite.config.mjs
rm -rf tailwind.config.js
rm -rf postcss.config.js
echo "Build cleanup complete"
