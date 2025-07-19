#!/usr/bin/env python
"""
Script to fix currency template filter issues in offline environment
Run this script from your Django project root directory
"""

import os
import sys
import shutil
from pathlib import Path

def fix_currency_tags():
    """Fix currency template tags for offline deployment"""
    
    print("🔧 Fixing currency template tags for offline environment...")
    
    # Get the project root
    project_root = Path(__file__).parent
    templatetags_dir = project_root / "PIU_Financial_mgt" / "templatetags"
    
    # Step 1: Ensure templatetags directory exists
    if not templatetags_dir.exists():
        print(f"❌ templatetags directory not found: {templatetags_dir}")
        templatetags_dir.mkdir(parents=True, exist_ok=True)
        print(f"✅ Created templatetags directory: {templatetags_dir}")
    
    # Step 2: Create __init__.py if missing
    init_file = templatetags_dir / "__init__.py"
    if not init_file.exists():
        with open(init_file, 'w') as f:
            f.write("# Template tags package\n")
        print(f"✅ Created __init__.py: {init_file}")
    
    # Step 3: Create/update currency_tags.py
    currency_tags_file = templatetags_dir / "currency_tags.py"
    currency_tags_content = '''from django import template

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
'''
    
    with open(currency_tags_file, 'w') as f:
        f.write(currency_tags_content)
    print(f"✅ Created/updated currency_tags.py: {currency_tags_file}")
    
    # Step 4: Clear Python cache
    print("🧹 Clearing Python cache...")
    for root, dirs, files in os.walk(project_root):
        # Remove __pycache__ directories
        if '__pycache__' in dirs:
            pycache_path = os.path.join(root, '__pycache__')
            shutil.rmtree(pycache_path)
            print(f"🗑️  Removed: {pycache_path}")
        
        # Remove .pyc files
        for file in files:
            if file.endswith('.pyc'):
                pyc_path = os.path.join(root, file)
                os.remove(pyc_path)
                print(f"🗑️  Removed: {pyc_path}")
    
    # Step 5: Test if Django can import the module
    try:
        sys.path.append(str(project_root))
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piu_project.settings')
        
        import django
        django.setup()
        
        from PIU_Financial_mgt.templatetags import currency_tags
        result = currency_tags.format_currency(1000, 'USD')
        print(f"✅ Template filter test successful: {result}")
        
    except Exception as e:
        print(f"❌ Template filter test failed: {e}")
        print("🔍 Manual steps required - see OFFLINE_CURRENCY_FIX.md")
    
    print("\n🎉 Currency template tags fix completed!")
    print("📋 Next steps:")
    print("   1. Restart your Django server")
    print("   2. Clear browser cache")
    print("   3. Test the dashboard page")
    print("   4. If still failing, check OFFLINE_CURRENCY_FIX.md for manual steps")

if __name__ == "__main__":
    fix_currency_tags()