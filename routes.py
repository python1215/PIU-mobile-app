import os
from flask import render_template, request, redirect, url_for, flash, send_from_directory, jsonify
from werkzeug.utils import secure_filename
from datetime import datetime
from app import app, db
from models import Project, Activity, Indicator, Document
from forms import ProjectForm, ActivityForm, IndicatorForm, DocumentForm
from utils import generate_project_report, get_dashboard_data
import logging

@app.route('/')
def index():
    """Home page with quick stats"""
    total_projects = Project.query.count()
    active_projects = Project.query.filter_by(status='Active').count()
    completed_projects = Project.query.filter_by(status='Completed').count()
    
    recent_projects = Project.query.order_by(Project.created_at.desc()).limit(5).all()
    
    return render_template('index.html', 
                         total_projects=total_projects,
                         active_projects=active_projects,
                         completed_projects=completed_projects,
                         recent_projects=recent_projects)

@app.route('/dashboard')
def dashboard():
    """Dashboard with charts and analytics"""
    data = get_dashboard_data()
    return render_template('dashboard.html', data=data)

@app.route('/dashboard/data')
def dashboard_data():
    """API endpoint for dashboard data"""
    return jsonify(get_dashboard_data())

# Project routes
@app.route('/projects')
def projects_list():
    """List all projects"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '', type=str)
    status_filter = request.args.get('status', '', type=str)
    
    query = Project.query
    
    if search:
        query = query.filter(Project.name.contains(search))
    
    if status_filter:
        query = query.filter_by(status=status_filter)
    
    projects = query.order_by(Project.created_at.desc()).paginate(
        page=page, per_page=10, error_out=False
    )
    
    return render_template('projects/list.html', projects=projects, search=search, status_filter=status_filter)

@app.route('/projects/create', methods=['GET', 'POST'])
def create_project():
    """Create new project"""
    form = ProjectForm()
    if form.validate_on_submit():
        project = Project(
            name=form.name.data,
            description=form.description.data,
            start_date=form.start_date.data,
            end_date=form.end_date.data,
            budget=form.budget.data,
            status=form.status.data,
            location=form.location.data,
            project_manager=form.project_manager.data
        )
        db.session.add(project)
        db.session.commit()
        flash('Project created successfully!', 'success')
        return redirect(url_for('projects_list'))
    
    return render_template('projects/create.html', form=form)

@app.route('/projects/<int:id>')
def project_detail(id):
    """Project details page"""
    project = Project.query.get_or_404(id)
    activities = Activity.query.filter_by(project_id=id).all()
    indicators = Indicator.query.filter_by(project_id=id).all()
    documents = Document.query.filter_by(project_id=id).all()
    
    return render_template('projects/detail.html', 
                         project=project, 
                         activities=activities, 
                         indicators=indicators,
                         documents=documents)

@app.route('/projects/<int:id>/edit', methods=['GET', 'POST'])
def edit_project(id):
    """Edit project"""
    project = Project.query.get_or_404(id)
    form = ProjectForm(obj=project)
    
    if form.validate_on_submit():
        form.populate_obj(project)
        project.updated_at = datetime.utcnow()
        db.session.commit()
        flash('Project updated successfully!', 'success')
        return redirect(url_for('project_detail', id=id))
    
    return render_template('projects/edit.html', form=form, project=project)

@app.route('/projects/<int:id>/delete', methods=['POST'])
def delete_project(id):
    """Delete project"""
    project = Project.query.get_or_404(id)
    db.session.delete(project)
    db.session.commit()
    flash('Project deleted successfully!', 'success')
    return redirect(url_for('projects_list'))

# Activity routes
@app.route('/projects/<int:project_id>/activities')
def activities_list(project_id):
    """List activities for a project"""
    project = Project.query.get_or_404(project_id)
    activities = Activity.query.filter_by(project_id=project_id).order_by(Activity.start_date).all()
    return render_template('activities/list.html', project=project, activities=activities)

@app.route('/projects/<int:project_id>/activities/create', methods=['GET', 'POST'])
def create_activity(project_id):
    """Create new activity"""
    project = Project.query.get_or_404(project_id)
    form = ActivityForm()
    
    if form.validate_on_submit():
        activity = Activity(
            project_id=project_id,
            name=form.name.data,
            description=form.description.data,
            start_date=form.start_date.data,
            end_date=form.end_date.data,
            status=form.status.data,
            progress_percentage=form.progress_percentage.data,
            budget_allocated=form.budget_allocated.data,
            budget_spent=form.budget_spent.data,
            responsible_person=form.responsible_person.data
        )
        db.session.add(activity)
        db.session.commit()
        flash('Activity created successfully!', 'success')
        return redirect(url_for('activities_list', project_id=project_id))
    
    return render_template('activities/create.html', form=form, project=project)

@app.route('/activities/<int:id>')
def activity_detail(id):
    """Activity details"""
    activity = Activity.query.get_or_404(id)
    return render_template('activities/detail.html', activity=activity)

@app.route('/activities/<int:id>/edit', methods=['GET', 'POST'])
def edit_activity(id):
    """Edit activity"""
    activity = Activity.query.get_or_404(id)
    form = ActivityForm(obj=activity)
    
    if form.validate_on_submit():
        form.populate_obj(activity)
        activity.updated_at = datetime.utcnow()
        db.session.commit()
        flash('Activity updated successfully!', 'success')
        return redirect(url_for('activity_detail', id=id))
    
    return render_template('activities/create.html', form=form, activity=activity)

@app.route('/activities/<int:id>/delete', methods=['POST'])
def delete_activity(id):
    """Delete activity"""
    activity = Activity.query.get_or_404(id)
    project_id = activity.project_id
    db.session.delete(activity)
    db.session.commit()
    flash('Activity deleted successfully!', 'success')
    return redirect(url_for('activities_list', project_id=project_id))

# Indicator routes
@app.route('/projects/<int:project_id>/indicators')
def indicators_list(project_id):
    """List indicators for a project"""
    project = Project.query.get_or_404(project_id)
    indicators = Indicator.query.filter_by(project_id=project_id).order_by(Indicator.type, Indicator.name).all()
    return render_template('indicators/list.html', project=project, indicators=indicators)

@app.route('/projects/<int:project_id>/indicators/create', methods=['GET', 'POST'])
def create_indicator(project_id):
    """Create new indicator"""
    project = Project.query.get_or_404(project_id)
    form = IndicatorForm()
    
    if form.validate_on_submit():
        indicator = Indicator(
            project_id=project_id,
            name=form.name.data,
            type=form.type.data,
            description=form.description.data,
            unit_of_measure=form.unit_of_measure.data,
            target_value=form.target_value.data,
            current_value=form.current_value.data,
            baseline_value=form.baseline_value.data,
            data_source=form.data_source.data,
            frequency=form.frequency.data
        )
        db.session.add(indicator)
        db.session.commit()
        flash('Indicator created successfully!', 'success')
        return redirect(url_for('indicators_list', project_id=project_id))
    
    return render_template('indicators/create.html', form=form, project=project)

@app.route('/indicators/<int:id>/edit', methods=['GET', 'POST'])
def edit_indicator(id):
    """Edit indicator"""
    indicator = Indicator.query.get_or_404(id)
    form = IndicatorForm(obj=indicator)
    
    if form.validate_on_submit():
        form.populate_obj(indicator)
        indicator.updated_at = datetime.utcnow()
        db.session.commit()
        flash('Indicator updated successfully!', 'success')
        return redirect(url_for('indicators_list', project_id=indicator.project_id))
    
    return render_template('indicators/create.html', form=form, indicator=indicator)

@app.route('/indicators/<int:id>/delete', methods=['POST'])
def delete_indicator(id):
    """Delete indicator"""
    indicator = Indicator.query.get_or_404(id)
    project_id = indicator.project_id
    db.session.delete(indicator)
    db.session.commit()
    flash('Indicator deleted successfully!', 'success')
    return redirect(url_for('indicators_list', project_id=project_id))

# Document routes
@app.route('/projects/<int:project_id>/documents/upload', methods=['GET', 'POST'])
def upload_document(project_id):
    """Upload document"""
    project = Project.query.get_or_404(project_id)
    form = DocumentForm()
    
    if form.validate_on_submit():
        file = form.file.data
        filename = secure_filename(file.filename)
        
        # Create unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        document = Document(
            project_id=project_id,
            name=form.name.data,
            filename=filename,
            file_path=file_path,
            file_type=file.content_type,
            file_size=os.path.getsize(file_path),
            uploaded_by=form.uploaded_by.data
        )
        db.session.add(document)
        db.session.commit()
        flash('Document uploaded successfully!', 'success')
        return redirect(url_for('project_detail', id=project_id))
    
    return render_template('projects/detail.html', project=project, upload_form=form)

@app.route('/documents/<int:id>/download')
def download_document(id):
    """Download document"""
    document = Document.query.get_or_404(id)
    return send_from_directory(app.config['UPLOAD_FOLDER'], document.filename, as_attachment=True)

@app.route('/documents/<int:id>/delete', methods=['POST'])
def delete_document(id):
    """Delete document"""
    document = Document.query.get_or_404(id)
    project_id = document.project_id
    
    # Delete file from filesystem
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    db.session.delete(document)
    db.session.commit()
    flash('Document deleted successfully!', 'success')
    return redirect(url_for('project_detail', id=project_id))

# Reports
@app.route('/reports')
def reports():
    """Reports page"""
    projects = Project.query.all()
    return render_template('reports/index.html', projects=projects)

@app.route('/reports/project/<int:project_id>/pdf')
def generate_project_pdf(project_id):
    """Generate PDF report for project"""
    project = Project.query.get_or_404(project_id)
    try:
        pdf_path = generate_project_report(project)
        return send_from_directory(os.path.dirname(pdf_path), os.path.basename(pdf_path), as_attachment=True)
    except Exception as e:
        logging.error(f"Error generating PDF: {str(e)}")
        flash('Error generating PDF report. Please try again.', 'error')
        return redirect(url_for('reports'))

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('base.html', error="Page not found"), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('base.html', error="Internal server error"), 500
