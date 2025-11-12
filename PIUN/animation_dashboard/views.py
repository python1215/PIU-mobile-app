from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count, Sum, Q
from django.core.paginator import Paginator
from PIU_Financial_mgt.models import Project
from .models import MediaItem
from .forms import MediaItemForm


@login_required
def animation_dashboard(request):
    """Main Animation Dashboard with media gallery and reports"""
    # Handle case where MediaItem table doesn't exist yet (migrations pending)
    try:
        media_items = MediaItem.objects.all()[:12]  # Latest 12 items
        total_media = MediaItem.objects.count()
        total_images = MediaItem.objects.filter(media_type='image').count()
        total_videos = MediaItem.objects.filter(media_type='video').count()
    except:
        media_items = []
        total_media = 0
        total_images = 0
        total_videos = 0
    
    context = {
        'total_media': total_media,
        'total_images': total_images,
        'total_videos': total_videos,
        'media_items': media_items,
    }
    return render(request, 'animation_dashboard/dashboard.html', context)


@login_required
def media_gallery(request):
    """Full media gallery with filtering"""
    media_type = request.GET.get('type', '')
    
    # Handle case where MediaItem table doesn't exist yet (migrations pending)
    try:
        media_items = MediaItem.objects.all()
        
        if media_type:
            media_items = media_items.filter(media_type=media_type)
        
        paginator = Paginator(media_items, 24)  # 24 items per page
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        total_count = media_items.count()
    except:
        page_obj = []
        total_count = 0
    
    context = {
        'media_items': page_obj,
        'media_type': media_type,
        'total_count': total_count,
    }
    return render(request, 'animation_dashboard/media_gallery.html', context)


@login_required
def projects_by_donors(request):
    """Report: NAWEC PIU Projects by Donors"""
    # Get all projects with their donors
    projects = Project.objects.prefetch_related('donors', 'currency').all()
    
    # Group projects by donor
    donor_groups = {}
    for project in projects:
        for donor in project.donors.all():
            if donor.name not in donor_groups:
                donor_groups[donor.name] = {
                    'donor': donor,
                    'projects': [],
                    'total_funding': 0,
                    'currencies': {}
                }
            donor_groups[donor.name]['projects'].append(project)
            
            # Track funding by currency
            currency_symbol = project.currency.currency if project.currency else 'N/A'
            if currency_symbol not in donor_groups[donor.name]['currencies']:
                donor_groups[donor.name]['currencies'][currency_symbol] = 0
            donor_groups[donor.name]['currencies'][currency_symbol] += float(project.funding)
    
    # Sort by donor name
    sorted_donors = sorted(donor_groups.values(), key=lambda x: x['donor'].name)
    
    context = {
        'donor_groups': sorted_donors,
        'total_donors': len(donor_groups),
        'total_projects': projects.count(),
    }
    return render(request, 'animation_dashboard/projects_by_donors.html', context)


@login_required
def projects_by_closing_date(request):
    """Report: NAWEC PIU Projects by Closing Date"""
    # Get projects ordered by closing date
    projects = Project.objects.select_related('currency').prefetch_related('donors').filter(
        closure_Date__isnull=False
    ).order_by('closure_Date')
    
    # Group by year and quarter
    year_groups = {}
    for project in projects:
        year = project.closure_Date.year
        quarter = (project.closure_Date.month - 1) // 3 + 1
        
        year_key = f"{year}"
        if year_key not in year_groups:
            year_groups[year_key] = {
                'year': year,
                'quarters': {},
                'projects_count': 0
            }
        
        quarter_key = f"Q{quarter}"
        if quarter_key not in year_groups[year_key]['quarters']:
            year_groups[year_key]['quarters'][quarter_key] = []
        
        year_groups[year_key]['quarters'][quarter_key].append(project)
        year_groups[year_key]['projects_count'] += 1
    
    # Sort by year descending
    sorted_years = sorted(year_groups.values(), key=lambda x: x['year'], reverse=True)
    
    context = {
        'year_groups': sorted_years,
        'total_projects': projects.count(),
        'projects_without_date': Project.objects.filter(closure_Date__isnull=True).count(),
    }
    return render(request, 'animation_dashboard/projects_by_closing_date.html', context)


@login_required
def projects_by_funding(request):
    """Report: NAWEC PIU Projects by Funding Amount"""
    # Get projects ordered by funding amount (descending)
    projects = Project.objects.select_related('currency').prefetch_related('donors').order_by('-funding')
    
    # Group by funding ranges and currency
    currency_groups = {}
    for project in projects:
        currency_symbol = project.currency.currency if project.currency else 'N/A'
        
        if currency_symbol not in currency_groups:
            currency_groups[currency_symbol] = {
                'currency': currency_symbol,
                'projects': [],
                'total_funding': 0,
                'count': 0
            }
        
        currency_groups[currency_symbol]['projects'].append(project)
        currency_groups[currency_symbol]['total_funding'] += float(project.funding)
        currency_groups[currency_symbol]['count'] += 1
    
    # Sort by total funding descending
    sorted_currencies = sorted(currency_groups.values(), key=lambda x: x['total_funding'], reverse=True)
    
    # Calculate grand total projects
    total_projects = sum(group['count'] for group in sorted_currencies)
    
    context = {
        'currency_groups': sorted_currencies,
        'total_projects': total_projects,
    }
    return render(request, 'animation_dashboard/projects_by_funding.html', context)


@login_required
def upload_media(request):
    """Upload new media item (picture or video)"""
    if request.method == 'POST':
        form = MediaItemForm(request.POST, request.FILES)
        if form.is_valid():
            media_item = form.save(commit=False)
            media_item.uploaded_by = request.user
            media_item.save()
            messages.success(request, f'{media_item.get_media_type_display()} "{media_item.title}" uploaded successfully!')
            return redirect('animation_dashboard:media_gallery')
        else:
            # Add error messages for debugging
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        form = MediaItemForm()
    
    context = {
        'form': form,
        'page_title': 'Upload Media',
    }
    return render(request, 'animation_dashboard/media_upload.html', context)


@login_required
def media_detail(request, pk):
    """View details of a media item"""
    media_item = get_object_or_404(MediaItem, pk=pk)
    
    context = {
        'media_item': media_item,
        'page_title': media_item.title,
    }
    return render(request, 'animation_dashboard/media_detail.html', context)


@login_required
def edit_media(request, pk):
    """Edit existing media item"""
    media_item = get_object_or_404(MediaItem, pk=pk)
    
    if request.method == 'POST':
        form = MediaItemForm(request.POST, request.FILES, instance=media_item)
        if form.is_valid():
            form.save()
            messages.success(request, f'{media_item.get_media_type_display()} updated successfully!')
            return redirect('animation_dashboard:media_detail', pk=media_item.pk)
    else:
        form = MediaItemForm(instance=media_item)
    
    context = {
        'form': form,
        'media_item': media_item,
        'page_title': f'Edit: {media_item.title}',
    }
    return render(request, 'animation_dashboard/media_edit.html', context)


@login_required
def delete_media(request, pk):
    """Delete media item"""
    media_item = get_object_or_404(MediaItem, pk=pk)
    
    if request.method == 'POST':
        media_type = media_item.get_media_type_display()
        title = media_item.title
        media_item.delete()
        messages.success(request, f'{media_type} "{title}" deleted successfully!')
        return redirect('animation_dashboard:media_gallery')
    
    context = {
        'media_item': media_item,
        'page_title': f'Delete: {media_item.title}',
    }
    return render(request, 'animation_dashboard/media_delete.html', context)


@login_required
def slideshow(request):
    """Full-screen auto-rotating slideshow of reports and media"""
    from collections import defaultdict
    from setup.models import Donor
    from PIU_Mapping_project_Sites.models import projectMapping
    
    # Prepare slideshow items list
    slideshow_items = []
    
    # === SLIDE 1: Projects by Donors Report ===
    projects = Project.objects.prefetch_related('donors', 'currency').all()
    donors_data = defaultdict(lambda: {'projects': [], 'totals_by_currency': defaultdict(float)})
    
    for project in projects:
        # Get donors (ManyToMany field)
        project_donors = project.donors.all()
        
        if project_donors.exists():
            for donor in project_donors:
                donor_name = donor.name
                funding_value = float(project.funding) if project.funding else 0.0
                
                donors_data[donor_name]['projects'].append({
                    'project_name': project.project,
                    'total_funding': funding_value,
                    'currency': project.currency.currency if project.currency else 'GMD'
                })
                currency = project.currency.currency if project.currency else 'GMD'
                donors_data[donor_name]['totals_by_currency'][currency] += funding_value
    
    # Convert nested defaultdicts to regular dicts for template rendering
    donors_data_converted = {}
    for donor_name, donor_info in donors_data.items():
        donors_data_converted[donor_name] = {
            'projects': donor_info['projects'],
            'totals_by_currency': dict(donor_info['totals_by_currency'])
        }
    
    slideshow_items.append({
        'type': 'report',
        'report_type': 'donors',
        'title': 'NAWEC PIU Projects by Donors',
        'data': donors_data_converted
    })
    
    # === SLIDE 2: Projects by Closing Date Report ===
    closing_data = defaultdict(lambda: defaultdict(list))
    for project in projects:
        if project.closure_Date:
            year = project.closure_Date.year
            quarter = (project.closure_Date.month - 1) // 3 + 1
            quarter_name = f"Q{quarter}"
            funding_value = float(project.funding) if project.funding else 0.0
            closing_data[year][quarter_name].append({
                'project_name': project.project,
                'closing_date': project.closure_Date.strftime('%b %d, %Y'),
                'total_funding': funding_value,
                'currency': project.currency.currency if project.currency else 'GMD'
            })
    
    slideshow_items.append({
        'type': 'report',
        'report_type': 'closing_date',
        'title': 'NAWEC PIU Projects by Closing Date',
        'data': {year: dict(quarters) for year, quarters in closing_data.items()}
    })
    
    # === SLIDE 3: Projects by Funding Amount Report ===
    projects_funding = []
    for project in projects:
        if project.funding:
            # Get donor names (ManyToMany field)
            donor_names = []
            project_donors = project.donors.all()
            for donor in project_donors:
                donor_names.append(donor.name)
            
            donor_display = ', '.join(donor_names) if donor_names else 'N/A'
            funding_value = float(project.funding)
            projects_funding.append({
                'project_name': project.project,
                'total_funding': funding_value,
                'currency': project.currency.currency if project.currency else 'GMD',
                'donor': donor_display
            })
    
    projects_funding.sort(key=lambda x: x['total_funding'], reverse=True)
    
    slideshow_items.append({
        'type': 'report',
        'report_type': 'funding',
        'title': 'NAWEC PIU Projects by Funding Amount',
        'data': projects_funding[:10]  # Top 10
    })
    
    # === SLIDE 4: Interactive Project Sites Map ===
    project_sites = projectMapping.objects.select_related(
        'region', 'district', 'settlement', 'project', 'access'
    ).prefetch_related('donor').filter(
        Latitude__isnull=False,
        Longitude__isnull=False
    ).all()
    
    # Group sites by region
    sites_by_region = defaultdict(lambda: {'sites': [], 'total_households': 0, 'total_connected': 0})
    
    for site in project_sites:
        region_name = site.region.region_name if site.region else 'Unknown'
        
        site_data = {
            'settlement': site.settlement.settlement_name if site.settlement else 'Unknown',
            'district': site.district.district_name if site.district else 'Unknown',
            'project': site.project.project if site.project else 'No Project',
            'donors': ', '.join([d.name for d in site.donor.all()]) if site.donor.exists() else 'N/A',
            'total_households': site.Total_No_of_Households or 0,
            'connected_households': site.no_of_connected_household or 0,
            'access_type': site.access.access_type if site.access else 'Unknown',
            'latitude': float(site.Latitude),
            'longitude': float(site.Longitude),
        }
        
        sites_by_region[region_name]['sites'].append(site_data)
        sites_by_region[region_name]['total_households'] += site.Total_No_of_Households or 0
        sites_by_region[region_name]['total_connected'] += site.no_of_connected_household or 0
    
    # Calculate connection rates
    map_data = {}
    for region, region_info in sites_by_region.items():
        total_hh = region_info['total_households']
        total_conn = region_info['total_connected']
        connection_rate = round((total_conn / total_hh * 100) if total_hh > 0 else 0, 1)
        
        map_data[region] = {
            'sites': region_info['sites'],
            'total_sites': len(region_info['sites']),
            'total_households': total_hh,
            'total_connected': total_conn,
            'connection_rate': connection_rate
        }
    
    slideshow_items.append({
        'type': 'report',
        'report_type': 'project_map',
        'title': 'NAWEC PIU Project Sites Map',
        'data': map_data,
        'total_sites': project_sites.count()
    })
    
    # === SLIDES 5+: Media Items (Images and Videos) ===
    try:
        media_items = MediaItem.objects.all().order_by('-uploaded_date')
        for media in media_items:
            slideshow_items.append({
                'type': 'media',
                'media_type': media.media_type,
                'title': media.title,
                'description': media.description or '',
                'file_url': media.file.url,
                'uploaded_date': media.uploaded_date.strftime('%b %d, %Y'),
                'uploaded_by': media.uploaded_by.username
            })
    except:
        pass  # Skip if MediaItem table doesn't exist
    
    context = {
        'slideshow_items': slideshow_items,
        'total_slides': len(slideshow_items),
        'page_title': 'Animation Slideshow',
    }
    return render(request, 'animation_dashboard/slideshow.html', context)
