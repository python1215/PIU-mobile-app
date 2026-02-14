import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiLayers, FiFolder, FiEye, FiSearch, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProjectModal = memo(function ProjectModal({ project, onClose, onSave, donors, contributors }) {
  const [formData, setFormData] = useState(() => {
    if (project) {
      return {
        ...project,
        donorIds: project.donors?.map(d => d.donorId) || [],
        contributorIds: project.contributors?.map(c => c.id) || [],
      };
    }
    return {
      projectId: '',
      project: '',
      funding: '',
      effectivenessDate: '',
      closureDate: '',
      donorIds: [],
      contributorIds: [],
    };
  });

  const handleDonorToggle = useCallback((donorId) => {
    setFormData(prev => {
      const currentIds = prev.donorIds || [];
      if (currentIds.includes(donorId)) {
        return { ...prev, donorIds: currentIds.filter(id => id !== donorId) };
      }
      return { ...prev, donorIds: [...currentIds, donorId] };
    });
  }, []);

  const handleContributorToggle = useCallback((contributorId) => {
    setFormData(prev => {
      const currentIds = prev.contributorIds || [];
      if (currentIds.includes(contributorId)) {
        return { ...prev, contributorIds: currentIds.filter(id => id !== contributorId) };
      }
      return { ...prev, contributorIds: [...currentIds, contributorId] };
    });
  }, []);

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSave(formData);
  }, [formData, onSave]);

  const donorList = useMemo(() => donors.map(donor => (
    <div key={donor.donorId} className="form-check">
      <input
        type="checkbox"
        className="form-check-input"
        id={`donor-${donor.donorId}`}
        checked={(formData.donorIds || []).includes(donor.donorId)}
        onChange={() => handleDonorToggle(donor.donorId)}
      />
      <label className="form-check-label" htmlFor={`donor-${donor.donorId}`}>
        {donor.name}
      </label>
    </div>
  )), [donors, formData.donorIds, handleDonorToggle]);

  const contributorList = useMemo(() => contributors.map(contributor => (
    <div key={contributor.id} className="form-check">
      <input
        type="checkbox"
        className="form-check-input"
        id={`contributor-${contributor.id}`}
        checked={(formData.contributorIds || []).includes(contributor.id)}
        onChange={() => handleContributorToggle(contributor.id)}
      />
      <label className="form-check-label" htmlFor={`contributor-${contributor.id}`}>
        {contributor.name}
      </label>
    </div>
  )), [contributors, formData.contributorIds, handleContributorToggle]);

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              {project ? 'Edit Project' : 'Add New Project'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">Project ID</label>
                  <input
                    type="text"
                    value={formData.projectId}
                    onChange={(e) => handleFieldChange('projectId', e.target.value)}
                    className="form-control"
                    placeholder="e.g., PRJ-001"
                    required
                    disabled={!!project}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Project Name</label>
                  <input
                    type="text"
                    value={formData.project}
                    onChange={(e) => handleFieldChange('project', e.target.value)}
                    className="form-control"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-medium">Funding Amount</label>
                  <input
                    type="number"
                    value={formData.funding}
                    onChange={(e) => handleFieldChange('funding', e.target.value)}
                    className="form-control"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-medium">Effectiveness Date</label>
                  <input
                    type="date"
                    value={formData.effectivenessDate || ''}
                    onChange={(e) => handleFieldChange('effectivenessDate', e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-medium">Closure Date</label>
                  <input
                    type="date"
                    value={formData.closureDate || ''}
                    onChange={(e) => handleFieldChange('closureDate', e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Donors (Multi-select)</label>
                  <div className="border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {donors.length === 0 ? (
                      <p className="text-muted small mb-0">No donors available. Add donors in System Setup.</p>
                    ) : donorList}
                  </div>
                  <small className="text-muted">Selected: {(formData.donorIds || []).length}</small>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Contributors (Multi-select)</label>
                  <div className="border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {contributors.length === 0 ? (
                      <p className="text-muted small mb-0">No contributors available. Add contributors in System Setup.</p>
                    ) : contributorList}
                  </div>
                  <small className="text-muted">Selected: {(formData.contributorIds || []).length}</small>
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
});

const ProjectRow = memo(function ProjectRow({ project, onEdit, onDelete }) {
  return (
    <tr>
      <td className="px-4 py-3 fw-medium">{project.projectId}</td>
      <td className="px-4 py-3">{project.project}</td>
      <td className="px-4 py-3">
        {project.donors?.map(d => d.name).join(', ') || '-'}
      </td>
      <td className="px-4 py-3">
        {project.contributors?.map(c => c.name).join(', ') || '-'}
      </td>
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
            onClick={() => onEdit(project)}
            className="btn btn-sm btn-outline-secondary"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(project.projectId)}
            className="btn btn-sm btn-outline-danger"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
});

const DataRow = memo(function DataRow({ item, activeTab, formatCurrency, onEdit, onDelete }) {
  return (
    <tr>
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
  );
});

const TabButton = memo(function TabButton({ tab, isActive, onClick }) {
  const Icon = tab.icon;
  return (
    <li className="nav-item">
      <button 
        className={`nav-link ${isActive ? 'active' : ''}`}
        onClick={onClick}
      >
        <Icon className="me-2" />
        {tab.label}
      </button>
    </li>
  );
});

const StatCard = memo(function StatCard({ title, value, bgClass }) {
  return (
    <div className="col-md-4">
      <div className={`card ${bgClass} text-white`}>
        <div className="card-body">
          <h6>{title}</h6>
          <h3>{value}</h3>
        </div>
      </div>
    </div>
  );
});

function FinancialManagement() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [components, setComponents] = useState([]);
  const [subcomponents, setSubcomponents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [pdos, setPdos] = useState([]);
  const [outcomes, setOutcomes] = useState([]);
  const [donors, setDonors] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [projectSearch, setProjectSearch] = useState('');

  const loadDonorsAndContributors = useCallback(async () => {
    try {
      const [donorRes, contributorRes] = await Promise.all([
        axios.get('/api/donors').catch(() => ({ data: [] })),
        axios.get('/api/setup/contributors').catch(() => ({ data: [] }))
      ]);
      setDonors(donorRes.data);
      setContributors(contributorRes.data);
    } catch (error) {
      console.error('Error loading donors/contributors:', error);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
      if (res.data.length > 0) {
        setSelectedProject(res.data[0].projectId);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFinancialData = useCallback(async () => {
    if (!selectedProject) return;
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
  }, [selectedProject]);

  useEffect(() => {
    loadProjects();
    loadDonorsAndContributors();
  }, [loadProjects, loadDonorsAndContributors]);

  useEffect(() => {
    if (selectedProject) {
      loadFinancialData();
    }
  }, [selectedProject, loadFinancialData]);

  const tabs = useMemo(() => [
    { id: 'projects', label: 'Projects', icon: FiFolder },
    { id: 'components', label: 'Components', icon: FiLayers },
    { id: 'subcomponents', label: 'Subcomponents', icon: FiLayers },
    { id: 'activities', label: 'Activities', icon: FiDollarSign },
    { id: 'pdos', label: t('financial.pdoStatements'), icon: FiDollarSign },
    { id: 'outcomes', label: t('financial.outcomes'), icon: FiDollarSign }
  ], [t]);

  const handleCreateProject = useCallback(async (data) => {
    try {
      await axios.post('/api/projects', data);
      toast.success(t('messages.createSuccess'));
      setShowModal(false);
      loadProjects();
    } catch (error) {
      toast.error(t('messages.createError'));
    }
  }, [loadProjects, t]);

  const handleUpdateProject = useCallback(async (data) => {
    try {
      await axios.put(`/api/projects/${editingProject.projectId}`, data);
      toast.success(t('messages.updateSuccess'));
      setEditingProject(null);
      loadProjects();
    } catch (error) {
      toast.error(t('messages.updateError'));
    }
  }, [editingProject, loadProjects, t]);

  const handleDeleteProject = useCallback(async (projectId) => {
    if (confirm(t('messages.confirmDelete'))) {
      try {
        await axios.delete(`/api/projects/${projectId}`);
        toast.success(t('messages.deleteSuccess'));
        loadProjects();
      } catch (error) {
        toast.error(t('messages.deleteError'));
      }
    }
  }, [loadProjects, t]);

  const handleProjectSave = useCallback((data) => {
    // Ensure essential fields are present, others like contributors are optional
    if (!data.project || !data.projectId) {
      toast.error('Project Name and ID are required');
      return;
    }

    if (editingProject) {
      handleUpdateProject(data);
    } else {
      handleCreateProject(data);
    }
  }, [editingProject, handleUpdateProject, handleCreateProject]);

  const handleComponentSave = useCallback(async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.project = { projectId: selectedProject };
    
    try {
      if (editingItem) {
        await axios.put(`/api/financial/components/${editingItem.compId}`, data);
        toast.success('Component updated successfully');
      } else {
        await axios.post('/api/financial/components', data);
        toast.success('Component created successfully');
      }
      setShowComponentModal(false);
      setEditingItem(null);
      loadFinancialData();
    } catch (error) {
      toast.error('Error saving component');
    }
  }, [selectedProject, editingItem, loadFinancialData]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setShowComponentModal(false);
    setEditingProject(null);
    setEditingItem(null);
  }, []);

  const handleShowModal = useCallback(() => {
    if (activeTab === 'projects') {
      setShowModal(true);
    } else if (activeTab === 'components') {
      setShowComponentModal(true);
    } else {
      toast.error(`Add New for ${activeTab} is coming soon`);
    }
  }, [activeTab]);

  const filteredProjects = useMemo(() => {
    const searchLower = projectSearch.toLowerCase();
    return projects.filter(
      (p) =>
        p.project?.toLowerCase().includes(searchLower) ||
        p.projectId?.toLowerCase().includes(searchLower)
    );
  }, [projects, projectSearch]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(amount || 0);
  }, []);

  const totalAllocation = useMemo(() => {
    return components.reduce((sum, c) => sum + (parseFloat(c.allocation) || 0), 0);
  }, [components]);

  const currentTabData = useMemo(() => {
    switch (activeTab) {
      case 'components': return components;
      case 'subcomponents': return subcomponents;
      case 'activities': return activities;
      case 'pdos': return pdos;
      case 'outcomes': return outcomes;
      default: return [];
    }
  }, [activeTab, components, subcomponents, activities, pdos, outcomes]);

  const dataTotal = useMemo(() => {
    if (!['components', 'subcomponents', 'activities'].includes(activeTab)) return 0;
    return currentTabData.reduce((sum, item) => sum + (parseFloat(item.allocation) || 0), 0);
  }, [activeTab, currentTabData]);

  const projectsTable = useMemo(() => {
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
              onChange={handleSearchChange}
              placeholder={t('common.search')}
              className="form-control border-start-0"
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="border-0 px-4 py-3">{t('projects.projectId')}</th>
                <th className="border-0 px-4 py-3">{t('common.name')}</th>
                <th className="border-0 px-4 py-3">Donor</th>
                <th className="border-0 px-4 py-3">Contributors</th>
                <th className="border-0 px-4 py-3">Funding Amount</th>
                <th className="border-0 px-4 py-3">Effectiveness Date</th>
                <th className="border-0 px-4 py-3">Closure Date</th>
                <th className="border-0 px-4 py-3 text-end">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <ProjectRow
                  key={project.projectId}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                />
              ))}
            </tbody>
          </table>
          {filteredProjects.length === 0 && (
            <p className="text-center text-muted py-5 mb-0">{t('table.noData')}</p>
          )}
        </div>
      </div>
    );
  }, [loading, projectSearch, filteredProjects, handleSearchChange, handleEditProject, handleDeleteProject]);

  const dataTable = useMemo(() => {
    if (loading) {
      return <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>;
    }

    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              {activeTab === 'components' && <><th>ID</th><th>{t('financial.componentName')}</th><th>{t('common.description')}</th><th className="text-end">{t('financial.allocation')}</th></>}
              {activeTab === 'subcomponents' && <><th>ID</th><th>{t('financial.subcomponent')}</th><th>{t('common.description')}</th><th className="text-end">{t('financial.allocation')}</th></>}
              {activeTab === 'activities' && <><th>ID</th><th>{t('financial.activity')}</th><th className="text-end">{t('financial.allocation')}</th></>}
              {activeTab === 'pdos' && <><th>ID</th><th>{t('financial.pdoStatement')}</th></>}
              {activeTab === 'outcomes' && <><th>ID</th><th>{t('financial.projectOutcome')}</th></>}
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {currentTabData.length === 0 ? (
              <tr><td colSpan="5" className="text-center text-muted">{t('table.noData')}</td></tr>
            ) : (
              currentTabData.map((item, index) => (
                <DataRow
                  key={item.id || item.compId || item.subcompId || item.activityId || index}
                  item={item}
                  activeTab={activeTab}
                  formatCurrency={formatCurrency}
                />
              ))
            )}
          </tbody>
          {['components', 'subcomponents', 'activities'].includes(activeTab) && currentTabData.length > 0 && (
            <tfoot className="table-secondary">
              <tr>
                <td colSpan={activeTab === 'activities' ? 2 : 3} className="fw-bold">{t('common.total')}</td>
                <td className="text-end fw-bold">{formatCurrency(dataTotal)}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    );
  }, [loading, activeTab, currentTabData, formatCurrency, dataTotal]);

  const tabButtons = useMemo(() => (
    <ul className="nav nav-tabs mb-4">
      {tabs.map(tab => (
        <TabButton
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onClick={() => handleTabChange(tab.id)}
        />
      ))}
    </ul>
  ), [tabs, activeTab, handleTabChange]);

  const projectOptions = useMemo(() => (
    projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)
  ), [projects]);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('financial.title')}</h2>
        <div className="d-flex gap-3">
          {activeTab !== 'projects' && (
            <select className="form-select" value={selectedProject} onChange={handleProjectSelect} style={{ width: '250px' }}>
              {projectOptions}
            </select>
          )}
          <button className="btn btn-primary" onClick={handleShowModal}>
            <FiPlus className="me-2" /> {t('common.addNew')}
          </button>
        </div>
      </div>

      {activeTab !== 'projects' && (
        <div className="row mb-4">
          <StatCard title="Total Components" value={components.length} bgClass="bg-primary" />
          <StatCard title="Total Allocation" value={`$${formatCurrency(totalAllocation)}`} bgClass="bg-success" />
          <StatCard title="Total Activities" value={activities.length} bgClass="bg-info" />
        </div>
      )}

      {tabButtons}

      <div className="card">
        <div className="card-body">
          {activeTab === 'projects' ? projectsTable : dataTable}
        </div>
      </div>

      {(showModal || editingProject) && activeTab === 'projects' && (
        <ProjectModal
          project={editingProject}
          onClose={handleCloseModal}
          onSave={handleProjectSave}
          donors={donors}
          contributors={contributors}
        />
      )}

      {showComponentModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{editingItem ? 'Edit Component' : 'Add Component'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleComponentSave}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-medium">Component ID</label>
                    <input name="compId" defaultValue={editingItem?.compId} className="form-control" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Component Name</label>
                    <input name="projectComponents" defaultValue={editingItem?.projectComponents} className="form-control" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Description</label>
                    <textarea name="componentDescription" defaultValue={editingItem?.componentDescription} className="form-control" rows="3"></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Allocation</label>
                    <input type="number" step="0.01" name="allocation" defaultValue={editingItem?.allocation} className="form-control" required />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={handleCloseModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingItem ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialManagement;
