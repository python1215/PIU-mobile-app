from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib import messages
from django.db import transaction

from .models import WidgetRecommendation, AvailableWidget, UserWidgetPreference
from .recommendation_engine import PersonalizedRecommendationEngine, ActivityTracker


@login_required
def dashboard_recommendations(request):
    """Display personalized widget recommendations"""
    engine = PersonalizedRecommendationEngine()
    recommendations = engine.generate_recommendations(request.user)
    
    # Get user's current preferences
    current_preferences = UserWidgetPreference.objects.filter(
        user=request.user, is_enabled=True
    ).select_related('widget')
    
    context = {
        'recommendations': recommendations[:6],  # Show top 6 recommendations
        'current_widgets': current_preferences,
        'total_recommendations': len(recommendations)
    }
    
    # Track that user viewed recommendations
    ActivityTracker.track_widget_view(
        request.user, 
        'recommendations_dashboard',
        {'recommendation_count': len(recommendations)}
    )
    
    return render(request, 'dashboard_recommendations/recommendations.html', context)


@login_required
@require_http_methods(["POST"])
def add_widget_to_dashboard(request):
    """Add a recommended widget to user's dashboard"""
    widget_id = request.POST.get('widget_id')
    
    try:
        widget = AvailableWidget.objects.get(widget_id=widget_id, is_active=True)
        
        # Get the next position
        max_position = UserWidgetPreference.objects.filter(user=request.user).count()
        
        preference, created = UserWidgetPreference.objects.get_or_create(
            user=request.user,
            widget=widget,
            defaults={
                'is_enabled': True,
                'position': max_position + 1
            }
        )
        
        if not created:
            preference.is_enabled = True
            preference.save()
        
        # Track the action
        ActivityTracker.track_widget_interaction(
            request.user,
            'widget_management',
            'add_widget',
            metadata={'widget_id': widget_id}
        )
        
        messages.success(request, f'Added "{widget.name}" to your dashboard!')
        
        if request.headers.get('Content-Type') == 'application/json':
            return JsonResponse({'success': True, 'message': 'Widget added successfully'})
            
    except AvailableWidget.DoesNotExist:
        messages.error(request, 'Widget not found.')
        if request.headers.get('Content-Type') == 'application/json':
            return JsonResponse({'success': False, 'error': 'Widget not found'})
    
    return redirect('dashboard_recommendations:recommendations')


@login_required
@require_http_methods(["POST"])
def remove_widget_from_dashboard(request):
    """Remove a widget from user's dashboard"""
    widget_id = request.POST.get('widget_id')
    
    try:
        widget = AvailableWidget.objects.get(widget_id=widget_id)
        preference = UserWidgetPreference.objects.get(
            user=request.user,
            widget=widget
        )
        
        preference.is_enabled = False
        preference.save()
        
        # Track the action
        ActivityTracker.track_widget_interaction(
            request.user,
            'widget_management',
            'remove_widget',
            metadata={'widget_id': widget_id}
        )
        
        messages.success(request, f'Removed "{widget.name}" from your dashboard.')
        
        if request.headers.get('Content-Type') == 'application/json':
            return JsonResponse({'success': True, 'message': 'Widget removed successfully'})
            
    except (AvailableWidget.DoesNotExist, UserWidgetPreference.DoesNotExist):
        messages.error(request, 'Widget not found.')
        if request.headers.get('Content-Type') == 'application/json':
            return JsonResponse({'success': False, 'error': 'Widget not found'})
    
    return redirect('dashboard_recommendations:recommendations')


@login_required
def widget_catalog(request):
    """Display all available widgets organized by category"""
    widgets_by_category = {}
    categories = AvailableWidget.objects.values_list('category', flat=True).distinct()
    
    for category in categories:
        widgets_by_category[category] = AvailableWidget.objects.filter(
            category=category, 
            is_active=True
        )
    
    # Get user's enabled widgets
    user_widgets = set(
        UserWidgetPreference.objects.filter(
            user=request.user, 
            is_enabled=True
        ).values_list('widget__widget_id', flat=True)
    )
    
    context = {
        'widgets_by_category': widgets_by_category,
        'user_widgets': user_widgets,
        'category_labels': dict(AvailableWidget.WIDGET_CATEGORIES)
    }
    
    return render(request, 'dashboard_recommendations/widget_catalog.html', context)


@login_required
@require_http_methods(["POST"])
def reorder_dashboard_widgets(request):
    """Reorder widgets on user's dashboard"""
    widget_order = request.POST.getlist('widget_order[]')
    
    try:
        with transaction.atomic():
            for index, widget_id in enumerate(widget_order):
                UserWidgetPreference.objects.filter(
                    user=request.user,
                    widget__widget_id=widget_id
                ).update(position=index + 1)
        
        ActivityTracker.track_widget_interaction(
            request.user,
            'widget_management',
            'reorder_widgets',
            metadata={'new_order': widget_order}
        )
        
        return JsonResponse({'success': True})
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


@login_required
def refresh_recommendations(request):
    """Regenerate recommendations for the user"""
    engine = PersonalizedRecommendationEngine()
    recommendations = engine.generate_recommendations(request.user)
    
    messages.success(request, f'Generated {len(recommendations)} new recommendations based on your activity!')
    
    return redirect('dashboard_recommendations:recommendations')


@login_required
def user_dashboard_personalized(request):
    """Display user's personalized dashboard with their selected widgets"""
    user_widgets = UserWidgetPreference.objects.filter(
        user=request.user,
        is_enabled=True
    ).select_related('widget').order_by('position')
    
    # Track dashboard view
    ActivityTracker.track_widget_view(
        request.user,
        'personalized_dashboard',
        {'widget_count': user_widgets.count()}
    )
    
    context = {
        'user_widgets': user_widgets,
        'user': request.user
    }
    
    return render(request, 'dashboard_recommendations/personalized_dashboard.html', context)