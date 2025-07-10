@echo off
REM PIU M&E System - Deployment Package Creation Script
REM Creates a complete deployment package for offline installation

echo PIU M&E System - Deployment Package Creator
echo ============================================
echo.

REM Set variables
set PACKAGE_NAME=PIU_ME_System_Deployment_Package
set TIMESTAMP=%date:~10,4%-%date:~4,2%-%date:~7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set PACKAGE_DIR=%PACKAGE_NAME%_%TIMESTAMP%
set BASE_DIR=%~dp0..

REM Create package directory
echo Creating package directory: %PACKAGE_DIR%
mkdir "%PACKAGE_DIR%"

REM Copy main application files
echo Copying main application files...
xcopy "%BASE_DIR%\PIUN" "%PACKAGE_DIR%\PIUN" /E /I /H /Y /EXCLUDE:deployment\exclude_list.txt

REM Copy deployment scripts
echo Copying deployment scripts...
xcopy "%BASE_DIR%\deployment" "%PACKAGE_DIR%\deployment" /E /I /H /Y

REM Copy main project files
echo Copying project files...
copy "%BASE_DIR%\main.py" "%PACKAGE_DIR%\"
copy "%BASE_DIR%\pyproject.toml" "%PACKAGE_DIR%\"
copy "%BASE_DIR%\uv.lock" "%PACKAGE_DIR%\"
copy "%BASE_DIR%\replit.md" "%PACKAGE_DIR%\"
copy "%BASE_DIR%\DEPLOYMENT_PACKAGE.md" "%PACKAGE_DIR%\"

REM Create README for deployment package
echo Creating deployment README...
(
echo PIU M&E System - Deployment Package
echo ===================================
echo.
echo This package contains all files needed to deploy the PIU M&E System
echo on an offline server with SQL Server backend.
echo.
echo QUICK START:
echo 1. Extract this package to your server
echo 2. Run: deployment\deploy.bat
echo 3. Follow the installation wizard
echo.
echo MANUAL INSTALLATION:
echo 1. Install Python 3.11
echo 2. Install SQL Server 2019/2022
echo 3. Run: deployment\setup_database.sql
echo 4. Run: deployment\install_dependencies.bat
echo 5. Configure: .env file
echo 6. Run: deployment\start_server.bat
echo.
echo DOCUMENTATION:
echo - DEPLOYMENT_PACKAGE.md: Complete deployment guide
echo - deployment\production_settings.py: Production configuration
echo - deployment\system_health_check.py: Health monitoring
echo.
echo SUPPORT:
echo For technical support, contact your system administrator.
echo.
echo Package created: %date% %time%
echo Version: 1.0.0
) > "%PACKAGE_DIR%\README.txt"

REM Create installation verification checklist
echo Creating verification checklist...
(
echo PIU M&E System - Installation Verification Checklist
echo ====================================================
echo.
echo PRE-INSTALLATION:
echo [ ] Windows Server 2019/2022 or Windows 10/11 Pro
echo [ ] SQL Server 2019/2022 installed and running
echo [ ] Python 3.11 installed
echo [ ] Administrator privileges available
echo [ ] Network connectivity configured
echo.
echo INSTALLATION STEPS:
echo [ ] Extract deployment package
echo [ ] Run deployment\deploy.bat as Administrator
echo [ ] Execute SQL Server setup script
echo [ ] Configure .env file with database credentials
echo [ ] Run database migrations
echo [ ] Create superuser account
echo [ ] Collect static files
echo [ ] Run system health check
echo.
echo POST-INSTALLATION:
echo [ ] Server starts without errors
echo [ ] Database connectivity verified
echo [ ] All modules accessible
echo [ ] User authentication working
echo [ ] CRUD operations functional
echo [ ] Backup scripts tested
echo.
echo SECURITY CHECKLIST:
echo [ ] Strong passwords set for all accounts
echo [ ] Database access restricted to application server
echo [ ] Firewall rules configured
echo [ ] SSL/TLS certificate installed ^(optional^)
echo [ ] Backup encryption enabled
echo [ ] Audit logging configured
echo.
echo OPERATIONAL READINESS:
echo [ ] System monitoring configured
echo [ ] Backup schedule established
echo [ ] Maintenance procedures documented
echo [ ] User training completed
echo [ ] Support contacts established
echo.
echo Installation completed by: ____________________
echo Date: ____________________
echo Verified by: ____________________
echo Date: ____________________
) > "%PACKAGE_DIR%\INSTALLATION_CHECKLIST.txt"

REM Create exclude list for copying
echo Creating exclude list for package...
(
echo __pycache__\
echo *.pyc
echo *.pyo
echo .env
echo logs\
echo media\uploads\
echo db.sqlite3
echo *.log
echo *.tmp
echo .git\
echo .vscode\
echo node_modules\
) > "%BASE_DIR%\deployment\exclude_list.txt"

REM Calculate package size
echo Calculating package size...
for /f "tokens=3" %%a in ('dir "%PACKAGE_DIR%" /s /-c ^| findstr /B /C:"Total Files Listed:"') do set PACKAGE_SIZE=%%a

REM Create ZIP archive
echo Creating ZIP archive...
if exist "%PACKAGE_DIR%.zip" del "%PACKAGE_DIR%.zip"
powershell -Command "Compress-Archive -Path '%PACKAGE_DIR%' -DestinationPath '%PACKAGE_DIR%.zip' -CompressionLevel Optimal"

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo Deployment Package Created Successfully!
    echo ============================================
    echo.
    echo Package: %PACKAGE_DIR%.zip
    echo Size: %PACKAGE_SIZE% bytes
    echo.
    echo Package Contents:
    echo - Complete PIU M&E System application
    echo - SQL Server deployment scripts
    echo - Python dependencies list
    echo - Configuration templates
    echo - Installation documentation
    echo - Health monitoring tools
    echo - Backup and recovery scripts
    echo.
    echo The package is ready for offline deployment.
    echo Transfer %PACKAGE_DIR%.zip to your target server and extract it.
    echo.
    echo Do you want to clean up temporary files? (Y/N)
    set /p cleanup_choice=
    if /i "%cleanup_choice%"=="Y" (
        rmdir /s /q "%PACKAGE_DIR%"
        del "%BASE_DIR%\deployment\exclude_list.txt"
        echo Temporary files cleaned up.
    )
) else (
    echo.
    echo ERROR: Failed to create ZIP archive
    echo Please check PowerShell execution policy
    echo The uncompressed package is available in: %PACKAGE_DIR%
)

echo.
pause