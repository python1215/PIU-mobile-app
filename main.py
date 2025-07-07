#!/usr/bin/env python
"""
Main entry point for the PIUN Django application.
This file serves as the WSGI application for running the Django project.
"""
import os
import sys
from django.core.wsgi import get_wsgi_application

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')

# Add the PIUN directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'PIUN'))

# Get the WSGI application
application = get_wsgi_application()

# For compatibility with gunicorn
app = application