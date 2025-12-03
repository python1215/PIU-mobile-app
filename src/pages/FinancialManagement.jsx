import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiLayers, FiFolder, FiEye, FiSearch, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

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

function FinancialManagement() {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [components, setComponents] = useState([]);
  const [subcomponents, setSubcomponents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [pdos, setPdos] = useState([]);
  const [outcomes, setOutcomes] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingProject, setEditingProject] = useState(null);
  const [projectSearch, setProjectSearch] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadFinancialData();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
      if (res.data.length > 0) {
        setSelectedProject(res.data[0].projectId);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const [compRes, subRes, actRes, pdoRes, outRes] = await Promise.all([
        axios.get(`/api/financial/components/project/${selectedProject}`).catch(() => ({ data: [] })),
        axios.get(`/api/financial/subcomponents`).catch(() => ({ data: [] })),
        axios.get(`/api/financial/activities/project/${selectedProject}`).catch(() => ({ data: [] })),
        axios.get(`/api/financial/pdos/project/${selectedProject}`).catch(() => ({ data: [] })),
        axios.get(`/api/financial/outcomes`).catch(() => ({ data: [] }))
      ]);
      setComponents(compRes.data);
      setSubcomponents(subRes.data);
      setActivities(actRes.data);
      setPdos(pdoRes.data);
      setOutcomes(outRes.data);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'projects', label: 'Projects', icon: FiFolder },
    { id: 'components', label: 'Components', icon: FiLayers },
    { id: 'subcomponents', label: 'Subcomponents', icon: FiLayers },
    { id: 'activities', label: 'Activities', icon: FiDollarSign },
    { id: 'pdos', label: 'PDO Statements', icon: FiDollarSign },
    { id: 'outcomes', label: 'Outcomes', icon: FiDollarSign }
  ];

  const handleCreateProject = async (data) => {
    try {
      await axios.post('/api/projects', data);
      toast.success('Project created successfully');
      setShowModal(false);
      loadProjects();
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleUpdateProject = async (data) => {
    try {
      await axios.put(`/api/projects/${editingProject.projectId}`, data);
      toast.success('Project updated successfully');
      setEditingProject(null);
      loadProjects();
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`/api/projects/${projectId}`);
        toast.success('Project deleted successfully');
        loadProjects();
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const handleProjectSave = (data) => {
    if (editingProject) {
      handleUpdateProject(data);
    } else {
      handleCreateProject(data);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.project?.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.projectId?.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(amount || 0);
  };

  const getTotalAllocation = () => {
    return components.reduce((sum, c) => sum + (parseFloat(c.allocation) || 0), 0);
  };

  const renderProjectsTable = () => {
    if (loading) {
      return <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>;
    }

    return (
      <div>
        <div className="mb-4">
          <div className="input-group" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white border-end-0">
              <FiSearch className="text-muted" />
            </span>
            <input
              type="text"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              placeholder="Search projects..."
              className="form-control border-start-0"
            />
          </div>
        </div>
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
                        onClick={() => handleDeleteProject(project.projectId)}
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
      </div>
    );
  };

  const renderTable = () => {
    if (loading) {
      return <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>;
    }

    const data = activeTab === 'components' ? components :
                 activeTab === 'subcomponents' ? subcomponents :
                 activeTab === 'activities' ? activities :
                 activeTab === 'pdos' ? pdos : outcomes;

    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              {activeTab === 'components' && <><th>ID</th><th>Component Name</th><th>Description</th><th className="text-end">Allocation</th></>}
              {activeTab === 'subcomponents' && <><th>ID</th><th>Subcomponent</th><th>Description</th><th className="text-end">Allocation</th></>}
              {activeTab === 'activities' && <><th>ID</th><th>Activity</th><th className="text-end">Allocation</th></>}
              {activeTab === 'pdos' && <><th>ID</th><th>PDO Statement</th></>}
              {activeTab === 'outcomes' && <><th>ID</th><th>Project Outcome</th></>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan="5" className="text-center text-muted">No data available</td></tr>
            ) : (
              data.map((item, index) => (
                <tr key={index}>
                  {activeTab === 'components' && (
                    <><td>{item.compId}</td><td>{item.projectComponents}</td><td>{item.componentDescription}</td><td className="text-end">{formatCurrency(item.allocation)}</td></>
                  )}
                  {activeTab === 'subcomponents' && (
                    <><td>{item.subcompId}</td><td>{item.subcomponent}</td><td>{item.subcomponentDescription}</td><td className="text-end">{formatCurrency(item.allocation)}</td></>
                  )}
                  {activeTab === 'activities' && (
                    <><td>{item.activityId}</td><td>{item.activity}</td><td className="text-end">{formatCurrency(item.allocation)}</td></>
                  )}
                  {activeTab === 'pdos' && (
                    <><td>{item.id}</td><td>{item.pdoStatement}</td></>
                  )}
                  {activeTab === 'outcomes' && (
                    <><td>{item.id}</td><td>{item.projectOutcome}</td></>
                  )}
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1"><FiEdit2 /></button>
                    <button className="btn btn-sm btn-outline-danger"><FiTrash2 /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {(activeTab === 'components' || activeTab === 'subcomponents' || activeTab === 'activities') && data.length > 0 && (
            <tfoot className="table-secondary">
              <tr>
                <td colSpan={activeTab === 'activities' ? 2 : 3} className="fw-bold">Total</td>
                <td className="text-end fw-bold">{formatCurrency(data.reduce((sum, item) => sum + (parseFloat(item.allocation) || 0), 0))}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    );
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Financial Management</h2>
        <div className="d-flex gap-3">
          {activeTab !== 'projects' && (
            <select className="form-select" value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ width: '250px' }}>
              {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
            </select>
          )}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus className="me-2" /> Add New
          </button>
        </div>
      </div>

      {activeTab !== 'projects' && (
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h6>Total Components</h6>
                <h3>{components.length}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h6>Total Allocation</h6>
                <h3>${formatCurrency(getTotalAllocation())}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h6>Total Activities</h6>
                <h3>{activities.length}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      <ul className="nav nav-tabs mb-4">
        {tabs.map(tab => (
          <li className="nav-item" key={tab.id}>
            <button 
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="me-2" />
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="card">
        <div className="card-body">
          {activeTab === 'projects' ? renderProjectsTable() : renderTable()}
        </div>
      </div>

      {(showModal || editingProject) && activeTab === 'projects' && (
        <ProjectModal
          project={editingProject}
          onClose={() => {
            setShowModal(false);
            setEditingProject(null);
          }}
          onSave={handleProjectSave}
        />
      )}
    </div>
  );
}

export default FinancialManagement;
