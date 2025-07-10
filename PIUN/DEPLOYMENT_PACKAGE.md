# PIU M&E System - Offline SQL Server Deployment Package

## Overview
This document provides complete instructions for deploying the PIU Monitoring & Evaluation System on an offline server with SQL Server backend.

## System Requirements

### Hardware Requirements
- **CPU**: Intel Core i5 or AMD Ryzen 5 (minimum 4 cores)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 100GB free space minimum
- **Network**: Ethernet connection for LAN deployment

### Software Requirements
- **Operating System**: Windows Server 2019/2022 or Windows 10/11 Pro
- **SQL Server**: SQL Server 2019/2022 Express or Standard Edition
- **Python**: Python 3.11.x
- **Web Server**: IIS with URL Rewrite module (optional) or use built-in Django server

## Pre-Deployment Checklist

### 1. SQL Server Configuration
- [ ] SQL Server installed and running
- [ ] SQL Server Authentication enabled (Mixed Mode)
- [ ] Database user created with appropriate permissions
- [ ] TCP/IP protocol enabled
- [ ] Firewall configured to allow SQL Server connections

### 2. Database Setup
- [ ] Create database: `piuprod3`
- [ ] Execute database schema scripts
- [ ] Import initial data
- [ ] Configure backup schedule

### 3. Python Environment
- [ ] Python 3.11 installed
- [ ] Virtual environment created
- [ ] Required packages installed
- [ ] Environment variables configured

## Deployment Steps

### Step 1: Server Preparation
1. Install Python 3.11 on target server
2. Create project directory: `C:\PIU_System\`
3. Set up virtual environment:
   ```cmd
   python -m venv C:\PIU_System\venv
   C:\PIU_System\venv\Scripts\activate
   ```

### Step 2: Database Configuration
1. Create SQL Server database `piuprod3`
2. Execute schema creation script
3. Import data using provided SQL scripts
4. Configure connection parameters

### Step 3: Application Configuration
1. Copy application files to server
2. Install Python dependencies
3. Configure environment variables
4. Set up static file serving
5. Configure logging

### Step 4: Testing and Validation
1. Test database connectivity
2. Verify CRUD operations
3. Test all modules functionality
4. Validate data integrity

## Security Considerations

### Database Security
- Use strong passwords for SQL Server authentication
- Implement database backup encryption
- Configure appropriate user permissions
- Enable SQL Server audit logging

### Application Security
- Configure secure session management
- Implement HTTPS (SSL/TLS)
- Set up proper file permissions
- Configure firewall rules

### Network Security
- Restrict database access to application server only
- Use VPN for remote access if needed
- Implement network monitoring
- Configure intrusion detection

## Backup and Recovery

### Database Backup
- Daily full backups
- Hourly transaction log backups
- Weekly differential backups
- Off-site backup storage

### Application Backup
- Configuration files backup
- Static files backup
- Log files archival
- Version control integration

## Monitoring and Maintenance

### System Monitoring
- SQL Server performance counters
- Application response times
- Error logging and alerting
- Resource utilization tracking

### Regular Maintenance
- Database index maintenance
- Log file cleanup
- Security updates
- Performance optimization

## Troubleshooting Guide

### Common Issues
1. **Database Connection Failed**
   - Check SQL Server service status
   - Verify connection string parameters
   - Test network connectivity

2. **Application Errors**
   - Check application logs
   - Verify Python dependencies
   - Review environment variables

3. **Performance Issues**
   - Monitor database performance
   - Check system resources
   - Review query execution plans

## Support and Documentation

### Technical Support
- System administrator contact
- Database administrator contact
- Development team contact

### Documentation
- User manual
- Administrator guide
- API documentation
- Database schema reference

## Appendices

### Appendix A: SQL Server Configuration Scripts
### Appendix B: Python Dependencies List
### Appendix C: Environment Variables Reference
### Appendix D: Backup Scripts
### Appendix E: Monitoring Scripts