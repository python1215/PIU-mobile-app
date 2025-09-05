from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import update_session_auth_hash, login
from django.contrib import messages
from django.urls import reverse_lazy
from django.views.generic import CreateView, ListView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db.models import Q
from django.http import JsonResponse
from django.utils import timezone
from .forms import CustomUserCreationForm, CustomUserChangeForm, CustomPasswordChangeForm
from .models import User
from .utils import ensure_user_can_login, ensure_platform_independence


# Helper function to check if user is admin/superuser
def is_admin(user):
    return user.is_superuser or user.is_staff


def index(request):
    return render(request, 'index.html')


# Class-based views for User CRUD operations
class UserCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = User
    form_class = CustomUserCreationForm
    template_name = 'accounts/user_form.html'
    success_url = reverse_lazy('accounts:user_list')

    def test_func(self):
        return is_admin(self.request.user)

    def form_valid(self, form):
        user = form.save()
        # Ensure new user can login immediately
        ensure_user_can_login(user)
        messages.success(self.request, 'User created successfully and is ready to login!')
        return super().form_valid(form)


class UserListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = User
    template_name = 'accounts/user_list.html'
    context_object_name = 'users'
    paginate_by = 20

    def test_func(self):
        return is_admin(self.request.user)

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        search_query = self.request.GET.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(username__icontains=search_query) |
                Q(email__icontains=search_query) |
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(department__icontains=search_query)
            )
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['search_query'] = self.request.GET.get('search', '')
        return context


class UserDetailView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = User
    form_class = CustomUserChangeForm
    template_name = 'accounts/user_detail.html'
    context_object_name = 'user_profile'

    def test_func(self):
        return is_admin(self.request.user) or self.get_object() == self.request.user

    def get_success_url(self):
        if is_admin(self.request.user):
            return reverse_lazy('accounts:user_list')
        else:
            return reverse_lazy('accounts:profile')

    def form_valid(self, form):
        messages.success(self.request, 'Profile updated successfully!')
        return super().form_valid(form)


class UserUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = User
    form_class = CustomUserChangeForm
    template_name = 'accounts/user_form.html'
    success_url = reverse_lazy('accounts:user_list')

    def test_func(self):
        return is_admin(self.request.user)

    def form_valid(self, form):
        messages.success(self.request, 'User updated successfully!')
        return super().form_valid(form)


class UserDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = User
    template_name = 'accounts/user_confirm_delete.html'
    success_url = reverse_lazy('accounts:user_list')

    def test_func(self):
        return is_admin(self.request.user) and self.get_object() != self.request.user

    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'User deleted successfully!')
        return super().delete(request, *args, **kwargs)


# Function-based views for additional functionality
@login_required
def profile_view(request):
    """View user's own profile"""
    return render(request, 'accounts/profile.html', {'user': request.user})


@login_required
def change_password(request):
    """Allow users to change their own password"""
    if request.method == 'POST':
        form = CustomPasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Important!
            messages.success(request, 'Your password was successfully updated!')
            return redirect('accounts:profile')
        else:
            messages.error(request, 'Please correct the error below.')
    else:
        form = CustomPasswordChangeForm(request.user)
    return render(request, 'accounts/change_password.html', {'form': form})


@login_required
@user_passes_test(is_admin)
def user_dashboard(request):
    """Admin dashboard for user management"""
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    staff_users = User.objects.filter(is_staff=True).count()
    recent_users = User.objects.order_by('-date_joined')[:5]
    
    context = {
        'total_users': total_users,
        'active_users': active_users,
        'staff_users': staff_users,
        'recent_users': recent_users,
    }
    return render(request, 'accounts/user_dashboard.html', context)


# Platform-independent management views
@login_required
@user_passes_test(is_admin)
def activate_all_users_view(request):
    """Admin view to activate all users for platform independence"""
    if request.method == 'POST':
        from .utils import activate_all_users
        count = activate_all_users()
        messages.success(request, f'Successfully activated {count} users.')
    return redirect('accounts:user_list')

@login_required
@user_passes_test(is_admin) 
def ensure_platform_independence_view(request):
    """Admin view to ensure platform independence"""
    if request.method == 'POST':
        result = ensure_platform_independence()
        messages.success(request, 
            f"Platform independence configured: {result['activated_users']} users activated, "
            f"{result['cleaned_sessions']} expired sessions cleaned, "
            f"Admin exists: {result['admin_exists']}")
    return redirect('accounts:user_list')

def system_status_api(request):
    """API endpoint to check system authentication status"""
    from django.contrib.sessions.models import Session
    
    # Get user statistics
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    users_with_login = User.objects.filter(last_login__isnull=False).count()
    active_sessions = Session.objects.filter(expire_date__gte=timezone.now()).count()
    
    # Check admin existence
    admin_exists = User.objects.filter(is_superuser=True, is_active=True).exists()
    
    status = {
        'total_users': total_users,
        'active_users': active_users, 
        'users_with_login': users_with_login,
        'active_sessions': active_sessions,
        'admin_exists': admin_exists,
        'authentication_ready': active_users > 0 and admin_exists,
        'timestamp': timezone.now().isoformat()
    }
    
    return JsonResponse(status)

# Legacy view (keep for compatibility)
class SignUpView(CreateView):
    form_class = CustomUserCreationForm
    success_url = reverse_lazy("login")
    template_name = "account/signup.html"
    
    def form_valid(self, form):
        user = form.save()
        # Ensure new user can login immediately
        ensure_user_can_login(user)
        messages.success(self.request, 'Account created successfully! You can now login.')
        return super().form_valid(form)