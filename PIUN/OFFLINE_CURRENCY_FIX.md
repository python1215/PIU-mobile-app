# Fix for Currency Template Filter Error in Offline Environment

## Problem
`TemplateSyntaxError: Invalid filter: 'format_currency'` appears in offline deployment

## Solution Steps

### 1. Verify INSTALLED_APPS in settings.py
Ensure `PIU_Financial_mgt` is listed in INSTALLED_APPS:
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Your apps
    'PIU_Financial_mgt',  # This must be present
    'social_and_env',
    'NAWEC_KPI',
    # ... other apps
]
```

### 2. Verify templatetags directory structure
Your PIU_Financial_mgt app should have:
```
PIU_Financial_mgt/
├── templatetags/
│   ├── __init__.py
│   └── currency_tags.py
```

### 3. Check __init__.py file
Ensure `PIU_Financial_mgt/templatetags/__init__.py` exists and contains:
```python
# Template tags package
```

### 4. Verify currency_tags.py content
Ensure `PIU_Financial_mgt/templatetags/currency_tags.py` contains:
```python
from django import template

register = template.Library()

@register.filter
def currency_symbol(currency_code):
    """Return the appropriate currency symbol for a given currency code"""
    symbol_map = {
        'USD': '$',
        'EUR': '€',
        'EURO': '€',
        'GMD': 'D',
        'UA': 'UA',
        'GBP': '£'
    }
    return symbol_map.get(currency_code, currency_code)

@register.filter
def format_currency(amount, currency_code):
    """Format amount with appropriate currency symbol"""
    symbol = currency_symbol(currency_code)
    try:
        amount_float = float(amount)
        return f"{symbol}{amount_float:,.2f}"
    except (ValueError, TypeError):
        return f"{symbol}{amount}"
```

### 5. Verify template loading
In your template files, ensure you load the tags at the top:
```django
{% extends 'PIU_Financial_mgt/base.html' %}
{% load widget_tweaks %}
{% load currency_tags %}  <!-- This line is critical -->
```

### 6. Clear Python cache and restart
Run these commands in your offline environment:
```bash
# Clear Python cache
find . -name "*.pyc" -delete
find . -name "__pycache__" -type d -exec rm -rf {} +

# Collect static files (if needed)
python manage.py collectstatic --noinput

# Restart your Django server
python manage.py runserver
```

### 7. Alternative Fix - Use Built-in Filters
If the custom filter still doesn't work, you can replace currency formatting with Django's built-in filters in templates:

Replace:
```django
{{ project.funding|format_currency:project.currency.currency }}
```

With:
```django
{% if project.currency.currency == 'USD' %}${% elif project.currency.currency == 'EUR' %}€{% elif project.currency.currency == 'GMD' %}D{% else %}{{ project.currency.currency }}{% endif %}{{ project.funding|floatformat:2|floatformat:',2f' }}
```

### 8. Debug Template Loading
Add this to your view to debug template tag loading:
```python
# In your view file
import logging
logger = logging.getLogger(__name__)

def your_view(request):
    try:
        from PIU_Financial_mgt.templatetags import currency_tags
        logger.info("Currency tags loaded successfully")
    except ImportError as e:
        logger.error(f"Failed to load currency tags: {e}")
    
    # ... rest of your view code
```

### 9. Check File Permissions
Ensure all files have proper read permissions:
```bash
chmod -R 644 PIU_Financial_mgt/templatetags/
chmod 755 PIU_Financial_mgt/templatetags/
```

### 10. Test the Filter Manually
In Django shell, test if the filter works:
```python
python manage.py shell

from PIU_Financial_mgt.templatetags.currency_tags import format_currency
result = format_currency(1000, 'USD')
print(result)  # Should output: $1,000.00
```

## Common Issues and Solutions

1. **Module not found**: Ensure `PIU_Financial_mgt` is in INSTALLED_APPS
2. **Import error**: Check file permissions and __init__.py files
3. **Filter not registered**: Verify @register.filter decorator is present
4. **Cache issues**: Clear Python cache and restart server
5. **Path issues**: Ensure templatetags directory is in the app root

## Quick Test
Create this simple test template to verify the filter works:
```django
<!-- test_currency.html -->
{% load currency_tags %}
Test: {{ 1000|format_currency:"USD" }}
```

If this shows "$1,000.00", your filter is working correctly.