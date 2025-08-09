# PIU Monitoring & Evaluation System

## Overview
This is a comprehensive Project Implementation Unit (PIU) Monitoring & Evaluation System built using Flask. The system provides a web-based platform for tracking project progress, monitoring activities, managing performance indicators, and generating reports. It's designed to support organizational excellence through effective project management and evaluation. Key capabilities include managing projects, activities, KPIs, issues, social/environmental impacts, and contracts.

## User Preferences
Preferred communication style: Simple, everyday language.

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
- **Core Models**: Project, Activity, KPI_For_Contract, Issues_Actions, Social_and_env, Contract_Profiling.
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
- **Module Structure**: Organized into specialized modules like Issues & Actions, NAWEC KPI Management, PIU Financial Management, Project Site Mapping, Project Documentation Tracking, Accounts Management, and Social & Environmental Monitoring.
- **Data Flow**: User interaction via web forms, data validation with Flask-WTF, persistence via SQLAlchemy, secure file storage, Chart.js for visualization, and system-generated reports.
- **Database Strategy**: Dual-mode support for SQLite (development) and SQL Server (production) with environment-based selection and raw SQL query capabilities for performance and compatibility.
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
- SQLite database
- SQL Server database
- Local file system (for document storage)
```