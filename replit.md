# PIU Project Management System - Microservices Architecture

## Overview
This is a comprehensive Project Implementation Unit (PIU) Monitoring & Evaluation System that has been converted from a Django monolithic application to a modern microservices architecture. The system provides project portfolio management, financial tracking, KPI monitoring, social and environmental compliance, issues/actions tracking, and documentation management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Architecture
The application uses two different architectures for development and production:

#### Development (Workflow)
- **Spring Boot (Port 5000)** - Runs directly on port 5000 via `start.sh`
  - Uses `setsid` to isolate from Replit workflow SIGTERM signals
  - Serves React SPA from `classpath:/static/` (built files in JAR)
  - Provides all REST API endpoints with JWT authentication
  - `start.sh` monitors and auto-restarts if Spring Boot exits

#### Production (Autoscale Deployment)
- **HealthProxy.java (Port 5000)** - Lightweight Java HTTP proxy
  - Instant startup for health checks
  - Serves static files from `dist/` directory
  - Proxies `/api/*` requests to Spring Boot on port 8080
- **Spring Boot (Port 8080)** - Backend API server
  - Started as child process by HealthProxy

#### Shared Components
- **Spring Boot Backend**
  - RESTful API server with JWT authentication
  - Handles all business logic and data operations
  - Uses JPA/Hibernate for database operations
  - 56 JPA repository interfaces

- **PostgreSQL Database**
  - Stores all application data
  - Connected via Neon-backed Replit database (PGHOST=helium)

### UI/UX Decisions
- **Frontend Framework**: React 19 with Vite for build tooling
- **Styling**: Tailwind CSS v4 with Bootstrap 5 components
- **State Management**: Zustand for client-side state
- **Data Fetching**: Axios with React Query for API calls
- **Charts**: Chart.js with react-chartjs-2 wrapper
- **Maps**: Leaflet with react-leaflet for geographic visualization
- **Routing**: React Router v7 for client-side navigation
- **Icons**: React Icons (Feather Icons)
- **Notifications**: React Hot Toast

### Technical Implementations

#### Frontend (React)
- **Build Tool**: Vite 7.x
- **CSS Framework**: Tailwind CSS v4 with Bootstrap 5
- **State**: Zustand with persist middleware for auth
- **API Client**: Axios with interceptors for JWT tokens
- **Pages**: 15 React pages for all modules
- **Performance Optimizations**: 
  - React.memo for component memoization (StatCard, ProjectRow, NavItem, etc.)
  - useMemo for computed values and derived data (filtered lists, chart data, totals)
  - useCallback for stable function references (event handlers, API calls)
  - Zustand selectors for minimal auth store subscriptions

#### Backend (Spring Boot)
- **Framework**: Spring Boot 3.2 with Java 21
- **Security**: Spring Security with JWT authentication
- **Database**: Spring Data JPA with Hibernate 6
- **Validation**: Jakarta Validation (Bean Validation)
- **Build**: Maven with JAR packaging

## Complete Database Schema (JPA Entities)

### Core Entities
- **User**: Authentication with JWT tokens
- **Project**: Core project management with String IDs (project_id)
- **Donor**: Donor/funding source management

### System Setup Entities (Reference Data)
- **Region**: Geographic regions
- **District**: Districts within regions
- **Settlement**: Settlements within districts
- **Year**: Fiscal/profile years
- **Quarter**: Quarterly periods
- **Currency**: Currency reference data
- **ProjectCategory**: Project categorization
- **DocumentType**: Document type classification
- **MonitoringType**: Types of monitoring activities
- **VulnerabilityCategory**: PAP vulnerability classifications
- **AccessType**: Settlement access type reference
- **ImpactType**: Impact type classifications
- **PAPType**: Project Affected Person types
- **PAPCategory**: PAP categories
- **SettlementNature**: Settlement nature types
- **DecisionOutcome**: Grievance decision outcomes
- **StakeholderEngagementType**: Engagement type classifications

### Financial Management Entities
- **Component**: Project components with currency and allocation
- **Subcomponent**: Sub-components linked to components
- **Activity**: Project activities with allocations
- **PDO**: Project Development Objectives
- **ProjectOutcome**: Project outcomes linked to PDOs
- **ProjectResult**: Project results linked to outcomes
- **KPIForContract**: KPI indicators for contracts
- **IndicatorDescription**: Detailed indicator descriptions

### Monitoring & Evaluation Entities
- **ResultsOrientedMonitoring**: Results tracking with baselines and targets
- **KPIIndicator**: Key Performance Indicators

### Project Actions Entities
- **ContractProfilingWorks**: Works contracts profiling
- **ContractProfilingGoods**: Goods and services contracts
- **SpecificContractMonitoring**: Contract-specific monitoring

### Social & Environmental Entities
- **ESIA**: Environmental and Social Impact Assessment
- **PAP**: Project Affected Persons tracking
- **GrievanceMonitoringLog**: Grievance case management
- **OHSMonitoring**: Occupational Health & Safety monitoring
- **CommunityEngagement**: Community engagement records

### Documentation Entities
- **ProjectDocument**: Project document records
- **DocumentVersion**: Document version tracking
- **DocumentComment**: Document comments
- **DocumentTag**: Document tagging

### Project Mapping Entities
- **ProjectMapping**: Geographic project mappings
- **NawecInfrastructure**: Infrastructure data
- **SettlementWithCoordinates**: Settlements with GPS coordinates

## React Pages (10 Main Navigation Pages)

1. **Dashboard** (`/`) - Real-time analytics with charts and statistics
2. **SystemSetup** (`/setup`) - Reference data management including:
   - Donors (first tab) - Donor/funding source management
   - Regions, Years, Quarters, Currencies, Categories, Document Types
3. **FinancialManagement** (`/financial`) - Financial operations including:
   - Projects (first tab) - Project list and management
   - Components, Subcomponents, Activities, PDO Statements, Outcomes
4. **ProjectDetail** (`/projects/:id`) - Individual project details
5. **MonitoringEvaluation** (`/monitoring`) - Results-oriented monitoring with progress tracking
6. **ProjectActions** (`/project-actions`) - Works and goods contract profiling
7. **SocialEnvironmental** (`/social-environmental`) - ESIA, PAP, grievances, OHS, community engagement
8. **Documentation** (`/documentation`) - Document management and tracking
9. **ProjectMap** (`/map`) - Geographic visualization with Leaflet
10. **Issues** (`/issues`) - Issues and actions tracking
11. **KPIMonitoring** (`/kpi`) - KPI tracking and monitoring

## REST API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT)

### System Setup
- `GET/POST /api/setup/regions` - Regions CRUD
- `GET/POST /api/setup/districts` - Districts CRUD
- `GET/POST /api/setup/settlements` - Settlements CRUD
- `GET/POST /api/setup/years` - Years CRUD
- `GET/POST /api/setup/quarters` - Quarters CRUD
- `GET/POST /api/setup/currencies` - Currencies CRUD
- `GET/POST /api/setup/categories` - Project categories CRUD
- `GET/POST /api/setup/document-types` - Document types CRUD
- `GET/POST /api/setup/monitoring-types` - Monitoring types CRUD

### Financial Management
- `GET/POST /api/financial/components` - Components CRUD
- `GET/POST /api/financial/subcomponents` - Subcomponents CRUD
- `GET/POST /api/financial/activities` - Activities CRUD
- `GET/POST /api/financial/pdos` - PDO statements CRUD
- `GET/POST /api/financial/outcomes` - Project outcomes CRUD
- `GET/POST /api/financial/results` - Project results CRUD

### Monitoring & Evaluation
- `GET/POST /api/monitoring` - Results monitoring CRUD
- `GET /api/monitoring/project/{projectId}` - Filter by project

### Project Actions
- `GET/POST /api/project-actions/works` - Works contracts CRUD
- `GET/POST /api/project-actions/goods` - Goods contracts CRUD

### Social & Environmental
- `GET/POST /api/social-environmental/esia` - ESIA CRUD
- `GET/POST /api/social-environmental/pap` - PAP CRUD
- `GET/POST /api/social-environmental/grievance` - Grievances CRUD
- `GET/POST /api/social-environmental/ohs` - OHS monitoring CRUD
- `GET/POST /api/social-environmental/community-engagement` - Engagement CRUD

### Documentation
- `GET/POST /api/documents` - Documents CRUD
- `GET /api/documents/project/{projectId}` - Filter by project

### Project Mapping
- `GET/POST /api/mapping` - Project mappings CRUD
- `GET /api/mapping/project/{projectId}` - Filter by project
- `GET /api/mapping/region/{regionCode}` - Filter by region

### Projects
- `GET/POST /api/projects` - Projects CRUD
- `GET/PUT/DELETE /api/projects/{id}` - Single project operations

### Issues
- `GET/POST /api/issues` - Issues CRUD
- `PUT /api/issues/{id}` - Update issue

### KPIs
- `GET/POST /api/kpis` - KPIs CRUD

### Donors
- `GET/POST /api/donors` - Donors CRUD

## Project Structure

```
/
├── app.py                 # Flask gateway application
├── main.py                # Entry point for gunicorn
├── dist/                  # Built React application
├── src/                   # React source code
│   ├── components/        # Reusable React components
│   │   └── Layout.jsx     # Main layout with navigation
│   ├── pages/             # Page components (12 pages)
│   │   ├── Dashboard.jsx
│   │   ├── Projects.jsx
│   │   ├── SystemSetup.jsx
│   │   ├── FinancialManagement.jsx
│   │   ├── MonitoringEvaluation.jsx
│   │   ├── ProjectActions.jsx
│   │   ├── SocialEnvironmental.jsx
│   │   ├── Documentation.jsx
│   │   ├── ProjectMap.jsx
│   │   └── ...
│   ├── store/             # Zustand state stores
│   └── App.jsx            # Main router configuration
├── backend/               # Spring Boot backend
│   ├── pom.xml            # Maven configuration
│   └── src/main/java/     # Java source code
│       └── com/piun/piuproject/
│           ├── controller/  # 8 REST controllers
│           ├── model/       # 40+ JPA entities
│           ├── repository/  # 29 Spring Data repositories
│           ├── service/     # Business logic services
│           ├── security/    # JWT authentication
│           └── config/      # Configuration classes
└── PIUN/                  # Original Django app (legacy)
```

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection URL
- `SESSION_SECRET`: Flask session secret key
- `JWT_SECRET`: JWT token signing secret

## Development Workflow

### Starting the Application
The workflow runs `gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app` which:
1. Starts the Flask gateway on port 5000
2. Automatically starts the Spring Boot backend on port 8080
3. Serves the React SPA and proxies API calls

### Building the Frontend
```bash
npx vite build
```
This compiles the React app to the `dist/` folder.

### Building the Backend
```bash
cd backend && mvn clean package -DskipTests
```
This creates the JAR file in `backend/target/piuproject-1.0.0.jar`.

## Recent Changes

### February 21, 2026 - Security Dependency Updates
- Upgraded Spring Boot parent from 3.2.0 to 3.4.3 (addresses CVEs in tomcat, spring-security, spring-web, logback, postgresql)
- Rebuilt backend JAR with updated dependencies:
  - logback-classic/core: 1.4.11 -> 1.5.16
  - tomcat-embed-core: 10.1.16 -> 10.1.36
  - spring-web/webmvc: 6.1.1 -> 6.2.3
  - spring-security-core/web/crypto: 6.2.0 -> 6.4.3
  - postgresql driver: 42.6.0 -> 42.7.5
- Updated Python dependencies: Django 5.2.1 -> 5.2.8, Pillow 11.3.0 -> 12.1.1, urllib3 added >=2.6.3
- Updated Node.js dependency: jspdf 4.1.0 -> 4.2.0

### December 3, 2025 - Complete Module Implementation
- Added 40+ JPA entities covering all 8 modules from Django
- Created 29 Spring Data JPA repositories
- Implemented 8 comprehensive REST controllers
- Created 12 React pages with Bootstrap UI
- Added navigation for all modules
- Modules completed:
  - System Setup (regions, districts, settlements, years, quarters, currencies, categories)
  - Financial Management (components, subcomponents, activities, PDOs, outcomes, results)
  - Monitoring & Evaluation (results-oriented monitoring with progress tracking)
  - Project Actions (works and goods contract profiling)
  - Social & Environmental (ESIA, PAP, grievances, OHS, community engagement)
  - Documentation (document management with versioning)
  - Project Mapping (geographic visualization with Leaflet maps)
  - Issues & Actions (issue logging with priority and status)

### December 2025 - Microservices Conversion
- Converted from Django monolithic to microservices architecture
- Added React frontend with Vite build system
- Added Spring Boot backend with JWT authentication
- Configured Flask gateway for serving SPA and proxying API calls
- Database migrated to PostgreSQL with JPA entities
- Added Tailwind CSS v4 and Bootstrap 5 for styling
