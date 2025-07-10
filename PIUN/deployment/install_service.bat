@echo off
REM PIU M&E System - Windows Service Installation Script
REM For Offline SQL Server Deployment

echo PIU M&E System - Windows Service Installation
echo =============================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

REM Set variables
set SERVICE_NAME=PIU_ME_System
set SERVICE_DISPLAY_NAME=PIU M&E System
set SERVICE_DESCRIPTION=Project Implementation Unit Monitoring and Evaluation System
set DEPLOY_DIR=%~dp0..
set PYTHON_EXE=%DEPLOY_DIR%\venv\Scripts\python.exe
set MANAGE_PY=%DEPLOY_DIR%\manage.py

REM Check if service already exists
sc query "%SERVICE_NAME%" >nul 2>&1
if %errorlevel% equ 0 (
    echo Service "%SERVICE_NAME%" already exists
    echo Do you want to reinstall it? (Y/N)
    set /p reinstall_choice=
    if /i "%reinstall_choice%"=="Y" (
        echo Stopping and removing existing service...
        sc stop "%SERVICE_NAME%"
        sc delete "%SERVICE_NAME%"
        timeout /t 5 /nobreak
    ) else (
        echo Installation cancelled
        pause
        exit /b 0
    )
)

REM Install NSSM (Non-Sucking Service Manager) if not present
if not exist "%DEPLOY_DIR%\deployment\nssm.exe" (
    echo Downloading NSSM...
    powershell -Command "(New-Object Net.WebClient).DownloadFile('https://nssm.cc/release/nssm-2.24.zip', '%DEPLOY_DIR%\deployment\nssm.zip')"
    if %errorlevel% neq 0 (
        echo ERROR: Failed to download NSSM
        echo Please download manually from https://nssm.cc/download
        pause
        exit /b 1
    )
    
    echo Extracting NSSM...
    powershell -Command "Expand-Archive -Path '%DEPLOY_DIR%\deployment\nssm.zip' -DestinationPath '%DEPLOY_DIR%\deployment\' -Force"
    copy "%DEPLOY_DIR%\deployment\nssm-2.24\win64\nssm.exe" "%DEPLOY_DIR%\deployment\nssm.exe"
    rmdir /s /q "%DEPLOY_DIR%\deployment\nssm-2.24"
    del "%DEPLOY_DIR%\deployment\nssm.zip"
)

REM Create service startup script
echo Creating service startup script...
(
echo @echo off
echo cd /d "%DEPLOY_DIR%"
echo call venv\Scripts\activate.bat
echo python manage.py runserver 0.0.0.0:8000 --settings=deployment.production_settings
) > "%DEPLOY_DIR%\deployment\service_start.bat"

REM Install service using NSSM
echo Installing Windows service...
"%DEPLOY_DIR%\deployment\nssm.exe" install "%SERVICE_NAME%" "%DEPLOY_DIR%\deployment\service_start.bat"

REM Configure service
echo Configuring service...
"%DEPLOY_DIR%\deployment\nssm.exe" set "%SERVICE_NAME%" DisplayName "%SERVICE_DISPLAY_NAME%"
"%DEPLOY_DIR%\deployment\nssm.exe" set "%SERVICE_NAME%" Description "%SERVICE_DESCRIPTION%"
"%DEPLOY_DIR%\deployment\nssm.exe" set "%SERVICE_NAME%" Start SERVICE_AUTO_START
"%DEPLOY_DIR%\deployment\nssm.exe" set "%SERVICE_NAME%" AppDirectory "%DEPLOY_DIR%"
"%DEPLOY_DIR%\deployment\nssm.exe" set "%SERVICE_NAME%" AppStdout "%DEPLOY_DIR%\logs\service_stdout.log"
"%DEPLOY_DIR%\deployment\nssm.exe" set "%SERVICE_NAME%" AppStderr "%DEPLOY_DIR%\logs\service_stderr.log"
"%DEPLOY_DIR%\deployment\nssm.exe" set "%SERVICE_NAME%" AppRotateFiles 1
"%DEPLOY_DIR%\deployment\nssm.exe" set "%SERVICE_NAME%" AppRotateOnline 1
"%DEPLOY_DIR%\deployment\nssm.exe" set "%SERVICE_NAME%" AppRotateBytes 1048576

REM Create logs directory
if not exist "%DEPLOY_DIR%\logs" mkdir "%DEPLOY_DIR%\logs"

REM Configure service recovery
echo Configuring service recovery options...
sc failure "%SERVICE_NAME%" reset= 86400 actions= restart/30000/restart/60000/restart/120000

REM Start service
echo Starting service...
sc start "%SERVICE_NAME%"

if %errorlevel% equ 0 (
    echo.
    echo =============================================
    echo Windows Service Installation Complete!
    echo =============================================
    echo.
    echo Service Name: %SERVICE_NAME%
    echo Display Name: %SERVICE_DISPLAY_NAME%
    echo Status: Starting...
    echo.
    echo The PIU M&E System will now start automatically with Windows.
    echo.
    echo Service Management:
    echo - Start:   sc start "%SERVICE_NAME%"
    echo - Stop:    sc stop "%SERVICE_NAME%"
    echo - Status:  sc query "%SERVICE_NAME%"
    echo - Remove:  sc delete "%SERVICE_NAME%"
    echo.
    echo Service logs are available at:
    echo - %DEPLOY_DIR%\logs\service_stdout.log
    echo - %DEPLOY_DIR%\logs\service_stderr.log
    echo.
    echo The system should be accessible at: http://localhost:8000
    echo.
) else (
    echo.
    echo ERROR: Failed to start service
    echo Please check the logs for more details
    echo.
)

pause