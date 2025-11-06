from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Sum, Q
from django.core.paginator import Paginator
from PIU_Financial_mgt.models import Project
from .models import MediaItem


@login_required
def animation_dashboard(request):
    """Main Animation Dashboard with media gallery and reports"""
    media_items = MediaItem.objects.all()[:12]  # Latest 12 items
    
    context = {
        'total_media': MediaItem.objects.count(),
        'total_images': MediaItem.objects.filter(media_type='image').count(),
        'total_videos': MediaItem.objects.filter(media_type='video').count(),
        'media_items': media_items,
    }
    return render(request, 'animation_dashboard/dashboard.html', context)


@login_required
def media_gallery(request):
    """Full media gallery with filtering"""
    media_type = request.GET.get('type', '')
    
    media_items = MediaItem.objects.all()
    
    if media_type:
        media_items = media_items.filter(media_type=media_type)
    
    paginator = Paginator(media_items, 24)  # 24 items per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'media_items': page_obj,
        'media_type': media_type,
        'total_count': media_items.count(),
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
            if donor.donor not in donor_groups:
                donor_groups[donor.donor] = {
                    'donor': donor,
                    'projects': [],
                    'total_funding': 0,
                    'currencies': {}
                }
            donor_groups[donor.donor]['projects'].append(project)
            
            # Track funding by currency
            currency_symbol = project.currency.currency if project.currency else 'N/A'
            if currency_symbol not in donor_groups[donor.donor]['currencies']:
                donor_groups[donor.donor]['currencies'][currency_symbol] = 0
            donor_groups[donor.donor]['currencies'][currency_symbol] += float(project.funding)
    
    # Sort by donor name
    sorted_donors = sorted(donor_groups.values(), key=lambda x: x['donor'].donor)
    
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
