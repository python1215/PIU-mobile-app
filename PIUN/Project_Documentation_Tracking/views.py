from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Q, Count
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views.generic import ListView, DetailView
from django.contrib.auth.mixins import LoginRequiredMixin

from .models import ProjectDocument
from .forms import ProjectDocumentForm
from PIU_Financial_mgt.models import Project
from setup.models import DocumentType
# Removed platform-specific database utilities - using Django ORM exclusively
from django.utils import timezone
import json
import os

# Mock classes removed - using Django ORM exclusively for platform independence


@login_required
def document_dashboard(request):
    """Document management dashboard using Django ORM exclusively"""
    # Platform-independent Django ORM implementation
    try:
        recent_documents = ProjectDocument.objects.select_related(
            'project', 'document_type', 'loginUser'
        ).order_by('-date')[:5]
        
        # Calculate statistics using Django ORM
        total_documents = ProjectDocument.objects.count()
        active_projects = ProjectDocument.objects.values('project').distinct().count()
        document_types = ProjectDocument.objects.values('document_type').distinct().count()
        
        context = {
            'recent_documents': recent_documents,
            'total_documents': total_documents,
            'active_projects': active_projects,
            'document_types': document_types,
        }
    except Exception as e:
        # Fallback with empty data if there's an issue
        context = {
            'recent_documents': [],
            'total_documents': 0,
            'active_projects': 0,
            'document_types': 0,
            'error_message': f"Error loading dashboard data: {str(e)}"
        }
    
    return render(request, 'Project_Documentation_Tracking/dashboard.html', context)


@login_required
def document_list(request):
    """List all documents with filtering and pagination - Django ORM exclusively"""
    # Platform-independent Django ORM implementation
    documents = ProjectDocument.objects.select_related(
        'project', 'document_type', 'loginUser'
    ).order_by('-date')
    
    # Apply filters using Django ORM
    project_id = request.GET.get('project')
    if project_id:
        documents = documents.filter(project_id=project_id)
    
    doc_type_id = request.GET.get('document_type')
    if doc_type_id:
        documents = documents.filter(document_type_id=doc_type_id)
    
    status = request.GET.get('status')
    if status:
        documents = documents.filter(status=status)
    
    search_query = request.GET.get('search')
    if search_query:
        documents = documents.filter(
            Q(description__icontains=search_query)
        )
    
    # Pagination using Django
    paginator = Paginator(documents, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Get filter options using Django ORM
    projects = Project.objects.all()
    document_types = DocumentType.objects.all()
    
    context = {
        'page_obj': page_obj,
        'projects': projects,
        'document_types': document_types,
        'current_filters': {
            'project': request.GET.get('project'),
            'document_type': request.GET.get('document_type'),
            'search': request.GET.get('search'),
        }
    }
    
    return render(request, 'Project_Documentation_Tracking/document_list.html', context)


@login_required
def document_detail(request, pk):
    """Document detail view using Django ORM exclusively"""
    document = get_object_or_404(
        ProjectDocument.objects.select_related(
            'project', 'document_type', 'loginUser'
        ),
        pk=pk
    )
    
    # Additional document metadata using Django ORM
    total_documents = ProjectDocument.objects.count()
    project_documents = ProjectDocument.objects.filter(project=document.project).count()
    
    context = {
        'document': document,
        'total_documents': total_documents,
        'project_documents': project_documents,
    }
    
    return render(request, 'Project_Documentation_Tracking/document_detail.html', context)


@login_required
def document_create(request):
    """Create new document using Django ORM exclusively"""
    if request.method == 'POST':
        form = ProjectDocumentForm(request.POST, request.FILES)
        if form.is_valid():
            document = form.save(commit=False)
            document.loginUser = request.user
            document.save()
            messages.success(request, 'Document created successfully!')
            return redirect('Project_Documentation_Tracking:document_detail', pk=document.pk)
        else:
            # Add form errors to messages
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        form = ProjectDocumentForm()
    
    # Get filter options using Django ORM
    projects = Project.objects.all()
    document_types = DocumentType.objects.all()
    
    context = {
        'form': form,
        'title': 'Create New Document',
        'projects': projects,
        'document_types': document_types,
    }
    
    return render(request, 'Project_Documentation_Tracking/document_form.html', context)


@login_required
def document_update(request, pk):
    """Update existing document using Django ORM exclusively"""
    document = get_object_or_404(ProjectDocument, pk=pk)
    
    if request.method == 'POST':
        form = ProjectDocumentForm(request.POST, request.FILES, instance=document)
        if form.is_valid():
            document = form.save(commit=False)
            document.loginUser = request.user  # Update user field
            
            # Update file metadata if new file uploaded
            if 'attachment' in request.FILES:
                document.attachment = request.FILES['attachment']
            
            document.save()
            messages.success(request, 'Document updated successfully!')
            return redirect('Project_Documentation_Tracking:document_detail', pk=pk)
        else:
            # Add form errors to messages
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        form = ProjectDocumentForm(instance=document)
    
    # Get filter options using Django ORM
    projects = Project.objects.all()
    document_types = DocumentType.objects.all()
    
    context = {
        'form': form,
        'document': document,
        'title': 'Update Document',
        'projects': projects,
        'document_types': document_types,
    }
    
    return render(request, 'Project_Documentation_Tracking/document_form.html', context)


@login_required
def document_delete(request, pk):
    """Delete document using Django ORM exclusively"""
    document = get_object_or_404(ProjectDocument, pk=pk)
    
    if request.method == 'POST':
        try:
            document.delete()
            messages.success(request, 'Document deleted successfully!')
            return redirect('Project_Documentation_Tracking:document_list')
        except Exception as e:
            messages.error(request, f'Error deleting document: {str(e)}')
    
    context = {
        'document': document,
        'title': 'Delete Document'
    }
    
    return render(request, 'Project_Documentation_Tracking/document_confirm_delete.html', context)


# Document approve/reject functions removed as status field doesn't exist in current model


@login_required
def upload_version(request, pk):
    """Upload new version of document - simplified for current model"""
    document = get_object_or_404(ProjectDocument, pk=pk)
    messages.info(request, 'Version upload feature is not available in current implementation.')
    return redirect('Project_Documentation_Tracking:document_detail', pk=pk)


@login_required
def tag_management(request):
    """Manage document tags - simplified for current model"""
    messages.info(request, 'Tag management feature is not available in current implementation.')
    return redirect('Project_Documentation_Tracking:document_list')


# AJAX status update removed as status field doesn't exist in current model


# Project_Documentation_Tracking module now fully platform-independent using Django ORM exclusively