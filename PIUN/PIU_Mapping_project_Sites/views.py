from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
import folium
from django.db.models import F, Prefetch, Sum, Count
import locale
import json
from django.utils import timezone
from .models import projectMapping, settlementwithCoordinates, Access, nawecinfrastructure
from .forms import MappingForm, NAWECInfrastructureForm, SettlementWithCoordinatesForm
from django.contrib import messages
from PIU_Financial_mgt.models import Project, Donor
from social_and_env.models import Settlement, Regions
from setup.models import YEAR, Districts
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.core.cache import cache
from django.db import connection
from functools import lru_cache
from django.core.paginator import Paginator
from utils.database_utils import (
    is_sql_server_mode, get_model_data, safe_model_save, 
    safe_model_update, safe_model_delete, get_paginated_data,
    execute_raw_sql, get_sql_server_table_name
)


from collections import defaultdict
import folium
from folium import FeatureGroup
from django.shortcuts import render
from django.core.cache import cache
from django.db.models import Sum
from .models import projectMapping


def index(request):
    """Main mapping view displaying authentic NAWEC PIU project coordinates"""
    
    cache.delete('project_map_html')
    
    project_communities = projectMapping.objects.select_related(
        'region', 'district', 'settlement', 'profile_year', 'access'
    ).prefetch_related('project', 'donor').filter(
        Latitude__isnull=False,
        Longitude__isnull=False
    ).all()
    
    # Check for coordinate parameters to focus on specific location
    focus_lat = request.GET.get('lat')
    focus_lng = request.GET.get('lng')
    
    if focus_lat and focus_lng:
        try:
            center_location = [float(focus_lat), float(focus_lng)]
            zoom_level = 15  # Zoom in when focusing on specific location
        except (ValueError, TypeError):
            center_location = [13.4544, -16.5753]  # Default to Gambia center
            zoom_level = 8
    else:
        center_location = [13.4544, -16.5753]  # Default to Gambia center
        zoom_level = 8
    
    # Create base map
    m = folium.Map(location=center_location, zoom_start=zoom_level)

    # Add optional tile layers with attribution
    folium.TileLayer(
        tiles='cartodb positron',
        name='CartoDB',
        attr='Map tiles by CartoDB, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
    ).add_to(m)
    
    # Group markers by project
    project_groups = defaultdict(lambda: folium.FeatureGroup(name=None, show=True))
    donor_colors = {}
    color_palette = ['blue', 'green', 'red', 'purple', 'orange', 'darkblue', 
                     'darkgreen', 'cadetblue', 'darkpurple', 'pink', 'lightblue', 
                     'lightgreen', 'gray', 'black', 'lightred']
    color_index = 0
    markers_added = 0
    
    for community in project_communities:
        try:
            if community.Latitude and community.Longitude:
                coords = (float(community.Latitude), float(community.Longitude))
                projects = community.project.all()
                donors = community.donor.all()
                
                project_names = [str(p.project) for p in projects]
                donor_names = [str(d.name) for d in donors]
                
                if project_names:
                    project_label = ", ".join(project_names[:2])
                    if len(project_names) > 2:
                        project_label += f" (+{len(project_names) - 2} more)"
                else:
                    project_label = "No Project Assigned"

                if donor_names:
                    donor_display = ", ".join(donor_names[:2])
                    if len(donor_names) > 2:
                        donor_display += f" (+{len(donor_names) - 2} more)"
                    primary_donor = donor_names[0]
                else:
                    donor_display = "No Donor"
                    primary_donor = "No Donor"
                
                # Color logic by primary donor
                if primary_donor not in donor_colors:
                    donor_colors[primary_donor] = color_palette[color_index % len(color_palette)]
                    color_index += 1
                marker_color = donor_colors[primary_donor]
                
                # Special highlighting for focused marker if coordinates match
                is_focused = False
                if focus_lat and focus_lng:
                    try:
                        focus_lat_f = float(focus_lat)
                        focus_lng_f = float(focus_lng)
                        # Check if coordinates match (within small tolerance for floating point)
                        if abs(float(community.Latitude) - focus_lat_f) < 0.0001 and abs(float(community.Longitude) - focus_lng_f) < 0.0001:
                            is_focused = True
                            marker_color = 'red'  # Highlight focused marker in red
                    except (ValueError, TypeError):
                        pass

                # Related info
                total_hh = community.Total_No_of_Households or 0
                connected_hh = community.no_of_connected_household or 0
                connections = community.no_of_customer_connections or 0
                access_rate = (connected_hh / total_hh * 100) if total_hh > 0 else 0

                settlement = str(community.settlement.settlement_name) if community.settlement else 'N/A'
                region = str(community.region.region_name) if community.region else 'N/A'
                district = str(community.district.district_name) if community.district else 'N/A'
                year = str(community.profile_year.profile_year) if community.profile_year else 'N/A'
                access = str(community.access.access_type) if community.access else 'N/A'

                # Special popup for focused location
                if is_focused:
                    popup = f"""
                        <div style="width: 280px; border-left: 4px solid #e74c3c;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <h4 style="color: #e74c3c; margin: 0;">
                                    <i class="fa fa-map-marker"></i> {settlement} 
                                    <span style="font-size: 12px; color: #95a5a6;">(Focused Location)</span>
                                </h4>
                                <a href="/PIU_Mapping_project_Sites/update-mapping/{community.pk}/" 
                                   style="color: #27ae60; text-decoration: none; font-size: 16px;" 
                                   title="Edit Details">
                                    <i class="fa fa-edit"></i>
                                </a>
                            </div>
                            <table style="width: 100%; font-size: 12px;">
                                <tr><td><strong>Project:</strong></td><td>{project_label}</td></tr>
                                <tr><td><strong>Region:</strong></td><td>{region}</td></tr>
                                <tr><td><strong>District:</strong></td><td>{district}</td></tr>
                                <tr><td><strong>Donor:</strong></td><td>{donor_display}</td></tr>
                                <tr><td><strong>Households:</strong></td><td>{total_hh:,}</td></tr>
                                <tr><td><strong>Connected:</strong></td><td>{connected_hh:,}</td></tr>
                                <tr><td><strong>Connections:</strong></td><td>{connections:,}</td></tr>
                                <tr><td><strong>Access Rate:</strong></td><td>{access_rate:.1f}%</td></tr>
                                <tr><td><strong>Access Type:</strong></td><td>{access}</td></tr>
                                <tr><td><strong>Year:</strong></td><td>{year}</td></tr>
                                <tr><td><strong>Coordinates:</strong></td><td>{community.Latitude:.4f}, {community.Longitude:.4f}</td></tr>
                            </table>
                        </div>
                    """
                else:
                    popup = f"""
                        <div style="width: 250px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <h4 style="color: #2c3e50; margin: 0;">{settlement}</h4>
                                <a href="/PIU_Mapping_project_Sites/update-mapping/{community.pk}/" 
                                   style="color: #27ae60; text-decoration: none; font-size: 16px;" 
                                   title="Edit Details">
                                    <i class="fa fa-edit"></i>
                                </a>
                            </div>
                            <table style="width: 100%; font-size: 12px;">
                                <tr><td><strong>Project:</strong></td><td>{project_label}</td></tr>
                                <tr><td><strong>Region:</strong></td><td>{region}</td></tr>
                                <tr><td><strong>District:</strong></td><td>{district}</td></tr>
                                <tr><td><strong>Donor:</strong></td><td>{donor_display}</td></tr>
                                <tr><td><strong>Households:</strong></td><td>{total_hh:,}</td></tr>
                                <tr><td><strong>Connected:</strong></td><td>{connected_hh:,}</td></tr>
                                <tr><td><strong>Connections:</strong></td><td>{connections:,}</td></tr>
                                <tr><td><strong>Access Rate:</strong></td><td>{access_rate:.1f}%</td></tr>
                                <tr><td><strong>Access Type:</strong></td><td>{access}</td></tr>
                                <tr><td><strong>Year:</strong></td><td>{year}</td></tr>
                                <tr><td><strong>Coordinates:</strong></td><td>{community.Latitude:.4f}, {community.Longitude:.4f}</td></tr>
                            </table>
                        </div>
                    """

                for project in project_names:
                    if project not in project_groups:
                        project_groups[project] = folium.FeatureGroup(name=project, show=True)

                    # Special marker for focused location
                    if is_focused:
                        folium.Marker(
                            coords,
                            popup=folium.Popup(popup, max_width=320),
                            tooltip=f"🎯 {settlement} - {total_hh:,} HH (Focused)",
                            icon=folium.Icon(color=marker_color, icon='star', prefix='fa')
                        ).add_to(project_groups[project])
                    else:
                        folium.Marker(
                            coords,
                            popup=folium.Popup(popup, max_width=300),
                            tooltip=f"{settlement} - {total_hh:,} HH",
                            icon=folium.Icon(color=marker_color, icon='home', prefix='fa')
                        ).add_to(project_groups[project])

                markers_added += 1

        except Exception as e:
            print(f"Error processing community {community.id}: {str(e)}")
            continue

    # Add all project groups to the map
    for group in project_groups.values():
        group.add_to(m)

    folium.LayerControl(collapsed=False).add_to(m)

    # # Add legend

    if donor_colors:
        legend_html = '''
        <div id="donor-legend" style="position: fixed; 
                    bottom: 50px; right: 50px; width: 200px;
                    border: 2px solid #34495e; z-index: 9999; font-size: 12px;
                    background-color: white; padding: 15px; border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1); cursor: move;">
            <div style="text-align: center; font-weight: bold; color: #2c3e50;">
                <i class="fa fa-map-marker"></i> Donor Legend
            </div>
            <div style="text-align: center; margin-bottom: 10px; font-size: 10px; color: #7f8c8d;">
                {markers:,} locations
            </div>
    '''.format(markers=markers_added)

    for donor, color in donor_colors.items():
        legend_html += f'''
            <div style="margin: 3px 0; display: flex; align-items: center;">
                <i class="fa fa-circle" style="color: {color}; margin-right: 8px;"></i>
                <span style="font-size: 11px;">{donor[:25]}{'...' if len(donor) > 25 else ''}</span>
            </div>
        '''

    legend_html += '''
        </div>

        <script>
            const legend = document.getElementById('donor-legend');
            let isDragging = false, offset = [0, 0];

            legend.addEventListener('mousedown', function(e) {
                isDragging = true;
                offset = [e.clientX - legend.offsetLeft, e.clientY - legend.offsetTop];
            });

            document.addEventListener('mouseup', function() {
                isDragging = false;
            });

            document.addEventListener('mousemove', function(e) {
                if (isDragging) {
                    legend.style.left = (e.clientX - offset[0]) + 'px';
                    legend.style.top = (e.clientY - offset[1]) + 'px';
                    legend.style.bottom = 'auto';
                    legend.style.right = 'auto';
                }
            });
        </script>
    '''

    m.get_root().html.add_child(folium.Element(legend_html))

    # if donor_colors:
    #     legend_html = '''
    #         <div style="position: fixed; 
    #                     bottom: 50px; right: 50px; width: 200px;
    #                     border: 2px solid #34495e; z-index: 9999; font-size: 12px;
    #                     background-color: white; padding: 15px; border-radius: 8px;
    #                     box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
    #             <div style="text-align: center; font-weight: bold; color: #2c3e50;">
    #                 <i class="fa fa-map-marker"></i> Donor Legend
    #             </div>
    #             <div style="text-align: center; margin-bottom: 10px; font-size: 10px; color: #7f8c8d;">
    #                 {markers:,} locations
    #             </div>
    #     '''.format(markers=markers_added)

    #     for donor, color in donor_colors.items():
    #         legend_html += f'''
    #             <div style="margin: 3px 0; display: flex; align-items: center;">
    #                 <i class="fa fa-circle" style="color: {color}; margin-right: 8px;"></i>
    #                 <span style="font-size: 11px;">{donor[:25]}{'...' if len(donor) > 25 else ''}</span>
    #             </div>
    #         '''

    #     legend_html += '</div>'
    #     m.get_root().html.add_child(folium.Element(legend_html))

    # Map HTML
    map_html = m._repr_html_()

    total_communities = project_communities.count()
    total_households = project_communities.aggregate(total=Sum('Total_No_of_Households'))['total'] or 0
    total_connected = project_communities.aggregate(total=Sum('no_of_connected_household'))['total'] or 0

    context = {
        'map': map_html,
        'total_communities': total_communities,
        'total_households': total_households,
        'total_connected': total_connected,
        'markers_added': markers_added,
        'overall_access_rate': (total_connected / total_households * 100) if total_households else 0
    }

    return render(request, 'PIU_Mapping_project_Sites/index.html', context)


# def index(request):
#     """Main mapping view displaying authentic NAWEC PIU project coordinates"""
    
#     # Clear cache to ensure we get fresh data
#     cache.delete('project_map_html')
    
#     # Fetch all project mappings with coordinates
#     project_communities = projectMapping.objects.select_related(
#         'region', 'district', 'settlement', 'profile_year', 'access'
#     ).prefetch_related('project', 'donor').filter(
#         Latitude__isnull=False, 
#         Longitude__isnull=False
#     ).all()
    
#     # Create map centered on The Gambia
#     m = folium.Map(location=[13.4544, -16.5753], zoom_start=8)
    
#     # Color scheme for different donors
#     donor_colors = {}
#     color_options = ['blue', 'green', 'red', 'purple', 'orange', 'darkblue', 
#                     'darkgreen', 'cadetblue', 'darkpurple', 'pink', 'lightblue', 
#                     'lightgreen', 'gray', 'black', 'lightred']
#     color_index = 0
    
#     markers_added = 0
    
#     for community in project_communities:
#         try:
#             # Ensure we have valid coordinates
#             if community.Latitude and community.Longitude:
#                 coordinates = (float(community.Latitude), float(community.Longitude))
                
#                 # Get project names from many-to-many relationship
#                 projects = community.project.all()
#                 if projects.exists():
#                     project_names = [str(p.project) for p in projects]
#                     project_name = ", ".join(project_names[:2])
#                     if len(project_names) > 2:
#                         project_name += f" (+ {len(project_names) - 2} more)"
#                 else:
#                     project_name = "No Project Assigned"
                
#                 # Get donor names from many-to-many relationship
#                 donors = community.donor.all()
#                 if donors.exists():
#                     donor_names = [str(d.name) for d in donors]
#                     donor_name = ", ".join(donor_names[:2])
#                     if len(donor_names) > 2:
#                         donor_name += f" (+ {len(donor_names) - 2} more)"
#                     primary_donor = donor_names[0]
#                 else:
#                     donor_name = "No Donor"
#                     primary_donor = "No Donor"
                
#                 # Assign color based on primary donor
#                 if primary_donor not in donor_colors:
#                     donor_colors[primary_donor] = color_options[color_index % len(color_options)]
#                     color_index += 1
                
#                 marker_color = donor_colors[primary_donor]
                
#                 # Calculate household connection statistics
#                 total_households = community.Total_No_of_Households or 0
#                 connected_households = community.no_of_connected_household or 0
#                 customer_connections = community.no_of_customer_connections or 0
#                 connection_rate = (connected_households / total_households * 100) if total_households > 0 else 0
                
#                 # Get related field information safely
#                 settlement_name = str(community.settlement.settlement_name) if community.settlement else 'N/A'
#                 region_name = str(community.region.region_name) if community.region else 'N/A'
#                 district_name = str(community.district.district_name) if community.district else 'N/A'
#                 year_info = str(community.profile_year.profile_year) if community.profile_year else 'N/A'
#                 access_type = str(community.access.access_type) if community.access else 'N/A'
                
#                 # Create detailed popup with authentic data
#                 popup_content = f"""
#                     <div style="width: 250px; font-family: Arial, sans-serif;">
#                         <h4 style="color: #2c3e50; margin-bottom: 10px; border-bottom: 2px solid #3498db; padding-bottom: 5px;">
#                             {settlement_name}
#                         </h4>
#                         <table style="width: 100%; font-size: 12px;">
#                             <tr><td><strong>Project:</strong></td><td>{project_name}</td></tr>
#                             <tr><td><strong>Region:</strong></td><td>{region_name}</td></tr>
#                             <tr><td><strong>District:</strong></td><td>{district_name}</td></tr>
#                             <tr><td><strong>Donor:</strong></td><td>{donor_name}</td></tr>
#                             <tr><td><strong>Total Households:</strong></td><td>{total_households:,}</td></tr>
#                             <tr><td><strong>Connected:</strong></td><td>{connected_households:,}</td></tr>
#                             <tr><td><strong>Connections:</strong></td><td>{customer_connections:,}</td></tr>
#                             <tr><td><strong>Access Rate:</strong></td><td>{connection_rate:.1f}%</td></tr>
#                             <tr><td><strong>Access Type:</strong></td><td>{access_type}</td></tr>
#                             <tr><td><strong>Year:</strong></td><td>{year_info}</td></tr>
#                             <tr><td><strong>Coordinates:</strong></td><td>{community.Latitude:.4f}, {community.Longitude:.4f}</td></tr>
#                         </table>
#                     </div>
#                 """
                
#                 # Add marker to map
#                 folium.Marker(
#                     coordinates,
#                     popup=folium.Popup(popup_content, max_width=300),
#                     icon=folium.Icon(color=marker_color, icon='home', prefix='fa'),
#                     tooltip=f"{settlement_name} - {total_households:,} households"
#                 ).add_to(m)
                
#                 markers_added += 1
                
#         except Exception as e:
#             # Log error but continue processing other markers
#             print(f"Error processing community {community.id}: {str(e)}")
#             continue
    
#     # Add legend showing donor colors
#     if donor_colors:
#         legend_html = f'''
#             <div style="position: fixed; 
#                         bottom: 50px; right: 50px; width: 200px; height: auto; 
#                         border: 2px solid #34495e; z-index: 9999; font-size: 12px;
#                         background-color: white; padding: 15px; border-radius: 8px;
#                         box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
#                 <div style="text-align: center; margin-bottom: 10px; font-weight: bold; color: #2c3e50;">
#                     <i class="fa fa-map-marker"></i> Legend - Donors
#                 </div>
#                 <div style="text-align: center; margin-bottom: 10px; font-size: 10px; color: #7f8c8d;">
#                     {markers_added:,} locations mapped
#                 </div>
#         '''
        
#         for donor, color in donor_colors.items():
#             # Truncate long donor names
#             display_name = donor[:25] + "..." if len(donor) > 25 else donor
#             legend_html += f'''
#                 <div style="margin: 3px 0; display: flex; align-items: center;">
#                     <i class="fa fa-circle" style="color: {color}; margin-right: 8px;"></i>
#                     <span style="font-size: 11px;">{display_name}</span>
#                 </div>
#             '''
        
#         legend_html += '</div>'
#         m.get_root().html.add_child(folium.Element(legend_html))
    
#     # FontAwesome is now included in base template, no need for external CDN
    
#     # Get map HTML
#     map_html = m._repr_html_()
    
#     # Get summary statistics
#     total_communities = project_communities.count()
#     total_households = project_communities.aggregate(
#         total=Sum('Total_No_of_Households')
#     )['total'] or 0
#     total_connected = project_communities.aggregate(
#         total=Sum('no_of_connected_household')
#     )['total'] or 0
    
#     context = {
#         'map': map_html,
#         'total_communities': total_communities,
#         'total_households': total_households,
#         'total_connected': total_connected,
#         'markers_added': markers_added,
#         'overall_access_rate': (total_connected / total_households * 100) if total_households > 0 else 0
#     }
    
#     return render(request, 'PIU_Mapping_project_Sites/index.html', context)

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
    
    # Calculate access rate
    access_rate = (mapping.no_of_connected_household / mapping.Total_No_of_Households * 100) if mapping.Total_No_of_Households > 0 else 0
    
    # Calculate customer connection rate
    customer_connection_rate = (mapping.no_of_customer_connections / mapping.Total_No_of_Households * 100) if mapping.Total_No_of_Households > 0 else 0
    
    # Get related projects and donors
    projects = mapping.project.all()
    donors = mapping.donor.all()
    
    context = {
        'mapping': mapping,
        'access_rate': access_rate,
        'customer_connection_rate': customer_connection_rate,
        'projects': projects,
        'donors': donors,
    }
    
    return render(request, 'PIU_Mapping_project_Sites/mapping_detail.html', context)

# Keep existing functions for compatibility
def indexl(request):
    """Leaflet map alternative"""
    communities = list(projectMapping.objects.filter(
        Latitude__isnull=False, 
        Longitude__isnull=False
    ).values_list('Latitude', 'Longitude', flat=False))
    
    context = {
        'communities': [{'Latitude': lat, 'Longitude': lng} for lat, lng in communities]
    }
    return render(request, 'indexl.html', context)

def offline_map(request):
    """Offline-capable map view for project sites"""
    # Get all project mappings with coordinates
    project_mappings = projectMapping.objects.select_related(
        'region', 'district', 'settlement', 'profile_year', 'access'
    ).prefetch_related('project', 'donor').filter(
        Latitude__isnull=False, 
        Longitude__isnull=False
    ).all()
    
    # Prepare data for JavaScript
    project_data = []
    total_households = 0
    connected_households = 0
    
    for mapping in project_mappings:
        # Get donor names
        donor_names = [donor.name for donor in mapping.donor.all()] if mapping.donor.exists() else []
        donor_str = ', '.join(donor_names) if donor_names else None
        
        # Get project names
        project_names = [project.project for project in mapping.project.all()] if mapping.project.exists() else []
        project_str = ', '.join(project_names) if project_names else None
        
        project_info = {
            'id': mapping.pk,  # Add mapping ID for edit functionality
            'latitude': float(mapping.Latitude),
            'longitude': float(mapping.Longitude),
            'settlement_name': mapping.settlement.settlement_name if mapping.settlement else 'Unknown',
            'region_name': mapping.region.region_name if mapping.region else 'Unknown',
            'district_name': mapping.district.district_name if mapping.district else 'Unknown',
            'total_households': mapping.Total_No_of_Households or 0,
            'connected_households': mapping.no_of_connected_household or 0,
            'access_status': mapping.access.access_type if mapping.access else None,
            'donor': donor_str,
            'project': project_str,
            'year': mapping.profile_year.profile_year if mapping.profile_year else None
        }
        
        project_data.append(project_info)
        total_households += mapping.Total_No_of_Households or 0
        connected_households += mapping.no_of_connected_household or 0
    
    # Calculate access rate
    access_rate = (connected_households / total_households * 100) if total_households > 0 else 0
    
    context = {
        'project_data': json.dumps(project_data),
        'total_projects': len(project_data),
        'total_households': total_households,
        'connected_households': connected_households,
        'access_rate': access_rate,
        'current_time': timezone.now()
    }
    
    return render(request, 'PIU_Mapping_project_Sites/offline_map.html', context)

def togglemarker(request):
    """Toggle marker view with settlement data"""
    settlements_data = projectMapping.objects.select_related(
        'region', 'district', 'settlement', 'profile_year', 'access'
    ).prefetch_related('project', 'donor').all()
    
    context = {'settlements': settlements_data}
    return render(request, 'mapping_sites/togglermarkers.html', context)

def mapping_dashboard(request):
    """Main mapping dashboard"""
    # Get summary statistics
    total_mappings = projectMapping.objects.count()
    total_households = projectMapping.objects.aggregate(
        total=Sum('Total_No_of_Households')
    )['total'] or 0
    total_connected = projectMapping.objects.aggregate(
        total=Sum('no_of_connected_household')
    )['total'] or 0
    
    overall_access_rate = (total_connected / total_households * 100) if total_households > 0 else 0
    
    # Get regional breakdown
    regional_stats = projectMapping.objects.select_related('region').values(
        'region__region_name'
    ).annotate(
        total_households=Sum('Total_No_of_Households'),
        connected_households=Sum('no_of_connected_household'),
        mapping_count=Count('id')
    ).order_by('-total_households')[:10]
    
    context = {
        'total_mappings': total_mappings,
        'total_households': total_households,
        'total_connected': total_connected,
        'overall_access_rate': overall_access_rate,
        'regional_stats': regional_stats,
    }
    
    return render(request, 'PIU_Mapping_project_Sites/mapping_dashboard.html', context)

def mappingCreateView(request):
    """Create new project mapping"""
    if request.method == 'POST':
        form = MappingForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Project mapping created successfully!')
            return redirect('PIU_Mapping_project_Sites:mapping-list')
    else:
        form = MappingForm()
    
    context = {'form': form}
    return render(request, 'PIU_Mapping_project_Sites/mapping_form.html', context)

def load_districts(request):
    """AJAX view to load districts based on region"""
    region_id = request.GET.get('region_id')
    districts = Districts.objects.filter(region_id=region_id).values('district_code', 'district')
    return JsonResponse({'districts': list(districts)})

def load_settlement(request):
    """AJAX view to load settlements based on district"""
    district_id = request.GET.get('district_id')
    settlements = Settlement.objects.filter(district_id=district_id).values('settlement_code', 'settlement_name')
    return JsonResponse({'settlements': list(settlements)})

def settlementswithcor(request):
    """View settlements with coordinates"""
    settlements = settlementwithCoordinates.objects.all()
    context = {'settlements': settlements}
    return render(request, 'PIU_Mapping_project_Sites/settlements_coordinates.html', context)

def add_mapping(request):
    """Add new mapping"""
    if request.method == 'POST':
        form = MappingForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Mapping added successfully!')
            return redirect('PIU_Mapping_project_Sites:mapping-list')
    else:
        form = MappingForm()
    
    context = {'form': form, 'action': 'Add'}
    return render(request, 'PIU_Mapping_project_Sites/mapping_form.html', context)

def update_mapping(request, pk):
    """Update existing mapping"""
    mapping = get_object_or_404(projectMapping, pk=pk)
    
    if request.method == 'POST':
        form = MappingForm(request.POST, instance=mapping)
        if form.is_valid():
            form.save()
            messages.success(request, 'Mapping updated successfully!')
            return redirect('PIU_Mapping_project_Sites:mapping-list')
    else:
        form = MappingForm(instance=mapping)
    
    context = {'form': form, 'mapping': mapping, 'action': 'Update'}
    return render(request, 'PIU_Mapping_project_Sites/mapping_form.html', context)

def delete_mapping(request, pk):
    """Delete mapping"""
    mapping = get_object_or_404(projectMapping, pk=pk)
    
    if request.method == 'POST':
        mapping.delete()
        messages.success(request, 'Mapping deleted successfully!')
        return redirect('PIU_Mapping_project_Sites:mapping-list')
    
    context = {'mapping': mapping}
    return render(request, 'PIU_Mapping_project_Sites/mapping_confirm_delete.html', context)