# SQL Server Project Activities Fix

## Issue
Project Activities not showing data in SQL Server environment due to Django ORM compatibility issues.

## Root Cause
The dashboard views were using Django ORM queries like `Activities.objects.order_by('-date')[:5]` which may not work correctly with SQL Server backends.

## Solution Applied

### 1. Multi-Environment SQL Server Support
Updated both `enhanced_project_dashboard` and `simple_financial_dashboard` functions to support:

- **Test Environment**: `[piuprod].[dbo].[PIU_Financial_mgt_activities]`
- **Production Environment**: `[piuprod3].[dbo].[PIU_Financial_mgt_activities]`
- **Fallback**: `PIU_Financial_mgt_activities` (without schema)

### 2. Raw SQL Queries
```python
# SQL Server compatible query
query = f"""
    SELECT TOP 5 
        activity,
        allocation,
        date,
        projectID_id,
        compID_id,
        subcompID_id
    FROM {table_name}
    ORDER BY date DESC
"""
```

### 3. Template Compatibility
Converts raw SQL results to dictionary format for template compatibility:
```python
recent_activities.append({
    'activity': row[0],
    'allocation': row[1],
    'date': row[2],
    'projectID_id': row[3],
    'compID_id': row[4],
    'subcompID_id': row[5]
})
```

## Expected Results

### In SQL Server Logs:
```
Successfully queried activities table: [piuprod].[dbo].[PIU_Financial_mgt_activities]
Found X recent activities
```

### In Dashboard:
- Project Activities section will now show recent activities
- Each activity displays: activity name, allocation amount, project info
- Activities are ordered by date (most recent first)

## Table Requirements

Your SQL Server should have a table with these columns:
- `activity` (text)
- `allocation` (decimal/money)
- `date` (datetime)
- `projectID_id` (varchar)
- `compID_id` (varchar)
- `subcompID_id` (varchar)

## Verification

1. Navigate to PIU Financial Management Dashboard
2. Check "Project Activities" section
3. Should display recent activities with budget allocations
4. Check server logs for successful table queries

If still no data, verify:
1. Activities table exists and has data
2. Table permissions for database user
3. Column names match expected format