from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from collections import defaultdict
import math

from .models import UserDashboardActivity, WidgetRecommendation, AvailableWidget, UserWidgetPreference
from PIU_Financial_mgt.models import Project, Component
from monitoring.models import Results_Oriented_Monitoring


class PersonalizedRecommendationEngine:
    """
    Intelligent recommendation system that analyzes user behavior patterns,
    project involvement, and system usage to suggest relevant dashboard widgets.
    """
    
    def __init__(self):
        self.weight_recent_activity = 0.4
        self.weight_frequency = 0.3
        self.weight_project_relevance = 0.2
        self.weight_role_based = 0.1
        
    def generate_recommendations(self, user):
        """Generate personalized widget recommendations for a user"""
        recommendations = {}
        
        # Get user's activity patterns
        user_activity = self._analyze_user_activity(user)
        
        # Get user's project involvement
        project_context = self._analyze_project_context(user)
        
        # Get available widgets
        available_widgets = AvailableWidget.objects.filter(is_active=True)
        
        for widget in available_widgets:
            score = self._calculate_widget_score(
                user, widget, user_activity, project_context
            )
            
            if score > 0.3:  # Only recommend widgets with decent relevance
                reason = self._generate_recommendation_reason(
                    user, widget, user_activity, project_context, score
                )
                
                recommendations[widget.widget_id] = {
                    'widget': widget,
                    'score': score,
                    'reason': reason
                }
        
        # Save recommendations to database
        self._save_recommendations(user, recommendations)
        
        return sorted(recommendations.values(), key=lambda x: x['score'], reverse=True)
    
    def _analyze_user_activity(self, user):
        """Analyze user's dashboard activity patterns"""
        recent_date = timezone.now() - timedelta(days=30)
        
        activity = UserDashboardActivity.objects.filter(
            user=user,
            timestamp__gte=recent_date
        )
        
        widget_frequency = defaultdict(int)
        widget_duration = defaultdict(list)
        recent_widgets = set()
        
        for act in activity:
            widget_frequency[act.widget_type] += 1
            if act.duration_seconds:
                widget_duration[act.widget_type].append(act.duration_seconds)
            
            # Mark widgets used in last 7 days as recent
            if act.timestamp >= timezone.now() - timedelta(days=7):
                recent_widgets.add(act.widget_type)
        
        return {
            'frequency': widget_frequency,
            'avg_duration': {
                widget: sum(durations) / len(durations) 
                for widget, durations in widget_duration.items()
                if durations
            },
            'recent_widgets': recent_widgets,
            'total_sessions': activity.count()
        }
    
    def _analyze_project_context(self, user):
        """Analyze user's project involvement and responsibilities"""
        user_projects = Project.objects.filter(loginUser=user)
        user_components = Component.objects.filter(loginUser=user)
        user_monitoring = Results_Oriented_Monitoring.objects.filter(loginUser=user)
        
        project_categories = []
        has_financial_responsibility = user_projects.exists() or user_components.exists()
        has_monitoring_responsibility = user_monitoring.exists()
        
        # Determine project focus areas
        if user_projects.exists():
            project_categories.append('project_management')
        if user_components.exists():
            project_categories.append('financial_planning')
        if user_monitoring.exists():
            project_categories.append('monitoring_evaluation')
            
        return {
            'project_count': user_projects.count(),
            'component_count': user_components.count(),
            'monitoring_count': user_monitoring.count(),
            'categories': project_categories,
            'has_financial_role': has_financial_responsibility,
            'has_monitoring_role': has_monitoring_responsibility
        }
    
    def _calculate_widget_score(self, user, widget, activity, context):
        """Calculate relevance score for a widget"""
        score = 0.0
        
        # Recent activity weight
        if widget.widget_id in activity['recent_widgets']:
            score += self.weight_recent_activity
        
        # Frequency weight
        widget_frequency = activity['frequency'].get(widget.widget_id, 0)
        if activity['total_sessions'] > 0:
            frequency_ratio = widget_frequency / activity['total_sessions']
            score += self.weight_frequency * frequency_ratio
        
        # Project relevance weight
        relevance = self._calculate_project_relevance(widget, context)
        score += self.weight_project_relevance * relevance
        
        # Role-based weight
        role_match = self._calculate_role_match(widget, context)
        score += self.weight_role_based * role_match
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _calculate_project_relevance(self, widget, context):
        """Calculate how relevant a widget is based on user's project involvement"""
        relevance = 0.0
        
        category_mapping = {
            'financial': ['project_management', 'financial_planning'],
            'monitoring': ['monitoring_evaluation'],
            'mapping': ['project_management'],
            'analytics': ['project_management', 'monitoring_evaluation'],
            'reports': ['project_management', 'financial_planning', 'monitoring_evaluation']
        }
        
        widget_relevant_categories = category_mapping.get(widget.category, [])
        user_categories = context['categories']
        
        # Calculate overlap
        overlap = len(set(widget_relevant_categories) & set(user_categories))
        if widget_relevant_categories:
            relevance = overlap / len(widget_relevant_categories)
        
        # Boost for users with many projects
        if context['project_count'] > 2:
            relevance *= 1.2
            
        return min(relevance, 1.0)
    
    def _calculate_role_match(self, widget, context):
        """Calculate role-based matching score"""
        score = 0.0
        
        if widget.category == 'financial' and context['has_financial_role']:
            score = 0.8
        elif widget.category == 'monitoring' and context['has_monitoring_role']:
            score = 0.8
        elif widget.category == 'analytics':
            score = 0.6  # Generally useful for all roles
        elif widget.category == 'reports':
            score = 0.5  # Moderately useful for all roles
            
        return score
    
    def _generate_recommendation_reason(self, user, widget, activity, context, score):
        """Generate human-readable explanation for the recommendation"""
        reasons = []
        
        if widget.widget_id in activity['recent_widgets']:
            reasons.append("You've used this recently")
        
        frequency = activity['frequency'].get(widget.widget_id, 0)
        if frequency > 5:
            reasons.append(f"You use this frequently ({frequency} times this month)")
        
        if widget.category == 'financial' and context['has_financial_role']:
            reasons.append("Matches your financial management responsibilities")
        
        if widget.category == 'monitoring' and context['has_monitoring_role']:
            reasons.append("Relevant to your monitoring activities")
        
        if context['project_count'] > 0:
            reasons.append(f"Useful for managing your {context['project_count']} projects")
        
        if not reasons:
            reasons.append("Popular among users with similar roles")
        
        return ". ".join(reasons) + "."
    
    def _save_recommendations(self, user, recommendations):
        """Save recommendations to database"""
        # Clear existing recommendations
        WidgetRecommendation.objects.filter(user=user).delete()
        
        # Create new recommendations
        for widget_id, rec_data in recommendations.items():
            WidgetRecommendation.objects.create(
                user=user,
                widget_type=widget_id,
                recommendation_score=rec_data['score'],
                reason=rec_data['reason']
            )


class ActivityTracker:
    """Track user dashboard activity for recommendation system"""
    
    @staticmethod
    def track_widget_view(user, widget_type, metadata=None):
        """Track when a user views a widget"""
        UserDashboardActivity.objects.create(
            user=user,
            widget_type=widget_type,
            action='view',
            metadata=metadata or {}
        )
    
    @staticmethod
    def track_widget_interaction(user, widget_type, action, duration=None, metadata=None):
        """Track user interaction with a widget"""
        UserDashboardActivity.objects.create(
            user=user,
            widget_type=widget_type,
            action=action,
            duration_seconds=duration,
            metadata=metadata or {}
        )