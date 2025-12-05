import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';

function IssueModal({ issue, onClose, onSave }) {
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
              {issue ? 'Edit Issue' : 'Add New Issue'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-medium">Issue Code</label>
                <input
                  type="text"
                  value={formData.issueCode}
                  onChange={(e) => setFormData({ ...formData, issueCode: e.target.value })}
                  className="form-control"
                  placeholder="e.g., ISS-001"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">Description</label>
                <textarea
                  value={formData.descriptionOfIssueOrAction}
                  onChange={(e) => setFormData({ ...formData, descriptionOfIssueOrAction: e.target.value })}
                  className="form-control"
                  rows={3}
                  placeholder="Describe the issue or action"
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="incomplete">Incomplete</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="form-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">Assigned To</label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="form-control"
                  placeholder="Username"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="form-control"
                  rows={2}
                  placeholder="Additional remarks"
                />
              </div>
            </div>

            <div className="modal-footer border-0 pt-0">
              <button type="button" onClick={onClose} className="btn btn-outline-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {issue ? 'Update' : 'Create'}
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
      toast.success('Issue created successfully');
      setModalOpen(false);
    },
    onError: () => toast.error('Failed to create issue'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => issueAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['issues']);
      toast.success('Issue updated successfully');
      setEditingIssue(null);
    },
    onError: () => toast.error('Failed to update issue'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => issueAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['issues']);
      toast.success('Issue deleted successfully');
    },
    onError: () => toast.error('Failed to delete issue'),
  });

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.issueCode?.toLowerCase().includes(search.toLowerCase()) ||
      issue.descriptionOfIssueOrAction?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSave = (data) => {
    if (editingIssue) {
      updateMutation.mutate({ id: editingIssue.issueId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      critical: 'bg-danger',
      high: 'bg-warning text-dark',
      medium: 'bg-primary',
      low: 'bg-secondary',
    };
    return badges[priority] || badges.medium;
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">{t('issues.title')}</h1>
          <p className="text-muted mb-0">{t('issues.subtitle')}</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary d-flex align-items-center gap-2">
          <FiPlus /> {t('issues.addIssue')}
        </button>
      </div>

      <div className="d-flex flex-column flex-md-row gap-3 mb-4">
        <div className="input-group" style={{ maxWidth: '400px' }}>
          <span className="input-group-text bg-white border-end-0">
            <FiSearch className="text-muted" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('table.search')}
            className="form-control border-start-0"
          />
        </div>
        <div className="d-flex align-items-center gap-2">
          <FiFilter className="text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="all">All Status</option>
            <option value="incomplete">Incomplete</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 px-4 py-3">Issue Code</th>
                    <th className="border-0 px-4 py-3">Description</th>
                    <th className="border-0 px-4 py-3">Status</th>
                    <th className="border-0 px-4 py-3">Priority</th>
                    <th className="border-0 px-4 py-3">Assigned To</th>
                    <th className="border-0 px-4 py-3">Due Date</th>
                    <th className="border-0 px-4 py-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue) => (
                    <tr key={issue.issueId}>
                      <td className="px-4 py-3 fw-medium">{issue.issueCode}</td>
                      <td className="px-4 py-3" style={{ maxWidth: '250px' }}>
                        <span className="text-truncate d-block">{issue.descriptionOfIssueOrAction}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${issue.status === 'complete' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${getPriorityBadge(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">{issue.assignedTo || '-'}</td>
                      <td className="px-4 py-3">{issue.dueDate || '-'}</td>
                      <td className="px-4 py-3 text-end">
                        <div className="btn-group">
                          <button
                            onClick={() => setEditingIssue(issue)}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this issue?')) {
                                deleteMutation.mutate(issue.issueId);
                              }
                            }}
                            className="btn btn-sm btn-outline-danger"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredIssues.length === 0 && (
                <p className="text-center text-muted py-5 mb-0">No issues found</p>
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
        />
      )}
    </div>
  );
}

export default Issues;
