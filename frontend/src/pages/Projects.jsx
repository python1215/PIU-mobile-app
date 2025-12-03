import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch } from 'react-icons/fi';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 mx-4">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          {project ? 'Edit Project' : 'Add New Project'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project ID
            </label>
            <input
              type="text"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="input-field"
              placeholder="e.g., PRJ-001"
              required
              disabled={!!project}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="input-field"
              placeholder="Enter project name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Funding Amount
            </label>
            <input
              type="number"
              value={formData.funding}
              onChange={(e) => setFormData({ ...formData, funding: e.target.value })}
              className="input-field"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effectiveness Date
              </label>
              <input
                type="date"
                value={formData.effectivenessDate || ''}
                onChange={(e) => setFormData({ ...formData, effectivenessDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Closure Date
              </label>
              <input
                type="date"
                value={formData.closureDate || ''}
                onChange={(e) => setFormData({ ...formData, closureDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {project ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your project portfolio</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Project
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="input-field pl-10"
        />
      </div>

      {/* Projects Table */}
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
                  <th className="table-header">Project ID</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Funding</th>
                  <th className="table-header">Effectiveness Date</th>
                  <th className="table-header">Closure Date</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.projectId} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="table-cell font-medium">{project.projectId}</td>
                    <td className="table-cell">{project.project}</td>
                    <td className="table-cell">
                      {project.currency?.currency} {project.funding?.toLocaleString()}
                    </td>
                    <td className="table-cell">{project.effectivenessDate || '-'}</td>
                    <td className="table-cell">{project.closureDate || '-'}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <Link
                          to={`/projects/${project.projectId}`}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        >
                          <FiEye size={18} />
                        </Link>
                        <button
                          onClick={() => setEditingProject(project)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this project?')) {
                              deleteMutation.mutate(project.projectId);
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
            {filteredProjects.length === 0 && (
              <p className="text-center text-gray-500 py-8">No projects found</p>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
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
