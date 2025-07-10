@echo off
REM PIU M&E System - Database Backup Script
REM For Offline SQL Server Deployment

setlocal enabledelayedexpansion

echo PIU M&E System - Database Backup Utility
echo.

REM Configuration
set DB_NAME=piuprod3
set BACKUP_DIR=C:\PIU_Backups
set TIMESTAMP=%date:~10,4%-%date:~4,2%-%date:~7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=%BACKUP_DIR%\PIU_Backup_%TIMESTAMP%.bak

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
    echo Created backup directory: %BACKUP_DIR%
)

REM Check if SQL Server is running
sc query MSSQLSERVER | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo ERROR: SQL Server service is not running
    echo Please start SQL Server service first
    pause
    exit /b 1
)

REM Perform database backup
echo Creating backup of database '%DB_NAME%'...
echo Backup file: %BACKUP_FILE%
echo.

sqlcmd -S localhost -E -Q "BACKUP DATABASE [%DB_NAME%] TO DISK = '%BACKUP_FILE%' WITH FORMAT, INIT, COMPRESSION, STATS = 10"

if %errorlevel% equ 0 (
    echo.
    echo Database backup completed successfully!
    echo Backup file: %BACKUP_FILE%
    
    REM Get backup file size
    for %%I in ("%BACKUP_FILE%") do set SIZE=%%~zI
    set /a SIZE_MB=!SIZE!/1024/1024
    echo Backup size: !SIZE_MB! MB
    
    REM Clean up old backups (keep last 30 days)
    echo.
    echo Cleaning up old backup files...
    forfiles /p "%BACKUP_DIR%" /m *.bak /d -30 /c "cmd /c del @path" 2>nul
    if %errorlevel% equ 0 (
        echo Old backup files cleaned up successfully
    ) else (
        echo No old backup files to clean up
    )
    
) else (
    echo.
    echo ERROR: Database backup failed!
    echo Please check SQL Server logs for more details
)

echo.
echo Backup operation completed.
pause