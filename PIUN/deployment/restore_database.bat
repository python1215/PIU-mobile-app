@echo off
REM PIU M&E System - Database Restore Script
REM For Offline SQL Server Deployment

setlocal enabledelayedexpansion

echo PIU M&E System - Database Restore Utility
echo.

REM Configuration
set DB_NAME=piuprod3
set BACKUP_DIR=C:\PIU_Backups

REM Check if SQL Server is running
sc query MSSQLSERVER | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo ERROR: SQL Server service is not running
    echo Please start SQL Server service first
    pause
    exit /b 1
)

REM List available backup files
echo Available backup files in %BACKUP_DIR%:
echo.
set /a count=0
if exist "%BACKUP_DIR%\*.bak" (
    for %%f in ("%BACKUP_DIR%\*.bak") do (
        set /a count+=1
        echo !count!. %%~nxf (%%~tf)
        set "file!count!=%%f"
    )
) else (
    echo No backup files found in %BACKUP_DIR%
    pause
    exit /b 1
)

echo.
set /p choice=Enter the number of the backup file to restore (1-%count%): 

REM Validate input
if "%choice%"=="" goto :invalid_choice
if %choice% lss 1 goto :invalid_choice
if %choice% gtr %count% goto :invalid_choice

REM Get selected backup file
set "BACKUP_FILE=!file%choice%!"

echo.
echo Selected backup file: %BACKUP_FILE%
echo.
echo WARNING: This will overwrite the existing database '%DB_NAME%'
echo All current data will be lost!
echo.
set /p confirm=Are you sure you want to continue? (Y/N): 

if /i not "%confirm%"=="Y" (
    echo Restore operation cancelled.
    pause
    exit /b 0
)

REM Perform database restore
echo.
echo Restoring database '%DB_NAME%' from backup...
echo Please wait, this may take several minutes...
echo.

REM Get logical file names from backup
echo Getting backup file information...
sqlcmd -S localhost -E -Q "RESTORE FILELISTONLY FROM DISK = '%BACKUP_FILE%'"

if %errorlevel% neq 0 (
    echo ERROR: Cannot read backup file
    pause
    exit /b 1
)

REM Restore database with replace option
sqlcmd -S localhost -E -Q "RESTORE DATABASE [%DB_NAME%] FROM DISK = '%BACKUP_FILE%' WITH REPLACE, STATS = 10"

if %errorlevel% equ 0 (
    echo.
    echo Database restore completed successfully!
    echo Database '%DB_NAME%' has been restored from backup.
    
    REM Verify database
    echo.
    echo Verifying database integrity...
    sqlcmd -S localhost -E -Q "USE [%DB_NAME%]; DBCC CHECKDB ('%DB_NAME%') WITH NO_INFOMSGS"
    
    if %errorlevel% equ 0 (
        echo Database integrity check passed.
    ) else (
        echo WARNING: Database integrity check failed!
    )
    
) else (
    echo.
    echo ERROR: Database restore failed!
    echo Please check SQL Server logs for more details
)

echo.
echo Restore operation completed.
pause
goto :eof

:invalid_choice
echo Invalid choice. Please enter a number between 1 and %count%.
pause
exit /b 1