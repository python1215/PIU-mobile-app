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
from utils.database_utils import is_sql_server_mode, get_sql_server_table_name, execute_database_query
from django.utils import timezone
import json
import os

def create_mock_document(doc_data):
    """Create mock document object for template compatibility"""
    if not doc_data:
        return None
    
    class MockDocument:
        def __init__(self, data):
            if isinstance(data, (list, tuple)) and len(data) >= 8:
                self.document_id = data[0]
                self.title = data[1] if len(data) > 1 else 'Document'
                self.description = data[2] if len(data) > 2 else ''
                self.status = data[3] if len(data) > 3 else 'draft'
                self.created_date = data[4] if len(data) > 4 else timezone.now()
                self.due_date = data[5] if len(data) > 5 else None
                self.project_id = data[6] if len(data) > 6 else None
                self.document_type_id = data[7] if len(data) > 7 else None
                self.created_by_id = data[8] if len(data) > 8 else None
            else:
                self.document_id = getattr(data, 'document_id', 1)
                self.title = getattr(data, 'title', 'Document')
                self.description = getattr(data, 'description', '')
                self.status = getattr(data, 'status', 'draft')
                self.created_date = getattr(data, 'created_date', timezone.now())
                self.due_date = getattr(data, 'due_date', None)
                self.project_id = getattr(data, 'project_id', None)
                self.document_type_id = getattr(data, 'document_type_id', None)
                self.created_by_id = getattr(data, 'created_by_id', None)
            
            # Add mock related objects
            self.project = MockProject(self.project_id)
            self.document_type = MockDocumentType(self.document_type_id)
            self.created_by = MockUser(self.created_by_id)
            
        def get_status_display(self):
            status_map = {
                'draft': 'Draft',
                'under_review': 'Under Review',
                'approved': 'Approved',
                'rejected': 'Rejected'
            }
            return status_map.get(self.status, self.status.title())
            
        @property
        def pk(self):
            return self.document_id
    
    class MockProject:
        def __init__(self, project_id):
            self.projectID = project_id
            self.project = f"Project {project_id}" if project_id else "Unknown Project"
    
    class MockDocumentType:
        def __init__(self, type_id):
            self.id = type_id
            self.document_type = f"Document Type {type_id}" if type_id else "Unknown Type"
    
    class MockUser:
        def __init__(self, user_id):
            self.id = user_id
            self.username = f"User {user_id}" if user_id else "Unknown User"
    
    return MockDocument(doc_data)


@login_required
def document_dashboard(request):
    """Document management dashboard with dual-mode database support"""
    if is_sql_server_mode():
        # SQL Server mode using raw queries
        table_name = get_sql_server_table_name("Project_Documentation_Tracking_projectdocument")
        
        # Get document statistics
        total_documents = execute_database_query(
            f"SELECT COUNT(*) FROM {table_name}", fetch_all=False
        )[0] if execute_database_query(f"SELECT COUNT(*) FROM {table_name}", fetch_all=False) else 0
        
        pending_review = execute_database_query(
            f"SELECT COUNT(*) FROM {table_name} WHERE status = ?", ['under_review'], fetch_all=False
        )[0] if execute_database_query(f"SELECT COUNT(*) FROM {table_name} WHERE status = ?", ['under_review'], fetch_all=False) else 0
        
        approved_documents = execute_database_query(
            f"SELECT COUNT(*) FROM {table_name} WHERE status = ?", ['approved'], fetch_all=False
        )[0] if execute_database_query(f"SELECT COUNT(*) FROM {table_name} WHERE status = ?", ['approved'], fetch_all=False) else 0
        
        overdue_documents = execute_database_query(
            f"SELECT COUNT(*) FROM {table_name} WHERE due_date < GETDATE() AND status IN ('draft', 'under_review')", 
            fetch_all=False
        )[0] if execute_database_query(f"SELECT COUNT(*) FROM {table_name} WHERE due_date < GETDATE() AND status IN ('draft', 'under_review')", fetch_all=False) else 0
        
        # Recent documents (simplified for SQL Server)
        recent_documents_data = execute_database_query(
            f"SELECT TOP 5 * FROM {table_name} ORDER BY created_date DESC"
        )
        
        # Create mock objects for template compatibility
        recent_documents = []
        for doc_data in recent_documents_data or []:
            recent_documents.append(create_mock_document(doc_data))
        
        # Status counts
        status_counts_data = execute_database_query(
            f"SELECT status, COUNT(*) as count FROM {table_name} GROUP BY status"
        )
        status_counts = [{'status': row[0], 'count': row[1]} for row in status_counts_data or []]
        
        # Project counts (simplified)
        project_counts = []
        
    else:
        # SQLite mode using Django ORM with actual model fields
        total_documents = ProjectDocument.objects.count()
        pending_review = 0  # No status field in current model
        approved_documents = 0  # No status field in current model
        overdue_documents = 0  # No due_date field in current model
        
        # Recent documents using actual fields
        recent_documents = ProjectDocument.objects.select_related(
            'project', 'document_type', 'loginUser'
        ).order_by('-date')[:5]
        
        # Documents by document type (since no status field)
        status_counts = ProjectDocument.objects.values('document_type__document_type').annotate(count=Count('id'))
        
        # Documents by project
        project_counts = ProjectDocument.objects.values('project__project').annotate(
            count=Count('id')
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
    """List all documents with filtering and pagination - dual-mode support"""
    if is_sql_server_mode():
        # SQL Server mode using raw queries
        table_name = get_sql_server_table_name("Project_Documentation_Tracking_projectdocument")
        
        # Build query with filters
        base_query = f"SELECT * FROM {table_name}"
        where_clauses = []
        params = []
        
        # Filter by project
        project_id = request.GET.get('project')
        if project_id:
            where_clauses.append("project_id = ?")
            params.append(project_id)
        
        # Filter by document type
        doc_type_id = request.GET.get('document_type')
        if doc_type_id:
            where_clauses.append("document_type_id = ?")
            params.append(doc_type_id)
        
        # Filter by status
        status = request.GET.get('status')
        if status:
            where_clauses.append("status = ?")
            params.append(status)
        
        # Search by title or description
        search_query = request.GET.get('search')
        if search_query:
            where_clauses.append("(title LIKE ? OR description LIKE ?)")
            params.extend([f'%{search_query}%', f'%{search_query}%'])
        
        # Construct final query
        if where_clauses:
            query = f"{base_query} WHERE {' AND '.join(where_clauses)} ORDER BY created_date DESC"
        else:
            query = f"{base_query} ORDER BY created_date DESC"
        
        # Execute query
        documents_data = execute_database_query(query, params)
        
        # Create mock objects for template compatibility
        documents = []
        for doc_data in documents_data or []:
            documents.append(create_mock_document(doc_data))
        
        # Simple pagination for SQL Server
        page_number = int(request.GET.get('page', 1))
        per_page = 10
        start_index = (page_number - 1) * per_page
        end_index = start_index + per_page
        
        class MockPaginator:
            def __init__(self, items, per_page):
                self.count = len(items)
                self.num_pages = (self.count + per_page - 1) // per_page
                self.per_page = per_page
        
        class MockPage:
            def __init__(self, items, page_num, paginator):
                self.object_list = items
                self.number = page_num
                self.paginator = paginator
                self.has_previous = page_num > 1
                self.has_next = page_num < paginator.num_pages
                self.previous_page_number = page_num - 1 if self.has_previous else None
                self.next_page_number = page_num + 1 if self.has_next else None
        
        paginator = MockPaginator(documents, per_page)
        page_obj = MockPage(documents[start_index:end_index], page_number, paginator)
        
        # Get filter options (simplified)
        projects = Project.objects.all() if not is_sql_server_mode() else []
        document_types = DocumentType.objects.all() if not is_sql_server_mode() else []
        
    else:
        # SQLite mode using Django ORM with actual model fields
        documents = ProjectDocument.objects.select_related(
            'project', 'document_type', 'loginUser'
        ).order_by('-id')
        
        # Filter by project
        project_id = request.GET.get('project')
        if project_id:
            documents = documents.filter(project_id=project_id)
        
        # Filter by document type
        doc_type_id = request.GET.get('document_type')
        if doc_type_id:
            documents = documents.filter(document_type_id=doc_type_id)
        
        # Search by description (no title field in current model)
        search_query = request.GET.get('search')
        if search_query:
            documents = documents.filter(
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
            'project': request.GET.get('project'),
            'document_type': request.GET.get('document_type'),
            'search': request.GET.get('search'),
        }
    }
    
    return render(request, 'Project_Documentation_Tracking/document_list.html', context)


@login_required
def document_detail(request, pk):
    """Document detail view with dual-mode database support"""
    if is_sql_server_mode():
        # SQL Server mode - get document using raw SQL
        table_name = get_sql_server_table_name("Project_Documentation_Tracking_projectdocument")
        
        # Get document data
        document_data = execute_database_query(
            f"SELECT * FROM {table_name} WHERE document_id = ?", [pk], fetch_all=False
        )
        
        if not document_data:
            messages.error(request, 'Document not found!')
            return redirect('Project_Documentation_Tracking:document_list')
        
        document = create_mock_document(document_data)
        
        # For SQL Server mode, simplified versions and comments
        versions = []
        comments = []
        comment_form = None
        
    else:
        # SQLite mode - Django ORM
        document = get_object_or_404(
            ProjectDocument.objects.select_related(
                'project', 'document_type', 'loginUser'
            ),
            pk=pk
        )
        
        # For SQLite mode, simplified versions and comments (matching actual model)
        versions = []
        comments = []
        comment_form = None
    
    context = {
        'document': document,
        'versions': versions,
        'comments': comments,
        'comment_form': comment_form,
    }
    
    return render(request, 'Project_Documentation_Tracking/document_detail.html', context)


@login_required
def document_create(request):
    """Create new document with dual-mode database support"""
    if request.method == 'POST':
        if is_sql_server_mode():
            # SQL Server mode - direct SQL insertion
            try:
                table_name = get_sql_server_table_name("Project_Documentation_Tracking_project_documentation_tracking")
                
                # Extract form data using actual model fields
                description = request.POST.get('description', '')
                project_id = request.POST.get('project')
                document_type_id = request.POST.get('document_type')
                document_date = request.POST.get('document_date')
                
                # Insert document into SQL Server
                insert_query = f"""
                    INSERT INTO {table_name} 
                    (description, project_id, document_type_id, document_date, loginUser_id, date)
                    VALUES (?, ?, ?, ?, ?, GETDATE())
                """
                
                params = [
                    description, project_id, document_type_id, document_date, request.user.id
                ]
                
                execute_database_query(insert_query, params, fetch_all=False)
                messages.success(request, 'Document created successfully!')
                return redirect('Project_Documentation_Tracking:document_list')
                
            except Exception as e:
                messages.error(request, f'Error creating document: {str(e)}')
        else:
            # SQLite mode - Django ORM
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
        form = ProjectDocumentForm() if not is_sql_server_mode() else None
    
    # Get filter options for forms
    if is_sql_server_mode():
        # For SQL Server mode, get basic project and document type data
        projects = Project.objects.all()[:10]  # Limit to first 10 for performance
        document_types = DocumentType.objects.all()[:10]
    else:
        # For SQLite mode, use all records
        projects = Project.objects.all()
        document_types = DocumentType.objects.all()
    
    context = {
        'form': form,
        'title': 'Create New Document',
        'projects': projects,
        'document_types': document_types,
        'is_sql_server_mode': is_sql_server_mode(),
    }
    
    return render(request, 'Project_Documentation_Tracking/document_form.html', context)


@login_required
def document_update(request, pk):
    """Update existing document with dual-mode database support"""
    if is_sql_server_mode():
        # SQL Server mode - get document using raw SQL
        table_name = get_sql_server_table_name("Project_Documentation_Tracking_projectdocument")
        
        # Get document data
        document_data = execute_database_query(
            f"SELECT * FROM {table_name} WHERE document_id = ?", [pk], fetch_all=False
        )
        
        if not document_data:
            messages.error(request, 'Document not found!')
            return redirect('Project_Documentation_Tracking:document_list')
        
        document = create_mock_document(document_data)
        
        if request.method == 'POST':
            try:
                # Extract form data
                title = request.POST.get('title')
                description = request.POST.get('description', '')
                project_id = request.POST.get('project')
                document_type_id = request.POST.get('document_type')
                status = request.POST.get('status', 'draft')
                priority = request.POST.get('priority', 'medium')
                due_date = request.POST.get('due_date')
                
                # Update document in SQL Server
                update_query = f"""
                    UPDATE {table_name} 
                    SET title = ?, description = ?, project_id = ?, document_type_id = ?, 
                        status = ?, priority = ?, due_date = ?, modified_date = GETDATE()
                    WHERE document_id = ?
                """
                
                params = [
                    title, description, project_id, document_type_id, 
                    status, priority, due_date, pk
                ]
                
                execute_database_query(update_query, params, fetch_all=False)
                messages.success(request, 'Document updated successfully!')
                return redirect('Project_Documentation_Tracking:document_list')
                
            except Exception as e:
                messages.error(request, f'Error updating document: {str(e)}')
        
        # Get filter options
        projects = []
        document_types = []
        form = None
        
    else:
        # SQLite mode - Django ORM
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
        
        # Get filter options
        projects = Project.objects.all()
        document_types = DocumentType.objects.all()
    
    context = {
        'form': form if not is_sql_server_mode() else None,
        'document': document,
        'title': 'Update Document',
        'projects': projects,
        'document_types': document_types,
        'is_sql_server_mode': is_sql_server_mode(),
    }
    
    return render(request, 'Project_Documentation_Tracking/document_form.html', context)


@login_required
def document_delete(request, pk):
    """Delete document with dual-mode database support"""
    if is_sql_server_mode():
        # SQL Server mode - get document using raw SQL
        table_name = get_sql_server_table_name("Project_Documentation_Tracking_projectdocument")
        
        # Get document data
        document_data = execute_database_query(
            f"SELECT * FROM {table_name} WHERE document_id = ?", [pk], fetch_all=False
        )
        
        if not document_data:
            messages.error(request, 'Document not found!')
            return redirect('Project_Documentation_Tracking:document_list')
        
        document = create_mock_document(document_data)
        
        if request.method == 'POST':
            try:
                # Delete document from SQL Server
                delete_query = f"DELETE FROM {table_name} WHERE document_id = ?"
                execute_database_query(delete_query, [pk], fetch_all=False)
                messages.success(request, 'Document deleted successfully!')
                return redirect('Project_Documentation_Tracking:document_list')
                
            except Exception as e:
                messages.error(request, f'Error deleting document: {str(e)}')
        
    else:
        # SQLite mode - Django ORM
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


# Add timezone import
from django.utils import timezone