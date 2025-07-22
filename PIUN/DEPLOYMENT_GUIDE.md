# PIU Financial Management Module - Remote Deployment Guide

## Package Information
- **Package Name**: PIU_Financial_mgt_Update_20250722_204405.zip
- **Package Size**: 0.69 MB (174,777 bytes)
- **Total Files**: 71 files
- **Created**: July 22, 2025 20:44:05

## Quick Deployment Steps

### Option 1: Direct File Transfer
```bash
# Download the ZIP package from this Replit
# Location: /home/runner/workspace/PIUN/PIU_Financial_mgt_Update_20250722_204405.zip

# On your remote system:
1. Upload PIU_Financial_mgt_Update_20250722_204405.zip to your server
2. Extract: unzip PIU_Financial_mgt_Update_20250722_204405.zip
3. Run: chmod +x install.sh && ./install.sh
4. Update Django settings as instructed
```

### Option 2: Manual Installation
If you're having connection issues, you can manually copy the files:

1. **Copy Core Module**
   ```bash
   cp -r PIU_Financial_mgt/ /path/to/your/django/project/
   ```

2. **Copy Templates**
   ```bash
   cp -r templates/PIU_Financial_mgt/ /path/to/your/django/project/templates/
   ```

3. **Copy Dependencies**
   ```bash
   cp -r setup/ /path/to/your/django/project/
   cp -r utils/ /path/to/your/django/project/
   ```

4. **Update Django Settings**
   Add to `settings.py`:
   ```python
   INSTALLED_APPS = [
       # ... existing apps
       'PIU_Financial_mgt',
       'setup',
   ]
   ```

5. **Update URLs**
   Add to main `urls.py`:
   ```python
   from django.urls import path, include
   
   urlpatterns = [
       # ... existing patterns
       path('PIU-Financial-mgt/', include('PIU_Financial_mgt.urls')),
   ]
   ```

6. **Run Migrations**
   ```bash
   python manage.py makemigrations PIU_Financial_mgt
   python manage.py makemigrations setup
   python manage.py migrate
   ```

7. **Load Initial Data**
   ```bash
   python manage.py shell
   ```
   ```python
   from PIU_Financial_mgt.models import Currency
   from django.contrib.auth.models import User
   user = User.objects.first()
   Currency.objects.get_or_create(currency='USD', defaults={'loginUser': user})
   Currency.objects.get_or_create(currency='GMD', defaults={'loginUser': user})
   Currency.objects.get_or_create(currency='EUR', defaults={'loginUser': user})
   Currency.objects.get_or_create(currency='UA', defaults={'loginUser': user})
   ```

## Package Contents
```
PIU_Financial_mgt_Update_Package/
├── PIU_Financial_mgt/          # Core module (10 Python files)
│   ├── models.py               # 6 database models
│   ├── views.py                # 30+ view functions
│   ├── forms.py                # 15+ forms with validation
│   ├── urls.py                 # 25+ URL patterns
│   └── migrations/             # Database migrations
├── templates/                  # 28 HTML templates
│   └── PIU_Financial_mgt/      # Bootstrap 5 responsive design
├── setup/                      # Dependency module
├── utils/                      # Database utilities
├── install.sh                  # Linux installation script
├── install.bat                 # Windows installation script
├── requirements.txt            # Python dependencies
├── module_config.json          # Configuration file
└── documentation/              # Comprehensive docs
```

## Features Included
- ✅ Project financial management with CRUD operations
- ✅ Budget allocation tracking and validation
- ✅ Component and subcomponent hierarchy management
- ✅ Activity monitoring and progress tracking
- ✅ Multi-currency support (USD, GMD, EUR, UA)
- ✅ Excel export functionality for reports
- ✅ Interactive dashboards with real-time data
- ✅ Dual-mode database support (SQLite/SQL Server)
- ✅ Responsive Bootstrap 5 design
- ✅ User authentication and activity tracking

## Access Module
After installation, access the module at:
```
http://your-server/PIU-Financial-mgt/
```

## Troubleshooting

### Connection Issues
If you're having SSH/remote connection problems:
1. Use the direct download link from this Replit
2. Transfer files via FTP/SFTP instead of SSH
3. Use the manual installation steps above

### Database Issues
If migrations fail:
```bash
python manage.py makemigrations --empty PIU_Financial_mgt
python manage.py migrate --fake-initial
```

### Template Issues
Ensure templates directory structure:
```
your_project/
├── templates/
│   └── PIU_Financial_mgt/
│       ├── base.html
│       ├── projects/
│       ├── components/
│       └── activities/
```

## Support Files
- `PACKAGE_INFO.txt` - Package statistics and overview
- `PIU_FINANCIAL_MGT_UPDATE_PACKAGE.md` - Detailed documentation
- `module_config.json` - Configuration reference
- `requirements.txt` - Python dependencies

## Verification
After installation, verify the module works:
1. Navigate to `/PIU-Financial-mgt/`
2. Check dashboard loads correctly
3. Test project creation
4. Verify component management
5. Test Excel export functionality

## Package Location in Replit
```
/home/runner/workspace/PIUN/PIU_Financial_mgt_Update_20250722_204405.zip
```

You can download this file directly from the Replit file browser or use the provided installation scripts.