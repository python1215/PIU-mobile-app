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
- **Core Modules**: Comprises 8 REST controllers, 40+ JPA entities (including DesignProgressMonitoring, DesignMonitoringMilestone, RiskAssessment, RiskMitigation), and 64 Spring Data repositories to manage various aspects of the PIU system.

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

## Mobile App (React Native / Expo)

A fully functional React Native app is located in the `mobile/` directory. It mirrors every screen and module from the web app and connects directly to the live Replit backend.

### Mobile Tech Stack
- **Expo ~51**: Managed workflow for React Native development and cloud APK builds.
- **React Navigation v6**: Drawer navigator (mirrors web sidebar) + Stack navigator for project detail flow.
- **Zustand + AsyncStorage**: Auth state management, persisted to device storage (auto-login on reopen).
- **Axios**: API client, JWT injection via request interceptors, auto-logout on 401.
- **i18next / react-i18next**: Multilingual support (English, French, Portuguese) with in-app language switcher on the Login screen.
- **React Native Paper**: Material Design 3 UI components.
- **react-native-maps**: Project map screen (requires Google Maps API key for production).
- **EAS Build**: Cloud-based APK/AAB build service via Expo.

### Mobile Screens (17 total)
- **Login**: Language switcher (EN/FR/PT), JWT auth
- **Dashboard**: Personalized greeting, live project + issue stats, recent projects list
- **Projects**: Search + filter, project cards, tap to view full detail
- **Project Detail**: Full project info with funding, donors, contributors, dates
- **Donors**: Full CRUD with add modal
- **Issues**: Filter by status (OPEN/IN_PROGRESS/RESOLVED/CLOSED), search
- **KPI Monitoring**: Per-project KPI cards with progress bar (baseline/achieved/target)
- **System Setup**: Regions, LGAs, Districts, Currencies, Categories
- **Financial Management**: Per-project financial records with totals
- **Monitoring & Evaluation**: Per-project monitoring records with progress
- **Project Actions**: Works, Goods, Design Work, BOQ, Supply Progress, Installation, JMC — all tabs connected to real API
- **Social & Environmental**: ESIA, OHS, Grievances, PAPs per project
- **Documentation**: File list with open/download via Linking
- **Project Map**: Interactive map with markers (requires react-native-maps setup)
- **Risk Assessment**: Per-project risk cards colour-coded by level
- **Administration**: Roles, Users, Online users (superuser only)
- **Change Password**: Validated password change form

### Navigation Structure
- **Bottom Tab Bar** (always visible): Dashboard · Projects · Issues · KPI · More
- **More Tab**: Opens a grid of all remaining modules + profile/sign-out
- **Full-screen modules**: Donors, System Setup, Financial Mgmt, M&E, Project Actions, Social & Environmental, Documentation, Map, Risk Assessment, Administration, Change Password — navigable from the More grid or deep links

### Offline Caching (`mobile/src/services/cache.js`)
- Projects and Issues are cached in AsyncStorage with a 5-minute TTL
- When offline, stale cached data is returned and a yellow offline banner is shown
- Pull-to-refresh always attempts a fresh API call; falls back to cache on failure
- Cache is cleared on sign-out

### Push Notifications (`mobile/src/services/notifications.js`)
- Requests notification permission on first launch
- Sets the app badge to the number of OPEN issues
- Schedules a local alert when open issues are detected on dashboard load
- Tapping the notification deep-links to the Issues tab

### API Connection
- Backend URL: `https://015c982b-d594-4648-8d79-6ca8b9c81baa-00-3f6k25yw209xw.pike.replit.dev/api`
- Update `mobile/src/services/api.js → BASE_URL` if the repl domain changes or for local device testing.

### Getting Started (local machine)
```bash
cd mobile
npm install
npx expo start        # scan QR with Expo Go app
# OR: eas build --platform android --profile preview  (cloud APK build)
```