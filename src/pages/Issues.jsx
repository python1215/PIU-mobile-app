import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';

function IssueModal({ issue, onClose, onSave, t }) {
  const [formData, setFormData] = useState(
    issue || {
      issueCode: '',
      descriptionOfIssueOrAction: '',
      status: 'incomplete',
      priority: 'medium',
      assignedTo: '',
      remarks: '',
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              {issue ? t('issues.editIssue') : t('issues.addIssue')}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-medium">{t('issues.issueNumber')}</label>
                <input
                  type="text"
                  value={formData.issueCode}
                  onChange={(e) => setFormData({ ...formData, issueCode: e.target.value })}
                  className="form-control"
                  placeholder="ISS-001"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">{t('common.description')}</label>
                <textarea
                  value={formData.descriptionOfIssueOrAction}
                  onChange={(e) => setFormData({ ...formData, descriptionOfIssueOrAction: e.target.value })}
                  className="form-control"
                  rows={3}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('common.status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="incomplete">{t('common.incomplete')}</option>
                    <option value="complete">{t('common.complete')}</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('issues.priority')}</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="form-select"
                  >
                    <option value="low">{t('issues.low')}</option>
                    <option value="medium">{t('issues.medium')}</option>
                    <option value="high">{t('issues.high')}</option>
                    <option value="critical">{t('issues.critical')}</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">{t('issues.assignedTo')}</label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">{t('common.remarks')}</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="form-control"
                  rows={2}
                />
              </div>
            </div>

            <div className="modal-footer border-0 pt-0">
              <button type="button" onClick={onClose} className="btn btn-outline-secondary">
                {t('common.cancel')}
              </button>
              <button type="submit" className="btn btn-primary">
                {issue ? t('common.update') : t('common.create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Issues() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const queryClient = useQueryClient();

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const response = await issueAPI.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => issueAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['issues']);
      toast.success(t('messages.createSuccess'));
      setModalOpen(false);
    },
    onError: () => toast.error(t('messages.createError')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => issueAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['issues']);
      toast.success(t('messages.updateSuccess'));
      setEditingIssue(null);
    },
    onError: () => toast.error(t('messages.updateError')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => issueAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['issues']);
      toast.success(t('messages.deleteSuccess'));
    },
    onError: () => toast.error(t('messages.deleteError')),
  });

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.issueCode?.toLowerCase().includes(search.toLowerCase()) ||
      issue.descriptionOfIssueOrAction?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-success',
      medium: 'bg-warning',
      high: 'bg-orange text-dark',
      critical: 'bg-danger',
    };
    const labels = {
      low: t('issues.low'),
      medium: t('issues.medium'),
      high: t('issues.high'),
      critical: t('issues.critical'),
    };
    return <span className={`badge ${colors[priority] || 'bg-secondary'}`}>{labels[priority] || priority}</span>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      incomplete: 'bg-warning text-dark',
      complete: 'bg-success',
    };
    const labels = {
      incomplete: t('common.incomplete'),
      complete: t('common.complete'),
    };
    return <span className={`badge ${colors[status] || 'bg-secondary'}`}>{labels[status] || status}</span>;
  };

  const handleSave = (data) => {
    if (editingIssue) {
      updateMutation.mutate({ id: editingIssue.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm(t('messages.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">{t('issues.title')}</h2>
          <p className="text-muted mb-0">{t('issues.subtitle')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <FiPlus className="me-2" /> {t('issues.addIssue')}
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FiSearch />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control"
                  placeholder={t('common.search')}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FiFilter />
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="all">{t('common.all')}</option>
                  <option value="incomplete">{t('common.incomplete')}</option>
                  <option value="complete">{t('common.complete')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="text-center p-5">
              <div className="spinner-border" role="status"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 px-4 py-3">{t('issues.issueNumber')}</th>
                    <th className="border-0 px-4 py-3">{t('common.description')}</th>
                    <th className="border-0 px-4 py-3">{t('common.status')}</th>
                    <th className="border-0 px-4 py-3">{t('issues.priority')}</th>
                    <th className="border-0 px-4 py-3">{t('issues.assignedTo')}</th>
                    <th className="border-0 px-4 py-3 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td className="px-4 py-3 fw-medium">{issue.issueCode}</td>
                      <td className="px-4 py-3">
                        <div className="text-truncate" style={{ maxWidth: '300px' }}>
                          {issue.descriptionOfIssueOrAction}
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(issue.status)}</td>
                      <td className="px-4 py-3">{getPriorityBadge(issue.priority)}</td>
                      <td className="px-4 py-3">{issue.assignedTo || '-'}</td>
                      <td className="px-4 py-3 text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => setEditingIssue(issue)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(issue.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredIssues.length === 0 && (
                <p className="text-center text-muted py-5 mb-0">{t('table.noData')}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {(modalOpen || editingIssue) && (
        <IssueModal
          issue={editingIssue}
          onClose={() => {
            setModalOpen(false);
            setEditingIssue(null);
          }}
          onSave={handleSave}
          t={t}
        />
      )}
    </div>
  );
}

export default Issues;
