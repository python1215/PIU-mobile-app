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

## User Preferences

Preferred communication style: Simple, everyday language.