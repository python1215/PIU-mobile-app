# PIU Monitoring & Evaluation System

## Overview
This is a comprehensive Project Implementation Unit (PIU) Monitoring & Evaluation System built using Flask. The system provides a web-based platform for tracking project progress, monitoring activities, managing performance indicators, and generating reports. It's designed to support organizational excellence through effective project management and evaluation. Key capabilities include managing projects, activities, KPIs, issues, social/environmental impacts, and contracts.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Updates
- **October 02, 2025**: Fixed Results Monitoring forms to display all 11 projects instead of filtering to only water-related projects. Removed hardcoded `project__icontains='water'` filter from both `Results_Oriented_MonitoringForm` (Add) and `updateResults_Oriented_MonitoringForm` (Update) in monitoring/forms.py. Previously saved projects now display correctly when editing existing records. Made system fully platform-independent using PIUN_BASE_DIR environment variable in settings.py to support running from any directory while maintaining Django ORM exclusively.
- **October 01, 2025**: Added complete Project Progress CRUD system with comprehensive tracking functionality. Implemented ProjectProgress model with fields for total funding, disbursement amounts/rates, physical progress, time elapsed tracking, and project timelines. Created full CRUD operations (Create, Read, Update, Delete) with forms, views, templates, and URL patterns. Added Project Progress navigation card to main dashboard with green theme and graph-up-arrow icon. System now tracks project implementation progress with disbursement rates, physical progress percentages, and time elapsed metrics.
- **September 01, 2025**: **Completely removed Project Development Objectives (PDO) from NAWEC M&E Management System**. Removed SetupPDO model from setup app, PDO model from PIU_Financial_mgt app, eliminated all PDO foreign key references from monitoring and NAWEC_KPI models, updated all forms and views to function without PDO dependencies, removed PDO navigation links from main dashboard, deleted PDO templates and URL patterns, and updated ProjectOutcome model to work independently without PDO relationships. System now operates as a streamlined M&E platform focused on project outcomes and results without the PDO hierarchy layer.
- **August 25, 2025**: Enhanced offline deployment user experience for contract lookup functionality. Replaced alarming "AJAX contract lookup failed" prompt with professional Bootstrap modal featuring clear messaging about offline mode, improved form validation, Enter key support, and better visual design. Users now see a user-friendly "Offline Mode - Manual Entry" interface instead of error messages.
- **August 25, 2025**: Completed project_actions module cleanup for HTMX consistency. Removed duplicate `load_type_of_investments` and `load_kpi_descriptions` functions that returned JSON responses. Both functions now consistently return HTMX partial templates maintaining dropdown functionality without JavaScript changes. Enhanced error handling with fallback logic and updated templates to match proper data structure. Reduced file size from 1840 to ~1200 lines, eliminating all LSP diagnostics errors.
- **August 24, 2025**: Cleaned up subcomponent template structure by consolidating duplicate folders. Removed unused `subcomponent` folder and moved all templates to unified `subcomponents` folder. Updated all view references to use consistent template paths. Removed unused template files including `add-subcomponent-new.html`. Fixed AttributeError in subcomponents view and optimized Create Monitoring Record for offline deployment compatibility.
- **August 23, 2025**: Added complete ProjectResult CRUD system integrated with Core Setup. Implemented full CRUD operations (Create, Read, Update, Delete) for ProjectResult model from PIU_Financial_mgt app, with comprehensive forms, views, templates, and navigation integration. Added ProjectResult setup card to Core Setup dashboard with orange/red theme and trophy icon. Enhanced project hierarchy display showing PDO → Outcome → Result relationships.
- **August 23, 2025**: Added complete ProjectOutcome CRUD system integrated with Core Setup. Implemented full CRUD operations (Create, Read, Update, Delete) for ProjectOutcome model from PIU_Financial_mgt app, with comprehensive forms, views, templates, and navigation integration. Added ProjectOutcome setup card to Core Setup dashboard with pink/magenta theme and target icon. Enhanced PDO system with comprehensive navigation links and "Back to Core Setup" functionality across all templates.
- **August 23, 2025**: Added comprehensive Excel and PDF export functionality with A4 portrait formatting. Fixed JavaScript freezing issue in offline deployments by optimizing timeout/promise handling. Implemented professional PDF reports using ReportLab with proper A4 dimensions, color-coded headers, and optimized column widths. All export functions support current page filters and provide timestamped file downloads.
- **August 20, 2025**: Fixed critical cascading dropdown validation errors in PAP forms. Replaced entire social_and_env module with updated files featuring HTMX-powered cascading dropdowns, enhanced form validation with auto-selection of valid options, and implemented form reset functionality that clears all fields on page refresh/reload. Added comprehensive offline fallback with 25+ investment types for project D309D6530GM.
- **August 19, 2025**: Fixed Investment Type cascading dropdown for PAP forms with project 'D309D6530GM'. Removed duplicate `load_investment_types_pap` functions, enhanced AJAX endpoint with offline fallback mechanisms, and added comprehensive JavaScript fallback with 20+ investment type options for offline scenarios.
- **August 15, 2025**: Converted to SQLite-only database configuration. Removed all MS SQL Server dependencies and configurations per user request.

## System Architecture

### UI/UX Decisions
- **Frontend Framework**: Bootstrap 5 with a dark theme and custom CSS overrides.
- **JavaScript**: Vanilla JavaScript with Chart.js for data visualization.
- **Template Engine**: Jinja2.
- **Design Principles**: Responsive design utilizing cards, tables, forms, and charts. Interactive maps with dynamic color assignments, layer controls, and draggable legends are integrated for project site visualization.

### Technical Implementations
- **Backend Framework**: Flask (Python).
- **Database ORM**: SQLAlchemy with Flask-SQLAlchemy.
- **Form Handling**: Flask-WTF for validation.
- **File Handling**: Werkzeug for secure uploads.
- **Session Management**: Flask session.
- **Core Models**: Project, Activity, KPI_For_Contract, Issues_Actions, Social_and_env, Contract_Profiling, SetupPDO, ProjectOutCome, ProjectResult, ProjectProgress.
- **Feature Specifications**:
    - **Dashboard**: Real-time analytics and summary cards.
    - **Project Management**: CRUD operations with status tracking.
    - **Activity Tracking**: Progress and budget monitoring.
    - **Performance Indicators**: KPI tracking with specialized calculation popups (e.g., ROA, NPM, DSCR, TMH) and dynamic target setting.
    - **Document Management**: Upload and organization of project documents.
    - **Reporting**: Generation of project reports (PDF/Excel) and specialized KPI performance reports with quarterly comparisons.
    - **Social & Environmental Monitoring**: Tracking for ESIA/ESMP, grievance, OHS, PAP, and community engagement. Includes geographic data (regions, districts, LGAs, settlements).
    - **Contract Management**: Profiling and monitoring for works and goods/services.
    - **Financial Management**: Budget tracking, component, and subcomponent management.

### System Design Choices
- **Module Structure**: Organized into specialized modules like Issues & Actions, NAWEC KPI Management, PIU Financial Management, Project Site Mapping, Project Documentation Tracking, Accounts Management, Social & Environmental Monitoring, Setup Management (ProjectOutcome and ProjectResult CRUD operations), and Core Setup configurations.
- **Data Flow**: User interaction via web forms, data validation with Flask-WTF, persistence via SQLAlchemy, secure file storage, Chart.js for visualization, and system-generated reports.
- **Database Strategy**: SQLite database using Django ORM exclusively for simplicity and reliability.
- **Deployment**: Configurable via environment variables for database URI, session secret, and upload folder. Includes provisions for secure production deployment with proxy fix and file size limits.
- **Data Consistency**: Automated validation and error handling for data integrity (e.g., project funding vs. component allocation).
- **Filtering & Search**: Comprehensive filtering options across modules (project, region, district, year, quarter, etc.) and text search.
- **Export Functionality**: Excel and PDF export capabilities for various reports and lists.

## External Dependencies

### Python Packages
- Flask
- SQLAlchemy
- Flask-WTF
- Werkzeug
- PyODBC (for SQL Server)

### Frontend Libraries
- Bootstrap 5
- Font Awesome
- Chart.js
- Leaflet (for interactive maps)

### Infrastructure
- SQLite database (primary)
- Django ORM
- Local file system (for document storage)
```