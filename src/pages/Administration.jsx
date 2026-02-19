import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiShield, FiX, FiCheck, FiUserCheck, FiChevronDown, FiChevronRight } from 'react-icons/fi';
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
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: {} });
  const [expandedRoles, setExpandedRoles] = useState({});

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1"><FiShield className="me-2" />{t('admin.title')}</h2>
          <p className="text-muted mb-0">{t('admin.subtitle')}</p>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}>
            <FiShield className="me-2" />{t('admin.roles')}
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <FiUsers className="me-2" />{t('admin.userAssignment')}
          </button>
        </li>
      </ul>

      {activeTab === 'roles' && (
        <div>
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-primary" onClick={openNewRole}>
              <FiPlus className="me-2" />{t('admin.addRole')}
            </button>
          </div>

          {roles.length === 0 ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <FiShield size={48} className="text-muted mb-3" />
                <h5 className="text-muted">{t('admin.noRoles')}</h5>
                <p className="text-muted">{t('admin.noRolesDesc')}</p>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {roles.map(role => (
                <div key={role.id} className="col-12">
                  <div className="card border-0 shadow-sm">
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

      {activeTab === 'users' && (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3">{t('common.username')}</th>
                    <th className="px-4 py-3">{t('common.email')}</th>
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
        </div>
      )}

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
