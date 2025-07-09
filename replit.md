# PIU Monitoring & Evaluation System

## Overview

This is a comprehensive Project Implementation Unit (PIU) Monitoring & Evaluation System built using Flask. The system provides a web-based platform for tracking project progress, monitoring activities, managing performance indicators, and generating reports. It's designed to support organizational excellence through effective project management and evaluation.

## System Architecture

### Frontend Architecture
- **Framework**: Bootstrap 5 with dark theme
- **CSS Framework**: Custom CSS with Bootstrap overrides
- **JavaScript**: Vanilla JavaScript with Chart.js for data visualization
- **Template Engine**: Jinja2 templates with Flask
- **UI Components**: Responsive design with cards, tables, forms, and charts

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Database ORM**: SQLAlchemy with Flask-SQLAlchemy
- **Forms**: Flask-WTF for form handling and validation
- **File Handling**: Werkzeug for secure file uploads
- **Session Management**: Flask session with configurable secret key

### Data Storage
- **Primary Database**: SQLite (development and production)
- **File Storage**: Local file system for document uploads
- **Database Management**: Django ORM with SQLite for simplicity and portability

## Key Components

### Core Models
1. **Project**: Main entity representing PIU projects
2. **Activity**: Project activities with progress tracking
3. **Indicator**: Performance indicators (Input, Output, Outcome, Impact)
4. **Document**: File attachments and documentation

### Main Features
- **Dashboard**: Real-time analytics with charts and summary cards
- **Project Management**: CRUD operations for projects with status tracking
- **Activity Tracking**: Monitor project activities with progress and budget
- **Performance Indicators**: Track KPIs across different categories
- **Document Management**: Upload and organize project documents
- **Reporting**: Generate project reports and analytics

### Module Structure
The PIUN directory contains specialized modules:
- Issues & Actions Monitoring
- NAWEC KPI Management
- PIU Financial Management
- Project Site Mapping
- Project Documentation Tracking
- Accounts Management
- Social & Environmental Monitoring

## Data Flow

1. **User Access**: Users interact through web interface
2. **Form Submission**: Data validated through Flask-WTF forms
3. **Database Operations**: SQLAlchemy ORM handles data persistence
4. **File Management**: Secure file uploads to designated folder
5. **Data Visualization**: Chart.js renders dashboard analytics
6. **Report Generation**: System generates PDF/Excel reports

## External Dependencies

### Python Packages
- Flask: Web framework
- SQLAlchemy: Database ORM
- Flask-WTF: Form handling
- Werkzeug: WSGI utilities
- Chart.js: Client-side charting

### Frontend Libraries
- Bootstrap 5: UI framework
- Font Awesome: Icons
- Chart.js: Data visualization
- Custom CSS: Theme customization

### Infrastructure
- SQLite: Database storage
- File system: Document storage
- Session management: User state

## Deployment Strategy

### Development Environment
- Debug mode enabled
- SQLite database for development
- Local file uploads
- Hot reload for development

### Production Considerations
- Environment variables for configuration
- SQLite database for simplicity
- Secure session keys
- Proxy fix for reverse proxy deployment
- File upload size limits (16MB)
- Django ORM optimization for performance

### Configuration
- Database URI: Configurable via DATABASE_URL environment variable
- Session Secret: Configurable via SESSION_SECRET environment variable
- Upload folder: Configurable upload directory
- Debug mode: Controlled via Flask debug setting

## Changelog

- July 07, 2025. Initial setup
- July 07, 2025. Converted from PostgreSQL to SQLite database for better portability and simplified deployment
- July 08, 2025. Successfully inserted 171 KPI monitoring records into KPI_For_Contract table
- July 08, 2025. Added comprehensive project data with 10 major projects including funding amounts, timelines, and currency information
- July 08, 2025. Updated monitoring types with proper descriptions: Environmental and Social, procurement, Technical, and Financial
- July 08, 2025. Inserted 15 project components with detailed allocations across 4 major projects totaling component value tracking
- July 08, 2025. Updated currency table with 4 standard currencies: EURO, GMD, UA (Unit of Account), and USD
- July 08, 2025. Inserted 39 subcomponents across 4 projects with detailed budget breakdown and multi-currency allocations
- July 08, 2025. Added 79 project activities with detailed implementation tracking across multiple years (2023-2025)
- July 08, 2025. Updated donor table with 7 major funding institutions including development banks, European institutions, and government entities
- July 08, 2025. Fixed Financial Management Dashboard Actions button functionality - converted from disabled to fully functional
- July 08, 2025. Fixed NAWEC PIU Financial Dashboard Project Activities display by adding missing recent_activities context data
- July 08, 2025. Updated contributor table with Government of The Gambia and NAWEC as key institutional contributors
- July 08, 2025. Configured project-donor relationships mapping 7 major projects to their respective funding institutions
- July 08, 2025. Configured project-contributor relationships linking Government of The Gambia and NAWEC to specific projects
- July 08, 2025. Added access type classifications for NAWEC utility services including electricity, water, and combined access options
- July 08, 2025. Added data collection frequency classifications for monitoring schedules: Weekly, Monthly, Quarterly, and Annually
- July 08, 2025. Added decision outcome classifications for tracking stakeholder agreements: No Agreement and Agreed
- July 08, 2025. Added indicator type classifications for M&E framework: Output, Outcome, Impact, Process, and Project Development Objective
- July 08, 2025. Added measurement unit classifications for KPI tracking: electrical units (KVA, KWh, GWh, MwP), physical units (KM, Tons), and qualitative measures
- July 08, 2025. Added PAP (Project Affected People) category classifications for social safeguards: land take, livelihood loss, economic trees, and restrictive land use
- July 08, 2025. Added physical progress scale classifications for project implementation tracking: Ongoing, Complete, Stagnant, Delayed, and Cancelled
- July 08, 2025. Inserted 28 contract profiling goods & services records with comprehensive contract tracking including suppliers, consultants, values, and timelines
- July 08, 2025. Inserted 10 contract profiling works records with infrastructure project tracking including beneficiary settlements, locations, and construction details
- July 08, 2025. Inserted 177 specific contract monitoring records with detailed milestone tracking, targets, achievements, and progress monitoring
- July 08, 2025. Added vulnerability category classifications for social safeguards: Under Aged, Elderly, Differently Able, Women-headed Household
- July 08, 2025. Updated physical progress scale classifications with new IDs: Ongoing (17), Complete (18), Stagnant (19), Delayed (20), Cancelled (21)
- July 08, 2025. Implemented cascading dropdowns in contract monitoring form: Project → Type of Monitoring → Type of Investment → KPI Description with AJAX-based real-time filtering
- July 08, 2025. Prepared system for SQL Server database migration with dual-mode support: auto-detects database engine and uses raw SQL queries for SQL Server ([piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract]) while maintaining SQLite compatibility
- July 08, 2025. Added SQL Server diagnostic endpoints (/test-sql-connection/, /sql-diagnostics/) and comprehensive migration documentation in SQL_SERVER_README.md
- July 08, 2025. Enhanced cascading dropdown AJAX endpoints with SQL Server-specific raw queries for better performance and compatibility with [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract] table structure
- July 08, 2025. Fixed JSON serialization errors in SQL Server diagnostic endpoints by converting PosixPath objects to strings for proper response handling
- July 08, 2025. Resolved file encoding issues that caused "null bytes" syntax errors during SQL Server deployment
- July 08, 2025. Verified diagnostic endpoints working correctly with 171 KPI records available across projects D309D6530GM and ECOREAPP164044
- July 08, 2025. Completed SQL Server migration preparation with full dual-mode support, diagnostic tools, and comprehensive documentation
- July 08, 2025. Fixed AJAX cascading dropdown endpoints for SQL Server compatibility: updated parameter binding (? instead of %s), corrected field mappings, and ensured proper data return format for both SQLite and SQL Server modes
- July 08, 2025. Created comprehensive SQL Server debugging endpoint (/project_actions/debug-cascading/) with table structure analysis and query testing capabilities
- July 08, 2025. Fixed SQL Server KPI descriptions query to use monitoring_Type_Code instead of non-existent id column, matching actual table structure: [type_of_investment, Kpi_description, monitoring_Type_Code, date, loginUser_id, monitoring_type_id, project_id]
- July 08, 2025. Enhanced debug endpoint to test both investment loading and KPI description queries with actual SQL Server column names
- July 08, 2025. Fixed critical project ID mismatch issue: URL-encoded "GEAP%201" now properly decodes to "GEAP 1" and automatically maps to database value "GEAP1"
- July 08, 2025. Added intelligent project ID handling to cascading dropdown endpoints with automatic space normalization for SQLite/SQL Server compatibility
- July 08, 2025. Resolved "not all arguments converted during string formatting" error by fixing print statements and parameter handling
- July 08, 2025. Verified cascading dropdown functionality: 21 investment types successfully loaded for GEAP1 project with Tec monitoring type
- July 08, 2025. Implemented comprehensive SQL Server cascading dropdown fix: progressive table name fallback (schema-prefixed → simple), dual parameter binding (? and %s), and robust project ID cleaning for malformed URLs like "D309&%20D6530%20-GM" → "D309D6530GM"
- July 08, 2025. Added multi-environment SQL Server support: automatically tries test environment table [piuprod].[dbo].[PIU_Financial_mgt_kpi_for_contract] and production environment table [piuprod3].[dbo].[PIU_Financial_mgt_kpi_for_contract] with fallback to simple table name
- July 08, 2025. Fixed Project Activities display issue in SQL Server: updated both enhanced_project_dashboard and simple_financial_dashboard views to use raw SQL queries compatible with SQL Server, supporting [piuprod].[dbo].[PIU_Financial_mgt_activities] and [piuprod3].[dbo].[PIU_Financial_mgt_activities] tables with proper template compatibility
- July 08, 2025. Fixed critical project ID parameter parsing issue in AJAX endpoints: project IDs containing special characters like '&' (e.g., 'D309& D6530 -GM') were being truncated due to URL parameter parsing - implemented enhanced query string extraction to preserve exact project_id format without modification
- July 08, 2025. Fixed contract monitoring record saving issue: enhanced form validation with cascading dropdown field validation for both SQLite and SQL Server, added comprehensive error handling for database constraints, foreign key violations, and improved user feedback for missing required fields
- July 08, 2025. Successfully inserted 5 Environmental and Social Impact Assessment (ESIA) records into social_and_env_esia table: processed 200 communities across 5 projects (GERMP Solar, GERMP BB1, GESREP ESIA, Soma Feeder.Add, ECO-TBT) with comprehensive ESIA findings text, covering WCR, KM, LRR, NBR, and CRR regions with proper data parsing and SQL insertion
- July 08, 2025. Successfully inserted 246 grievance monitoring log records into social_and_env_grieviancemonitoringlog table: processed complaint tracking data covering GERMP Solar (39 cases) and GERMP T&D (207 cases) projects with comprehensive case management including complainant details, resolution status, and follow-up actions across gender breakdown (204 male, 42 female) and case status (84 open, 134 closed)
- July 08, 2025. Added regional administrative structure with 6 regions into setup_regions table: Greater Banjul Area (GBA), West Coast Region (WCR), Lower River Region (LRR), North Bank Region (NBR), Central River Region (CRR), and Upper River Region (URR) with proper region codes (100-600) for geographic data organization
- July 08, 2025. Inserted 8 Local Government Areas (LGAs) into setup_lga table: Banjul (1001), Kanifing (1002), Brikama (2001), Mansakonko (3001), Kerewan (4001), Kuntaur (5001), Janjanbureh (5002), and Basse (6001) with proper hierarchical coding linked to regional structure for comprehensive administrative geographic organization
- July 08, 2025. Inserted 53 districts into setup_districts table: complete district-level administrative structure across all 8 LGAs and 6 regions, including Banjul (3 districts), Kanifing (7 districts), Brikama (12 districts), Mansakonko (6 districts), Kerewan (7 districts), Kuntaur (5 districts), Janjanbureh (6 districts), and Basse (7 districts) for granular geographic organization and project location tracking
- July 08, 2025. Successfully inserted 17 Occupational Health and Safety (OHS) monitoring records into social_and_env_ohs_monitoring table: tracked workplace safety compliance across GEAP 1 (2 records) and D309& D6530 -GM (15 records) projects with comprehensive worker demographics (male/female/youth breakdown), safety requirement assessments, and working environment monitoring including safety violations documentation
- July 08, 2025. Successfully inserted 231 Project Affected People (PAP) records into social_and_env_pap table: comprehensive compensation tracking for D309& D6530 -GM project with detailed individual records including names, locations, compensation amounts, plot references, and completion status - covers 203 male and 28 female PAPs with 100% compensation completion rate across multiple districts (101, 102, 103, 109) and plot reference numbers for land acquisition and resettlement management
- July 08, 2025. Successfully inserted 5 community consultation engagement records into social_and_env_communityconsult_engagement table: documented stakeholder engagement activities across ADF-16 and TSF- (3 records) and D309& D6530 -GM (2 records) projects with 109 total participants (57 male, 52 female), covering consultation dates from April 23-30, 2025, including key issues discussed, follow-up actions, and engagement types for comprehensive community participation tracking
- July 08, 2025. Fixed Issues Actions monitoring syntax error and applied migrations: corrected typo in remarks field (blank=Fal → blank=True), added assign_date field migration to IssueActions model, updated forms to include assign_date field with proper DateInput widget, and updated all templates (dashboard, list, detail, form) to display the new assignment date field for improved issue tracking workflow
- July 08, 2025. Made Issues Actions remarks field mandatory: updated model to set blank=False, modified form to require field input, enhanced template with visual indicators (red asterisk) and updated help text, applied migration 0004_alter_issueactions_remarks for database schema enforcement
- July 08, 2025. Fixed Social & Environmental grievance detail template missing error: created comprehensive grievance_detail.html template with complete case information display, complainant details, complaint investigation timeline, and responsive design with Bootstrap styling for proper grievance case management
- July 08, 2025. Fixed Social & Environmental grievance detail template URL namespace issue: corrected invalid namespace references from 'social_and_env:grievance_list' to 'grievance_list' since the app doesn't have a registered namespace
- July 08, 2025. Enhanced pagination functionality across all list views: implemented comprehensive pagination with smart page number display, ellipsis for large page ranges, page size selector (10/25/50/100), and proper URL parameter preservation for filtering. Added reusable pagination template component at templates/includes/pagination.html and updated Issues Actions monitoring and Social & Environmental grievance list templates with enhanced pagination controls
- July 08, 2025. Fixed Grievance Management and OHS Monitoring pagination problems: replaced faulty request.GET.urlencode with proper URL parameter loop construct, implemented smart page number display with ellipsis, added First/Previous/Next/Last navigation controls with Bootstrap icons, enhanced page information display, and added configurable page size support in views for both modules
- July 08, 2025. Enhanced PAP data fetching for SQL Server compatibility: implemented dual-mode PAP data retrieval with proper null value handling for offline SQL Server deployment, created SQL Server utility functions with ISNULL handling, added automatic table name detection for different SQL Server environments ([piuprod3], [piuprod], simple), and ensured all PAP records are fetched even when some fields contain null values
- July 08, 2025. Fixed PAP form field relationship errors: corrected Districts model field references from 'region_id' to 'region_code', Settlement model from 'district_id' to 'district_code', and KPI_For_Contract from 'project_id' to 'project' - resolved FieldError issues in both PAPForm and PAPUpdateForm classes for proper cascading dropdown functionality
- July 09, 2025. Implemented Project Mapping detail view functionality: created comprehensive mapping_detail.html template with location information, coordinates, access statistics, household metrics, project/donor associations, and interactive map integration - replaced placeholder JavaScript alert with proper detail view navigation and added mapping_detail URL pattern
- July 09, 2025. Fixed OHS Monitoring action buttons in offline version: created missing ohs_detail and ohs_edit views with proper URL patterns, comprehensive detail template with worker statistics, safety assessments, and quick actions - resolved JavaScript navigation issues for view/edit functionality
- July 09, 2025. Resolved PAP Management list MS SQL backend compatibility issues: implemented exact column mapping using provided SQL Server table structure ([pap_identification_number] through [vulnerability_category_id]), enhanced SQL Server utilities with proper ISNULL handling, simplified query approach without complex joins, and created mock objects for template compatibility with foreign key IDs
- July 09, 2025. Fixed OHS Monitoring action buttons for offline SQL Server backend: enhanced ohs_list and ohs_detail views with dual-mode support (SQL Server raw queries vs Django ORM for SQLite), implemented get_sql_server_ohs_data() and get_sql_server_ohs_record_by_id() functions in sql_server_pap_utils.py, created MockOHSQuerySet and MockOHSRecord classes for template compatibility, added progressive database schema detection for [piuprod].[dbo].[social_and_env_ohs_monitoring] table with proper ISNULL handling for all 18 OHS fields, and provided appropriate user feedback for edit operations in SQL Server mode
- July 09, 2025. Resolved OHS template field reference error: fixed Project model attribute access from project_name to project field in both ohs_detail and ohs_edit views, corrected template button references to use ohs.pk instead of ohs.ohs_Id for proper record navigation, and verified OHS action buttons work correctly with existing records (IDs 1 and 2) in both SQLite and SQL Server modes
- July 09, 2025. Implemented comprehensive SQL Server database integration: configured dual-mode database support with USE_SQL_SERVER environment variable, created setup_sql_server.py script for database initialization, added enable_sql_server.py and activate_sql_server.py utilities for mode switching, installed django-mssql-backend and pyodbc packages, and provided complete SQL Server configuration with ODBC Driver 17 support, TrustServerCertificate=yes, and [piuprod].[dbo] schema compatibility
- July 09, 2025. Updated SQL Server integration with comprehensive database script: processed enhanced database script containing 236 DROP CONSTRAINT statements, 90 DROP TABLE statements, 90 CREATE TABLE statements, and 11,468 INSERT statements providing complete data population, created update_sql_server.py utility for database schema updates, added COMPREHENSIVE_SQL_SERVER_GUIDE.md with detailed integration instructions, and verified all key tables including social_and_env_*, PIU_Financial_mgt_*, and setup_* tables for complete offline functionality
- July 09, 2025. Forced SQL Server mode for all database queries: updated all views and forms to always use raw SQL queries instead of Django ORM, modified settings.py to set USE_SQL_SERVER=True, replaced all 'mssql' in engine.lower() detection with True conditions, updated social_and_env/views.py (OHS, PAP, Grievance), PIU_Financial_mgt/views.py (dashboard, activities), project_actions/views.py (cascading dropdowns), and project_actions/forms.py (validation) to ensure consistent SQL Server compatible query execution across all modules

## User Preferences

Preferred communication style: Simple, everyday language.