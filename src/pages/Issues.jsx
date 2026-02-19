import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueAPI, issueActionSourceAPI, projectAPI, setupAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiAlertCircle, FiLayers } from 'react-icons/fi';

const emptyIssueForm = {
  project: null,
  year: null,
  quarter: null,
  issueCode: '',
  issueActionType: null,
  descriptionOfIssueOrAction: '',
  sourceOfIssueOrAction: null,
  status: 'incomplete',
  priority: 'medium',
  assignedTo: '',
  assignDate: '',
  dueDate: '',
  remarks: '',
};

function Issues() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('issues');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [sourceFormData, setSourceFormData] = useState({ issueActionSource: '' });
  const [issueFormData, setIssueFormData] = useState({ ...emptyIssueForm });
  const queryClient = useQueryClient();

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => { const r = await issueAPI.getAll(); return r.data; },
  });

  const { data: sources = [], isLoading: sourcesLoading } = useQuery({
    queryKey: ['issueActionSources'],
    queryFn: async () => { const r = await issueActionSourceAPI.getAll(); return r.data; },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => { const r = await projectAPI.getAll(); return r.data; },
  });

  const { data: years = [] } = useQuery({
    queryKey: ['years'],
    queryFn: async () => { const r = await setupAPI.getYears(); return r.data; },
  });

  const { data: quarters = [] } = useQuery({
    queryKey: ['quarters'],
    queryFn: async () => { const r = await setupAPI.getQuarters(); return r.data; },
  });

  const { data: monitoringTypes = [] } = useQuery({
    queryKey: ['monitoringTypes'],
    queryFn: async () => { const r = await setupAPI.getMonitoringTypes(); return r.data; },
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
      setModalOpen(false);
    },
    onError: () => toast.error(t('messages.updateError')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => issueAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['issues']);
      toast.success(t('messages.deleteSuccess'));
    },
    onError: (error) => {
      const msg = error.response?.data?.message || t('messages.deleteError');
      toast.error(msg);
    },
  });

  const createSourceMutation = useMutation({
    mutationFn: (data) => issueActionSourceAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['issueActionSources']);
      toast.success(t('issues.sourceCreated'));
      setSourceModalOpen(false);
      setSourceFormData({ issueActionSource: '' });
    },
    onError: () => toast.error(t('messages.createError')),
  });

  const updateSourceMutation = useMutation({
    mutationFn: ({ id, data }) => issueActionSourceAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['issueActionSources']);
      toast.success(t('issues.sourceUpdated'));
      setEditingSource(null);
      setSourceModalOpen(false);
      setSourceFormData({ issueActionSource: '' });
    },
    onError: () => toast.error(t('messages.updateError')),
  });

  const deleteSourceMutation = useMutation({
    mutationFn: (id) => issueActionSourceAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['issueActionSources']);
      toast.success(t('issues.sourceDeleted'));
    },
    onError: (error) => {
      const msg = error.response?.data?.message || t('messages.deleteError');
      toast.error(msg);
    },
  });

  const filteredIssues = useMemo(() => issues.filter((issue) => {
    const matchesSearch =
      issue.issueCode?.toLowerCase().includes(search.toLowerCase()) ||
      issue.descriptionOfIssueOrAction?.toLowerCase().includes(search.toLowerCase()) ||
      issue.assignedTo?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [issues, search, statusFilter]);

  const filteredSources = useMemo(() => sources.filter((source) =>
    source.issueActionSource?.toLowerCase().includes(search.toLowerCase())
  ), [sources, search]);

  const getPriorityBadge = (priority) => {
    const colors = { low: 'bg-success', medium: 'bg-warning text-dark', high: 'bg-orange text-dark', critical: 'bg-danger', done: 'bg-info' };
    const labels = { low: t('issues.low'), medium: t('issues.medium'), high: t('issues.high'), critical: t('issues.critical'), done: t('issues.done') };
    return <span className={`badge ${colors[priority] || 'bg-secondary'}`}>{labels[priority] || priority}</span>;
  };

  const getStatusBadge = (status) => {
    const colors = { incomplete: 'bg-warning text-dark', complete: 'bg-success', Cancel: 'bg-secondary' };
    const labels = { incomplete: t('common.incomplete'), complete: t('common.complete'), Cancel: t('issues.cancel') };
    return <span className={`badge ${colors[status] || 'bg-secondary'}`}>{labels[status] || status}</span>;
  };

  const buildPayload = (formData) => {
    const payload = {
      issueCode: formData.issueCode,
      descriptionOfIssueOrAction: formData.descriptionOfIssueOrAction,
      status: formData.status,
      priority: formData.priority,
      assignedTo: formData.assignedTo,
      assignDate: formData.assignDate || null,
      dueDate: formData.dueDate || null,
      remarks: formData.remarks,
    };
    if (formData.project) payload.project = { projectId: formData.project };
    if (formData.year) payload.year = { id: parseInt(formData.year) };
    if (formData.quarter) payload.quarter = { id: parseInt(formData.quarter) };
    if (formData.issueActionType) payload.issueActionType = { monitoringTypeCode: formData.issueActionType };
    if (formData.sourceOfIssueOrAction) payload.sourceOfIssueOrAction = { id: parseInt(formData.sourceOfIssueOrAction) };
    return payload;
  };

  const handleSave = (formData) => {
    const payload = buildPayload(formData);
    if (editingIssue) {
      updateMutation.mutate({ id: editingIssue.issueId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm(t('messages.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenIssueModal = (issue = null) => {
    if (issue) {
      setEditingIssue(issue);
      setIssueFormData({
        project: issue.project?.projectId || '',
        year: issue.year?.id?.toString() || '',
        quarter: issue.quarter?.id?.toString() || '',
        issueCode: issue.issueCode || '',
        issueActionType: issue.issueActionType?.monitoringTypeCode || '',
        descriptionOfIssueOrAction: issue.descriptionOfIssueOrAction || '',
        sourceOfIssueOrAction: issue.sourceOfIssueOrAction?.id?.toString() || '',
        status: issue.status || 'incomplete',
        priority: issue.priority || 'medium',
        assignedTo: issue.assignedTo || '',
        assignDate: issue.assignDate || '',
        dueDate: issue.dueDate || '',
        remarks: issue.remarks || '',
      });
    } else {
      setEditingIssue(null);
      setIssueFormData({ ...emptyIssueForm });
    }
    setModalOpen(true);
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    handleSave(issueFormData);
  };

  const handleOpenSourceModal = (source = null) => {
    if (source) {
      setEditingSource(source);
      setSourceFormData({ issueActionSource: source.issueActionSource || '' });
    } else {
      setEditingSource(null);
      setSourceFormData({ issueActionSource: '' });
    }
    setSourceModalOpen(true);
  };

  const handleSourceSubmit = (e) => {
    e.preventDefault();
    if (editingSource) {
      updateSourceMutation.mutate({ id: editingSource.id, data: sourceFormData });
    } else {
      createSourceMutation.mutate(sourceFormData);
    }
  };

  const handleDeleteSource = (id) => {
    if (window.confirm(t('messages.confirmDelete'))) {
      deleteSourceMutation.mutate(id);
    }
  };

  const tabs = [
    { id: 'issues', label: t('issues.issuesTab'), icon: <FiAlertCircle size={16} />, count: issues.length },
    { id: 'sources', label: t('issues.sourcesTab'), icon: <FiLayers size={16} />, count: sources.length },
  ];

  return (
    <div className="container-fluid" style={{ paddingBottom: '2rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>{t('issues.title')}</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>{t('issues.subtitle')}</p>
        </div>
        <button
          className="btn btn-primary btn-sm shadow-sm d-flex align-items-center gap-1"
          style={{ borderRadius: '8px', whiteSpace: 'nowrap' }}
          onClick={() => activeTab === 'issues' ? handleOpenIssueModal() : handleOpenSourceModal()}
        >
          <FiPlus size={16} /> {activeTab === 'issues' ? t('issues.addIssue') : t('issues.addSource')}
        </button>
      </div>

      <div className="row g-3 mb-4">
        {tabs.map(tab => (
          <div className="col-6" key={tab.id}>
            <div
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg, #4A7BF7 0%, #6C63FF 100%)' : '#fff',
                color: activeTab === tab.id ? '#fff' : '#333',
                borderRadius: '14px',
                boxShadow: activeTab === tab.id ? '0 4px 15px rgba(74,123,247,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
                border: activeTab === tab.id ? 'none' : '1px solid #e9ecef',
                padding: '16px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
            >
              <div className="d-flex align-items-center gap-3">
                <div style={{ opacity: 0.85 }}>{tab.icon}</div>
                <div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.9, fontWeight: 500 }}>{tab.label}</div>
                  <div className="fw-bold" style={{ fontSize: '1.6rem', lineHeight: 1.2 }}>{tab.count}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-3 border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div className="card-body py-2 px-3" style={{ backgroundColor: '#fafbfc' }}>
          <div className="row g-2 align-items-end">
            <div className="col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white"><FiSearch size={14} /></span>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="form-control" placeholder={t('common.search')} />
              </div>
            </div>
            {activeTab === 'issues' && (
              <div className="col-md-3">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white"><FiFilter size={14} /></span>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select form-select-sm">
                    <option value="all">{t('common.all')}</option>
                    <option value="incomplete">{t('common.incomplete')}</option>
                    <option value="complete">{t('common.complete')}</option>
                    <option value="Cancel">{t('issues.cancel')}</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeTab === 'issues' && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom">
            <h6 className="mb-0 fw-bold">{t('issues.issuesTab')}</h6>
            <span className="badge bg-light text-dark border" style={{ fontSize: '0.8rem' }}>{filteredIssues.length} / {issues.length} {t('table.records')}</span>
          </div>
          <div className="card-body p-0">
            {isLoading ? (
              <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ backgroundColor: '#f0f4ff' }}>
                    <tr>
                      <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('issues.issueNumber')}</th>
                      <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('issues.project')}</th>
                      <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('issues.issueActionType')}</th>
                      <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('common.description')}</th>
                      <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('common.status')}</th>
                      <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('issues.priority')}</th>
                      <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('issues.assignedTo')}</th>
                      <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('issues.dueDate')}</th>
                      <th className="fw-semibold text-end" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.map((issue) => (
                      <tr key={issue.issueId}>
                        <td className="fw-semibold text-primary" style={{ fontSize: '0.85rem' }}>{issue.issueCode}</td>
                        <td style={{ fontSize: '0.85rem' }}>{issue.project?.project || issue.project?.projectId || '-'}</td>
                        <td style={{ fontSize: '0.85rem' }}>{issue.issueActionType?.monitoringType || '-'}</td>
                        <td style={{ fontSize: '0.85rem' }}>
                          <div className="text-truncate" style={{ maxWidth: '200px' }}>{issue.descriptionOfIssueOrAction}</div>
                        </td>
                        <td>{getStatusBadge(issue.status)}</td>
                        <td>{getPriorityBadge(issue.priority)}</td>
                        <td style={{ fontSize: '0.85rem' }}>{issue.assignedTo || '-'}</td>
                        <td style={{ fontSize: '0.85rem' }}>{issue.dueDate || '-'}</td>
                        <td className="text-end">
                          <div className="d-flex gap-1 justify-content-end">
                            <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: '6px', padding: '3px 8px' }} onClick={() => handleOpenIssueModal(issue)}><FiEdit2 size={14} /></button>
                            <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: '6px', padding: '3px 8px' }} onClick={() => handleDelete(issue.issueId)}><FiTrash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredIssues.length === 0 && (
                  <p className="text-center text-muted py-4 mb-0">{t('table.noData')}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sources' && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom">
            <h6 className="mb-0 fw-bold">{t('issues.sourcesTab')}</h6>
            <span className="badge bg-light text-dark border" style={{ fontSize: '0.8rem' }}>{filteredSources.length} / {sources.length} {t('table.records')}</span>
          </div>
          <div className="card-body p-0">
            {sourcesLoading ? (
              <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ backgroundColor: '#f0f4ff' }}>
                    <tr>
                      <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>ID</th>
                      <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('issues.issueActionSource')}</th>
                      <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('issues.sourceCreatedBy')}</th>
                      <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('issues.sourceDateCreated')}</th>
                      <th className="fw-semibold text-end" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSources.map((source) => (
                      <tr key={source.id}>
                        <td className="fw-semibold text-primary" style={{ fontSize: '0.85rem' }}>{source.id}</td>
                        <td style={{ fontSize: '0.85rem' }}>{source.issueActionSource}</td>
                        <td style={{ fontSize: '0.85rem' }}>{source.user?.username || '-'}</td>
                        <td style={{ fontSize: '0.85rem' }}>{source.dateCreated ? new Date(source.dateCreated).toLocaleDateString() : '-'}</td>
                        <td className="text-end">
                          <div className="d-flex gap-1 justify-content-end">
                            <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: '6px', padding: '3px 8px' }} onClick={() => handleOpenSourceModal(source)}><FiEdit2 size={14} /></button>
                            <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: '6px', padding: '3px 8px' }} onClick={() => handleDeleteSource(source.id)}><FiTrash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredSources.length === 0 && (
                  <p className="text-center text-muted py-4 mb-0">{t('table.noData')}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-fullscreen-md-down modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header py-2">
                <h6 className="modal-title mb-0">{editingIssue ? t('issues.editIssue') : t('issues.addIssue')}</h6>
                <button type="button" className="btn-close" onClick={() => { setModalOpen(false); setEditingIssue(null); }}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleIssueSubmit}>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f8f9ff'}}>
                        <h6 className="text-primary mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('issues.issueDetails')}</h6>
                        <div className="row g-2">
                          <div className="col-12">
                            <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('issues.project')} *</label>
                            <select className="form-select form-select-sm" value={issueFormData.project || ''} onChange={(e) => setIssueFormData({ ...issueFormData, project: e.target.value })} required>
                              <option value="">{t('issues.selectProject')}</option>
                              {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                            </select>
                          </div>
                          <div className="col-6">
                            <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('issues.year')} *</label>
                            <select className="form-select form-select-sm" value={issueFormData.year || ''} onChange={(e) => setIssueFormData({ ...issueFormData, year: e.target.value })} required>
                              <option value="">{t('issues.selectYear')}</option>
                              {years.map(y => <option key={y.id} value={y.id}>{y.profileYear}</option>)}
                            </select>
                          </div>
                          <div className="col-6">
                            <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('issues.quarter')} *</label>
                            <select className="form-select form-select-sm" value={issueFormData.quarter || ''} onChange={(e) => setIssueFormData({ ...issueFormData, quarter: e.target.value })} required>
                              <option value="">{t('issues.selectQuarter')}</option>
                              {quarters.map(q => <option key={q.id} value={q.id}>{q.quarter}</option>)}
                            </select>
                          </div>
                          <div className="col-12">
                            <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('issues.issueNumber')} *</label>
                            <input type="text" className="form-control form-control-sm" value={issueFormData.issueCode} onChange={(e) => setIssueFormData({ ...issueFormData, issueCode: e.target.value })} placeholder="ISS-001" required />
                          </div>
                        </div>
                      </div>

                      <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f8fff8'}}>
                        <h6 className="text-success mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('issues.descriptionOfIssueOrAction')}</h6>
                        <div className="row g-2">
                          <div className="col-12">
                            <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('issues.descriptionOfIssueOrAction')} *</label>
                            <textarea className="form-control form-control-sm" rows="3" value={issueFormData.descriptionOfIssueOrAction} onChange={(e) => setIssueFormData({ ...issueFormData, descriptionOfIssueOrAction: e.target.value })} required></textarea>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f9f9f9'}}>
                        <h6 className="text-secondary mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('common.remarks')}</h6>
                        <textarea className="form-control form-control-sm" rows="2" value={issueFormData.remarks} onChange={(e) => setIssueFormData({ ...issueFormData, remarks: e.target.value })}></textarea>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="border rounded p-2 mb-2" style={{backgroundColor: '#fff8f0'}}>
                        <h6 className="text-warning mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('issues.classification')}</h6>
                        <div className="row g-2">
                          <div className="col-12">
                            <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('issues.issueActionType')} *</label>
                            <select className="form-select form-select-sm" value={issueFormData.issueActionType || ''} onChange={(e) => setIssueFormData({ ...issueFormData, issueActionType: e.target.value })} required>
                              <option value="">{t('issues.selectType')}</option>
                              {monitoringTypes.map(mt => <option key={mt.monitoringTypeCode} value={mt.monitoringTypeCode}>{mt.monitoringType}</option>)}
                            </select>
                          </div>
                          <div className="col-12">
                            <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('issues.sourceOfIssueOrAction')} *</label>
                            <select className="form-select form-select-sm" value={issueFormData.sourceOfIssueOrAction || ''} onChange={(e) => setIssueFormData({ ...issueFormData, sourceOfIssueOrAction: e.target.value })} required>
                              <option value="">{t('issues.selectSource')}</option>
                              {sources.map(s => <option key={s.id} value={s.id}>{s.issueActionSource}</option>)}
                            </select>
                          </div>
                          <div className="col-6">
                            <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('common.status')}</label>
                            <select className="form-select form-select-sm" value={issueFormData.status} onChange={(e) => setIssueFormData({ ...issueFormData, status: e.target.value })}>
                              <option value="incomplete">{t('common.incomplete')}</option>
                              <option value="complete">{t('common.complete')}</option>
                              <option value="Cancel">{t('issues.cancel')}</option>
                            </select>
                          </div>
                          <div className="col-6">
                            <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('issues.priority')}</label>
                            <select className="form-select form-select-sm" value={issueFormData.priority} onChange={(e) => setIssueFormData({ ...issueFormData, priority: e.target.value })}>
                              <option value="low">{t('issues.low')}</option>
                              <option value="medium">{t('issues.medium')}</option>
                              <option value="high">{t('issues.high')}</option>
                              <option value="critical">{t('issues.critical')}</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded p-2 mb-2" style={{backgroundColor: '#fdf8ff'}}>
                        <h6 className="text-info mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('issues.assignment')}</h6>
                        <div className="row g-2">
                          <div className="col-12">
                            <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('issues.assignedTo')} *</label>
                            <input type="text" className="form-control form-control-sm" value={issueFormData.assignedTo} onChange={(e) => setIssueFormData({ ...issueFormData, assignedTo: e.target.value })} required />
                          </div>
                        </div>
                      </div>

                      <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f0fff4'}}>
                        <h6 className="text-success mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('issues.dates')}</h6>
                        <div className="row g-2">
                          <div className="col-6">
                            <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('issues.assignDate')}</label>
                            <input type="date" className="form-control form-control-sm" value={issueFormData.assignDate} onChange={(e) => setIssueFormData({ ...issueFormData, assignDate: e.target.value })} />
                          </div>
                          <div className="col-6">
                            <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('issues.dueDate')}</label>
                            <input type="date" className="form-control form-control-sm" value={issueFormData.dueDate} onChange={(e) => setIssueFormData({ ...issueFormData, dueDate: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer mt-2 px-0 pt-2">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setModalOpen(false); setEditingIssue(null); }}>
                      {t('common.cancel')}
                    </button>
                    <button type="submit" className="btn btn-sm btn-primary">
                      {editingIssue ? t('common.update') : t('common.save')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {sourceModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-fullscreen-md-down modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header py-2">
                <h6 className="modal-title mb-0">{editingSource ? t('issues.editSource') : t('issues.addSource')}</h6>
                <button type="button" className="btn-close" onClick={() => { setSourceModalOpen(false); setEditingSource(null); setSourceFormData({ issueActionSource: '' }); }}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSourceSubmit}>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f8f9ff'}}>
                        <h6 className="text-primary mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('issues.sourceDetails')}</h6>
                        <div className="row g-2">
                          <div className="col-12">
                            <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('issues.issueActionSource')} *</label>
                            <input type="text" className="form-control form-control-sm" value={sourceFormData.issueActionSource} onChange={(e) => setSourceFormData({ ...sourceFormData, issueActionSource: e.target.value })} required />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer mt-2 px-0 pt-2">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setSourceModalOpen(false); setEditingSource(null); setSourceFormData({ issueActionSource: '' }); }}>
                      {t('common.cancel')}
                    </button>
                    <button type="submit" className="btn btn-sm btn-primary">
                      {editingSource ? t('common.update') : t('common.save')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Issues;
