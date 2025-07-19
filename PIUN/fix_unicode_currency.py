#!/usr/bin/env python
"""
Script to fix Unicode encoding issues in currency_tags.py for offline environment
This fixes the UTF-8 codec error with currency symbols
"""

import os
from pathlib import Path

def fix_unicode_currency_tags():
    """Fix Unicode encoding issues in currency template tags"""
    
    print("🔧 Fixing Unicode encoding issues in currency template tags...")
    
    # Get the project root
    project_root = Path(__file__).parent
    templatetags_dir = project_root / "PIU_Financial_mgt" / "templatetags"
    currency_tags_file = templatetags_dir / "currency_tags.py"
    
    # Create the templatetags directory if it doesn't exist
    templatetags_dir.mkdir(parents=True, exist_ok=True)
    
    # Create __init__.py if missing
    init_file = templatetags_dir / "__init__.py"
    if not init_file.exists():
        with open(init_file, 'w', encoding='utf-8') as f:
            f.write("# Template tags package\n")
        print(f"✅ Created __init__.py: {init_file}")
    
    # Create currency_tags.py with proper Unicode encoding
    currency_tags_content = '''# -*- coding: utf-8 -*-
from django import template

register = template.Library()

@register.filter
def currency_symbol(currency_code):
    """Return the appropriate currency symbol for a given currency code"""
    symbol_map = {
        'USD': '$',
        'EUR': '\\u20AC',  # Euro symbol using Unicode escape
        'EURO': '\\u20AC',  # Euro symbol using Unicode escape
        'GMD': 'D',
        'UA': 'UA',
        'GBP': '\\u00A3'  # Pound symbol using Unicode escape
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
'''
    
    # Write the file with UTF-8 encoding
    with open(currency_tags_file, 'w', encoding='utf-8') as f:
        f.write(currency_tags_content)
    print(f"✅ Created currency_tags.py with proper Unicode encoding: {currency_tags_file}")
    
    # Clear Python cache
    print("🧹 Clearing Python cache...")
    import shutil
    for root, dirs, files in os.walk(project_root):
        # Remove __pycache__ directories
        if '__pycache__' in dirs:
            pycache_path = os.path.join(root, '__pycache__')
            try:
                shutil.rmtree(pycache_path)
                print(f"🗑️  Removed: {pycache_path}")
            except:
                pass
        
        # Remove .pyc files
        for file in files:
            if file.endswith('.pyc'):
                pyc_path = os.path.join(root, file)
                try:
                    os.remove(pyc_path)
                    print(f"🗑️  Removed: {pyc_path}")
                except:
                    pass
    
    print("\n🎉 Unicode currency template tags fix completed!")
    print("📋 Next steps:")
    print("   1. Restart your Django server: python manage.py runserver")
    print("   2. Clear browser cache")
    print("   3. Test the dashboard page")

if __name__ == "__main__":
    fix_unicode_currency_tags()