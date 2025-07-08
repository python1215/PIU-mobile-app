# SQL Server Project ID Parameter Parsing Fix

## Issue
Project IDs containing special characters like `&` were being incorrectly parsed in AJAX endpoints, causing cascading dropdown failures.

**Example Problem:**
- Full Project ID: `D309& D6530 -GM`
- URL: `...?project_id=D309&%20D6530%20-GM&monitoring_type_id=proc`
- Wrong parsing: `D309` (truncated at `&` character)
- Correct parsing: `D309& D6530 -GM`

## Root Cause
The `&` character in project IDs was being interpreted as a URL parameter separator instead of part of the project ID value.

## Solution Applied

### 1. Enhanced Parameter Extraction
Updated both `load_type_of_investments` and `load_kpi_descriptions` functions to:

1. **Extract from full query string** instead of using `request.GET.get()`
2. **Parse manually** to handle special characters properly
3. **Maintain fallback** to standard GET parameter method

### 2. Implementation Details

```python
# Extract project_id from full query string
full_query_string = request.META.get('QUERY_STRING', '')
project_id = None

if 'project_id=' in full_query_string:
    start_idx = full_query_string.find('project_id=') + len('project_id=')
    remaining = full_query_string[start_idx:]
    
    # Find end of project_id by looking for next known parameter
    known_params = ['&monitoring_type_id=', '&investment_code=']
    end_idx = len(remaining)
    for param in known_params:
        param_pos = remaining.find(param)
        if param_pos != -1 and param_pos < end_idx:
            end_idx = param_pos
    
    project_id = remaining[:end_idx]
    project_id = urllib.parse.unquote(project_id)
```

### 3. Debugging Output
Added comprehensive logging to track parameter extraction:

```python
print(f"Full query string: {full_query_string}")
print(f"Extracted project_id: {project_id}")
```

## Expected Results

### Before Fix:
```
Received project_id: D309
SQL Server query results: 0 rows found
```

### After Fix:
```
Full query string: monitoring_type_id=proc&project_id=D309&%20D6530%20-GM
Extracted project_id: D309& D6530 -GM
SQL Server query results: X rows found
```

## Impact
- Cascading dropdowns now work correctly with project IDs containing special characters
- No modification of actual project_id values - preserves exact format
- Maintains backward compatibility with simple project IDs
- Supports both SQL Server and SQLite environments

## Files Modified
- `PIUN/project_actions/views.py` (functions: `load_type_of_investments`, `load_kpi_descriptions`)

## Verification
1. Test with project ID: `D309& D6530 -GM`
2. Check logs for full query string parsing
3. Verify cascading dropdown functionality
4. Confirm SQL Server query returns data