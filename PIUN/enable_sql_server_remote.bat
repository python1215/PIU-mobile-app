@echo off
REM Enable SQL Server for Remote Connections
REM Run this as Administrator on your Windows machine

echo Enabling SQL Server for remote connections...

REM Enable SQL Server TCP/IP Protocol
echo Configuring SQL Server network protocols...
sqlcmd -E -S "PGOMEZ\PGOMEZ" -Q "EXEC xp_instance_regwrite N'HKEY_LOCAL_MACHINE', N'SOFTWARE\Microsoft\Microsoft SQL Server\MSSQLServer\SuperSocketNetLib\Tcp\IPAll', N'TcpPort', REG_SZ, N'1433'"

REM Configure Windows Firewall
echo Configuring Windows Firewall...
netsh advfirewall firewall add rule name="SQL Server" dir=in action=allow protocol=TCP localport=1433

REM Enable SQL Server Browser
echo Starting SQL Server Browser...
net start "SQL Server Browser"

REM Set services to automatic
sc config "SQL Server Browser" start=auto
sc config "MSSQLSERVER" start=auto

echo SQL Server configuration complete!
echo.
echo Next steps:
echo 1. Restart SQL Server service
echo 2. Test connection from Replit
echo.
pause