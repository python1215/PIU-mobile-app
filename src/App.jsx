import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
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
import Administration from './pages/Administration';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function ModuleGuard({ moduleKey, children }) {
  const permissions = useAuthStore((state) => state.permissions);
  const user = useAuthStore((state) => state.user);

  if (!permissions || user?.isSuperuser) return children;
  if (permissions[moduleKey] === true) return children;
  return <Navigate to="/" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
        <Route path="issues" element={<ModuleGuard moduleKey="issues"><Issues /></ModuleGuard>} />
        <Route path="kpi" element={<ModuleGuard moduleKey="kpi"><KPIMonitoring /></ModuleGuard>} />
        <Route path="setup" element={<ModuleGuard moduleKey="systemSetup"><SystemSetup /></ModuleGuard>} />
        <Route path="financial" element={<ModuleGuard moduleKey="financialManagement"><FinancialManagement /></ModuleGuard>} />
        <Route path="monitoring" element={<ModuleGuard moduleKey="monitoring"><MonitoringEvaluation /></ModuleGuard>} />
        <Route path="project-actions" element={<ModuleGuard moduleKey="projectActions"><ProjectActions /></ModuleGuard>} />
        <Route path="social-environmental" element={<ModuleGuard moduleKey="socialEnvironmental"><SocialEnvironmental /></ModuleGuard>} />
        <Route path="documentation" element={<ModuleGuard moduleKey="documentation"><Documentation /></ModuleGuard>} />
        <Route path="map" element={<ModuleGuard moduleKey="projectMap"><ProjectMap /></ModuleGuard>} />
        <Route path="administration" element={<ModuleGuard moduleKey="administration"><Administration /></ModuleGuard>}>
          <Route index element={<Navigate to="/administration/roles" replace />} />
          <Route path="roles" element={null} />
          <Route path="users" element={null} />
          <Route path="register" element={null} />
          <Route path="connected" element={null} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
