from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
import json
from django.db.models import F, Prefetch, Sum, Count
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
    
    if focus_lat and focus_lng:
        try:
            center_lat = float(focus_lat)
            center_lng = float(focus_lng)
            zoom_level = 16  # Zoom in when focusing on specific location
        except (ValueError, TypeError):
            center_lat = 13.4544  # Default to Gambia center
            center_lng = -16.5753
            zoom_level = 8
    else:
        center_lat = 13.4544  # Default to Gambia center
        center_lng = -16.5753
        zoom_level = 8
    
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
                
                # Build project data object
                project_data.append({
                    'id': community.id,
                    'latitude': float(community.Latitude),
                    'longitude': float(community.Longitude),
                    'settlement': str(community.settlement) if community.settlement else 'Unknown Settlement',
                    'region': str(community.region) if community.region else 'Unknown Region',
                    'district': str(community.district) if community.district else 'Unknown District',
                    'total_households': community.Total_No_of_Households or 0,
                    'connected_households': community.no_of_connected_household or 0,
                    'access_rate': round((community.no_of_connected_household or 0) / max(community.Total_No_of_Households or 1, 1) * 100, 1),
                    'access_type': str(community.access) if community.access else 'Not Specified',
                    'profile_year': str(community.profile_year) if community.profile_year else 'N/A',
                    'projects': project_names,
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

def indexl(request):
    """Leaflet map placeholder"""
    return redirect('PIU_Mapping_project_Sites:index')

def offline_map(request):
    """Offline map placeholder"""
    return redirect('PIU_Mapping_project_Sites:index')

def togglemarker(request):
    """Toggle marker placeholder"""
    return redirect('PIU_Mapping_project_Sites:index')

def mappingCreateView(request):
    """Mapping create placeholder"""
    return redirect('PIU_Mapping_project_Sites:index')

def load_districts(request):
    """Load districts placeholder"""
    return JsonResponse({'districts': []})

def load_settlement(request):
    """Load settlement placeholder"""
    return JsonResponse({'settlements': []})

def settlementswithcor(request):
    """Settlements with coordinates placeholder"""
    return redirect('PIU_Mapping_project_Sites:index')

@login_required
def mapping_list(request):
    """Mapping list placeholder"""
    return redirect('PIU_Mapping_project_Sites:index')

def mapping_detail(request, pk):
    """Mapping detail placeholder"""
    return redirect('PIU_Mapping_project_Sites:index')

def add_mapping(request):
    """Add mapping placeholder"""
    return redirect('PIU_Mapping_project_Sites:index')

def update_mapping(request, pk):
    """Update mapping placeholder"""
    return redirect('PIU_Mapping_project_Sites:index')

def delete_mapping(request, pk):
    """Delete mapping placeholder"""
    return redirect('PIU_Mapping_project_Sites:index')