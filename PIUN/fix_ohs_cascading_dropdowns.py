"""
Fix script for OHS cascading dropdown NoReverseMatch errors
Apply these changes to your local PIUN project
"""

print("=== OHS Cascading Dropdown Fix Instructions ===")
print()
print("1. UPDATE social_and_env/urls.py:")
print("   Add these URL patterns to the urlpatterns list:")
print()
print("   # Add these lines to social_and_env/urls.py")
print("   path('ajax/load-investment-types-ohs/', views.load_investment_types_ohs, name='load_investment_types_ohs'),")
print("   path('ajax/load-districts-ohs/', views.load_districts_ohs, name='load_districts_ohs'),")
print("   path('ajax/load-settlements-ohs/', views.load_settlements_ohs, name='load_settlements_ohs'),")
print()
print("2. ADD these view functions to social_and_env/views.py:")
print()

view_functions = '''
@login_required
def load_investment_types_ohs(request):
    """Load investment types for OHS based on selected project"""
    project_id = request.GET.get('project')
    investment_types = KPI_For_Contract.objects.none()
    
    if project_id:
        investment_types = KPI_For_Contract.objects.filter(project_id=project_id).distinct()
    
    return render(request, 'social_and_env/partials/investment_types_ohs.html', {
        'investment_types': investment_types
    })


@login_required
def load_districts_ohs(request):
    """Load districts for OHS based on selected region"""
    region_id = request.GET.get('region')
    districts = Districts.objects.none()
    
    if region_id:
        districts = Districts.objects.filter(region_code=region_id).order_by('district_name')
    
    return render(request, 'social_and_env/partials/districts_ohs.html', {
        'districts': districts
    })


@login_required
def load_settlements_ohs(request):
    """Load settlements for OHS based on selected district"""
    district_id = request.GET.get('district')
    settlements = Settlements.objects.none()
    
    if district_id:
        settlements = Settlements.objects.filter(district_code=district_id).order_by('settlement_name')
    
    return render(request, 'social_and_env/partials/settlements_ohs.html', {
        'settlements': settlements
    })
'''

print(view_functions)
print()
print("3. CREATE these template files:")
print()
print("   Create directory: templates/social_and_env/partials/")
print()
print("   File: templates/social_and_env/partials/investment_types_ohs.html")
print('<option value="">Select Investment Type</option>')
print('{% for investment_type in investment_types %}')
print('    <option value="{{ investment_type.pk }}">{{ investment_type.type_of_investment }}</option>')
print('{% endfor %}')
print()
print("   File: templates/social_and_env/partials/districts_ohs.html")
print('<option value="">Select District</option>')
print('{% for district in districts %}')
print('    <option value="{{ district.district_code }}">{{ district.district_name }}</option>')
print('{% endfor %}')
print()
print("   File: templates/social_and_env/partials/settlements_ohs.html")
print('<option value="">Select Settlement</option>')
print('{% for settlement in settlements %}')
print('    <option value="{{ settlement.settlement_code }}">{{ settlement.settlement_name }}</option>')
print('{% endfor %}')
print()
print("4. ADD missing imports to social_and_env/views.py (if not already present):")
print("   from django.http import JsonResponse")
print("   from django.shortcuts import render, get_object_or_404, redirect")
print("   from django.contrib.auth.decorators import login_required")
print("   from .models import Districts, Settlements, KPI_For_Contract")
print()
print("5. UPDATE JavaScript URLs in your OHS form template:")
print("   In templates/social_and_env/ohs/ohs_form.html, change:")
print("   fetch(`/social_and_env/load-districts-ohs/?region=${regionId}`)")
print("   TO:")
print("   fetch(`/social_and_env/ajax/load-districts-ohs/?region=${regionId}`)")
print()
print("   AND change:")
print("   fetch(`/social_and_env/load-settlements-ohs/?district=${districtId}`)")
print("   TO:")
print("   fetch(`/social_and_env/ajax/load-settlements-ohs/?district=${districtId}`)")
print()
print("6. RESTART your Django development server:")
print("   python manage.py runserver")
print()
print("=== End of Fix Instructions ===")