from django.contrib.auth import login
from django.contrib.sessions.models import Session
from django.utils import timezone
from .models import User

def ensure_user_can_login(user, request=None):
    """
    Utility function to ensure a user can login and perform transactions
    Platform-independent user activation and session management
    """
    
    # Ensure user is active and can login
    if not user.is_active:
        user.is_active = True
        user.save()
    
    # Set last_login if it's None
    if not user.last_login:
        user.last_login = timezone.now()
        user.save()
    
    # Create/refresh session if request is provided
    if request:
        login(request, user)
        
    return user

def activate_all_users():
    """
    Utility function to ensure all registered users are active and can login
    Use this for platform-independent deployment setup
    """
    inactive_users = User.objects.filter(is_active=False)
    activated_count = 0
    
    for user in inactive_users:
        user.is_active = True
        if not user.last_login:
            user.last_login = timezone.now()
        user.save()
        activated_count += 1
    
    return activated_count

def cleanup_expired_sessions():
    """
    Clean up expired sessions to maintain performance
    """
    expired_sessions = Session.objects.filter(expire_date__lt=timezone.now())
    count = expired_sessions.count()
    expired_sessions.delete()
    return count

def get_user_session_info(user):
    """
    Get session information for a user
    """
    sessions = Session.objects.filter(expire_date__gte=timezone.now())
    user_sessions = []
    
    for session in sessions:
        session_data = session.get_decoded()
        if session_data.get('_auth_user_id') == str(user.id):
            user_sessions.append({
                'session_key': session.session_key,
                'expire_date': session.expire_date,
                'last_activity': session_data.get('last_activity', 'Unknown')
            })
    
    return user_sessions

def ensure_platform_independence():
    """
    Configure system for platform-independent operation
    Call this during deployment or startup
    """
    # Activate all users
    activated_count = activate_all_users()
    
    # Clean up expired sessions
    cleaned_count = cleanup_expired_sessions()
    
    # Ensure admin user exists and is active
    admin_users = User.objects.filter(is_superuser=True, is_active=True)
    if not admin_users.exists():
        # Create or reactivate admin if needed
        try:
            admin = User.objects.get(username='admin')
            admin.is_active = True
            admin.is_superuser = True
            admin.is_staff = True
            admin.save()
        except User.DoesNotExist:
            pass
    
    return {
        'activated_users': activated_count,
        'cleaned_sessions': cleaned_count,
        'admin_exists': admin_users.exists()
    }