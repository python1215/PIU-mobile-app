# PIU Project Management System - Microservices Architecture

## Overview
This is a comprehensive Project Implementation Unit (PIU) Monitoring & Evaluation System that has been converted from a Django monolithic application to a modern microservices architecture. The system provides project portfolio management, financial tracking, KPI monitoring, social and environmental compliance, issues/actions tracking, and documentation management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Microservices Architecture
The application follows a microservices pattern with three main components:

1. **Flask Gateway (Port 5000)**
   - Serves the React SPA (Single Page Application)
   - Proxies all `/api/*` requests to the Spring Boot backend
   - Handles static file serving from the built React app

2. **Spring Boot Backend (Port 8080)**
   - RESTful API server with JWT authentication
   - Handles all business logic and data operations
   - Uses JPA/Hibernate for database operations

3. **PostgreSQL Database**
   - Stores all application data
   - Connected via Neon-backed Replit database

### UI/UX Decisions
- **Frontend Framework**: React 19 with Vite for build tooling
- **Styling**: Tailwind CSS v4 with custom components
- **State Management**: Zustand for client-side state
- **Data Fetching**: Axios with React Query for API calls
- **Charts**: Chart.js with react-chartjs-2 wrapper
- **Maps**: Leaflet with react-leaflet for geographic visualization
- **Routing**: React Router v7 for client-side navigation

### Technical Implementations

#### Frontend (React)
- **Build Tool**: Vite 7.x
- **CSS Framework**: Tailwind CSS v4 with @tailwindcss/postcss
- **State**: Zustand with persist middleware for auth
- **API Client**: Axios with interceptors for JWT tokens
- **Components**: Custom React components for Dashboard, Projects, Donors, Issues, KPI Monitoring

#### Backend (Spring Boot)
- **Framework**: Spring Boot 3.2 with Java 21
- **Security**: Spring Security with JWT authentication
- **Database**: Spring Data JPA with Hibernate 6
- **Validation**: Jakarta Validation (Bean Validation)
- **Build**: Maven with JAR packaging

#### Database Schema (JPA Entities)
- **User**: Authentication with JWT tokens
- **Project**: Core project management with String IDs (project_id)
- **Component**: Project components with currency and allocation
- **Subcomponent**: Sub-components linked to components
- **Donor**: Donor/funding source management
- **IssueAction**: Issues and actions tracking
- **KPIIndicator**: Key Performance Indicators
- **Currency**: Currency reference data
- **Quarter**: Quarterly reference data
- **Year**: Year reference data

### Feature Specifications
- **Dashboard**: Real-time analytics with charts and statistics
- **Project Management**: CRUD operations with status tracking
- **Financial Tracking**: Component/subcomponent budget monitoring
- **KPI Monitoring**: Performance indicator tracking with targets
- **Issues & Actions**: Issue logging with priority and status
- **Donor Management**: Funding source tracking
- **Geographic Visualization**: Map-based project locations

## Project Structure

```
/
├── app.py                 # Flask gateway application
├── main.py                # Entry point for gunicorn
├── dist/                  # Built React application
├── src/                   # React source code
│   ├── components/        # Reusable React components
│   ├── pages/             # Page components
│   ├── store/             # Zustand state stores
│   └── services/          # API service functions
├── backend/               # Spring Boot backend
│   ├── pom.xml            # Maven configuration
│   └── src/main/java/     # Java source code
│       └── com/piun/piuproject/
│           ├── controller/  # REST controllers
│           ├── model/       # JPA entities
│           ├── repository/  # Spring Data repositories
│           ├── service/     # Business logic
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

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT)

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Issues
- `GET /api/issues` - List all issues
- `POST /api/issues` - Create issue
- `PUT /api/issues/{id}` - Update issue

### KPIs
- `GET /api/kpis` - List all KPIs
- `POST /api/kpis` - Create KPI

### Donors
- `GET /api/donors` - List all donors
- `POST /api/donors` - Create donor

## Recent Changes

### December 2025 - Microservices Conversion
- Converted from Django monolithic to microservices architecture
- Added React frontend with Vite build system
- Added Spring Boot backend with JWT authentication
- Configured Flask gateway for serving SPA and proxying API calls
- Database migrated to PostgreSQL with JPA entities
- Added Tailwind CSS v4 for styling
