import os
import sys

# Add PIUN directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'PIUN'))
os.chdir('PIUN')

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')

app = get_wsgi_application()
