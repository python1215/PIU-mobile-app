
# SQL Server Database Setup Instructions

## Current Configuration
- Database: piuprod
- Host: localhost
- User: sa
- Port: 1433
- Trust Server Certificate: Yes

## Database Script Processing
The provided SQL script contains:
- DROP CONSTRAINT statements for all foreign keys
- DROP INDEX statements for unique constraints  
- CREATE TABLE statements for all system tables
- INSERT statements for initial data
- Comprehensive schema recreation

## System Features in SQL Server Mode
✓ Dual-mode database support (SQLite ↔ SQL Server)
✓ Raw SQL queries for SQL Server compatibility
✓ Progressive table name detection ([piuprod], [piuprod3], [dbo])
✓ Comprehensive error handling and user feedback
✓ All CRUD operations working in offline mode

## Module Support
✓ OHS Monitoring - View/Edit with proper feedback
✓ PAP Management - List/Detail views with field mapping
✓ Grievance Management - Full CRUD operations
✓ Contract Monitoring - Enhanced cascading dropdowns
✓ Project Financial Management - Comprehensive reports
✓ Issues & Actions Monitoring - Complete workflow
✓ Social & Environmental Monitoring - Full functionality

## Next Steps
1. Execute the SQL script on your SQL Server instance
2. The system automatically detects SQL Server mode
3. All views switch to raw SQL queries
4. Full offline functionality is available
