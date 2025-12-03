import { useState } from 'react';
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          {issue ? 'Edit Issue' : 'Add New Issue'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Code
            </label>
            <input
              type="text"
              value={formData.issueCode}
              onChange={(e) => setFormData({ ...formData, issueCode: e.target.value })}
              className="input-field"
              placeholder="e.g., ISS-001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.descriptionOfIssueOrAction}
              onChange={(e) => setFormData({ ...formData, descriptionOfIssueOrAction: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Describe the issue or action"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="incomplete">Incomplete</option>
                <option value="complete">Complete</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To
            </label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="input-field"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="Additional remarks"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {issue ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Issues() {
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

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-blue-100 text-blue-700',
      low: 'bg-gray-100 text-gray-700',
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Issues & Actions</h1>
          <p className="text-gray-500 mt-1">Track and manage project issues</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Issue
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Status</option>
            <option value="incomplete">Incomplete</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Issue Code</th>
                  <th className="table-header">Description</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Priority</th>
                  <th className="table-header">Assigned To</th>
                  <th className="table-header">Due Date</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => (
                  <tr key={issue.issueId} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="table-cell font-medium">{issue.issueCode}</td>
                    <td className="table-cell max-w-xs truncate">
                      {issue.descriptionOfIssueOrAction}
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        issue.status === 'complete'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="table-cell">{issue.assignedTo || '-'}</td>
                    <td className="table-cell">{issue.dueDate || '-'}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingIssue(issue)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this issue?')) {
                              deleteMutation.mutate(issue.issueId);
                            }
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredIssues.length === 0 && (
              <p className="text-center text-gray-500 py-8">No issues found</p>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
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
