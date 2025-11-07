#!/bin/bash
# Startup script for gunicorn with extended timeout for large file uploads
cd PIUN
gunicorn --config ../gunicorn_config.py main:app
