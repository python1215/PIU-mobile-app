import os
import sys
from pathlib import Path

# Add PIUN directory to Python path
BASE_DIR = Path(__file__).resolve().parent
PIUN_DIR = BASE_DIR / 'PIUN'
sys.path.insert(0, str(PIUN_DIR))

# Change working directory to PIUN
os.chdir(PIUN_DIR)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')

app = get_wsgi_application()
