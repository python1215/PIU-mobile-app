import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiShield, FiX, FiCheck, FiUserCheck, FiUserPlus, FiChevronDown, FiChevronRight, FiActivity, FiClock, FiRefreshCw } from 'react-icons/fi';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const MODULE_KEYS = [
  'dashboard', 'systemSetup', 'financialManagement', 'monitoring',
  'projectActions', 'socialEnvironmental', 'documentation',
  'projectMap', 'issues', 'kpi', 'administration'
];

const MODULE_LABEL_MAP = {
  dashboard: 'nav.dashboard',
  systemSetup: 'nav.systemSetup',
  financialManagement: 'nav.financialManagement',
  monitoring: 'nav.monitoring',
  projectActions: 'nav.projectActions',
  socialEnvironmental: 'nav.socialEnvironmental',
  documentation: 'nav.documentation',
  projectMap: 'nav.projectMap',
  issues: 'nav.issues',
  kpi: 'nav.kpi',
  administration: 'admin.title'
};

function Administration() {
  const { t } = useTranslation();
  const [openAccordion, setOpenAccordion] = useState(null);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: {} });
  const [expandedRoles, setExpandedRoles] = useState({});
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '', department: '' });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState({ users: [], totalConnected: 0, activeCount: 0, idleCount: 0 });
  const [connectedLoading, setConnectedLoading] = useState(false);
  const refreshIntervalRef = useRef(null);

  const loadConnectedUsers = useCallback(async () => {
    try {
      setConnectedLoading(true);
      const res = await axios.get('/api/admin/connected-users');
      setConnectedUsers(res.data);
    } catch (err) {
      console.error('Error loading connected users:', err);
    } finally {
      setConnectedLoading(false);
    }
  }, []);

  const loadRoles = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/roles');
      setRoles(res.data);
    } catch (err) {
      console.error('Error loading roles:', err);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadRoles(), loadUsers()]).finally(() => setLoading(false));
  }, [loadRoles, loadUsers]);

  const toggleAccordion = useCallback((section) => {
    setOpenAccordion(prev => prev === section ? null : section);
  }, []);

  useEffect(() => {
    if (openAccordion === 'connected') {
      loadConnectedUsers();
      refreshIntervalRef.current = setInterval(loadConnectedUsers, 30000);
    }
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [openAccordion, loadConnectedUsers]);

  const openNewRole = useCallback(() => {
    const perms = {};
    MODULE_KEYS.forEach(k => { perms[k] = false; });
    perms.dashboard = true;
    setRoleForm({ name: '', description: '', permissions: perms });
    setEditingRole(null);
    setShowRoleModal(true);
  }, []);

  const openEditRole = useCallback((role) => {
    setRoleForm({
      name: role.name,
      description: role.description || '',
      permissions: { ...role.permissions }
    });
    setEditingRole(role);
    setShowRoleModal(true);
  }, []);

  const handleSaveRole = useCallback(async () => {
    if (!roleForm.name.trim()) {
      toast.error(t('admin.roleNameRequired'));
      return;
    }
    try {
      if (editingRole) {
        await axios.put(`/api/admin/roles/${editingRole.id}`, roleForm);
        toast.success(t('messages.updateSuccess'));
      } else {
        await axios.post('/api/admin/roles', roleForm);
        toast.success(t('messages.createSuccess'));
      }
      setShowRoleModal(false);
      loadRoles();
    } catch (err) {
      toast.error(err.response?.data?.error || t('messages.error'));
    }
  }, [roleForm, editingRole, loadRoles, t]);

  const handleDeleteRole = useCallback(async (roleId) => {
    if (!confirm(t('messages.confirmDelete'))) return;
    try {
      await axios.delete(`/api/admin/roles/${roleId}`);
      toast.success(t('messages.deleteSuccess'));
      loadRoles();
    } catch (err) {
      toast.error(t('messages.error'));
    }
  }, [loadRoles, t]);

  const handleAssignRole = useCallback(async (userId, roleId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { roleId: roleId || null });
      toast.success(t('messages.updateSuccess'));
      loadUsers();
    } catch (err) {
      toast.error(t('messages.error'));
    }
  }, [loadUsers, t]);

  const togglePermission = useCallback((moduleKey, value) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [moduleKey]: value }
    }));
  }, []);

  const toggleRoleExpand = useCallback((roleId) => {
    setExpandedRoles(prev => ({ ...prev, [roleId]: !prev[roleId] }));
  }, []);

  const handleRegisterUser = useCallback(async (e) => {
    e.preventDefault();
    if (!registerForm.username.trim() || !registerForm.email.trim() || !registerForm.password.trim()) {
      toast.error(t('admin.registerFieldsRequired'));
      return;
    }
    setRegisterLoading(true);
    try {
      await authAPI.register(registerForm);
      toast.success(t('admin.registerUserSuccess'));
      setRegisterForm({ username: '', email: '', password: '', firstName: '', lastName: '', department: '' });
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.registerUserFailed'));
    } finally {
      setRegisterLoading(false);
    }
  }, [registerForm, loadUsers, t]);

  const selectAll = useCallback((value) => {
    setRoleForm(prev => {
      const perms = {};
      MODULE_KEYS.forEach(k => { perms[k] = value; });
      return { ...prev, permissions: perms };
    });
  }, []);

  if (loading) {
    return <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="fw-bold mb-1"><FiShield className="me-2" />{t('admin.title')}</h2>
        <p className="text-muted mb-0">{t('admin.subtitle')}</p>
      </div>

      <div>

        <div className="card border-0 shadow-sm mb-3 rounded-3">
          <div
            className="card-header bg-white d-flex justify-content-between align-items-center py-3 px-4 rounded-3"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleAccordion('roles')}
          >
            <div className="d-flex align-items-center gap-2">
              <FiShield size={18} className="text-muted" />
              <span className="fw-bold">{t('admin.roles')}</span>
              <span className="badge bg-primary bg-opacity-10 text-primary ms-1">{roles.length}</span>
            </div>
            <FiChevronDown
              size={18}
              className="text-muted"
              style={{ transition: 'transform 0.3s', transform: openAccordion === 'roles' ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </div>
          {openAccordion === 'roles' && (
            <div className="card-body border-top px-4 py-3">
              <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary" onClick={openNewRole}>
                  <FiPlus className="me-2" />{t('admin.addRole')}
                </button>
              </div>

              {roles.length === 0 ? (
                <div className="text-center py-5">
                  <FiShield size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">{t('admin.noRoles')}</h5>
                  <p className="text-muted">{t('admin.noRolesDesc')}</p>
                </div>
              ) : (
                <div className="row g-3">
                  {roles.map(role => (
                    <div key={role.id} className="col-12">
                      <div className="card border shadow-sm">
                        <div
                          className="card-header bg-white d-flex justify-content-between align-items-center py-3"
                          style={{ cursor: 'pointer' }}
                          onClick={() => toggleRoleExpand(role.id)}
                        >
                          <div className="d-flex align-items-center gap-2">
                            {expandedRoles[role.id] ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                            <div>
                              <h6 className="mb-0 fw-bold">{role.name}</h6>
                              {role.description && <small className="text-muted">{role.description}</small>}
                            </div>
                          </div>
                          <div className="d-flex gap-2 align-items-center" onClick={(e) => e.stopPropagation()}>
                            <span className="badge bg-primary bg-opacity-10 text-primary">
                              <FiUsers className="me-1" />{role.userCount} {t('admin.users')}
                            </span>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => openEditRole(role)}>
                              <FiEdit2 size={14} />
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRole(role.id)}>
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {expandedRoles[role.id] && (
                          <div className="card-body p-0">
                            <div className="table-responsive">
                              <table className="table table-sm mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th className="px-3 py-2" style={{ width: '40%' }}>{t('admin.module')}</th>
                                    <th className="px-3 py-2 text-center" style={{ width: '30%' }}>{t('admin.accessGranted')}</th>
                                    <th className="px-3 py-2 text-center" style={{ width: '30%' }}>{t('admin.accessDenied')}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {MODULE_KEYS.map(moduleKey => (
                                    <tr key={moduleKey}>
                                      <td className="px-3 py-2 fw-medium">{t(MODULE_LABEL_MAP[moduleKey])}</td>
                                      <td className="px-3 py-2 text-center">
                                        {role.permissions[moduleKey] ? (
                                          <span className="badge bg-success bg-opacity-10 text-success"><FiCheck size={14} /> {t('common.yes')}</span>
                                        ) : null}
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        {!role.permissions[moduleKey] ? (
                                          <span className="badge bg-danger bg-opacity-10 text-danger"><FiX size={14} /> {t('common.no')}</span>
                                        ) : null}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card border-0 shadow-sm mb-3 rounded-3">
          <div
            className="card-header bg-white d-flex justify-content-between align-items-center py-3 px-4 rounded-3"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleAccordion('users')}
          >
            <div className="d-flex align-items-center gap-2">
              <FiUsers size={18} className="text-muted" />
              <span className="fw-bold">{t('admin.userAssignment')}</span>
              <span className="badge bg-primary bg-opacity-10 text-primary ms-1">{users.length}</span>
            </div>
            <FiChevronDown
              size={18}
              className="text-muted"
              style={{ transition: 'transform 0.3s', transform: openAccordion === 'users' ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </div>
          {openAccordion === 'users' && (
            <div className="card-body border-top p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3">{t('admin.username')}</th>
                      <th className="px-4 py-3">{t('admin.email')}</th>
                      <th className="px-4 py-3">{t('admin.fullName')}</th>
                      <th className="px-4 py-3">{t('admin.department')}</th>
                      <th className="px-4 py-3">{t('admin.superuser')}</th>
                      <th className="px-4 py-3">{t('admin.assignedRole')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="px-4 py-3 fw-medium">{user.username}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">{[user.firstName, user.lastName].filter(Boolean).join(' ') || '-'}</td>
                        <td className="px-4 py-3">{user.department || '-'}</td>
                        <td className="px-4 py-3">
                          {user.isSuperuser ? (
                            <span className="badge bg-warning bg-opacity-10 text-warning">{t('admin.superuser')}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {user.isSuperuser ? (
                            <span className="text-muted fst-italic">{t('admin.allAccess')}</span>
                          ) : (
                            <select
                              className="form-select form-select-sm"
                              value={user.roleId || ''}
                              onChange={(e) => handleAssignRole(user.id, e.target.value ? parseInt(e.target.value) : null)}
                              style={{ width: '180px' }}
                            >
                              <option value="">{t('admin.noRole')}</option>
                              {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <p className="text-center text-muted py-5">{t('table.noData')}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="card border-0 shadow-sm mb-3 rounded-3">
          <div
            className="card-header bg-white d-flex justify-content-between align-items-center py-3 px-4 rounded-3"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleAccordion('register')}
          >
            <div className="d-flex align-items-center gap-2">
              <FiUserPlus size={18} className="text-muted" />
              <span className="fw-bold">{t('admin.registerUser')}</span>
            </div>
            <FiChevronDown
              size={18}
              className="text-muted"
              style={{ transition: 'transform 0.3s', transform: openAccordion === 'register' ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </div>
          {openAccordion === 'register' && (
            <div className="card-body border-top px-4 py-3">
              <form onSubmit={handleRegisterUser}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">{t('admin.firstName')}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={registerForm.firstName}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder={t('admin.firstName')}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">{t('admin.lastName')}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder={t('admin.lastName')}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">{t('admin.username')} <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder={t('admin.enterUsername')}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">{t('admin.email')} <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className="form-control"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder={t('admin.enterEmail')}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">{t('admin.password')} <span className="text-danger">*</span></label>
                    <input
                      type="password"
                      className="form-control"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder={t('admin.enterPassword')}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">{t('admin.department')}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={registerForm.department}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, department: e.target.value }))}
                      placeholder={t('admin.enterDepartment')}
                    />
                  </div>
                </div>
                <div className="d-flex gap-2 mt-4">
                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="btn btn-primary d-flex align-items-center gap-2"
                  >
                    {registerLoading ? (
                      <>
                        <div className="spinner-border spinner-border-sm" role="status"></div>
                        <span>{t('admin.registering')}</span>
                      </>
                    ) : (
                      <>
                        <FiUserPlus size={18} />
                        <span>{t('admin.registerUser')}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="reset"
                    className="btn btn-outline-secondary"
                    onClick={() => setRegisterForm({ username: '', email: '', password: '', firstName: '', lastName: '', department: '' })}
                  >
                    {t('common.clear')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="card border-0 shadow-sm mb-3 rounded-3">
          <div
            className="card-header bg-white d-flex justify-content-between align-items-center py-3 px-4 rounded-3"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleAccordion('connected')}
          >
            <div className="d-flex align-items-center gap-2">
              <FiActivity size={18} className="text-muted" />
              <span className="fw-bold">{t('admin.connectedUsers')}</span>
              {connectedUsers.totalConnected > 0 && (
                <span className="badge bg-success ms-1">{connectedUsers.totalConnected}</span>
              )}
            </div>
            <FiChevronDown
              size={18}
              className="text-muted"
              style={{ transition: 'transform 0.3s', transform: openAccordion === 'connected' ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </div>
          {openAccordion === 'connected' && (
            <div className="card-body border-top px-4 py-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex gap-3 flex-wrap">
                  <div className="card border shadow-sm px-3 py-2">
                    <div className="d-flex align-items-center gap-2">
                      <FiUsers className="text-primary" />
                      <div>
                        <small className="text-muted d-block">{t('admin.totalConnected')}</small>
                        <strong className="fs-5">{connectedUsers.totalConnected}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="card border shadow-sm px-3 py-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="rounded-circle d-inline-block" style={{ width: 10, height: 10, backgroundColor: '#22c55e' }}></span>
                      <div>
                        <small className="text-muted d-block">{t('admin.activeNow')}</small>
                        <strong className="fs-5 text-success">{connectedUsers.activeCount}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="card border shadow-sm px-3 py-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="rounded-circle d-inline-block" style={{ width: 10, height: 10, backgroundColor: '#f59e0b' }}></span>
                      <div>
                        <small className="text-muted d-block">{t('admin.idleUsers')}</small>
                        <strong className="fs-5 text-warning">{connectedUsers.idleCount}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="btn btn-outline-primary btn-sm" onClick={loadConnectedUsers} disabled={connectedLoading}>
                  <FiRefreshCw className={`me-1 ${connectedLoading ? 'spin-animation' : ''}`} size={14} />
                  {t('common.refresh')}
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3">{t('admin.statusLabel')}</th>
                      <th className="px-4 py-3">{t('admin.username')}</th>
                      <th className="px-4 py-3">{t('admin.fullName')}</th>
                      <th className="px-4 py-3">{t('admin.email')}</th>
                      <th className="px-4 py-3">{t('admin.department')}</th>
                      <th className="px-4 py-3">{t('admin.assignedRole')}</th>
                      <th className="px-4 py-3">{t('admin.lastActivityTime')}</th>
                      <th className="px-4 py-3">{t('admin.lastLoginTime')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {connectedUsers.users.map(user => {
                      const isActive = user.status === 'active';
                      return (
                        <tr key={user.id}>
                          <td className="px-4 py-3">
                            <span className={`badge ${isActive ? 'bg-success' : 'bg-warning'} bg-opacity-10 ${isActive ? 'text-success' : 'text-warning'}`}>
                              <span className="rounded-circle d-inline-block me-1" style={{ width: 8, height: 8, backgroundColor: isActive ? '#22c55e' : '#f59e0b' }}></span>
                              {isActive ? t('admin.active') : t('admin.idle')}
                            </span>
                          </td>
                          <td className="px-4 py-3 fw-medium">{user.username}</td>
                          <td className="px-4 py-3">{[user.firstName, user.lastName].filter(Boolean).join(' ') || '-'}</td>
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3">{user.department || '-'}</td>
                          <td className="px-4 py-3">{user.roleName || '-'}</td>
                          <td className="px-4 py-3">
                            <span className="d-flex align-items-center gap-1">
                              <FiClock size={14} className="text-muted" />
                              {user.lastActivity ? new Date(user.lastActivity).toLocaleString() : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {connectedUsers.users.length === 0 && (
                  <div className="text-center py-5">
                    <FiUsers size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">{t('admin.noConnectedUsers')}</h5>
                    <p className="text-muted">{t('admin.noConnectedUsersDesc')}</p>
                  </div>
                )}
              </div>
              <small className="text-muted mt-2 d-block">
                <FiRefreshCw size={12} className="me-1" />
                {t('admin.autoRefreshNote')}
              </small>
            </div>
          )}
        </div>

      </div>

      {showRoleModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editingRole ? t('admin.editRole') : t('admin.addRole')}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowRoleModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">{t('admin.roleName')}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">{t('common.description')}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={roleForm.description}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0">{t('admin.modulePermissions')}</h6>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-success" onClick={() => selectAll(true)}>{t('admin.grantAll')}</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => selectAll(false)}>{t('admin.revokeAll')}</button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-sm table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="px-3 py-2">{t('admin.module')}</th>
                        <th className="px-3 py-2 text-center">{t('admin.accessGranted')}</th>
                        <th className="px-3 py-2 text-center">{t('admin.accessDenied')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MODULE_KEYS.map(moduleKey => (
                        <tr key={moduleKey} className={roleForm.permissions[moduleKey] ? 'table-success' : ''}>
                          <td className="px-3 py-2 fw-medium">{t(MODULE_LABEL_MAP[moduleKey])}</td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="radio"
                              className="form-check-input"
                              name={`perm-${moduleKey}`}
                              checked={roleForm.permissions[moduleKey] === true}
                              onChange={() => togglePermission(moduleKey, true)}
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="radio"
                              className="form-check-input"
                              name={`perm-${moduleKey}`}
                              checked={roleForm.permissions[moduleKey] === false}
                              onChange={() => togglePermission(moduleKey, false)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-outline-secondary" onClick={() => setShowRoleModal(false)}>
                  {t('common.cancel')}
                </button>
                <button className="btn btn-primary" onClick={handleSaveRole}>
                  {editingRole ? t('common.update') : t('common.create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Administration;
