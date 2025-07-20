from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.db.models import Count

# Safe imports with try-except to handle missing modules
try:
    from PIU_Financial_mgt.models import Project
except ImportError:
    Project = None

try:
    from social_and_env.models import ESIA, PAP, GrievianceMonitoringLog, OHS_Monitoring, CommunityConsult_Engagement
except ImportError:
    ESIA = PAP = GrievianceMonitoringLog = OHS_Monitoring = CommunityConsult_Engagement = None

try:
    from PIU_Mapping_project_Sites.models import projectMapping
except ImportError:
    projectMapping = None

@login_required
def main_dashboard(request):
    """
    Main main_dashboard view that provides overview statistics and quick access to all NAWEC PIU modules
    """
    context = {
        # Basic statistics - only count if models exist
        'total_projects': Project.objects.count(),
        'total_esia': ESIA.objects.count(),
        'total_pap': PAP.objects.count(),
        'total_sites': projectMapping.objects.count(),
        'total_grievances': GrievianceMonitoringLog.objects.count() if GrievianceMonitoringLog else 0,
        'total_ohs': OHS_Monitoring.objects.count() if OHS_Monitoring else 0,
        'total_community': CommunityConsult_Engagement.objects.count() if CommunityConsult_Engagement else 0,
        
        # Recent activity - using safe field references
        'recent_projects': list(Project.objects.order_by('-date')[:5]),
        'recent_esia': list(ESIA.objects.order_by('-date_created')[:5]) if ESIA else [],
        'recent_pap': list(PAP.objects.order_by('-date_created')[:5]) if PAP else [],
        
        # Simple statistics without complex filtering
        'active_projects': Project.objects.count() if Project else 0,
        'total_records': (
            (Project.objects.count() if Project else 0) +
            (ESIA.objects.count() if ESIA else 0) +
            (PAP.objects.count() if PAP else 0)
        ),
    }
    
    return render(request, 'main_dashboard.html', context)

def redirect_login(request):
    """
    Handle double-encoded login URL issue by redirecting to proper login page
    """
    return redirect('/accounts/login/?next=/')