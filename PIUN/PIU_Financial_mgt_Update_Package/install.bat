@echo off
REM PIU Financial Management Module Installation Script (Windows)
REM Generated on 2025-07-22 20:44:05

echo Installing PIU Financial Management Module...

REM 1. Copy module files
echo Copying module files...
xcopy /E /I /Y PIU_Financial_mgt "C:\path\to\django\project\PIU_Financial_mgt"
xcopy /E /I /Y templates "C:\path\to\django\project\templates"
xcopy /E /I /Y setup "C:\path\to\django\project\setup"
xcopy /E /I /Y utils "C:\path\to\django\project\utils"

REM 2. Run migrations
echo Running database migrations...
python manage.py makemigrations PIU_Financial_mgt
python manage.py makemigrations setup
python manage.py migrate

echo PIU Financial Management Module installed successfully!
echo Access the module at: /PIU-Financial-mgt/
pause
