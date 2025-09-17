# Fix for Django Admin User Deletion Error

## Problem Description
Django admin fails when trying to delete users with error:
```
Invalid object name 'dashboard_user_activity'
```

## Root Cause
- Your production environment uses **SQL Server** but references a missing `dashboard_user_activity` table
- Current Replit development environment uses **SQLite** and doesn't have this issue
- There's a model somewhere that has a foreign key to User but the table doesn't exist in SQL Server

## Environment Status
- ✅ **Replit (Development)**: SQLite - No issues found
- ❌ **Production (10.220.0.199:8000)**: SQL Server - Missing table causes deletion failure

## Solution Options

### Option 1: Use Django Management Command (Recommended)
Run this on your **SQL Server production environment**:

```bash
# Navigate to your production server
cd /path/to/your/production/project

# Run the management command
python manage.py fix_user_activity_table
```

### Option 2: Manual SQL Server Fix
Connect to your SQL Server and run:

```sql
CREATE TABLE dashboard_user_activity (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type NVARCHAR(100),
    description NVARCHAR(MAX),
    timestamp DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES accounts_user (id)
);
```

### Option 3: Identify and Remove Legacy Reference
If this table isn't needed, find and remove the model reference:

1. **Search production codebase** for any model using `dashboard_user_activity`
2. **Check INSTALLED_APPS** for any legacy apps
3. **Remove or update** the problematic model
4. **Run migrations** to apply changes

## Verification Steps
After applying any fix:

1. **Test user deletion** in Django admin
2. **Check database consistency**: `python manage.py check`
3. **Run migrations**: `python manage.py migrate`
4. **Verify no related errors** in logs

## Prevention
- **Keep environments aligned**: Use same database engine across dev/prod
- **Regular migration checks**: Ensure all migrations are applied
- **Database schema documentation**: Track table relationships

## Files Created
- `fix_dashboard_user_activity.py` - Automated fix script
- `debug_user_relations.py` - Diagnostic script (can be deleted after fix)
- `DATABASE_FIX_INSTRUCTIONS.md` - This documentation