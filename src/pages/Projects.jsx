import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiX } from 'react-icons/fi';

function ProjectModal({ project, onClose, onSave }) {
  const [formData, setFormData] = useState(
    project || {
      projectId: '',
      project: '',
      funding: '',
      effectivenessDate: '',
      closureDate: '',
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              {project ? 'Edit Project' : 'Add New Project'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-medium">Project ID</label>
                <input
                  type="text"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="form-control"
                  placeholder="e.g., PRJ-001"
                  required
                  disabled={!!project}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">Project Name</label>
                <input
                  type="text"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className="form-control"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">Funding Amount</label>
                <input
                  type="number"
                  value={formData.funding}
                  onChange={(e) => setFormData({ ...formData, funding: e.target.value })}
                  className="form-control"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label fw-medium">Effectiveness Date</label>
                  <input
                    type="date"
                    value={formData.effectivenessDate || ''}
                    onChange={(e) => setFormData({ ...formData, effectivenessDate: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-medium">Closure Date</label>
                  <input
                    type="date"
                    value={formData.closureDate || ''}
                    onChange={(e) => setFormData({ ...formData, closureDate: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer border-0 pt-0">
              <button type="button" onClick={onClose} className="btn btn-outline-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {project ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Projects() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectAPI.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => projectAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      toast.success('Project created successfully');
      setModalOpen(false);
    },
    onError: () => toast.error('Failed to create project'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => projectAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      toast.success('Project updated successfully');
      setEditingProject(null);
    },
    onError: () => toast.error('Failed to update project'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => projectAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      toast.success('Project deleted successfully');
    },
    onError: () => toast.error('Failed to delete project'),
  });

  const filteredProjects = projects.filter(
    (p) =>
      p.project?.toLowerCase().includes(search.toLowerCase()) ||
      p.projectId?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data) => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.projectId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">Projects</h1>
          <p className="text-muted mb-0">Manage your project portfolio</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary d-flex align-items-center gap-2">
          <FiPlus /> Add Project
        </button>
      </div>

      <div className="mb-4">
        <div className="input-group" style={{ maxWidth: '400px' }}>
          <span className="input-group-text bg-white border-end-0">
            <FiSearch className="text-muted" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="form-control border-start-0"
          />
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
                    <th className="border-0 px-4 py-3">Project ID</th>
                    <th className="border-0 px-4 py-3">Name</th>
                    <th className="border-0 px-4 py-3">Funding</th>
                    <th className="border-0 px-4 py-3">Effectiveness Date</th>
                    <th className="border-0 px-4 py-3">Closure Date</th>
                    <th className="border-0 px-4 py-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.projectId}>
                      <td className="px-4 py-3 fw-medium">{project.projectId}</td>
                      <td className="px-4 py-3">{project.project}</td>
                      <td className="px-4 py-3">
                        {project.currency?.currency} {project.funding?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{project.effectivenessDate || '-'}</td>
                      <td className="px-4 py-3">{project.closureDate || '-'}</td>
                      <td className="px-4 py-3 text-end">
                        <div className="btn-group">
                          <Link
                            to={`/projects/${project.projectId}`}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            <FiEye size={16} />
                          </Link>
                          <button
                            onClick={() => setEditingProject(project)}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this project?')) {
                                deleteMutation.mutate(project.projectId);
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
              {filteredProjects.length === 0 && (
                <p className="text-center text-muted py-5 mb-0">No projects found</p>
              )}
            </div>
          )}
        </div>
      </div>

      {(modalOpen || editingProject) && (
        <ProjectModal
          project={editingProject}
          onClose={() => {
            setModalOpen(false);
            setEditingProject(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default Projects;
