# PIU Project Management System - Microservices Architecture

## Overview
This project is a comprehensive Project Implementation Unit (PIU) Monitoring & Evaluation System. It has been re-engineered from a Django monolith to a modern microservices architecture to provide robust project portfolio management. Key capabilities include financial tracking, KPI monitoring, social and environmental compliance, issues and actions tracking, and documentation management. The system aims to offer a scalable and efficient solution for managing complex project lifecycles.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Architecture
The system employs a microservices architecture, leveraging Spring Boot for the backend and React for the frontend.

#### Development Workflow
- **Spring Boot (Port 5000)**: Serves the React Single Page Application (SPA) and provides REST API endpoints with JWT authentication. It runs via `start.sh`, which also monitors and restarts the service.

#### Production Deployment
- **HealthProxy.java (Port 5000)**: A lightweight Java HTTP proxy for instant health checks and static file serving. It proxies `/api/*` requests to the Spring Boot backend.
- **Spring Boot (Port 8080)**: The backend API server, running as a child process of HealthProxy, handles all business logic and data operations.

#### Shared Components
- **Spring Boot Backend**: Provides a RESTful API with JWT authentication, managing all business logic and data operations through JPA/Hibernate.
- **PostgreSQL Database**: Serves as the primary data store, connected via Neon-backed Replit database.

### UI/UX Decisions
- **Frontend Framework**: React 19 with Vite.
- **Styling**: Tailwind CSS v4 integrated with Bootstrap 5 components.
- **State Management**: Zustand for client-side state, with persistence for authentication.
- **Data Fetching**: Axios for API calls, enhanced with React Query.
- **Charting**: Chart.js with `react-chartjs-2`.
- **Mapping**: Leaflet with `react-leaflet` for geographic visualizations.
- **Routing**: React Router v7 for navigation.
- **Icons**: React Icons (Feather Icons).
- **Notifications**: React Hot Toast.

### Technical Implementations

#### Frontend (React)
- **Build Tool**: Vite 7.x.
- **Performance Optimizations**: Utilizes `React.memo`, `useMemo`, and `useCallback` for efficient component rendering and state management.
- **Core Modules**: Implements 15 React pages covering various functionalities like Dashboard, System Setup, Financial Management, Monitoring & Evaluation, Project Actions, Social & Environmental, Documentation, Project Map, Risk Assessment, Issues, and KPI Monitoring.

#### Backend (Spring Boot)
- **Framework**: Spring Boot 3.2 with Java 21.
- **Security**: Spring Security with JWT for authentication.
- **Database**: Spring Data JPA with Hibernate 6.
- **Validation**: Jakarta Validation (Bean Validation).
- **Build System**: Maven, producing a JAR package.
- **Core Modules**: Comprises 8 REST controllers, 40+ JPA entities, and 29 Spring Data repositories to manage various aspects of the PIU system.

## External Dependencies
- **PostgreSQL**: Primary database.
- **Neon**: Provides PostgreSQL database hosting for Replit.
- **Vite**: Frontend build tool.
- **Tailwind CSS**: Utility-first CSS framework.
- **Bootstrap 5**: CSS framework for UI components.
- **Zustand**: State management library for React.
- **Axios**: HTTP client for API requests.
- **React Query**: Data fetching and caching library.
- **Chart.js**: JavaScript charting library.
- **Leaflet**: Open-source JavaScript library for interactive maps.
- **React Router**: Declarative routing for React.
- **React Icons**: Icon library.
- **React Hot Toast**: Toast notifications library.
- **Spring Boot**: Backend framework.
- **Spring Security**: Security framework for Java applications.
- **JPA/Hibernate**: Object-relational mapping (ORM) for database interaction.
- **Maven**: Build automation tool for Java projects.