from django.urls import path
from PIU_Financial_mgt import views

app_name = 'PIU_Financial_mgt'

urlpatterns =[
    #dashboard
    path("", views.simple_financial_dashboard, name='dashboard'),
    path("dashboard/", views.simple_financial_dashboard, name='simple-dashboard'),
    
    #project
    path("projects/", views.projects, name='projects'),
    path("project-list/", views.project_list, name='project_list'),
    path("project/<str:project_id>/", views.project_detail, name='project_detail'),
    path("project/<str:project_id>/edit/", views.edit_project, name='edit_project'),
    path("project/<str:project_id>/delete/", views.delete_project, name='delete_project'),
    path("add-project/", views.add_project, name='add-project'),
    path("export-projects-excel/", views.export_projects_excel, name='export_projects_excel'),
    path("export-projects-pdf/", views.export_projects_pdf, name='export_projects_pdf'),

     #component
    path("components/", views.components, name='components'),
    path("add-component/", views.addcomponent, name='add_component'),
    path("component/<int:component_id>/", views.component_detail, name='component_detail'),
    path("component/<int:component_id>/edit/", views.edit_component, name='edit_component'),
    path("component/<int:component_id>/delete/", views.delete_component, name='delete_component'),
    path("export-components-excel/", views.export_components_excel, name='export_components_excel'),
    path("export-components-pdf/", views.export_components_pdf, name='export_components_pdf'),

    #subcomponent
    path("subcomponents/", views.subcomponents, name='subcomponents'),
    path("subcomponent-list/", views.subcomponents, name='subcomponent_list'),
    path("subcomponent/<int:subcomponent_id>/", views.subcomponent_detail, name='subcomponent_detail'),
    path("subcomponent/<int:subcomponent_id>/edit/", views.edit_subcomponent, name='edit_subcomponent'),
    path("subcomponent/<int:subcomponent_id>/delete/", views.delete_subcomponent, name='delete_subcomponent'),
    path("add-subcomponent/", views.add_subcomponent, name='add_subcomponent'),
    path("add-subcomponent-isolated/", views.add_subcomponent_isolated, name='add-subcomponent-isolated'),
    path("load_project_components/", views.load_project_components, name='load_project_components'),
    path("load_project_subcomponents/", views.load_project_subcomponents, name='load_project_subcomponents'),

    #activity
    path("activities/", views.activities, name='activities'),
    path("add-activity/", views.addactivity, name='add_activity'),
    path("activity/<int:activity_id>/", views.activity_detail, name='activity_detail'),
    path("activity/<int:activity_id>/edit/", views.edit_activity, name='edit_activity'),
    path("activity/<int:activity_id>/delete/", views.delete_activity, name='delete_activity'),

    #budget summary
    path("budget-summary/", views.budget_summary, name='budget-summary'),
    
    # Financial Validation API endpoints
    path("api/validate-project-funding/", views.validate_project_funding, name='validate-project-funding'),
    path("api/validate-component-allocation/", views.validate_component_allocation, name='validate-component-allocation'),
    path("api/validate-subcomponent-allocation/", views.validate_subcomponent_allocation, name='validate-subcomponent-allocation'),
    path("api/validate-activity-allocation/", views.validate_activity_allocation, name='validate-activity-allocation'),
    
    #legacy routes
    path("enhanced_project_dashboard/", views.enhanced_project_dashboard, name='enhanced_project_dashboard'),
    path("enhanced_project_dashboard/<str:project_id>/", views.enhanced_project_dashboard, name='enhanced_project_dashboard_with_id'),
    path("simple-financial-dashboard/", views.simple_financial_dashboard, name='simple-financial-dashboard'),
]