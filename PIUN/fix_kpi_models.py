#!/usr/bin/env python3
"""
Script to fix NAWEC KPI model calculation issues
Replaces field arithmetic with proper float() conversions
"""
import re
import os

def fix_model_file():
    model_file = "NAWEC_KPI/models.py"
    
    with open(model_file, 'r') as f:
        content = f.read()
    
    # Fix arithmetic operations with Django fields
    patterns = [
        # Fix division operations
        (r'self\.(\w+)\s*/\s*self\.(\w+)', r'float(self.\1) / float(self.\2)'),
        # Fix subtraction operations 
        (r'\(self\.(\w+)\s*-\s*self\.(\w+)\)', r'(float(self.\1) - float(self.\2))'),
        # Fix multiplication with fields
        (r'self\.(\w+)\s*\*\s*(\d+)', r'float(self.\1) * \2'),
        # Fix comparison with fields  
        (r'self\.(\w+)\s*!=\s*self\.(\w+)', r'float(self.\1) != float(self.\2)'),
        # Fix Decimal() constructor with fields
        (r'Decimal\(self\.(\w+)\)', r'Decimal(float(self.\1))'),
        # Fix int() constructor with fields
        (r'int\(self\.(\w+)\)', r'int(float(self.\1))'),
    ]
    
    # Apply fixes
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)
    
    # Fix __str__ methods that return field objects
    content = re.sub(
        r'return\s+str\(self\.(\w+)\)',
        r'return str(self.\1 or "")',
        content
    )
    
    # Fix default values in field definitions
    content = re.sub(
        r'models\.(Float|Integer)Field\([^)]*default=(\d+\.\d+)[^)]*\)',
        lambda m: m.group(0).replace(f'default={m.group(2)}', f'default={m.group(2)}'),
        content
    )
    
    with open(model_file, 'w') as f:
        f.write(content)
    
    print("✅ Fixed NAWEC KPI models arithmetic operations")

def fix_str_methods():
    """Fix __str__ methods that return field objects"""
    model_file = "NAWEC_KPI/models.py"
    
    with open(model_file, 'r') as f:
        lines = f.readlines()
    
    # Find and fix problematic __str__ methods
    for i, line in enumerate(lines):
        if 'def __str__(self):' in line:
            # Check next few lines for return statements with fields
            for j in range(1, 5):
                if i + j < len(lines):
                    return_line = lines[i + j]
                    if 'return' in return_line and 'self.' in return_line and 'f"' not in return_line:
                        # Fix simple field returns
                        if 'return self.' in return_line:
                            field_name = return_line.split('return self.')[1].strip()
                            lines[i + j] = f'        return str(self.{field_name})\n'
    
    with open(model_file, 'w') as f:
        f.writelines(lines)
    
    print("✅ Fixed __str__ methods")

if __name__ == "__main__":
    fix_model_file()
    fix_str_methods()
    print("🎉 NAWEC KPI models fixed!")