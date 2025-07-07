from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView
from django.contrib.auth.decorators import login_required
from .forms import Project_DocumentationTrackingForm
from .models import Project_Documentation_Tracking,Project
from .models import document_upload_path
from django.contrib import messages
from setup.models import DocumentType
from django.core.paginator import Paginator
from django.views.decorators.http import require_http_methods
from django.db.models import Count

@login_required
def document_dashboard(request):
    """Professional Document Management Dashboard"""
    total_documents = Project_Documentation_Tracking.objects.count()
    recent_documents = Project_Documentation_Tracking.objects.order_by('-date')[:5]
    
    doc_type_stats = Project_Documentation_Tracking.objects.values(
        'document_type__document_type'
    ).annotate(count=Count('id')).order_by('-count')
    
    project_stats = Project_Documentation_Tracking.objects.values(
        'project__project'
    ).annotate(count=Count('id')).order_by('-count')[:10]
    
    context = {
        'total_documents': total_documents,
        'recent_documents': recent_documents,
        'doc_type_stats': doc_type_stats,
        'project_stats': project_stats,
    }
    
    return render(request, 'documentation_tracking/document_dashboard.html', context)

@login_required
def add_document(request):
    if request.method == 'POST':
        form = Project_DocumentationTrackingForm(request.POST, request.FILES)
        
        # Check if the form is valid
        if form.is_valid():
            document = form.save(commit=False)
            document.loginUser = request.user
            
            # Log the loginUser to see if it's being set correctly
            #print('loginuser:', document.loginUser)
            document.save()

            # Pass a success message and render the success page
            context = {'message': "Data saved successfully!"}
            return render(request, 'documentation_tracking/document_success.html', context)
        else:
            # If form is invalid, print the form errors
            print('Form errors:', form.errors)
    
    # If not POST, or form is invalid, render the form
    context = {'form': Project_DocumentationTrackingForm()}
    return render(request, 'documentation_tracking/add_document.html', context)

@login_required
def upload_document(request):
    if request.method == 'POST':
        form = Project_DocumentationTrackingForm(request.POST, request.FILES)
        if form.is_valid():
            #document_type = form.cleaned_data['document_type']  # Retrieve document type from form data
            form.instance.loginUser = request.user
            #form.instance.attachment.name = document_upload_path(form.instance, form.cleaned_data['attachment'], document_type)
            #form.save(commit=False)
            #form.attachment = document_upload_path(form.instance, form.cleaned_data['attachment'], document_type)
            form.save()
            messages.success(request, 'Document uploaded successfully!')
            return redirect('upload_document')
    else:
        form = Project_DocumentationTrackingForm()
    return render(request, 'documentation_tracking/upload_document.html', {'form': form})


#In use 
@login_required
def list_document(request):
    
    project_id = request.GET.get('project')
    document_type = request.GET.get('document_type')

    documents = Project_Documentation_Tracking.objects.all().order_by('-id')
    document_types = DocumentType.objects.all()  # Fetch document types
    projects = Project.objects.all()  # Fetch projects

    if project_id:
        documents = documents.filter(project_id=project_id)
    
    if document_type:
        documents = documents.filter(document_type=document_type)

    # Add project acronym and icon URL to each document
    for document in documents:
        if document.project and hasattr(document.project, 'project'):
            document.project_acronym = ''.join([word[0] for word in document.project.project.split()]).upper()
        else:
            document.project_acronym = 'N/A'

        if document.attachment.name.endswith('.pdf'):
            document.icon_url = 'icons/pdf-icon.png'
        elif document.attachment.name.endswith('.doc') or document.attachment.name.endswith('.docx'):
            document.icon_url = 'icons/word-icon.png'
        elif document.attachment.name.endswith('.xls') or document.attachment.name.endswith('.xlsx'):
            document.icon_url = 'icons/excel-icon.png'
        else:
            document.icon_url = 'icons/file-icon.png'

    paginator = Paginator(documents, 12)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)
    

    return render(request, 'documentation_tracking/document-list.html', {
        'document_types': document_types,
        'projects': projects,
        'selected_project_id': project_id,
        'selected_document_type': document_type,
        'page_obj':page_obj
    })


#to be worked on
@login_required
def list_documents(request):
    project_id = request.GET.get('project')
    document_type = request.GET.get('document_type')

    documents = Project_Documentation_Tracking.objects.all().order_by('-id')
    document_types = DocumentType.objects.all()  # Fetch document types
    projects = Project.objects.all()  # Fetch projects

    if project_id:
        documents = documents.filter(project_id=project_id)
    
    if document_type:
        documents = documents.filter(document_type=document_type)

    # Add project acronym and icon URL to each document
    for document in documents:
        if document.project and hasattr(document.project, 'project'):
            document.project_acronym = ''.join([word[0] for word in document.project.project.split()]).upper()
        else:
            document.project_acronym = 'N/A'

        if document.attachment.name.endswith('.pdf'):
            document.icon_url = 'icons/pdf-icon.png'
        elif document.attachment.name.endswith('.doc') or document.attachment.name.endswith('.docx'):
            document.icon_url = 'icons/word-icon.png'
        elif document.attachment.name.endswith('.xls') or document.attachment.name.endswith('.xlsx'):
            document.icon_url = 'icons/excel-icon.png'
        else:
            document.icon_url = 'icons/file-icon.png'

    return render(request, 'documentation_tracking/list_documents.html', {
        'documents': documents, 
        'document_types': document_types,
        'projects': projects,
        'selected_project_id': project_id,
        'selected_document_type': document_type
    })

#Preview the document before dowloading
@login_required
def preview_document(request, document_id):
    document = get_object_or_404(Project_Documentation_Tracking, id=document_id)
    return render(request, 'documentation_tracking/preview_document.html', {'document': document})


@login_required
def update_document(request, pk):
    document = get_object_or_404(Project_Documentation_Tracking, pk=pk)
    if request.method == "POST":
        form = Project_DocumentationTrackingForm(request.POST,request.FILES, instance=document)
        if form.is_valid():
            form.save()
            return render(request, 'documentation_tracking/document_success.html', {'message': 'Document updated successfully'})
    else:
        form = Project_DocumentationTrackingForm(instance=document)
    return render(request, 'documentation_tracking/update-document.html', {'form': form, 'document': document})


#Delete request
@login_required
@require_http_methods(["DELETE"])
def delete_document(request, pk):
    document = get_object_or_404(Project_Documentation_Tracking, pk=pk)
    document.delete()
    
    # Return success message for HTMX request
    context = {
        'message': "Data Deleted successfully!" 
    }
    return render(request, 'documentation_tracking/document_success.html', context)