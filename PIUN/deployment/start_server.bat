@echo off
REM PIU M&E System - Production Server Startup Script
REM For Offline SQL Server Deployment

echo Starting PIU M&E System Server...
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found
    echo Please run install_dependencies.bat first
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found
    echo Please copy .env.example to .env and configure your settings
    pause
)

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Run database migrations
echo Running database migrations...
python manage.py migrate --settings=deployment.production_settings
if %errorlevel% neq 0 (
    echo ERROR: Database migration failed
    pause
    exit /b 1
)

REM Collect static files
echo Collecting static files...
python manage.py collectstatic --noinput --settings=deployment.production_settings
if %errorlevel% neq 0 (
    echo ERROR: Static files collection failed
    pause
    exit /b 1
)

REM Check if superuser exists
echo Checking for superuser...
python manage.py shell --settings=deployment.production_settings -c "
from django.contrib.auth.models import User
if not User.objects.filter(is_superuser=True).exists():
    print('No superuser found. Please create one.')
    exit(1)
"

if %errorlevel% neq 0 (
    echo.
    echo Creating superuser account...
    python manage.py createsuperuser --settings=deployment.production_settings
)

REM Start the server
echo.
echo Starting PIU M&E System on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

REM Start with gunicorn for production
gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 120 --keep-alive 2 --max-requests 1000 --max-requests-jitter 50 PIUN.wsgi:application

REM Fallback to Django development server if gunicorn fails
if %errorlevel% neq 0 (
    echo.
    echo Gunicorn failed, starting with Django development server...
    python manage.py runserver 0.0.0.0:8000 --settings=deployment.production_settings
)

pause