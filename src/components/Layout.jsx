import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  FiHome, 
  FiFolder, 
  FiUsers, 
  FiAlertCircle, 
  FiBarChart2, 
  FiLogOut,
  FiMenu,
  FiX,
  FiSettings,
  FiDollarSign,
  FiTrendingUp,
  FiFileText,
  FiShield,
  FiFile,
  FiMapPin
} from 'react-icons/fi';
import { useState } from 'react';

const navItems = [
  { path: '/', icon: FiHome, label: 'Dashboard' },
  { path: '/projects', icon: FiFolder, label: 'Projects' },
  { path: '/donors', icon: FiUsers, label: 'Donors' },
  { path: '/setup', icon: FiSettings, label: 'System Setup' },
  { path: '/financial', icon: FiDollarSign, label: 'Financial Management' },
  { path: '/monitoring', icon: FiTrendingUp, label: 'Monitoring & Evaluation' },
  { path: '/project-actions', icon: FiFileText, label: 'Project Actions' },
  { path: '/social-environmental', icon: FiShield, label: 'Social & Environmental' },
  { path: '/documentation', icon: FiFile, label: 'Documentation' },
  { path: '/map', icon: FiMapPin, label: 'Project Map' },
  { path: '/issues', icon: FiAlertCircle, label: 'Issues & Actions' },
  { path: '/kpi', icon: FiBarChart2, label: 'KPI Monitoring' },
];

function Layout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex vh-100 bg-light">
      <aside 
        className={`bg-white shadow-sm d-flex flex-column ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        style={{ width: sidebarOpen ? '280px' : '80px', transition: 'width 0.3s ease', minHeight: '100vh' }}
      >
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          {sidebarOpen && (
            <h4 className="mb-0 text-primary fw-bold">PIU Manager</h4>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-light btn-sm rounded-circle"
            style={{ width: '40px', height: '40px' }}
          >
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        <nav className="flex-grow-1 py-3 overflow-auto">
          <ul className="nav flex-column gap-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link d-flex align-items-center gap-3 rounded-3 px-3 py-2 ${
                      isActive
                        ? 'bg-primary bg-opacity-10 text-primary'
                        : 'text-secondary'
                    }`}
                    style={{ transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                  >
                    <Icon size={20} />
                    {sidebarOpen && <span className="fw-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-top">
          <div className={`d-flex align-items-center ${sidebarOpen ? 'gap-3' : 'justify-content-center'}`}>
            <div 
              className="rounded-circle bg-primary bg-opacity-10 text-primary fw-semibold d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px', minWidth: '40px' }}
            >
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-grow-1 overflow-hidden">
                <p className="mb-0 fw-medium text-dark text-truncate">{user?.username}</p>
                <p className="mb-0 small text-muted text-truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`btn btn-outline-danger w-100 mt-3 d-flex align-items-center gap-2 ${
              sidebarOpen ? '' : 'justify-content-center'
            }`}
          >
            <FiLogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-grow-1 overflow-auto">
        <div className="container-fluid p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
