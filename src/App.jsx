import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Donors from './pages/Donors';
import Issues from './pages/Issues';
import KPIMonitoring from './pages/KPIMonitoring';
import SystemSetup from './pages/SystemSetup';
import FinancialManagement from './pages/FinancialManagement';
import MonitoringEvaluation from './pages/MonitoringEvaluation';
import ProjectActions from './pages/ProjectActions';
import SocialEnvironmental from './pages/SocialEnvironmental';
import Documentation from './pages/Documentation';
import ProjectMap from './pages/ProjectMap';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="donors" element={<Donors />} />
        <Route path="issues" element={<Issues />} />
        <Route path="kpi" element={<KPIMonitoring />} />
        <Route path="setup" element={<SystemSetup />} />
        <Route path="financial" element={<FinancialManagement />} />
        <Route path="monitoring" element={<MonitoringEvaluation />} />
        <Route path="project-actions" element={<ProjectActions />} />
        <Route path="social-environmental" element={<SocialEnvironmental />} />
        <Route path="documentation" element={<Documentation />} />
        <Route path="map" element={<ProjectMap />} />
      </Route>
    </Routes>
  );
}

export default App;
