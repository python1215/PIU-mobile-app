# SQL Server Table Access Fix

## Issues Identified

### 1. Invalid Table Name Error
**Error**: `Invalid object name 'piuprod3.dbo.PIU_Financial_mgt_kpi_for_contract'`
**Root Cause**: SQL Server schema reference is incorrect
**Solution**: Use simple table name `PIU_Financial_mgt_kpi_for_contract` without schema prefix

### 2. Truncated Project ID
**Error**: URL `project_id=D309&%20D6530%20-GM` becomes `project_id=D309`
**Root Cause**: Malformed URL where project ID is split across multiple parameters
**Solution**: Reconstruct complete project ID from query string

## Fix Applied

### 1. Removed Schema Prefix
```sql
-- OLD (fails in SQL Server):
FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]

-- NEW (works in SQL Server):
FROM PIU_Financial_mgt_kpi_for_contract
```

### 2. Project ID Reconstruction
```python
# Detect truncated project ID
if project_id and len(project_id) < 10:  # Likely truncated
    # Reconstruct from full query string
    full_query = request.META.get('QUERY_STRING', '')
    # Extract: project_id=D309&%20D6530%20-GM → D309D6530GM
```

## SQL Server Table Requirements

Your SQL Server should have a table named exactly:
```
PIU_Financial_mgt_kpi_for_contract
```

With columns:
- `project_id` (varchar)
- `monitoring_type_id` (varchar) 
- `type_of_investment` (text)
- `monitoring_Type_Code` (varchar)
- `Kpi_description` (text)

## Testing

After this fix, the system should:
1. Correctly reconstruct `D309D6530GM` from malformed URL
2. Access SQL Server table without schema prefix
3. Return investment options for the project

## If Still Getting Errors

1. **Verify table exists**:
   ```sql
   SELECT COUNT(*) FROM PIU_Financial_mgt_kpi_for_contract
   ```

2. **Check table permissions** for the database user

3. **Verify data exists**:
   ```sql
   SELECT DISTINCT project_id FROM PIU_Financial_mgt_kpi_for_contract
   ```