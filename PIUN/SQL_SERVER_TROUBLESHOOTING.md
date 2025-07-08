# SQL Server Cascading Dropdown Troubleshooting Guide

## Problem
Cascading dropdowns show "No investments available" when deployed to SQL Server, but work correctly in SQLite.

## Diagnostic Steps

### Step 1: Verify Database Engine Detection
Visit: `/project_actions/debug-cascading/`

**What to check:**
- `sql_server_mode`: Should be `true` for SQL Server deployment
- `engine`: Should contain "mssql" for SQL Server

**Expected for SQL Server:**
```json
{
  "engine": "mssql",
  "sql_server_mode": true,
  "parameters": {...}
}
```

### Step 2: Check Table Structure
The debug endpoint shows available columns in your SQL Server table.

**Required columns:**
- `project_id` (varchar/nvarchar)
- `monitoring_type_id` (varchar/nvarchar) 
- `type_of_investment` (varchar/nvarchar)
- `Kpi_description` (varchar/nvarchar)

### Step 3: Verify Data Availability
The debug endpoint shows:
- `investments_found`: Number of investments for the test query
- `sample_investments`: Sample data returned
- `available_combinations`: All project_id/monitoring_type_id combinations

### Step 4: Check Parameter Values
Common issues:
1. **Monitoring Type Mismatch**: SQLite uses 'proc', 'Tec', 'ESS' but SQL Server might use different values
2. **Project ID Format**: Ensure project IDs match exactly (case-sensitive)
3. **Data Encoding**: Check for special characters or encoding issues

### Step 5: Test Different Parameters
Try the debug endpoint with different values:
- `/project_actions/debug-cascading/?monitoring_type_id=proc&project_id=D309D6530GM`
- `/project_actions/debug-cascading/?monitoring_type_id=1&project_id=D309D6530GM`
- `/project_actions/debug-cascading/?monitoring_type_id=Tec&project_id=D309D6530GM`

## Common SQL Server Issues

### Issue 1: Database Engine Not Detected
**Symptom**: `sql_server_mode: false` even when using SQL Server
**Solution**: Check Django settings for correct SQL Server engine:
```python
DATABASES = {
    'default': {
        'ENGINE': 'mssql',  # Must contain 'mssql'
        'NAME': 'piuprod3',
        # ... other settings
    }
}
```

### Issue 2: Table/Column Name Mismatch
**Symptom**: Error in `table_columns` or empty results
**Solutions**:
- Verify table exists: `[piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]`
- Check column names are exact matches (case-sensitive)
- Ensure data types are compatible

### Issue 3: Data Value Mismatch
**Symptom**: `investments_found: 0` but table has data
**Solutions**:
- Check `available_combinations` to see what values exist
- Verify monitoring_type_id values match between SQLite and SQL Server
- Ensure project_id values are identical

### Issue 4: Parameter Binding Issues
**Symptom**: SQL execution errors
**Solution**: Verify queries use `?` placeholders for SQL Server (not `%s`)

## Resolution Actions

### Action 1: Fix Monitoring Type Values
If SQLite uses 'proc' but SQL Server uses '1':
1. Update the form to send correct values
2. Or update SQL Server data to match SQLite values

### Action 2: Update Column Names
If SQL Server columns have different names:
1. Update the raw SQL queries in `load_type_of_investments`
2. Ensure column names match your actual SQL Server schema

### Action 3: Fix Data Encoding
If data contains special characters:
1. Check encoding in SQL Server (UTF-8 vs ANSI)
2. Verify data import preserved special characters correctly

## Testing Commands

Run in SQL Server Management Studio:
```sql
-- Check table structure
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'dbo' 
AND TABLE_NAME = 'PIU_Financial_mgt_kpi_for_contract'

-- Check available data
SELECT DISTINCT project_id, monitoring_type_id 
FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]

-- Test specific query
SELECT DISTINCT type_of_investment
FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
WHERE project_id = 'D309D6530GM' AND monitoring_type_id = 'proc'
```

## Quick Fix Checklist

- [ ] Database engine contains 'mssql'
- [ ] Table `[piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]` exists
- [ ] Required columns exist with correct names
- [ ] Data exists for test project 'D309D6530GM'
- [ ] Monitoring type values match between SQLite and SQL Server
- [ ] SQL queries use `?` parameter binding
- [ ] No encoding or special character issues