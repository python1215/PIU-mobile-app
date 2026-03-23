import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiAlertTriangle, FiShield, FiZap, FiTarget, FiEye, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const LIKELIHOOD_OPTIONS = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
const IMPACT_OPTIONS = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
const CATEGORY_OPTIONS = ['Financial', 'Technical', 'Environmental', 'Social', 'Legal', 'Operational', 'Schedule', 'Safety'];
const STATUS_OPTIONS = ['Identified', 'Assessed', 'Mitigating', 'Resolved', 'Closed'];
const STRATEGY_OPTIONS = ['Avoid', 'Transfer', 'Mitigate', 'Accept'];
const MIT_STATUS_OPTIONS = ['Planned', 'In Progress', 'Completed'];
const EFFECTIVENESS_OPTIONS = ['Effective', 'Partially Effective', 'Ineffective', 'Not Yet Assessed'];

function RiskAssessment() {
  const { t } = useTranslation();
  const [risks, setRisks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [stats, setStats] = useState({});
  const [expandedRisk, setExpandedRisk] = useState(null);
  const [mitigations, setMitigations] = useState({});
  const [showMitModal, setShowMitModal] = useState(false);
  const [editingMit, setEditingMit] = useState(null);
  const [mitRiskId, setMitRiskId] = useState(null);
  const [autoLoading, setAutoLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadRisks();
    loadStats();
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadRisks = async () => {
    setLoading(true);
    try {
      const url = selectedProject === 'all' ? '/api/risks' : `/api/risks/project/${selectedProject}`;
      const res = await axios.get(url);
      setRisks(res.data);
    } catch (error) {
      console.error('Error loading risks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await axios.get('/api/risks/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadMitigations = async (riskId) => {
    try {
      const res = await axios.get(`/api/risks/${riskId}/mitigations`);
      setMitigations(prev => ({ ...prev, [riskId]: res.data }));
    } catch (error) {
      console.error('Error loading mitigations:', error);
    }
  };

  const toggleExpand = (riskId) => {
    if (expandedRisk === riskId) {
      setExpandedRisk(null);
    } else {
      setExpandedRisk(riskId);
      if (!mitigations[riskId]) {
        loadMitigations(riskId);
      }
    }
  };

  const handleAutoIdentify = async () => {
    setAutoLoading(true);
    try {
      const res = await axios.post('/api/risks/auto-identify');
      const count = res.data.risksIdentified || 0;
      if (count > 0) {
        toast.success(t('risk.autoIdentified', { count }));
      } else {
        toast.success(t('risk.noNewRisks'));
      }
      loadRisks();
      loadStats();
    } catch (error) {
      console.error('Error auto-identifying risks:', error);
      toast.error(t('risk.autoIdentifyError'));
    } finally {
      setAutoLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      project: data.projectId ? { projectId: data.projectId } : null,
      riskCategory: data.riskCategory,
      riskTitle: data.riskTitle,
      riskDescription: data.riskDescription,
      likelihood: data.likelihood,
      impact: data.impact,
      status: data.status,
      identifiedDate: data.identifiedDate || null,
      identifiedBy: data.identifiedBy,
      riskOwner: data.riskOwner,
      dueDate: data.dueDate || null,
      remarks: data.remarks
    };

    try {
      if (editingItem) {
        await axios.put(`/api/risks/${editingItem.id}`, payload);
        toast.success(t('risk.updateSuccess'));
      } else {
        await axios.post('/api/risks', payload);
        toast.success(t('risk.createSuccess'));
      }
      setShowModal(false);
      setEditingItem(null);
      loadRisks();
      loadStats();
    } catch (error) {
      console.error('Error saving risk:', error);
      toast.error(t('risk.saveError'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('common.confirmDelete'))) return;
    try {
      await axios.delete(`/api/risks/${id}`);
      toast.success(t('common.deleteSuccess'));
      loadRisks();
      loadStats();
    } catch (error) {
      console.error('Error deleting risk:', error);
      toast.error(t('risk.deleteError'));
    }
  };

  const handleMitSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      strategy: data.strategy,
      actionDescription: data.actionDescription,
      responsiblePerson: data.responsiblePerson,
      targetDate: data.targetDate || null,
      completionDate: data.completionDate || null,
      status: data.status,
      effectiveness: data.effectiveness,
      remarks: data.remarks
    };

    try {
      if (editingMit) {
        await axios.put(`/api/risks/mitigations/${editingMit.id}`, payload);
        toast.success(t('risk.mitUpdateSuccess'));
      } else {
        await axios.post(`/api/risks/${mitRiskId}/mitigations`, payload);
        toast.success(t('risk.mitCreateSuccess'));
      }
      setShowMitModal(false);
      setEditingMit(null);
      loadMitigations(mitRiskId);
    } catch (error) {
      console.error('Error saving mitigation:', error);
      toast.error(t('risk.mitSaveError'));
    }
  };

  const handleDeleteMit = async (mitId, riskId) => {
    if (!confirm(t('common.confirmDelete'))) return;
    try {
      await axios.delete(`/api/risks/mitigations/${mitId}`);
      toast.success(t('common.deleteSuccess'));
      loadMitigations(riskId);
    } catch (error) {
      console.error('Error deleting mitigation:', error);
      toast.error(t('risk.deleteError'));
    }
  };

  const getRiskLevelBadge = (level) => {
    const colors = {
      Critical: 'bg-danger',
      High: 'bg-warning text-dark',
      Medium: 'bg-info',
      Low: 'bg-success'
    };
    return <span className={`badge ${colors[level] || 'bg-secondary'}`}>{t(`risk.level${level}`) || level}</span>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      Identified: 'bg-primary',
      Assessed: 'bg-info',
      Mitigating: 'bg-warning text-dark',
      Resolved: 'bg-success',
      Closed: 'bg-secondary'
    };
    return <span className={`badge ${colors[status] || 'bg-secondary'}`}>{t(`risk.status${status}`) || status}</span>;
  };

  const getSourceBadge = (source) => {
    if (source === 'Automated') return <span className="badge bg-info"><FiZap className="me-1" />{t('risk.automated')}</span>;
    return <span className="badge bg-secondary">{t('risk.manual')}</span>;
  };

  const renderRiskMatrix = () => {
    const matrix = {};
    risks.forEach(r => {
      const key = `${r.likelihood}-${r.impact}`;
      if (!matrix[key]) matrix[key] = [];
      matrix[key].push(r);
    });

    const likelihoods = [...LIKELIHOOD_OPTIONS].reverse();
    const impacts = IMPACT_OPTIONS;

    const getCellColor = (l, i) => {
      const lv = LIKELIHOOD_OPTIONS.indexOf(l) + 1;
      const iv = IMPACT_OPTIONS.indexOf(i) + 1;
      const score = lv * iv;
      if (score >= 20) return '#dc3545';
      if (score >= 12) return '#ffc107';
      if (score >= 6) return '#17a2b8';
      return '#28a745';
    };

    return (
      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <h6 className="mb-0">{t('risk.riskMatrix')}</h6>
        </div>
        <div className="card-body p-2">
          <div className="table-responsive">
            <table className="table table-bordered mb-0 text-center" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th className="bg-light" style={{ width: '120px' }}>{t('risk.likelihood')} / {t('risk.impact')}</th>
                  {impacts.map(i => <th key={i} className="bg-light">{t(`risk.scale${i.replace(/\s/g, '')}`) || i}</th>)}
                </tr>
              </thead>
              <tbody>
                {likelihoods.map(l => (
                  <tr key={l}>
                    <td className="bg-light fw-bold">{t(`risk.scale${l.replace(/\s/g, '')}`) || l}</td>
                    {impacts.map(i => {
                      const key = `${l}-${i}`;
                      const items = matrix[key] || [];
                      return (
                        <td key={i} style={{ backgroundColor: getCellColor(l, i) + '30', minWidth: '80px' }}>
                          {items.length > 0 && (
                            <span className="badge rounded-pill" style={{ backgroundColor: getCellColor(l, i), color: '#fff' }}>
                              {items.length}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1"><FiShield className="me-2" />{t('risk.title')}</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{t('risk.subtitle')}</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <select className="form-select form-select-sm" style={{ width: '200px' }} value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
            <option value="all">{t('common.allProjects')}</option>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
          </select>
          <button className="btn btn-sm btn-outline-info" onClick={handleAutoIdentify} disabled={autoLoading}>
            <FiZap className="me-1" />{autoLoading ? t('risk.scanning') : t('risk.autoIdentify')}
          </button>
          <button className="btn btn-sm btn-primary" onClick={() => { setEditingItem(null); setShowModal(true); }}>
            <FiPlus className="me-1" />{t('risk.addRisk')}
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3 col-6 mb-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-danger bg-opacity-10 p-2 me-3"><FiAlertTriangle className="text-danger" size={20} /></div>
                <div>
                  <div className="text-muted small">{t('risk.criticalRisks')}</div>
                  <h4 className="mb-0 fw-bold text-danger">{stats.critical || 0}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3"><FiAlertTriangle className="text-warning" size={20} /></div>
                <div>
                  <div className="text-muted small">{t('risk.highRisks')}</div>
                  <h4 className="mb-0 fw-bold text-warning">{stats.high || 0}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3"><FiShield className="text-primary" size={20} /></div>
                <div>
                  <div className="text-muted small">{t('risk.totalRisks')}</div>
                  <h4 className="mb-0 fw-bold">{stats.total || 0}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3"><FiTarget className="text-success" size={20} /></div>
                <div>
                  <div className="text-muted small">{t('risk.resolvedRisks')}</div>
                  <h4 className="mb-0 fw-bold text-success">{stats.resolved || 0}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 mb-3">
        <button className={`btn btn-sm ${viewMode === 'table' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setViewMode('table')}>{t('risk.tableView')}</button>
        <button className={`btn btn-sm ${viewMode === 'matrix' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setViewMode('matrix')}>{t('risk.matrixView')}</button>
      </div>

      {viewMode === 'matrix' && renderRiskMatrix()}

      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>
          ) : risks.length === 0 ? (
            <div className="text-center text-muted p-5">
              <FiShield size={48} className="mb-3 opacity-50" />
              <p>{t('risk.noRisks')}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0" style={{ fontSize: '0.85rem' }}>
                <thead className="table-dark">
                  <tr>
                    <th style={{ width: '30px' }}></th>
                    <th>{t('risk.riskId')}</th>
                    <th>{t('financial.project')}</th>
                    <th>{t('risk.category')}</th>
                    <th>{t('risk.riskTitle')}</th>
                    <th>{t('risk.likelihood')}</th>
                    <th>{t('risk.impact')}</th>
                    <th>{t('risk.score')}</th>
                    <th>{t('risk.riskLevel')}</th>
                    <th>{t('risk.status')}</th>
                    <th>{t('risk.source')}</th>
                    <th>{t('risk.identifiedDate')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {risks.map(risk => (
                    <tr key={risk.id} className={expandedRisk === risk.id ? 'table-active' : ''}>
                      <td>
                        <button className="btn btn-sm p-0 border-0" onClick={() => toggleExpand(risk.id)}>
                          {expandedRisk === risk.id ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                      </td>
                      <td><strong>{risk.riskId || '-'}</strong></td>
                      <td>{risk.project?.project || '-'}</td>
                      <td>{risk.riskCategory || '-'}</td>
                      <td style={{ maxWidth: '200px' }}>{risk.riskTitle || '-'}</td>
                      <td>{risk.likelihood || '-'}</td>
                      <td>{risk.impact || '-'}</td>
                      <td><strong>{risk.riskScore || '-'}</strong></td>
                      <td>{getRiskLevelBadge(risk.riskLevel)}</td>
                      <td>{getStatusBadge(risk.status)}</td>
                      <td>{getSourceBadge(risk.source)}</td>
                      <td>{risk.identifiedDate || '-'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => { setEditingItem(risk); setShowModal(true); }}><FiEdit2 /></button>
                        <button className="btn btn-sm btn-outline-danger me-1" onClick={() => handleDelete(risk.id)}><FiTrash2 /></button>
                        <button className="btn btn-sm btn-outline-success" onClick={() => { setMitRiskId(risk.id); setEditingMit(null); setShowMitModal(true); }} title={t('risk.addMitigation')}><FiTarget /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {expandedRisk && (
        <div className="card mt-3 border-primary">
          <div className="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">
              <FiTarget className="me-2" />
              {t('risk.mitigationStrategies')} - {risks.find(r => r.id === expandedRisk)?.riskId}
            </h6>
            <button className="btn btn-sm btn-primary" onClick={() => { setMitRiskId(expandedRisk); setEditingMit(null); setShowMitModal(true); }}>
              <FiPlus className="me-1" />{t('risk.addMitigation')}
            </button>
          </div>
          <div className="card-body p-0">
            {!mitigations[expandedRisk] || mitigations[expandedRisk].length === 0 ? (
              <div className="text-center text-muted p-4">{t('risk.noMitigations')}</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th>{t('risk.strategy')}</th>
                      <th>{t('risk.actionDescription')}</th>
                      <th>{t('risk.responsible')}</th>
                      <th>{t('risk.targetDate')}</th>
                      <th>{t('risk.completionDate')}</th>
                      <th>{t('risk.status')}</th>
                      <th>{t('risk.effectiveness')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mitigations[expandedRisk].map(m => (
                      <tr key={m.id}>
                        <td><span className="badge bg-secondary">{m.strategy}</span></td>
                        <td style={{ maxWidth: '250px' }}>{m.actionDescription || '-'}</td>
                        <td>{m.responsiblePerson || '-'}</td>
                        <td>{m.targetDate || '-'}</td>
                        <td>{m.completionDate || '-'}</td>
                        <td>
                          <span className={`badge ${m.status === 'Completed' ? 'bg-success' : m.status === 'In Progress' ? 'bg-warning text-dark' : 'bg-info'}`}>
                            {m.status || '-'}
                          </span>
                        </td>
                        <td>{m.effectiveness || '-'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button className="btn btn-sm btn-outline-primary me-1" onClick={() => { setMitRiskId(expandedRisk); setEditingMit(m); setShowMitModal(true); }}><FiEdit2 /></button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteMit(m.id, expandedRisk)}><FiTrash2 /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header text-white" style={{ background: 'linear-gradient(135deg, #dc3545, #fd7e14)' }}>
                <h5 className="modal-title fw-bold">
                  <FiShield className="me-2" />
                  {editingItem ? t('risk.editRisk') : t('risk.addRisk')}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => { setShowModal(false); setEditingItem(null); }}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('financial.project')} *</label>
                      <select name="projectId" defaultValue={editingItem?.project?.projectId || ''} className="form-select" required>
                        <option value="">-- {t('risk.selectProject')} --</option>
                        {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('risk.category')} *</label>
                      <select name="riskCategory" defaultValue={editingItem?.riskCategory || ''} className="form-select" required>
                        <option value="">-- {t('risk.selectCategory')} --</option>
                        {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{t(`risk.cat${c}`) || c}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">{t('risk.riskTitle')} *</label>
                      <input name="riskTitle" defaultValue={editingItem?.riskTitle || ''} className="form-control" required />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">{t('risk.riskDescription')} *</label>
                      <textarea name="riskDescription" defaultValue={editingItem?.riskDescription || ''} className="form-control" rows="3" required></textarea>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('risk.likelihood')} *</label>
                      <select name="likelihood" defaultValue={editingItem?.likelihood || ''} className="form-select" required>
                        <option value="">-- {t('common.select')} --</option>
                        {LIKELIHOOD_OPTIONS.map(o => <option key={o} value={o}>{t(`risk.scale${o.replace(/\s/g, '')}`) || o}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('risk.impact')} *</label>
                      <select name="impact" defaultValue={editingItem?.impact || ''} className="form-select" required>
                        <option value="">-- {t('common.select')} --</option>
                        {IMPACT_OPTIONS.map(o => <option key={o} value={o}>{t(`risk.scale${o.replace(/\s/g, '')}`) || o}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('risk.status')} *</label>
                      <select name="status" defaultValue={editingItem?.status || 'Identified'} className="form-select" required>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{t(`risk.status${s}`) || s}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('risk.identifiedDate')}</label>
                      <input type="date" name="identifiedDate" defaultValue={editingItem?.identifiedDate || new Date().toISOString().split('T')[0]} className="form-control" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('risk.identifiedBy')}</label>
                      <input name="identifiedBy" defaultValue={editingItem?.identifiedBy || ''} className="form-control" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('risk.riskOwner')}</label>
                      <input name="riskOwner" defaultValue={editingItem?.riskOwner || ''} className="form-control" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('risk.dueDate')}</label>
                      <input type="date" name="dueDate" defaultValue={editingItem?.dueDate || ''} className="form-control" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('risk.remarks')}</label>
                      <textarea name="remarks" defaultValue={editingItem?.remarks || ''} className="form-control" rows="2"></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => { setShowModal(false); setEditingItem(null); }}>{t('common.cancel')}</button>
                  <button type="submit" className="btn btn-primary">{editingItem ? t('common.update') : t('common.create')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showMitModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header text-white" style={{ background: 'linear-gradient(135deg, #198754, #20c997)' }}>
                <h5 className="modal-title fw-bold">
                  <FiTarget className="me-2" />
                  {editingMit ? t('risk.editMitigation') : t('risk.addMitigation')}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => { setShowMitModal(false); setEditingMit(null); }}></button>
              </div>
              <form onSubmit={handleMitSave}>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('risk.strategy')} *</label>
                      <select name="strategy" defaultValue={editingMit?.strategy || ''} className="form-select" required>
                        <option value="">-- {t('common.select')} --</option>
                        {STRATEGY_OPTIONS.map(s => <option key={s} value={s}>{t(`risk.strat${s}`) || s}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('risk.responsible')} *</label>
                      <input name="responsiblePerson" defaultValue={editingMit?.responsiblePerson || ''} className="form-control" required />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">{t('risk.actionDescription')} *</label>
                      <textarea name="actionDescription" defaultValue={editingMit?.actionDescription || ''} className="form-control" rows="3" required></textarea>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('risk.targetDate')}</label>
                      <input type="date" name="targetDate" defaultValue={editingMit?.targetDate || ''} className="form-control" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('risk.completionDate')}</label>
                      <input type="date" name="completionDate" defaultValue={editingMit?.completionDate || ''} className="form-control" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('risk.status')} *</label>
                      <select name="status" defaultValue={editingMit?.status || 'Planned'} className="form-select" required>
                        {MIT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('risk.effectiveness')}</label>
                      <select name="effectiveness" defaultValue={editingMit?.effectiveness || 'Not Yet Assessed'} className="form-select">
                        {EFFECTIVENESS_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('risk.remarks')}</label>
                      <textarea name="remarks" defaultValue={editingMit?.remarks || ''} className="form-control" rows="2"></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => { setShowMitModal(false); setEditingMit(null); }}>{t('common.cancel')}</button>
                  <button type="submit" className="btn btn-success">{editingMit ? t('common.update') : t('common.create')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiskAssessment;
