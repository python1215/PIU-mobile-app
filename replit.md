# PIU Monitoring & Evaluation System

## Overview
This is a comprehensive Project Implementation Unit (PIU) Monitoring & Evaluation System built using Flask. The system provides a web-based platform for tracking project progress, monitoring activities, managing performance indicators, and generating reports. It's designed to support organizational excellence through effective project management and evaluation, including managing projects, activities, KPIs, issues, social/environmental impacts, and contracts.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Frontend Framework**: Bootstrap 5 with a dark theme and custom CSS overrides.
- **JavaScript**: Vanilla JavaScript with Chart.js for data visualization.
- **Template Engine**: Jinja2.
- **Design Principles**: Responsive design utilizing cards, tables, forms, charts, and interactive maps with dynamic color assignments, layer controls, and draggable legends.

### Technical Implementations
- **Backend Framework**: Flask (Python).
- **Database ORM**: SQLAlchemy with Flask-SQLAlchemy.
- **Form Handling**: Flask-WTF for validation.
- **File Handling**: Werkzeug for secure uploads.
- **Session Management**: Flask session.
- **Core Models**: Project, Activity, KPI_For_Contract, Issues_Actions, Social_and_env, Contract_Profiling, ProjectOutCome, ProjectResult, ProjectProgress.
- **Feature Specifications**:
    - **Dashboard**: Real-time analytics and summary cards.
    - **Project Management**: CRUD operations with status tracking.
    - **Activity Tracking**: Progress and budget monitoring.
    - **Performance Indicators**: KPI tracking with specialized calculation popups (e.g., ROA, NPM, DSCR, TMH) and dynamic target setting.
    - **Document Management**: Upload and organization of project documents.
    - **Reporting**: Generation of project reports (PDF/Excel) and specialized KPI performance reports with quarterly comparisons.
    - **Social & Environmental Monitoring**: Tracking for ESIA/ESMP, grievance, OHS, PAP, and community engagement, including geographic data.
    - **Contract Management**: Profiling and monitoring for works and goods/services.
    - **Financial Management**: Budget tracking, component, and subcomponent management.
    - **Animation Dashboard**: Media gallery and custom project reports (by Donors, Closing Date, Funding Amount).
    - **Setup Management**: CRUD operations for ProjectOutcome, ProjectResult, and Profile Year.
    - **Notification System**: Automated priority-based notification frequency system with navbar bell icon, dropdown, and periodic reminders via Django management command.

### System Design Choices
- **Module Structure**: Organized into specialized modules like Issues & Actions, NAWEC KPI Management, PIU Financial Management, Project Site Mapping, Project Documentation Tracking, Accounts Management, Social & Environmental Monitoring, Setup Management, Animation Dashboard, and Core Setup configurations.
- **Data Flow**: User interaction via web forms, data validation with Flask-WTF, persistence via SQLAlchemy, secure file storage, Chart.js for visualization, and system-generated reports.
- **Database Strategy**: SQLite database using Django ORM exclusively for simplicity and reliability.
- **Deployment**: Configurable via environment variables for database URI, session secret, and upload folder, with provisions for secure production deployment.
- **Data Consistency**: Automated validation and error handling for data integrity.
- **Filtering & Search**: Comprehensive filtering options across modules and text search.
- **Export Functionality**: Excel, PDF, and MS Word export capabilities for various reports and lists with A4 portrait formatting and text wrapping.
- **Notification System**: Priority-based automated reminders (Low: 2/day, Medium: 5/day, High: 10/day, Critical: 20/day) via Django management command scheduled with cron. Notifications shown in navbar bell icon with auto-refresh and unread count badge.

## External Dependencies

### Python Packages
- Flask
- SQLAlchemy
- Flask-WTF
- Werkzeug
- PyODBC (for SQL Server, though SQLite is primary)

### Frontend Libraries
- Bootstrap 5
- Font Awesome
- Chart.js
- Leaflet (for interactive maps)

### Infrastructure
- SQLite database (primary)
- Django ORM
- Local file system (for document storage)