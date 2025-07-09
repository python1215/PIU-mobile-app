@echo off
echo Setting up SQL Server environment for PIUN Project
echo ===================================================

REM Set environment variables for SQL Server
set USE_SQL_SERVER=True
set DB_HOST=localhost
set DB_USER=sa
set DB_PASSWORD=
set DB_PORT=1433

echo SQL Server mode activated!
echo.
echo Database Configuration:
echo - Database: piuprod
echo - Host: %DB_HOST%
echo - User: %DB_USER%
echo - Port: %DB_PORT%
echo.
echo To apply SQL schema, run:
echo python setup_sql_server.py attached_assets/Pasted-USE-piuprod-GO-ALTER-TABLE-dbo-social-and-env-pap-DROP-CONSTRAINT-social-and-env-pap-vulner-1752061647602_1752061647610.txt
echo.
echo Then restart the Django application
pause
