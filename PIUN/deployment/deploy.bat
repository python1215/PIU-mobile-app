@echo off
REM PIU M&E System - Master Deployment Script
REM For Offline SQL Server Deployment

echo PIU M&E System - Master Deployment Script
echo ===============================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

REM Set deployment directory
set DEPLOY_DIR=%~dp0..
cd /d "%DEPLOY_DIR%"

echo Current directory: %cd%
echo.

REM Step 1: Install Python dependencies
echo Step 1: Installing Python dependencies...
call deployment\install_dependencies.bat
if %errorlevel% neq 0 (
    echo ERROR: Dependency installation failed
    pause
    exit /b 1
)

echo.
echo Step 2: Database setup...
echo Please run the following SQL script on your SQL Server:
echo %cd%\deployment\setup_database.sql
echo.
pause

REM Step 3: Environment configuration
echo Step 3: Environment configuration...
if not exist ".env" (
    echo Creating .env file from template...
    copy deployment\.env.example .env
    echo.
    echo Please edit .env file with your SQL Server connection details:
    echo - DB_HOST (your SQL Server hostname)
    echo - DB_USER (SQL Server username)
    echo - DB_PASSWORD (SQL Server password)
    echo - SECRET_KEY (generate a secure secret key)
    echo.
    pause
) else (
    echo .env file already exists
)

REM Step 4: Database migrations
echo Step 4: Running database migrations...
call venv\Scripts\activate.bat && python manage.py migrate --settings=deployment.production_settings
if %errorlevel% neq 0 (
    echo ERROR: Database migration failed
    echo Please check your database connection settings
    pause
    exit /b 1
)

REM Step 5: Create superuser
echo Step 5: Creating superuser account...
call venv\Scripts\activate.bat && python manage.py createsuperuser --settings=deployment.production_settings

REM Step 6: Collect static files
echo Step 6: Collecting static files...
call venv\Scripts\activate.bat && python manage.py collectstatic --noinput --settings=deployment.production_settings

REM Step 7: Health check
echo Step 7: Running system health check...
call venv\Scripts\activate.bat && python deployment\system_health_check.py

REM Step 8: Create Windows service (optional)
echo.
echo Step 8: Windows Service Setup (Optional)
echo Do you want to install PIU M&E System as a Windows service? (Y/N)
set /p service_choice=
if /i "%service_choice%"=="Y" (
    call deployment\install_service.bat
)

echo.
echo ===============================================
echo PIU M&E System Deployment Complete!
echo ===============================================
echo.
echo Next steps:
echo 1. Start the server: deployment\start_server.bat
echo 2. Access the system: http://localhost:8000
echo 3. Login with your superuser account
echo 4. Configure system settings
echo 5. Import your data if needed
echo.
echo For support, see: DEPLOYMENT_PACKAGE.md
echo.
pause