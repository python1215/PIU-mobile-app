# SQL Server Column Structure

## Actual SQL Server Table Columns
Based on your SQL Server database `[piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]`:

```sql
[type_of_investment]        -- varchar/nvarchar
[Kpi_description]           -- varchar/nvarchar  
[monitoring_Type_Code]      -- varchar/nvarchar (Note: capital T)
[date]                      -- datetime
[loginUser_id]              -- int
[monitoring_type_id]        -- varchar/nvarchar
[project_id]                -- varchar/nvarchar
```

## Query Updates Made

### 1. Investment Loading Query (Fixed)
```sql
SELECT DISTINCT 
    type_of_investment as value,
    type_of_investment as text
FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
WHERE project_id = ? AND monitoring_type_id = ?
ORDER BY type_of_investment
```

### 2. KPI Descriptions Query (Fixed)
**Before (Incorrect):**
```sql
SELECT DISTINCT 
    id as value,  -- ❌ Column 'id' does not exist
    Kpi_description as text
```

**After (Correct):**
```sql
SELECT DISTINCT 
    monitoring_Type_Code as value,  -- ✅ Uses actual column
    Kpi_description as text
FROM [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]
WHERE type_of_investment = ? AND project_id = ?
ORDER BY Kpi_description
```

## Key Fixes Applied
1. ✅ Updated KPI query to use `monitoring_Type_Code` instead of non-existent `id` column
2. ✅ Maintained proper parameter binding with `?` placeholders for SQL Server
3. ✅ Enhanced debug endpoint to test actual column structure
4. ✅ Added comprehensive debugging for both investment and KPI queries

## Testing
Use the debug endpoint to verify:
- `/project_actions/debug-cascading/` - Shows table structure and query results
- `/project_actions/debug-cascading/?monitoring_type_id=proc&project_id=D309D6530GM` - Test specific values