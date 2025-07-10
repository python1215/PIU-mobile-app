-- PIU M&E System - SQL Server Database Setup Script
-- Execute this script on your SQL Server instance

USE master;
GO

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'piuprod3')
BEGIN
    CREATE DATABASE piuprod3;
    PRINT 'Database piuprod3 created successfully';
END
ELSE
BEGIN
    PRINT 'Database piuprod3 already exists';
END
GO

-- Switch to the PIU database
USE piuprod3;
GO

-- Create login for PIU application (replace with your desired credentials)
IF NOT EXISTS (SELECT name FROM sys.sql_logins WHERE name = 'piu_user')
BEGIN
    CREATE LOGIN piu_user WITH PASSWORD = 'P1U_S3cur3_P@ssw0rd!';
    PRINT 'Login piu_user created successfully';
END
ELSE
BEGIN
    PRINT 'Login piu_user already exists';
END
GO

-- Create user for the database
IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'piu_user')
BEGIN
    CREATE USER piu_user FOR LOGIN piu_user;
    PRINT 'User piu_user created successfully';
END
ELSE
BEGIN
    PRINT 'User piu_user already exists';
END
GO

-- Grant necessary permissions
ALTER ROLE db_datareader ADD MEMBER piu_user;
ALTER ROLE db_datawriter ADD MEMBER piu_user;
ALTER ROLE db_ddladmin ADD MEMBER piu_user;
GO

-- Enable SQL Server Authentication (Mixed Mode)
-- This requires server restart
EXEC xp_instance_regwrite N'HKEY_LOCAL_MACHINE', 
    N'Software\Microsoft\MSSQLServer\MSSQLServer',
    N'LoginMode', REG_DWORD, 2;
GO

-- Configure SQL Server for remote connections
EXEC sp_configure 'remote access', 1;
RECONFIGURE;
GO

-- Enable TCP/IP protocol (requires SQL Server Configuration Manager)
PRINT 'Please enable TCP/IP protocol in SQL Server Configuration Manager';
PRINT 'and restart SQL Server service';
GO

-- Create backup directory
DECLARE @BackupPath NVARCHAR(255) = 'C:\PIU_Backups\';
DECLARE @sql NVARCHAR(MAX) = 'EXEC xp_create_subdir ''' + @BackupPath + '''';
EXEC sp_executesql @sql;
GO

-- Configure database options
ALTER DATABASE piuprod3 SET RECOVERY FULL;
ALTER DATABASE piuprod3 SET AUTO_CLOSE OFF;
ALTER DATABASE piuprod3 SET AUTO_SHRINK OFF;
ALTER DATABASE piuprod3 SET AUTO_CREATE_STATISTICS ON;
ALTER DATABASE piuprod3 SET AUTO_UPDATE_STATISTICS ON;
GO

PRINT 'Database setup completed successfully!';
PRINT 'Connection String: Server=localhost;Database=piuprod3;User Id=piu_user;Password=P1U_S3cur3_P@ssw0rd!;TrustServerCertificate=yes;';
GO