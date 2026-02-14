import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiLayers, FiFolder, FiEye, FiSearch, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProjectModal = memo(function ProjectModal({ project, onClose, onSave, donors, contributors, currencies }) {
  const [formData, setFormData] = useState(() => {
    if (project) {
      return {
        ...project,
        donorIds: project.donors?.map(d => d.donorId) || [],
        contributorIds: project.contributors?.map(c => c.id) || [],
        currencyId: project.currency?.id || '',
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
      currencyId: '',
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

                <div className="col-md-6">
                  <label className="form-label fw-medium">Currency</label>
                  <select
                    className="form-select shadow-sm border-secondary-subtle"
                    value={formData.currencyId || ''}
                    onChange={(e) => handleFieldChange('currencyId', e.target.value)}
                  >
                    <option value="">Select Currency</option>
                    {currencies.map(curr => (
                      <option key={curr.id} value={curr.id}>
                        {curr.currency}{curr.code ? ` (${curr.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
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

                <div className="col-md-6">
                  <label className="form-label fw-medium">Effectiveness Date</label>
                  <input
                    type="date"
                    value={formData.effectivenessDate || ''}
                    onChange={(e) => handleFieldChange('effectivenessDate', e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="col-md-6">
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
        {project.currency?.currency || '-'}
      </td>
      <td className="px-4 py-3">
        {project.funding?.toLocaleString() || '-'}
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

const DataRow = memo(function DataRow({ item, activeTab, formatCurrency, onView, onEdit, onDelete }) {
  return (
    <tr>
      {activeTab === 'components' && (
        <><td>{item.project?.project || '-'}</td><td>{item.compId}</td><td>{item.projectComponents}</td><td>{item.componentDescription}</td><td>{item.currency?.currency || '-'}</td><td className="text-end">{formatCurrency(item.allocation)}</td></>
      )}
      {activeTab === 'subcomponents' && (
        <><td>{item.project?.project || '-'}</td><td>{item.component?.projectComponents || '-'}</td><td>{item.subcompId}</td><td>{item.subcomponent}</td><td>{item.subcomponentDescription || '-'}</td><td>{item.currency?.currency || '-'}</td><td className="text-end">{formatCurrency(item.allocation)}</td></>
      )}
      {activeTab === 'activities' && (
        <><td>{item.project?.project || '-'}</td><td>{item.component?.projectComponents || '-'}</td><td>{item.subcomponent?.subcomponent || '-'}</td><td>{item.activity}</td><td>{item.currency?.currency || '-'}</td><td className="text-end">{formatCurrency(item.allocation)}</td><td>{item.year?.profileYear || '-'}</td></>
      )}
      <td>
        <button className="btn btn-sm btn-outline-info me-1" onClick={() => onView && onView(item)} title="View"><FiEye /></button>
        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => onEdit && onEdit(item)} title="Edit"><FiEdit2 /></button>
        <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete && onDelete(item)} title="Delete"><FiTrash2 /></button>
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
  const [donors, setDonors] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [showSubcomponentModal, setShowSubcomponentModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [projectSearch, setProjectSearch] = useState('');
  const [years, setYears] = useState([]);
  const [activityProjectId, setActivityProjectId] = useState('');
  const [activityComponentId, setActivityComponentId] = useState('');
  const [componentProjectId, setComponentProjectId] = useState('');
  const [allComponents, setAllComponents] = useState([]);

  const loadDonorsAndContributors = useCallback(async () => {
    try {
      const [donorRes, contributorRes, currencyRes, yearRes] = await Promise.all([
        api.get('/donors').catch(() => ({ data: [] })),
        api.get('/setup/contributors').catch(() => ({ data: [] })),
        api.get('/setup/currencies').catch(() => ({ data: [] })),
        api.get('/setup/years').catch(() => ({ data: [] }))
      ]);
      setDonors(donorRes.data);
      setContributors(contributorRes.data);
      setCurrencies(currencyRes.data);
      setYears(yearRes.data);
    } catch (error) {
      console.error('Error loading donors/contributors/currencies:', error);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
      setSelectedProject('all');
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFinancialData = useCallback(async () => {
    if (!selectedProject) return;
    setLoading(true);
    const isAll = selectedProject === 'all';
    try {
      const [compRes, subRes, actRes] = await Promise.all([
        api.get(isAll ? '/financial/components' : `/financial/components/project/${selectedProject}`).catch(err => { console.error('Components load error:', err.response?.status, err.response?.data || err.message); return { data: [] }; }),
        api.get('/financial/subcomponents').catch(err => { console.error('Subcomponents load error:', err.response?.status, err.response?.data || err.message); return { data: [] }; }),
        api.get(isAll ? '/financial/activities' : `/financial/activities/project/${selectedProject}`).catch(err => { console.error('Activities load error:', err.response?.status, err.response?.data || err.message); return { data: [] }; })
      ]);
      setComponents(compRes.data);
      setSubcomponents(subRes.data);
      setActivities(actRes.data);
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
    loadFinancialData();
  }, [selectedProject, loadFinancialData]);

  useEffect(() => {
    if (showComponentModal) {
      api.get('/financial/components').then(res => setAllComponents(res.data)).catch(() => setAllComponents([]));
    }
  }, [showComponentModal]);

  const tabs = useMemo(() => [
    { id: 'projects', label: 'Projects', icon: FiFolder },
    { id: 'components', label: 'Components', icon: FiLayers },
    { id: 'subcomponents', label: 'Subcomponents', icon: FiLayers },
    { id: 'activities', label: 'Activities', icon: FiDollarSign }
  ], [t]);

  const handleCreateProject = useCallback(async (data) => {
    try {
      await api.post('/projects', data);
      toast.success(t('messages.createSuccess'));
      setShowModal(false);
      loadProjects();
    } catch (error) {
      toast.error(t('messages.createError'));
    }
  }, [loadProjects, t]);

  const handleUpdateProject = useCallback(async (data) => {
    try {
      await api.put(`/projects/${editingProject.projectId}`, data);
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
        await api.delete(`/projects/${projectId}`);
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

  const componentBudgetInfo = useMemo(() => {
    if (!componentProjectId || componentProjectId === 'all') return null;
    const project = projects.find(p => p.projectId === componentProjectId);
    if (!project) return null;
    const totalFunding = parseFloat(project.funding) || 0;
    const allocatedAmount = allComponents
      .filter(c => c.project?.projectId === componentProjectId && (!editingItem || c.id !== editingItem.id))
      .reduce((sum, c) => sum + (parseFloat(c.allocation) || 0), 0);
    const remainingBalance = totalFunding - allocatedAmount;
    return { totalFunding, allocatedAmount, remainingBalance };
  }, [componentProjectId, projects, allComponents, editingItem]);

  const handleComponentSave = useCallback(async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const projectId = componentProjectId;
    
    const allocation = parseFloat(data.allocation);
    if (isNaN(allocation)) {
      toast.error('Invalid allocation amount');
      return;
    }

    if (componentBudgetInfo && allocation > componentBudgetInfo.remainingBalance) {
      toast.error(`Allocation exceeds remaining balance of ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(componentBudgetInfo.remainingBalance)}`);
      return;
    }

    const payload = {
      projectComponents: data.projectComponents,
      componentDescription: data.componentDescription,
      allocation: allocation,
      project: { projectId: projectId },
      currency: data.currencyId ? { id: parseInt(data.currencyId) } : null
    };
    
    try {
      if (editingItem) {
        await api.put(`/financial/components/${editingItem.id}`, payload);
        toast.success('Component updated successfully');
      } else {
        await api.post('/financial/components', payload);
        toast.success('Component created successfully');
      }
      setShowComponentModal(false);
      setEditingItem(null);
      setComponentProjectId('');
      loadFinancialData();
    } catch (error) {
      console.error('Error saving component:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Error saving component');
    }
  }, [editingItem, loadFinancialData, componentProjectId, componentBudgetInfo]);

  const handleSubcomponentSave = useCallback(async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const projectId = data.projectId;
    if (!projectId) {
      toast.error('Please select a project');
      return;
    }
    const payload = {
      subcomponent: data.subcomponent,
      subcomponentDescription: data.subcomponentDescription,
      allocation: parseFloat(data.allocation),
      component: { id: parseInt(data.componentId) },
      project: { projectId: projectId },
      currency: data.currencyId ? { id: parseInt(data.currencyId) } : null
    };

    try {
      if (editingItem) {
        await api.put(`/financial/subcomponents/${editingItem.subcompId}`, payload);
        toast.success('Subcomponent updated successfully');
      } else {
        await api.post('/financial/subcomponents', payload);
        toast.success('Subcomponent created successfully');
      }
      setShowSubcomponentModal(false);
      setEditingItem(null);
      loadFinancialData();
    } catch (error) {
      console.error('Error saving subcomponent:', error);
      toast.error('Error saving subcomponent');
    }
  }, [editingItem, selectedProject, loadFinancialData]);

  const activityFilteredComponents = useMemo(() => {
    if (!activityProjectId) return [];
    return components.filter(c => c.project?.projectId === activityProjectId);
  }, [components, activityProjectId]);

  const activityFilteredSubcomponents = useMemo(() => {
    if (!activityComponentId) return [];
    return subcomponents.filter(s => s.component?.id?.toString() === activityComponentId);
  }, [subcomponents, activityComponentId]);

  const handleActivitySave = useCallback(async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (!data.projectId) {
      toast.error('Please select a project');
      return;
    }
    const payload = {
      activity: data.activity,
      allocation: parseFloat(data.allocation),
      project: { projectId: data.projectId },
      component: data.componentId ? { id: parseInt(data.componentId) } : null,
      subcomponent: data.subcomponentId ? { subcompId: parseInt(data.subcomponentId) } : null,
      currency: data.currencyId ? { id: parseInt(data.currencyId) } : null,
      year: data.yearId ? { id: parseInt(data.yearId) } : null
    };

    try {
      if (editingItem) {
        await api.put(`/financial/activities/${editingItem.activityId}`, payload);
        toast.success('Activity updated successfully');
      } else {
        await api.post('/financial/activities', payload);
        toast.success('Activity created successfully');
      }
      setShowActivityModal(false);
      setEditingItem(null);
      setActivityProjectId('');
      setActivityComponentId('');
      loadFinancialData();
    } catch (error) {
      console.error('Error saving activity:', error);
      toast.error('Error saving activity');
    }
  }, [editingItem, loadFinancialData]);

  const handleDeleteItem = useCallback(async (item) => {
    if (!confirm(t('messages.confirmDelete'))) return;
    try {
      if (activeTab === 'components') {
        await api.delete(`/financial/components/${item.id}`);
      } else if (activeTab === 'subcomponents') {
        await api.delete(`/financial/subcomponents/${item.subcompId}`);
      } else if (activeTab === 'activities') {
        await api.delete(`/financial/activities/${item.activityId}`);
      }
      toast.success(t('messages.deleteSuccess'));
      loadFinancialData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(t('messages.deleteError'));
    }
  }, [activeTab, loadFinancialData, t]);

  const handleViewItem = useCallback((item) => {
    setViewingItem(item);
  }, []);

  const handleEditItem = useCallback((item) => {
    setEditingItem(item);
    if (activeTab === 'components') {
      setComponentProjectId(item.project?.projectId || '');
      setShowComponentModal(true);
    } else if (activeTab === 'subcomponents') {
      setShowSubcomponentModal(true);
    } else if (activeTab === 'activities') {
      setActivityProjectId(item.project?.projectId || '');
      setActivityComponentId(item.component?.id?.toString() || '');
      setShowActivityModal(true);
    }
  }, [activeTab]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setShowComponentModal(false);
    setShowSubcomponentModal(false);
    setShowActivityModal(false);
    setEditingProject(null);
    setEditingItem(null);
    setActivityProjectId('');
    setActivityComponentId('');
    setComponentProjectId('');
  }, []);

  const handleEditProject = useCallback((project) => {
    setEditingProject(project);
    setShowModal(true);
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setProjectSearch(e.target.value);
  }, []);

  const handleProjectSelect = useCallback((e) => {
    setSelectedProject(e.target.value);
  }, []);

  const handleShowModal = useCallback(() => {
    if (activeTab === 'projects') {
      setShowModal(true);
    } else if (activeTab === 'components') {
      setComponentProjectId(selectedProject === 'all' ? '' : selectedProject);
      setShowComponentModal(true);
    } else if (activeTab === 'subcomponents') {
      setShowSubcomponentModal(true);
    } else if (activeTab === 'activities') {
      setActivityProjectId('');
      setActivityComponentId('');
      setShowActivityModal(true);
    } else {
      toast.error(`Add New for ${activeTab} is coming soon`);
    }
  }, [activeTab, selectedProject]);

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
      default: return [];
    }
  }, [activeTab, components, subcomponents, activities]);

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
                <th className="border-0 px-4 py-3">Currency</th>
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
              {activeTab === 'components' && <><th>{t('common.project')}</th><th>ID</th><th>{t('financial.componentName')}</th><th>{t('common.description')}</th><th>{t('financial.currency')}</th><th className="text-end">{t('financial.allocation')}</th></>}
              {activeTab === 'subcomponents' && <><th>{t('common.project')}</th><th>{t('financial.components')}</th><th>ID</th><th>{t('financial.subcomponentName')}</th><th>{t('common.description')}</th><th>{t('financial.currency')}</th><th className="text-end">{t('financial.allocation')}</th></>}
              {activeTab === 'activities' && <><th>{t('common.project')}</th><th>{t('financial.components')}</th><th>{t('financial.subcomponents')}</th><th>{t('financial.activityName')}</th><th>{t('financial.currency')}</th><th className="text-end">{t('financial.allocation')}</th><th>{t('common.year')}</th></>}
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {currentTabData.length === 0 ? (
              <tr><td colSpan="10" className="text-center text-muted">{t('table.noData')}</td></tr>
            ) : (
              currentTabData.map((item, index) => (
                <DataRow
                  key={item.id || item.compId || item.subcompId || item.activityId || index}
                  item={item}
                  activeTab={activeTab}
                  formatCurrency={formatCurrency}
                  onView={handleViewItem}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              ))
            )}
          </tbody>
          {['components', 'subcomponents', 'activities'].includes(activeTab) && currentTabData.length > 0 && (
            <tfoot className="table-secondary">
              <tr>
                <td colSpan={activeTab === 'components' ? 5 : activeTab === 'subcomponents' ? 6 : activeTab === 'activities' ? 5 : 2} className="fw-bold">{t('common.total')}</td>
                <td className="text-end fw-bold">{formatCurrency(dataTotal)}</td>
                {activeTab === 'activities' && <td></td>}
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    );
  }, [loading, activeTab, currentTabData, formatCurrency, dataTotal, handleViewItem, handleEditItem, handleDeleteItem, t]);

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
    <>
      <option value="all">All</option>
      {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
    </>
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
          currencies={currencies}
        />
      )}

      {showComponentModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{editingItem ? 'Edit Component' : 'Add Component'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleComponentSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-medium">Project</label>
                      <select value={componentProjectId} onChange={(e) => setComponentProjectId(e.target.value)} className="form-select" required>
                        <option value="">Select Project...</option>
                        {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                      </select>
                    </div>
                    {componentBudgetInfo && (
                      <div className="col-12">
                        <div className="card border-0" style={{ backgroundColor: '#e8f4fd' }}>
                          <div className="card-body py-2 px-3">
                            <div className="row text-center">
                              <div className="col-md-4">
                                <small className="text-muted d-block">Total Project Funding</small>
                                <span className="fw-bold text-primary">{formatCurrency(componentBudgetInfo.totalFunding)}</span>
                              </div>
                              <div className="col-md-4">
                                <small className="text-muted d-block">Already Allocated</small>
                                <span className="fw-bold text-warning">{formatCurrency(componentBudgetInfo.allocatedAmount)}</span>
                              </div>
                              <div className="col-md-4">
                                <small className="text-muted d-block">Remaining Balance</small>
                                <span className={`fw-bold ${componentBudgetInfo.remainingBalance >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(componentBudgetInfo.remainingBalance)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="col-12">
                      <label className="form-label fw-medium">Component Name</label>
                      <input name="projectComponents" defaultValue={editingItem?.projectComponents} className="form-control" placeholder="Enter component name" required />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">Description</label>
                      <textarea name="componentDescription" defaultValue={editingItem?.componentDescription} className="form-control" rows="3" placeholder="Enter description"></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Currency</label>
                      <select name="currencyId" defaultValue={editingItem?.currency?.id} className="form-select">
                        <option value="">Select Currency</option>
                        {currencies.map(c => (
                          <option key={c.id} value={c.id}>{c.currency}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Allocation</label>
                      <input type="number" step="0.01" name="allocation" defaultValue={editingItem?.allocation} className="form-control" placeholder="0.00" required max={componentBudgetInfo ? componentBudgetInfo.remainingBalance : undefined} />
                      {componentBudgetInfo && componentBudgetInfo.remainingBalance >= 0 && (
                        <div className="form-text">Maximum allowed: {formatCurrency(componentBudgetInfo.remainingBalance)}</div>
                      )}
                    </div>
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
      {showSubcomponentModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{editingItem ? 'Edit Subcomponent' : 'Add Subcomponent'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubcomponentSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium"><FiFolder className="me-1" /> Project *</label>
                      <select name="projectId" defaultValue={selectedProject === 'all' ? '' : selectedProject} className="form-select" required>
                        <option value="">Select Project...</option>
                        {projects.map(p => (
                          <option key={p.projectId} value={p.projectId}>{p.project}</option>
                        ))}
                      </select>
                      <div className="form-text">Select the project for this subcomponent</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium"><FiLayers className="me-1" /> Component *</label>
                      <select name="componentId" className="form-select" required>
                        <option value="">Select Component...</option>
                        {components.map(c => (
                          <option key={c.id} value={c.id}>{c.projectComponents}</option>
                        ))}
                      </select>
                      <div className="form-text">Select the component for this subcomponent</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Subcomponent Name *</label>
                      <input name="subcomponent" defaultValue={editingItem?.subcomponent} className="form-control" placeholder="Enter the subcomponent identifier" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium"><FiDollarSign className="me-1" /> Currency *</label>
                      <select name="currencyId" defaultValue={editingItem?.currency?.id} className="form-select" required>
                        <option value="">Select Currency...</option>
                        {currencies.map(c => (
                          <option key={c.id} value={c.id}>{c.currency}</option>
                        ))}
                      </select>
                      <div className="form-text">Select the currency for allocation</div>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">Description</label>
                      <textarea name="subcomponentDescription" defaultValue={editingItem?.subcomponentDescription} className="form-control" rows="3" placeholder="Provide a detailed description of the subcomponent"></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium"><FiDollarSign className="me-1" /> Allocation Amount *</label>
                      <input type="number" step="0.01" name="allocation" defaultValue={editingItem?.allocation} className="form-control" placeholder="Enter the allocated budget amount" required />
                    </div>
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
      {showActivityModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{editingItem ? 'Edit Activity' : 'Add Activity'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleActivitySave}>
                <div className="modal-body">
                  <div className="card border-0 bg-light mb-3">
                    <div className="card-header bg-dark text-white py-2 fw-bold" style={{ fontSize: '0.9rem' }}>Activity Information</div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-medium">Project</label>
                          <select name="projectId" value={activityProjectId} onChange={(e) => { setActivityProjectId(e.target.value); setActivityComponentId(''); }} className="form-select" required>
                            <option value="">Select Project...</option>
                            {projects.map(p => (
                              <option key={p.projectId} value={p.projectId}>{p.project}</option>
                            ))}
                          </select>
                          <div className="form-text">Select a project to load its components</div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">Component</label>
                          <select name="componentId" value={activityComponentId} onChange={(e) => setActivityComponentId(e.target.value)} className="form-select">
                            <option value="">{activityProjectId ? 'Select Component...' : 'First select a project...'}</option>
                            {activityFilteredComponents.map(c => (
                              <option key={c.id} value={c.id}>{c.projectComponents}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">Subcomponent</label>
                          <select name="subcomponentId" defaultValue={editingItem?.subcomponent?.subcompId || ''} className="form-select">
                            <option value="">{activityComponentId ? 'Select Subcomponent...' : 'First select a component...'}</option>
                            {activityFilteredSubcomponents.map(s => (
                              <option key={s.subcompId} value={s.subcompId}>{s.subcomponent}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">Activity Name</label>
                          <input name="activity" defaultValue={editingItem?.activity} className="form-control" required />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-medium">Currency</label>
                          <select name="currencyId" defaultValue={editingItem?.currency?.id} className="form-select">
                            <option value="">----------</option>
                            {currencies.map(c => (
                              <option key={c.id} value={c.id}>{c.currency}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-medium">Allocation</label>
                          <input type="number" step="0.01" name="allocation" defaultValue={editingItem?.allocation} className="form-control" />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-medium">Year</label>
                          <select name="yearId" defaultValue={editingItem?.year?.id} className="form-select">
                            <option value="">----------</option>
                            {years.map(y => (
                              <option key={y.id} value={y.id}>{y.profileYear}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
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
      {viewingItem && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {activeTab === 'components' && 'Component Details'}
                  {activeTab === 'subcomponents' && 'Subcomponent Details'}
                  {activeTab === 'activities' && 'Activity Details'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setViewingItem(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {activeTab === 'components' && (
                    <>
                      <div className="col-md-6"><label className="form-label text-muted small">{t('common.project')}</label><p className="fw-medium">{viewingItem.project?.project || '-'}</p></div>
                      <div className="col-md-6"><label className="form-label text-muted small">ID</label><p className="fw-medium">{viewingItem.compId}</p></div>
                      <div className="col-12"><label className="form-label text-muted small">{t('financial.componentName')}</label><p className="fw-medium">{viewingItem.projectComponents}</p></div>
                      <div className="col-12"><label className="form-label text-muted small">{t('common.description')}</label><p className="fw-medium">{viewingItem.componentDescription || '-'}</p></div>
                      <div className="col-md-6"><label className="form-label text-muted small">{t('financial.currency')}</label><p className="fw-medium">{viewingItem.currency?.currency || '-'}</p></div>
                      <div className="col-md-6"><label className="form-label text-muted small">{t('financial.allocation')}</label><p className="fw-medium">{formatCurrency(viewingItem.allocation)}</p></div>
                    </>
                  )}
                  {activeTab === 'subcomponents' && (
                    <>
                      <div className="col-md-6"><label className="form-label text-muted small">{t('financial.components')}</label><p className="fw-medium">{viewingItem.component?.projectComponents || '-'}</p></div>
                      <div className="col-md-6"><label className="form-label text-muted small">ID</label><p className="fw-medium">{viewingItem.subcompId}</p></div>
                      <div className="col-12"><label className="form-label text-muted small">{t('financial.subcomponentName')}</label><p className="fw-medium">{viewingItem.subcomponent}</p></div>
                      <div className="col-12"><label className="form-label text-muted small">{t('common.description')}</label><p className="fw-medium">{viewingItem.subcomponentDescription || '-'}</p></div>
                      <div className="col-md-6"><label className="form-label text-muted small">{t('financial.currency')}</label><p className="fw-medium">{viewingItem.currency?.currency || '-'}</p></div>
                      <div className="col-md-6"><label className="form-label text-muted small">{t('financial.allocation')}</label><p className="fw-medium">{formatCurrency(viewingItem.allocation)}</p></div>
                    </>
                  )}
                  {activeTab === 'activities' && (
                    <>
                      <div className="col-md-6"><label className="form-label text-muted small">{t('common.project')}</label><p className="fw-medium">{viewingItem.project?.project || '-'}</p></div>
                      <div className="col-md-6"><label className="form-label text-muted small">{t('financial.components')}</label><p className="fw-medium">{viewingItem.component?.projectComponents || '-'}</p></div>
                      <div className="col-md-6"><label className="form-label text-muted small">{t('financial.subcomponents')}</label><p className="fw-medium">{viewingItem.subcomponent?.subcomponent || '-'}</p></div>
                      <div className="col-md-6"><label className="form-label text-muted small">{t('financial.activityName')}</label><p className="fw-medium">{viewingItem.activity}</p></div>
                      <div className="col-md-4"><label className="form-label text-muted small">{t('financial.currency')}</label><p className="fw-medium">{viewingItem.currency?.currency || '-'}</p></div>
                      <div className="col-md-4"><label className="form-label text-muted small">{t('financial.allocation')}</label><p className="fw-medium">{formatCurrency(viewingItem.allocation)}</p></div>
                      <div className="col-md-4"><label className="form-label text-muted small">{t('common.year')}</label><p className="fw-medium">{viewingItem.year?.profileYear || '-'}</p></div>
                    </>
                  )}
                  {viewingItem.dateCreated && (
                    <div className="col-12"><label className="form-label text-muted small">{t('common.dateCreated')}</label><p className="fw-medium">{new Date(viewingItem.dateCreated).toLocaleDateString()}</p></div>
                  )}
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setViewingItem(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialManagement;
