#!/bin/bash
# PIU Financial Management Module Installation Script
# Generated on 2025-07-22 20:44:05

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
    Currency.objects.get_or_create(currency='USD', defaults={'loginUser': user})
    Currency.objects.get_or_create(currency='GMD', defaults={'loginUser': user})
    Currency.objects.get_or_create(currency='EUR', defaults={'loginUser': user})
    Currency.objects.get_or_create(currency='UA', defaults={'loginUser': user})
    print("✓ Currency data loaded successfully")
else:
    print("⚠️  No users found. Please create a superuser first.")
EOF

echo "✅ PIU Financial Management Module installed successfully!"
echo "🌐 Access the module at: /PIU-Financial-mgt/"
