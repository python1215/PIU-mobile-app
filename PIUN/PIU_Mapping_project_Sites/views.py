from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.db.models import F, Prefetch, Sum, Count
import json
from .models import projectMapping, settlementwithCoordinates, Access, nawecinfrastructure
from .forms import MappingForm, NAWECInfrastructureForm, settlementwithCoordinatesForm
from django.contrib import messages
from PIU_Financial_mgt.models import Project, Donor
from social_and_env.models import Settlement, Regions
from setup.models import YEAR, Districts
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.core.cache import cache
from django.core.paginator import Paginator


def working_map(request):
    """Working map implementation"""
    
    project_communities = projectMapping.objects.select_related(
        'region', 'district', 'settlement', 'profile_year', 'access'
    ).prefetch_related('project', 'donor').filter(
        Latitude__isnull=False,
        Longitude__isnull=False
    ).all()
    
    project_data = []
    for community in project_communities:
        try:
            if community.Latitude and community.Longitude:
                projects = community.project.all()
                project_names = [str(p.project) for p in projects]
                
                project_data.append({
                    'id': community.id,
                    'latitude': float(community.Latitude),
                    'longitude': float(community.Longitude),
                    'settlement': community.settlement.settlement_name if community.settlement else 'Unknown',
                    'region': community.region.region_name if community.region else 'Unknown', 
                    'district': community.district.district_name if community.district else 'Unknown',
                    'projects': project_names,
                    'total_households': community.Total_No_of_Households or 0,
                    'connected_households': community.no_of_connected_household or 0,
                    'access_type': community.access.access_type if community.access else 'Unknown',
                    'year': community.profile_year.profile_year if community.profile_year else 'Unknown',
                })
        except Exception as e:
            continue
    
    context = {
        'total_communities': project_communities.count(),
        'project_data_json': json.dumps(project_data),
    }
    
    return render(request, 'PIU_Mapping_project_Sites/working_map.html', context)

def simple_map(request):
    """Simplified map view with basic Leaflet implementation"""
    
    project_communities = projectMapping.objects.select_related(
        'region', 'district', 'settlement', 'profile_year', 'access'
    ).prefetch_related('project', 'donor').filter(
        Latitude__isnull=False,
        Longitude__isnull=False
    ).all()
    
    # Generate simple project data for JavaScript
    project_data = []
    for community in project_communities:
        try:
            if community.Latitude and community.Longitude:
                projects = community.project.all()
                project_names = [str(p.project) for p in projects]
                
                project_data.append({
                    'id': community.id,
                    'latitude': float(community.Latitude),
                    'longitude': float(community.Longitude),
                    'settlement': community.settlement.settlement_name if community.settlement else 'Unknown',
                    'region': community.region.region_name if community.region else 'Unknown', 
                    'district': community.district.district_name if community.district else 'Unknown',
                    'projects': project_names,
                    'total_households': community.Total_No_of_Households or 0,
                    'connected_households': community.no_of_connected_household or 0,
                })
        except Exception as e:
            print(f"Error processing community {community.id}: {str(e)}")
            continue
    
    context = {
        'total_communities': project_communities.count(),
        'project_data_json': json.dumps(project_data),
    }
    
    return render(request, 'PIU_Mapping_project_Sites/simple_map.html', context)

def index(request):
    """Main mapping view displaying authentic NAWEC PIU project coordinates"""
    
    project_communities = projectMapping.objects.select_related(
        'region', 'district', 'settlement', 'profile_year', 'access'
    ).prefetch_related('project', 'donor').filter(
        Latitude__isnull=False,
        Longitude__isnull=False
    ).all()
    
    # Debug: Print number of communities found
    print(f"DEBUG: Found {project_communities.count()} communities with coordinates")
    
    # Check for coordinate parameters to focus on specific location
    focus_lat = request.GET.get('lat')
    focus_lng = request.GET.get('lng')
    mapping_id = request.GET.get('mappingId')
    
    if focus_lat and focus_lng:
        try:
            center_lat = float(focus_lat)
            center_lng = float(focus_lng)
            zoom_level = 16  # Zoom in when focusing on specific location
        except (ValueError, TypeError):
            center_lat = 13.4667  # Default to Gambia center
            center_lng = -15.3100
            zoom_level = 9
    else:
        center_lat = 13.4667  # Default to Gambia center
        center_lng = -15.3100
        zoom_level = 9
    
    print(f"DEBUG: Map created successfully centered at [{center_lat}, {center_lng}]")

    # Generate project data for JavaScript map
    project_data = []
    
    for community in project_communities:
        try:
            if community.Latitude and community.Longitude:
                projects = community.project.all()
                project_names = [str(p.project) for p in projects]
                
                # Check if this is the focused location from URL parameters
                is_focused = False
                if focus_lat and focus_lng:
                    try:
                        focus_lat_f = float(focus_lat)
                        focus_lng_f = float(focus_lng)
                        # Check if coordinates match (within small tolerance)
                        if abs(float(community.Latitude) - focus_lat_f) < 0.0001 and abs(float(community.Longitude) - focus_lng_f) < 0.0001:
                            is_focused = True
                    except (ValueError, TypeError):
                        pass
                
                # Also check mapping ID match for precise highlighting
                if mapping_id and str(community.id) == str(mapping_id):
                    is_focused = True
                
                # Build project data object
                project_data.append({
                    'id': community.id,
                    'latitude': float(community.Latitude),
                    'longitude': float(community.Longitude),
                    'settlement': community.settlement.settlement_name if community.settlement else 'Unknown',
                    'region': community.region.region_name if community.region else 'Unknown',
                    'district': community.district.district_name if community.district else 'Unknown',
                    'projects': project_names,
                    'total_households': community.Total_No_of_Households or 0,
                    'connected_households': community.no_of_connected_household or 0,
                    'access_type': community.access.access_type if community.access else 'Unknown',
                    'profile_year': community.profile_year.profile_year if community.profile_year else 'Unknown',
                    'is_focused': is_focused
                })
        except Exception as e:
            print(f"DEBUG: Error processing community {community.id}: {str(e)}")
            continue
    
    print(f"DEBUG: Generated data for {len(project_data)} project locations")

    total_communities = project_communities.count()
    total_households = project_communities.aggregate(total=Sum('Total_No_of_Households'))['total'] or 0
    total_connected = project_communities.aggregate(total=Sum('no_of_connected_household'))['total'] or 0

    context = {
        'total_communities': total_communities,
        'total_households': total_households,
        'total_connected': total_connected,
        'markers_added': len(project_data),
        'overall_access_rate': (total_connected / total_households * 100) if total_households else 0,
        'project_data_json': json.dumps(project_data),
        'center_lat': center_lat,
        'center_lng': center_lng,
        'zoom_level': zoom_level
    }

    return render(request, 'PIU_Mapping_project_Sites/index.html', context)


def mapping_dashboard(request):
    """Mapping dashboard - route to main map view"""
    return index(request)


@login_required
def mapping_list(request):
    """List view of all project mappings"""
    mappings = projectMapping.objects.select_related(
        'region', 'district', 'settlement', 'profile_year', 'access'
    ).prefetch_related('project', 'donor').order_by('region__region_name', 'district__district_name', 'settlement__settlement_name')
    
    # Add pagination
    paginator = Paginator(mappings, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'mappings': page_obj.object_list
    }
    
    return render(request, 'PIU_Mapping_project_Sites/mapping_list.html', context)


def mapping_detail(request, pk):
    """Detail view of a specific project mapping"""
    mapping = get_object_or_404(projectMapping, pk=pk)
    
    context = {
        'mapping': mapping,
        'projects': mapping.project.all(),
        'donors': mapping.donor.all(),
    }
    
    return render(request, 'PIU_Mapping_project_Sites/mapping_detail.html', context)


def add_mapping(request):
    """Add new mapping view"""
    if request.method == 'POST':
        form = MappingForm(request.POST)
        if form.is_valid():
            mapping = form.save(commit=False)
            mapping.loginUser = request.user
            mapping.save()
            form.save_m2m()
            messages.success(request, 'Mapping added successfully!')
            return redirect('PIU_Mapping_project_Sites:mapping_list')
    else:
        form = MappingForm()
    
    context = {
        'form': form,
        'title': 'Add New Mapping'
    }
    
    return render(request, 'PIU_Mapping_project_Sites/mapping_form.html', context)


def update_mapping(request, pk):
    """Update mapping view"""
    mapping = get_object_or_404(projectMapping, pk=pk)
    
    if request.method == 'POST':
        form = MappingForm(request.POST, instance=mapping)
        if form.is_valid():
            form.save()
            messages.success(request, 'Mapping updated successfully!')
            
            # Check if this was opened from a popup (from_popup parameter)
            if request.GET.get('from_popup'):
                return render(request, 'PIU_Mapping_project_Sites/popup_close.html', {
                    'message': 'Mapping updated successfully! Returning to map...'
                })
            
            return redirect('PIU_Mapping_project_Sites:mapping_list')
    else:
        form = MappingForm(instance=mapping)
    
    context = {
        'form': form,
        'mapping': mapping,
        'title': 'Update Mapping',
        'from_popup': request.GET.get('from_popup', False)
    }
    
    return render(request, 'PIU_Mapping_project_Sites/mapping_form.html', context)


def delete_mapping(request, pk):
    """Delete mapping view"""
    mapping = get_object_or_404(projectMapping, pk=pk)
    
    if request.method == 'POST':
        mapping.delete()
        messages.success(request, 'Mapping deleted successfully!')
        return redirect('PIU_Mapping_project_Sites:mapping_list')
    
    context = {
        'mapping': mapping,
        'title': 'Delete Mapping'
    }
    
    return render(request, 'PIU_Mapping_project_Sites/mapping_confirm_delete.html', context)


# AJAX endpoints for cascading dropdowns
def load_districts(request):
    """Load districts based on selected region"""
    region_id = request.GET.get('region_id')
    districts = Districts.objects.filter(region_code=region_id).order_by('district_name')
    return JsonResponse({'districts': [{'id': d.district_code, 'name': d.district_name} for d in districts]})


def load_settlement(request):
    """Load settlements based on selected district"""
    district_id = request.GET.get('district_id')
    settlements = Settlement.objects.filter(district_code=district_id).order_by('settlement_name')
    return JsonResponse({'settlements': [{'id': s.settlement_code, 'name': s.settlement_name} for s in settlements]})


# Placeholder functions for compatibility
def indexl(request):
    """Leaflet map placeholder - redirect to main map"""
    return redirect('PIU_Mapping_project_Sites:index')


def offline_map(request):
    """Offline map placeholder - redirect to main map"""
    return redirect('PIU_Mapping_project_Sites:index')


def togglemarker(request):
    """Toggle marker placeholder - redirect to main map"""
    return redirect('PIU_Mapping_project_Sites:index')


def mappingCreateView(request):
    """Mapping create placeholder - redirect to add mapping"""
    return redirect('PIU_Mapping_project_Sites:add_mapping')


def settlementswithcor(request):
    """Settlements with coordinates placeholder - redirect to main map"""
    return redirect('PIU_Mapping_project_Sites:index')