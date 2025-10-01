from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import ProjectProgress
from .forms import ProjectProgressForm


@login_required
def project_progress_list(request):
    """List all project progress records"""
    progress_records = ProjectProgress.objects.all().select_related('project').order_by('-id')
    
    context = {
        'progress_records': progress_records,
    }
    return render(request, 'project_progress/list.html', context)


@login_required
def project_progress_create(request):
    """Create new project progress record"""
    if request.method == 'POST':
        form = ProjectProgressForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Project progress record created successfully!')
            return redirect('project_progress:list')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = ProjectProgressForm()
    
    context = {
        'form': form,
        'is_edit': False,
    }
    return render(request, 'project_progress/form.html', context)


@login_required
def project_progress_update(request, pk):
    """Update existing project progress record"""
    progress = get_object_or_404(ProjectProgress, pk=pk)
    
    if request.method == 'POST':
        form = ProjectProgressForm(request.POST, instance=progress)
        if form.is_valid():
            form.save()
            messages.success(request, 'Project progress record updated successfully!')
            return redirect('project_progress:list')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = ProjectProgressForm(instance=progress)
    
    context = {
        'form': form,
        'is_edit': True,
        'progress': progress,
    }
    return render(request, 'project_progress/form.html', context)


@login_required
def project_progress_delete(request, pk):
    """Delete project progress record"""
    progress = get_object_or_404(ProjectProgress, pk=pk)
    
    if request.method == 'POST':
        progress.delete()
        messages.success(request, 'Project progress record deleted successfully!')
        return redirect('project_progress:list')
    
    context = {
        'progress': progress,
    }
    return render(request, 'project_progress/delete_confirm.html', context)
