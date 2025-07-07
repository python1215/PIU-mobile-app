import os
from datetime import datetime
from flask import current_app
from models import Project, Activity, Indicator, Document


def get_dashboard_data():
    """Get data for dashboard charts and metrics"""
    try:
        # Get project statistics
        total_projects = Project.query.count()
        total_activities = Activity.query.count()
        total_indicators = Indicator.query.count()
        
        # Project status distribution
        project_status = {}
        projects = Project.query.all()
        for project in projects:
            status = project.status
            project_status[status] = project_status.get(status, 0) + 1
        
        # Activity status distribution
        activity_status = {}
        activities = Activity.query.all()
        for activity in activities:
            status = activity.status
            activity_status[status] = activity_status.get(status, 0) + 1
        
        # Budget data for chart
        budget_data = []
        for project in projects:
            if project.budget:
                total_spent = sum(activity.budget_spent or 0 for activity in project.activities)
                budget_data.append({
                    'name': project.name[:20] + '...' if len(project.name) > 20 else project.name,
                    'budget': project.budget,
                    'spent': total_spent,
                    'utilization': (total_spent / project.budget * 100) if project.budget > 0 else 0
                })
        
        # Indicator achievement data
        indicator_achievement = []
        indicators = Indicator.query.all()
        for indicator in indicators:
            achievement = indicator.achievement_percentage
            indicator_achievement.append({
                'name': indicator.name[:30] + '...' if len(indicator.name) > 30 else indicator.name,
                'achievement': achievement,
                'type': indicator.type
            })
        
        # Sort by achievement descending
        indicator_achievement.sort(key=lambda x: x['achievement'], reverse=True)
        
        return {
            'total_projects': total_projects,
            'total_activities': total_activities,
            'total_indicators': total_indicators,
            'project_status': project_status,
            'activity_status': activity_status,
            'budget_data': budget_data,
            'indicator_achievement': indicator_achievement[:10]  # Top 10
        }
    
    except Exception as e:
        current_app.logger.error(f"Error getting dashboard data: {str(e)}")
        return {
            'total_projects': 0,
            'total_activities': 0,
            'total_indicators': 0,
            'project_status': {},
            'activity_status': {},
            'budget_data': [],
            'indicator_achievement': []
        }


def generate_project_report(project):
    """Generate a simple text report for a project"""
    try:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"project_report_{project.id}_{timestamp}.txt"
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        
        # Generate report content
        report_content = f"""
PIU MONITORING & EVALUATION SYSTEM
PROJECT REPORT

Project: {project.name}
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

========================================
PROJECT OVERVIEW
========================================
Name: {project.name}
Description: {project.description or 'No description provided'}
Status: {project.status}
Start Date: {project.start_date}
End Date: {project.end_date}
Location: {project.location or 'Not specified'}
Project Manager: {project.project_manager or 'Not assigned'}
Budget: ${project.budget:,.2f if project.budget else 0}
Progress: {project.progress_percentage:.1f}%
Budget Utilization: {project.budget_utilization:.1f}%

========================================
ACTIVITIES ({len(project.activities)})
========================================
"""
        
        for i, activity in enumerate(project.activities, 1):
            report_content += f"""
{i}. {activity.name}
   Status: {activity.status}
   Progress: {activity.progress_percentage:.1f}%
   Duration: {activity.start_date} to {activity.end_date}
   Budget Allocated: ${activity.budget_allocated:,.2f if activity.budget_allocated else 0}
   Budget Spent: ${activity.budget_spent:,.2f if activity.budget_spent else 0}
   Responsible: {activity.responsible_person or 'Not assigned'}
"""
        
        report_content += f"""
========================================
PERFORMANCE INDICATORS ({len(project.indicators)})
========================================
"""
        
        for i, indicator in enumerate(project.indicators, 1):
            report_content += f"""
{i}. {indicator.name}
   Type: {indicator.type}
   Unit: {indicator.unit_of_measure or 'N/A'}
   Target: {indicator.target_value or 'Not set'}
   Current: {indicator.current_value or 0}
   Baseline: {indicator.baseline_value or 0}
   Achievement: {indicator.achievement_percentage:.1f}%
   Data Source: {indicator.data_source or 'Not specified'}
   Frequency: {indicator.frequency or 'Not specified'}
"""
        
        report_content += f"""
========================================
DOCUMENTS ({len(project.documents)})
========================================
"""
        
        for i, document in enumerate(project.documents, 1):
            file_size_mb = document.file_size / (1024 * 1024) if document.file_size else 0
            report_content += f"""
{i}. {document.name}
   File: {document.filename}
   Size: {file_size_mb:.2f} MB
   Type: {document.file_type or 'Unknown'}
   Uploaded by: {document.uploaded_by or 'Unknown'}
   Date: {document.uploaded_at.strftime('%Y-%m-%d')}
"""
        
        report_content += f"""
========================================
REPORT END
========================================
Generated by PIU Monitoring & Evaluation System
Report ID: {timestamp}
"""
        
        # Write report to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(report_content)
        
        return file_path
    
    except Exception as e:
        current_app.logger.error(f"Error generating project report: {str(e)}")
        raise Exception(f"Failed to generate report: {str(e)}")


def get_allowed_extensions():
    """Get list of allowed file extensions for uploads"""
    return {
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 
        'txt', 'csv', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar'
    }


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in get_allowed_extensions()


def format_file_size(size_bytes):
    """Format file size in human readable format"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    import math
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    return f"{s} {size_names[i]}"


def calculate_project_health(project):
    """Calculate project health score based on progress, budget, and timeline"""
    try:
        health_score = 0
        factors = 0
        
        # Progress factor (40% weight)
        if project.progress_percentage >= 80:
            health_score += 40
        elif project.progress_percentage >= 60:
            health_score += 30
        elif project.progress_percentage >= 40:
            health_score += 20
        else:
            health_score += 10
        factors += 1
        
        # Budget utilization factor (30% weight)
        budget_util = project.budget_utilization
        if budget_util <= 80:
            health_score += 30
        elif budget_util <= 100:
            health_score += 25
        elif budget_util <= 120:
            health_score += 15
        else:
            health_score += 5
        factors += 1
        
        # Timeline factor (30% weight)
        from datetime import date
        today = date.today()
        total_days = (project.end_date - project.start_date).days
        elapsed_days = (today - project.start_date).days
        
        if total_days > 0:
            time_progress = (elapsed_days / total_days) * 100
            progress_vs_time = project.progress_percentage - time_progress
            
            if progress_vs_time >= 0:
                health_score += 30
            elif progress_vs_time >= -10:
                health_score += 20
            elif progress_vs_time >= -20:
                health_score += 10
            else:
                health_score += 5
        else:
            health_score += 15
        factors += 1
        
        # Normalize score
        final_score = health_score / factors if factors > 0 else 0
        
        # Determine health status
        if final_score >= 80:
            return {'score': final_score, 'status': 'Excellent', 'color': 'success'}
        elif final_score >= 60:
            return {'score': final_score, 'status': 'Good', 'color': 'primary'}
        elif final_score >= 40:
            return {'score': final_score, 'status': 'Fair', 'color': 'warning'}
        else:
            return {'score': final_score, 'status': 'Poor', 'color': 'danger'}
    
    except Exception as e:
        current_app.logger.error(f"Error calculating project health: {str(e)}")
        return {'score': 0, 'status': 'Unknown', 'color': 'secondary'}