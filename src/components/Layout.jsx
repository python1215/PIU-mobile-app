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
  FiPackage,
  FiClipboard,
} from "react-icons/fi";
import { useState, useCallback, useMemo, useEffect, memo } from "react";

const navItemsConfig = [
  { path: "/", icon: FiHome, labelKey: "nav.dashboard", moduleKey: "dashboard" },
  { path: "/setup", icon: FiSettings, labelKey: "nav.systemSetup", moduleKey: "systemSetup" },
  { path: "/financial", icon: FiDollarSign, labelKey: "nav.financialManagement", moduleKey: "financialManagement" },
  { path: "/monitoring", icon: FiTrendingUp, labelKey: "nav.monitoring", moduleKey: "monitoring" },
  { path: "/social-environmental", icon: FiShield, labelKey: "nav.socialEnvironmental", moduleKey: "socialEnvironmental" },
  { path: "/documentation", icon: FiFile, labelKey: "nav.documentation", moduleKey: "documentation" },
  { path: "/map", icon: FiMapPin, labelKey: "nav.projectMap", moduleKey: "projectMap" },
  { path: "/issues", icon: FiAlertCircle, labelKey: "nav.issues", moduleKey: "issues" },
  { path: "/kpi", icon: FiBarChart2, labelKey: "nav.kpi", moduleKey: "kpi" },
];

const projectActionsSubItems = [
  { path: "/project-actions/works", icon: FiFileText, labelKey: "projectActions.worksContracts" },
  { path: "/project-actions/goods", icon: FiPackage, labelKey: "projectActions.goodsContracts" },
  { path: "/project-actions/monitoring", icon: FiActivity, labelKey: "projectActions.contractMonitoring" },
  { path: "/project-actions/design-work", icon: FiClipboard, labelKey: "projectActions.designWorkPlan" },
  { path: "/project-actions/boq", icon: FiFileText, labelKey: "projectActions.boqTab" },
  { path: "/project-actions/supply-progress", icon: FiPackage, labelKey: "projectActions.supplyProgressTab" },
  { path: "/project-actions/installation", icon: FiSettings, labelKey: "projectActions.installationTab" },
];

const adminSubItems = [
  { path: "/administration/roles", icon: FiShield, labelKey: "admin.roles" },
  { path: "/administration/users", icon: FiUsers, labelKey: "admin.userAssignment" },
  { path: "/administration/register", icon: FiUserPlus, labelKey: "admin.registerUser" },
  { path: "/administration/connected", icon: FiActivity, labelKey: "admin.connectedUsers" },
];

const NavItem = memo(function NavItem({ item, isActive, sidebarOpen, t, onClick }) {
  const Icon = item.icon;
  return (
    <li className="nav-item">
      <Link
        to={item.path}
        onClick={onClick}
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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}

function Layout() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const permissions = useAuthStore((state) => state.permissions);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [adminExpanded, setAdminExpanded] = useState(false);
  const [projectActionsExpanded, setProjectActionsExpanded] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdminPath = location.pathname.startsWith("/administration");
  const isProjectActionsPath = location.pathname.startsWith("/project-actions");

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const closeSidebarOnMobile = useCallback(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const toggleProjectActions = useCallback(() => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setProjectActionsExpanded(true);
      navigate("/project-actions/works");
    } else {
      setProjectActionsExpanded((prev) => !prev);
    }
  }, [sidebarOpen, navigate]);

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

  const showProjectActions = useMemo(() => {
    if (!permissions || user?.isSuperuser) return true;
    return permissions.projectActions === true;
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
          sidebarOpen={sidebarOpen || isMobile}
          t={t}
          onClick={closeSidebarOnMobile}
        />
      )),
    [filteredNavItems, location.pathname, sidebarOpen, isMobile, t, closeSidebarOnMobile],
  );

  const sidebarStyle = useMemo(
    () => {
      if (isMobile) {
        return {
          width: "280px",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1040,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        };
      }
      return {
        width: sidebarOpen ? "280px" : "80px",
        transition: "width 0.3s ease",
        minHeight: "100vh",
      };
    },
    [sidebarOpen, isMobile],
  );

  useEffect(() => {
    if (isProjectActionsPath) setProjectActionsExpanded(true);
  }, [isProjectActionsPath]);

  useEffect(() => {
    if (isAdminPath) setAdminExpanded(true);
  }, [isAdminPath]);

  const adminIsExpanded = adminExpanded;
  const showLabels = sidebarOpen || isMobile;

  return (
    <div className="d-flex vh-100 bg-light">
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {isMobile && (
        <div className="mobile-header bg-white shadow-sm d-flex align-items-center justify-content-between px-3" style={{ height: "56px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 1030 }}>
          <button
            onClick={toggleSidebar}
            className="btn btn-light btn-sm rounded-circle"
            style={{ width: "40px", height: "40px" }}
          >
            <FiMenu size={20} />
          </button>
          <h6 className="mb-0 text-primary fw-bold">ROMEOT M&E</h6>
          <UserAvatar username={user?.username} />
        </div>
      )}

      <aside
        className={`bg-white shadow-sm d-flex flex-column ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
        style={sidebarStyle}
      >
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          {showLabels && (
            <h4 className="mb-0 text-primary fw-bold" style={{ fontSize: isMobile ? "1rem" : undefined }}>
              ROMEOT DIGITAL M&E SYSTEM{" "}
            </h4>
          )}
          <button
            onClick={toggleSidebar}
            className="btn btn-light btn-sm rounded-circle"
            style={{ width: "40px", height: "40px" }}
          >
            {sidebarOpen || isMobile ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        <nav className="flex-grow-1 py-3 overflow-auto">
          <ul className="nav flex-column gap-1 px-2">
            {navList}

            {showProjectActions && (
              <>
                <li className="nav-item">
                  <button
                    onClick={toggleProjectActions}
                    className={`nav-link d-flex align-items-center gap-3 rounded-3 px-3 py-2 w-100 border-0 bg-transparent ${
                      isProjectActionsPath ? "bg-primary bg-opacity-10 text-primary" : "text-secondary"
                    }`}
                    style={{ transition: "all 0.2s", whiteSpace: "nowrap", textAlign: "left" }}
                  >
                    <FiFileText size={20} />
                    {showLabels && (
                      <>
                        <span className="fw-medium flex-grow-1">{t("nav.projectActions")}</span>
                        <FiChevronDown
                          size={16}
                          style={{
                            transition: "transform 0.3s",
                            transform: projectActionsExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        />
                      </>
                    )}
                  </button>
                </li>

                {showLabels && projectActionsExpanded && (
                  <div style={{ paddingLeft: "20px" }}>
                    {projectActionsSubItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = location.pathname === sub.path;
                      return (
                        <li key={sub.path} className="nav-item">
                          <Link
                            to={sub.path}
                            onClick={closeSidebarOnMobile}
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
                    {showLabels && (
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

                {showLabels && adminIsExpanded && (
                  <div style={{ paddingLeft: "20px" }}>
                    {adminSubItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = location.pathname === sub.path;
                      return (
                        <li key={sub.path} className="nav-item">
                          <Link
                            to={sub.path}
                            onClick={closeSidebarOnMobile}
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
          {showLabels && (
            <div className="mb-3">
              <LanguageSelector />
            </div>
          )}

          <div
            className={`d-flex align-items-center cursor-pointer ${showLabels ? "gap-3" : "justify-content-center"}`}
            onClick={() => setUserMenuOpen(prev => !prev)}
            style={{ cursor: 'pointer' }}
          >
            <UserAvatar username={user?.username} />
            {showLabels && (
              <>
                <div className="flex-grow-1 overflow-hidden">
                  <p className="mb-0 fw-medium text-dark text-truncate">
                    {user?.username}
                  </p>
                  <p className="mb-0 small text-muted text-truncate">
                    {user?.email}
                  </p>
                </div>
                <FiChevronDown size={14} className="text-muted" style={{ transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              </>
            )}
          </div>
          {userMenuOpen && (
            <>
              <Link
                to="/change-password"
                onClick={closeSidebarOnMobile}
                className={`btn btn-outline-secondary w-100 mt-2 d-flex align-items-center gap-2 ${
                  showLabels ? "" : "justify-content-center"
                }`}
              >
                <FiLock size={18} />
                {showLabels && <span>{t("changePassword.title")}</span>}
              </Link>
              <button
                onClick={handleLogout}
                className={`btn btn-outline-danger w-100 mt-2 d-flex align-items-center gap-2 ${
                  showLabels ? "" : "justify-content-center"
                }`}
              >
                <FiLogOut size={18} />
                {showLabels && <span>{t("auth.logout")}</span>}
              </button>
            </>
          )}
        </div>
      </aside>

      <main className={`flex-grow-1 overflow-auto ${isMobile ? "mobile-main" : ""}`}>
        <div className={`container-fluid ${isMobile ? "p-2 pt-3" : "p-4"}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default memo(Layout);
