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

from .models import ProjectDocument, DocumentVersion, DocumentComment, DocumentTag
from .forms import ProjectDocumentForm, DocumentCommentForm, DocumentTagForm
from PIU_Financial_mgt.models import Project
from setup.models import DocumentType
import json
import os


@login_required
def document_dashboard(request):
    """Document management dashboard"""
    # Get document statistics
    total_documents = ProjectDocument.objects.count()
    pending_review = ProjectDocument.objects.filter(status='under_review').count()
    approved_documents = ProjectDocument.objects.filter(status='approved').count()
    overdue_documents = ProjectDocument.objects.filter(
        due_date__lt=timezone.now().date(),
        status__in=['draft', 'under_review']
    ).count()
    
    # Recent documents
    recent_documents = ProjectDocument.objects.select_related(
        'project', 'document_type', 'created_by'
    ).order_by('-created_date')[:5]
    
    # Documents by status
    status_counts = ProjectDocument.objects.values('status').annotate(count=Count('status'))
    
    # Documents by project
    project_counts = ProjectDocument.objects.values('project__project').annotate(
        count=Count('document_id')
    ).order_by('-count')[:5]
    
    context = {
        'total_documents': total_documents,
        'pending_review': pending_review,
        'approved_documents': approved_documents,
        'overdue_documents': overdue_documents,
        'recent_documents': recent_documents,
        'status_counts': status_counts,
        'project_counts': project_counts,
    }
    
    return render(request, 'Project_Documentation_Tracking/dashboard.html', context)


@login_required
def document_list(request):
    """List all documents with filtering and pagination"""
    documents = ProjectDocument.objects.select_related(
        'project', 'document_type', 'created_by'
    ).all()
    
    # Filter by project
    project_id = request.GET.get('project')
    if project_id:
        documents = documents.filter(project_id=project_id)
    
    # Filter by document type
    doc_type_id = request.GET.get('document_type')
    if doc_type_id:
        documents = documents.filter(document_type_id=doc_type_id)
    
    # Filter by status
    status = request.GET.get('status')
    if status:
        documents = documents.filter(status=status)
    
    # Search by title or description
    search_query = request.GET.get('search')
    if search_query:
        documents = documents.filter(
            Q(title__icontains=search_query) | 
            Q(description__icontains=search_query)
        )
    
    # Pagination
    paginator = Paginator(documents, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Get filter options
    projects = Project.objects.all()
    document_types = DocumentType.objects.all()
    
    context = {
        'page_obj': page_obj,
        'projects': projects,
        'document_types': document_types,
        'current_filters': {
            'project': project_id,
            'document_type': doc_type_id,
            'status': status,
            'search': search_query,
        }
    }
    
    return render(request, 'Project_Documentation_Tracking/document_list.html', context)


@login_required
def document_detail(request, pk):
    """Document detail view"""
    document = get_object_or_404(
        ProjectDocument.objects.select_related(
            'project', 'document_type', 'created_by', 'reviewed_by'
        ),
        pk=pk
    )
    
    # Get document versions
    versions = DocumentVersion.objects.filter(document=document).order_by('-created_date')
    
    # Get comments
    comments = DocumentComment.objects.filter(document=document).select_related('author')
    
    # Handle comment form
    if request.method == 'POST':
        comment_form = DocumentCommentForm(request.POST)
        if comment_form.is_valid():
            comment = comment_form.save(commit=False)
            comment.document = document
            comment.author = request.user
            comment.save()
            messages.success(request, 'Comment added successfully!')
            return redirect('Project_Documentation_Tracking:document_detail', pk=pk)
    else:
        comment_form = DocumentCommentForm()
    
    context = {
        'document': document,
        'versions': versions,
        'comments': comments,
        'comment_form': comment_form,
    }
    
    return render(request, 'Project_Documentation_Tracking/document_detail.html', context)


@login_required
def document_create(request):
    """Create new document"""
    if request.method == 'POST':
        form = ProjectDocumentForm(request.POST, request.FILES)
        if form.is_valid():
            document = form.save(commit=False)
            document.created_by = request.user
            
            # Set file metadata
            if document.document_file:
                document.file_size = document.document_file.size
            
            document.save()
            messages.success(request, 'Document created successfully!')
            return redirect('Project_Documentation_Tracking:document_detail', pk=document.pk)
    else:
        form = ProjectDocumentForm()
    
    context = {
        'form': form,
        'title': 'Create New Document'
    }
    
    return render(request, 'Project_Documentation_Tracking/document_form.html', context)


@login_required
def document_update(request, pk):
    """Update existing document"""
    document = get_object_or_404(ProjectDocument, pk=pk)
    
    if request.method == 'POST':
        form = ProjectDocumentForm(request.POST, request.FILES, instance=document)
        if form.is_valid():
            document = form.save(commit=False)
            document.modified_by = request.user
            
            # Update file metadata if new file uploaded
            if 'document_file' in request.FILES:
                document.file_size = document.document_file.size
            
            document.save()
            messages.success(request, 'Document updated successfully!')
            return redirect('Project_Documentation_Tracking:document_detail', pk=pk)
    else:
        form = ProjectDocumentForm(instance=document)
    
    context = {
        'form': form,
        'document': document,
        'title': 'Update Document'
    }
    
    return render(request, 'Project_Documentation_Tracking/document_form.html', context)


@login_required
def document_delete(request, pk):
    """Delete document"""
    document = get_object_or_404(ProjectDocument, pk=pk)
    
    if request.method == 'POST':
        document.delete()
        messages.success(request, 'Document deleted successfully!')
        return redirect('Project_Documentation_Tracking:document_list')
    
    context = {
        'document': document,
        'title': 'Delete Document'
    }
    
    return render(request, 'Project_Documentation_Tracking/document_confirm_delete.html', context)


@login_required
def document_approve(request, pk):
    """Approve document"""
    document = get_object_or_404(ProjectDocument, pk=pk)
    
    if request.method == 'POST':
        document.status = 'approved'
        document.reviewed_by = request.user
        document.review_date = timezone.now()
        document.review_comments = request.POST.get('review_comments', '')
        document.save()
        
        messages.success(request, 'Document approved successfully!')
        return redirect('Project_Documentation_Tracking:document_detail', pk=pk)
    
    context = {
        'document': document,
        'title': 'Approve Document'
    }
    
    return render(request, 'Project_Documentation_Tracking/document_approve.html', context)


@login_required
def document_reject(request, pk):
    """Reject document"""
    document = get_object_or_404(ProjectDocument, pk=pk)
    
    if request.method == 'POST':
        document.status = 'rejected'
        document.reviewed_by = request.user
        document.review_date = timezone.now()
        document.review_comments = request.POST.get('review_comments', '')
        document.save()
        
        messages.success(request, 'Document rejected!')
        return redirect('Project_Documentation_Tracking:document_detail', pk=pk)
    
    context = {
        'document': document,
        'title': 'Reject Document'
    }
    
    return render(request, 'Project_Documentation_Tracking/document_reject.html', context)


@login_required
def upload_version(request, pk):
    """Upload new version of document"""
    document = get_object_or_404(ProjectDocument, pk=pk)
    
    if request.method == 'POST':
        version_number = request.POST.get('version_number')
        version_notes = request.POST.get('version_notes', '')
        version_file = request.FILES.get('version_file')
        
        if version_file and version_number:
            # Create new version
            version = DocumentVersion.objects.create(
                document=document,
                version_number=version_number,
                document_file=version_file,
                version_notes=version_notes,
                created_by=request.user,
                file_size=version_file.size
            )
            
            # Update main document version
            document.version = version_number
            document.save()
            
            messages.success(request, f'Version {version_number} uploaded successfully!')
        else:
            messages.error(request, 'Please provide version number and file!')
        
        return redirect('Project_Documentation_Tracking:document_detail', pk=pk)
    
    context = {
        'document': document,
        'title': 'Upload New Version'
    }
    
    return render(request, 'Project_Documentation_Tracking/upload_version.html', context)


@login_required
def tag_management(request):
    """Manage document tags"""
    tags = DocumentTag.objects.all()
    
    if request.method == 'POST':
        form = DocumentTagForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Tag created successfully!')
            return redirect('Project_Documentation_Tracking:tag_management')
    else:
        form = DocumentTagForm()
    
    context = {
        'tags': tags,
        'form': form,
    }
    
    return render(request, 'Project_Documentation_Tracking/tag_management.html', context)


@csrf_exempt
@require_http_methods(["POST"])
def ajax_update_document_status(request):
    """AJAX endpoint to update document status"""
    try:
        data = json.loads(request.body)
        document_id = data.get('document_id')
        new_status = data.get('status')
        
        document = get_object_or_404(ProjectDocument, pk=document_id)
        document.status = new_status
        document.save()
        
        return JsonResponse({'success': True, 'message': 'Status updated successfully'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


# Add timezone import
from django.utils import timezone