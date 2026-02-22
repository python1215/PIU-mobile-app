import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import LanguageSelector from "./LanguageSelector";
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
  FiMapPin,
  FiLock,
  FiChevronDown,
  FiUserPlus,
  FiActivity,
} from "react-icons/fi";
import { useState, useCallback, useMemo, memo } from "react";

const navItemsConfig = [
  { path: "/", icon: FiHome, labelKey: "nav.dashboard", moduleKey: "dashboard" },
  { path: "/setup", icon: FiSettings, labelKey: "nav.systemSetup", moduleKey: "systemSetup" },
  { path: "/financial", icon: FiDollarSign, labelKey: "nav.financialManagement", moduleKey: "financialManagement" },
  { path: "/monitoring", icon: FiTrendingUp, labelKey: "nav.monitoring", moduleKey: "monitoring" },
  { path: "/project-actions", icon: FiFileText, labelKey: "nav.projectActions", moduleKey: "projectActions" },
  { path: "/social-environmental", icon: FiShield, labelKey: "nav.socialEnvironmental", moduleKey: "socialEnvironmental" },
  { path: "/documentation", icon: FiFile, labelKey: "nav.documentation", moduleKey: "documentation" },
  { path: "/map", icon: FiMapPin, labelKey: "nav.projectMap", moduleKey: "projectMap" },
  { path: "/issues", icon: FiAlertCircle, labelKey: "nav.issues", moduleKey: "issues" },
  { path: "/kpi", icon: FiBarChart2, labelKey: "nav.kpi", moduleKey: "kpi" },
];

const adminSubItems = [
  { path: "/administration/roles", icon: FiShield, labelKey: "admin.roles" },
  { path: "/administration/users", icon: FiUsers, labelKey: "admin.userAssignment" },
  { path: "/administration/register", icon: FiUserPlus, labelKey: "admin.registerUser" },
  { path: "/administration/connected", icon: FiActivity, labelKey: "admin.connectedUsers" },
];

const NavItem = memo(function NavItem({ item, isActive, sidebarOpen, t }) {
  const Icon = item.icon;
  return (
    <li className="nav-item">
      <Link
        to={item.path}
        className={`nav-link d-flex align-items-center gap-3 rounded-3 px-3 py-2 ${
          isActive ? "bg-primary bg-opacity-10 text-primary" : "text-secondary"
        }`}
        style={{ transition: "all 0.2s", whiteSpace: "nowrap" }}
      >
        <Icon size={20} />
        {sidebarOpen && <span className="fw-medium">{t(item.labelKey)}</span>}
      </Link>
    </li>
  );
});

const UserAvatar = memo(function UserAvatar({ username }) {
  return (
    <div
      className="rounded-circle bg-primary bg-opacity-10 text-primary fw-semibold d-flex align-items-center justify-content-center"
      style={{ width: "40px", height: "40px", minWidth: "40px" }}
    >
      {username?.[0]?.toUpperCase() || "U"}
    </div>
  );
});

function Layout() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const permissions = useAuthStore((state) => state.permissions);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminExpanded, setAdminExpanded] = useState(false);

  const isAdminPath = location.pathname.startsWith("/administration");

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const toggleAdmin = useCallback(() => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setAdminExpanded(true);
      navigate("/administration/roles");
    } else {
      setAdminExpanded((prev) => !prev);
    }
  }, [sidebarOpen, navigate]);

  const filteredNavItems = useMemo(() => {
    if (!permissions || user?.isSuperuser) return navItemsConfig;
    return navItemsConfig.filter((item) => {
      if (item.moduleKey === 'dashboard') return true;
      return permissions[item.moduleKey] === true;
    });
  }, [permissions, user]);

  const showAdmin = useMemo(() => {
    if (!permissions || user?.isSuperuser) return true;
    return permissions.administration === true;
  }, [permissions, user]);

  const navList = useMemo(
    () =>
      filteredNavItems.map((item) => (
        <NavItem
          key={item.path}
          item={item}
          isActive={location.pathname === item.path}
          sidebarOpen={sidebarOpen}
          t={t}
        />
      )),
    [filteredNavItems, location.pathname, sidebarOpen, t],
  );

  const sidebarStyle = useMemo(
    () => ({
      width: sidebarOpen ? "280px" : "80px",
      transition: "width 0.3s ease",
      minHeight: "100vh",
    }),
    [sidebarOpen],
  );

  const adminIsExpanded = adminExpanded || isAdminPath;

  return (
    <div className="d-flex vh-100 bg-light">
      <aside
        className={`bg-white shadow-sm d-flex flex-column ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
        style={sidebarStyle}
      >
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          {sidebarOpen && (
            <h4 className="mb-0 text-primary fw-bold">
              PIU DIGITAL M&E SYSTEM{" "}
            </h4>
          )}
          <button
            onClick={toggleSidebar}
            className="btn btn-light btn-sm rounded-circle"
            style={{ width: "40px", height: "40px" }}
          >
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        <nav className="flex-grow-1 py-3 overflow-auto">
          <ul className="nav flex-column gap-1 px-2">
            {navList}

            {showAdmin && (
              <>
                <li className="nav-item">
                  <button
                    onClick={toggleAdmin}
                    className={`nav-link d-flex align-items-center gap-3 rounded-3 px-3 py-2 w-100 border-0 bg-transparent ${
                      isAdminPath ? "bg-primary bg-opacity-10 text-primary" : "text-secondary"
                    }`}
                    style={{ transition: "all 0.2s", whiteSpace: "nowrap", textAlign: "left" }}
                  >
                    <FiLock size={20} />
                    {sidebarOpen && (
                      <>
                        <span className="fw-medium flex-grow-1">{t("nav.administration")}</span>
                        <FiChevronDown
                          size={16}
                          style={{
                            transition: "transform 0.3s",
                            transform: adminIsExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        />
                      </>
                    )}
                  </button>
                </li>

                {sidebarOpen && adminIsExpanded && (
                  <div style={{ paddingLeft: "20px" }}>
                    {adminSubItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = location.pathname === sub.path;
                      return (
                        <li key={sub.path} className="nav-item">
                          <Link
                            to={sub.path}
                            className={`nav-link d-flex align-items-center gap-3 rounded-3 px-3 py-2 ${
                              isSubActive ? "bg-primary bg-opacity-10 text-primary" : "text-secondary"
                            }`}
                            style={{ transition: "all 0.2s", whiteSpace: "nowrap", fontSize: "0.9rem" }}
                          >
                            <SubIcon size={16} />
                            <span className="fw-medium">{t(sub.labelKey)}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </ul>
        </nav>

        <div className="p-3 border-top">
          {sidebarOpen && (
            <div className="mb-3">
              <LanguageSelector />
            </div>
          )}

          <div
            className={`d-flex align-items-center ${sidebarOpen ? "gap-3" : "justify-content-center"}`}
          >
            <UserAvatar username={user?.username} />
            {sidebarOpen && (
              <div className="flex-grow-1 overflow-hidden">
                <p className="mb-0 fw-medium text-dark text-truncate">
                  {user?.username}
                </p>
                <p className="mb-0 small text-muted text-truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`btn btn-outline-danger w-100 mt-3 d-flex align-items-center gap-2 ${
              sidebarOpen ? "" : "justify-content-center"
            }`}
          >
            <FiLogOut size={18} />
            {sidebarOpen && <span>{t("auth.logout")}</span>}
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

export default memo(Layout);
