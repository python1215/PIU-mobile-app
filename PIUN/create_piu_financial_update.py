#!/usr/bin/env python3
"""
PIU Financial Management Module Update Package Creator
Creates a comprehensive deployment package for remote system updates
"""

import os
import shutil
import zipfile
import json
from datetime import datetime

def create_update_package():
    """Create comprehensive update package for PIU_Financial_mgt module"""
    
    # Create package directory
    package_dir = "PIU_Financial_mgt_Update_Package"
    if os.path.exists(package_dir):
        shutil.rmtree(package_dir)
    os.makedirs(package_dir)
    
    print("🏗️  Creating PIU Financial Management Update Package...")
    
    # 1. Copy core module files
    print("📁 Copying core module files...")
    module_source = "PIU_Financial_mgt"
    module_dest = os.path.join(package_dir, "PIU_Financial_mgt")
    
    if os.path.exists(module_source):
        shutil.copytree(module_source, module_dest)
        print(f"   ✓ Copied {module_source} to {module_dest}")
    
    # 2. Copy template files
    print("🎨 Copying template files...")
    template_source = "templates/PIU_Financial_mgt"
    template_dest = os.path.join(package_dir, "templates", "PIU_Financial_mgt")
    
    if os.path.exists(template_source):
        os.makedirs(os.path.dirname(template_dest), exist_ok=True)
        shutil.copytree(template_source, template_dest)
        print(f"   ✓ Copied {template_source} to {template_dest}")
    
    # 3. Copy dependency modules
    print("🔗 Copying dependency modules...")
    dependencies = ['setup', 'utils']
    
    for dep in dependencies:
        if os.path.exists(dep):
            dep_dest = os.path.join(package_dir, dep)
            shutil.copytree(dep, dep_dest)
            print(f"   ✓ Copied dependency: {dep}")
    
    # 4. Create installation script
    print("📋 Creating installation script...")
    install_script = f"""#!/bin/bash
# PIU Financial Management Module Installation Script
# Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

echo "🚀 Installing PIU Financial Management Module..."

# 1. Copy module files
echo "📁 Copying module files..."
cp -r PIU_Financial_mgt/ /path/to/django/project/
cp -r templates/ /path/to/django/project/templates/
cp -r setup/ /path/to/django/project/
cp -r utils/ /path/to/django/project/

# 2. Update Django settings
echo "⚙️  Updating Django settings..."
echo "Add 'PIU_Financial_mgt' to INSTALLED_APPS in settings.py"

# 3. Update URL configuration
echo "🌐 Updating URL configuration..."
echo "Add path('PIU-Financial-mgt/', include('PIU_Financial_mgt.urls')) to main urls.py"

# 4. Run migrations
echo "🗄️  Running database migrations..."
python manage.py makemigrations PIU_Financial_mgt
python manage.py makemigrations setup
python manage.py migrate

# 5. Load initial data
echo "📊 Loading initial data..."
python manage.py shell << EOF
from PIU_Financial_mgt.models import Currency
from django.contrib.auth.models import User
user = User.objects.first()
if user:
    Currency.objects.get_or_create(currency='USD', defaults={{'loginUser': user}})
    Currency.objects.get_or_create(currency='GMD', defaults={{'loginUser': user}})
    Currency.objects.get_or_create(currency='EUR', defaults={{'loginUser': user}})
    Currency.objects.get_or_create(currency='UA', defaults={{'loginUser': user}})
    print("✓ Currency data loaded successfully")
else:
    print("⚠️  No users found. Please create a superuser first.")
EOF

echo "✅ PIU Financial Management Module installed successfully!"
echo "🌐 Access the module at: /PIU-Financial-mgt/"
"""
    
    with open(os.path.join(package_dir, "install.sh"), 'w') as f:
        f.write(install_script)
    os.chmod(os.path.join(package_dir, "install.sh"), 0o755)
    
    # 5. Create Windows installation script
    print("🪟 Creating Windows installation script...")
    install_bat = f"""@echo off
REM PIU Financial Management Module Installation Script (Windows)
REM Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

echo Installing PIU Financial Management Module...

REM 1. Copy module files
echo Copying module files...
xcopy /E /I /Y PIU_Financial_mgt "C:\\path\\to\\django\\project\\PIU_Financial_mgt"
xcopy /E /I /Y templates "C:\\path\\to\\django\\project\\templates"
xcopy /E /I /Y setup "C:\\path\\to\\django\\project\\setup"
xcopy /E /I /Y utils "C:\\path\\to\\django\\project\\utils"

REM 2. Run migrations
echo Running database migrations...
python manage.py makemigrations PIU_Financial_mgt
python manage.py makemigrations setup
python manage.py migrate

echo PIU Financial Management Module installed successfully!
echo Access the module at: /PIU-Financial-mgt/
pause
"""
    
    with open(os.path.join(package_dir, "install.bat"), 'w') as f:
        f.write(install_bat)
    
    # 6. Create configuration file
    print("⚙️  Creating configuration file...")
    config = {
        "module_name": "PIU_Financial_mgt",
        "version": "1.5",
        "created_date": datetime.now().isoformat(),
        "description": "PIU Financial Management Module for project budget tracking and financial reporting",
        "dependencies": ["setup", "utils", "django", "django-bootstrap5"],
        "database_models": [
            "Currency", "Project", "Component", "SubComponent", 
            "Activities", "KPI_For_Contract"
        ],
        "url_namespace": "PIU_Financial_mgt",
        "template_directory": "templates/PIU_Financial_mgt",
        "features": [
            "Project financial management",
            "Budget allocation tracking", 
            "Component and subcomponent management",
            "Activity tracking",
            "Multi-currency support",
            "Excel export functionality",
            "Financial dashboards",
            "Budget validation"
        ],
        "installation_steps": [
            "Copy module files to Django project",
            "Add 'PIU_Financial_mgt' to INSTALLED_APPS",
            "Update main urls.py with module URL patterns",
            "Run migrations",
            "Load initial currency data",
            "Access module at /PIU-Financial-mgt/"
        ]
    }
    
    with open(os.path.join(package_dir, "module_config.json"), 'w') as f:
        json.dump(config, f, indent=2)
    
    # 7. Copy documentation
    print("📚 Copying documentation...")
    docs_to_copy = [
        "PIU_FINANCIAL_MGT_UPDATE_PACKAGE.md",
        "replit.md"
    ]
    
    for doc in docs_to_copy:
        if os.path.exists(doc):
            shutil.copy2(doc, package_dir)
            print(f"   ✓ Copied documentation: {doc}")
    
    # 8. Create requirements file
    print("📦 Creating requirements file...")
    requirements = """# PIU Financial Management Module Requirements
django>=4.0
django-bootstrap5
django-widget-tweaks
openpyxl
python-dateutil
pillow
"""
    
    with open(os.path.join(package_dir, "requirements.txt"), 'w') as f:
        f.write(requirements)
    
    # 9. Generate package statistics
    print("📊 Generating package statistics...")
    
    # Count files
    total_files = 0
    python_files = 0
    template_files = 0
    
    for root, dirs, files in os.walk(package_dir):
        for file in files:
            total_files += 1
            if file.endswith('.py'):
                python_files += 1
            elif file.endswith('.html'):
                template_files += 1
    
    # Calculate size
    total_size = 0
    for root, dirs, files in os.walk(package_dir):
        for file in files:
            file_path = os.path.join(root, file)
            total_size += os.path.getsize(file_path)
    
    # Create statistics file
    stats = f"""PIU Financial Management Module Package Statistics
Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Package Contents:
- Total Files: {total_files}
- Python Files: {python_files}
- Template Files: {template_files}
- Package Size: {total_size / 1024 / 1024:.2f} MB

Module Components:
- Core Models: 6 (Currency, Project, Component, SubComponent, Activities, KPI_For_Contract)
- Views: 30+ (CRUD operations, dashboards, reports, exports)
- Templates: 28 (responsive design with Bootstrap 5)
- URL Patterns: 25+ (comprehensive routing)
- Forms: 15+ (with validation and AJAX support)

Key Features:
✓ Project financial management
✓ Budget allocation tracking
✓ Component hierarchy management
✓ Activity monitoring
✓ Multi-currency support (USD, GMD, EUR, UA)
✓ Excel export functionality
✓ Interactive dashboards
✓ Real-time budget validation
✓ Dual-mode database support (SQLite/SQL Server)
✓ Responsive design
✓ User authentication and tracking

Installation:
1. Run install.sh (Linux/Mac) or install.bat (Windows)
2. Update Django settings and URLs as instructed
3. Access module at /PIU-Financial-mgt/

Support:
- Review module_config.json for detailed configuration
- Check PIU_FINANCIAL_MGT_UPDATE_PACKAGE.md for comprehensive documentation
- Examine model files for database structure
"""
    
    with open(os.path.join(package_dir, "PACKAGE_INFO.txt"), 'w') as f:
        f.write(stats)
    
    # 10. Create ZIP archive
    print("🗜️  Creating ZIP archive...")
    zip_filename = f"PIU_Financial_mgt_Update_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(package_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arc_path = os.path.relpath(file_path, package_dir)
                zipf.write(file_path, arc_path)
    
    print(f"✅ Package created successfully!")
    print(f"📦 Package directory: {package_dir}")
    print(f"🗜️  ZIP archive: {zip_filename}")
    print(f"📊 Total files: {total_files}")
    print(f"💾 Package size: {total_size / 1024 / 1024:.2f} MB")
    
    return package_dir, zip_filename

if __name__ == "__main__":
    package_dir, zip_file = create_update_package()
    print(f"\n🎉 PIU Financial Management Update Package ready for deployment!")
    print(f"📁 Extract {zip_file} on remote system and run installation script")