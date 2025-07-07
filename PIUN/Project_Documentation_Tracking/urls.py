from django.contrib import admin
from django.urls import path
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('', views.document_dashboard, name='document-dashboard'),
    path('document_upload', views.upload_document, name='add-document_'),
    path('add-document', views.add_document, name='add-document'),
    path('document-list', views.list_document, name='document-list'),
    path('documents', views.list_documents, name='list_documents'),
    path('update-document/<str:pk>/', views.update_document, name='update-document'),
    path('delete-document/<str:pk>/', views.delete_document, name='delete-document'),
    path('preview/<int:document_id>/', views.preview_document, name='preview_document'),          
]