import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiFileText, FiPackage, FiActivity, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

function ProjectActions() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('works');
  const [projects, setProjects] = useState([]);
  const [works, setWorks] = useState([]);
  const [goods, setGoods] = useState([]);
  const [monitoring, setMonitoring] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [quarters, setQuarters] = useState([]);
  const [monitoringTypes, setMonitoringTypes] = useState([]);

  useEffect(() => {
    loadProjects();
    loadReferenceData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadContracts();
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

  const loadReferenceData = async () => {
    try {
      const [qRes, mtRes] = await Promise.all([
        axios.get('/api/setup/quarters').catch(() => ({ data: [] })),
        axios.get('/api/setup/monitoring-types').catch(() => ({ data: [] }))
      ]);
      setQuarters(qRes.data);
      setMonitoringTypes(mtRes.data);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const loadContracts = async () => {
    setLoading(true);
    try {
      const [worksRes, goodsRes, monRes] = await Promise.all([
        axios.get(`/api/project-actions/works/project/${selectedProject}`).catch(() => ({ data: [] })),
        axios.get(`/api/project-actions/goods/project/${selectedProject}`).catch(() => ({ data: [] })),
        axios.get(`/api/project-actions/monitoring/project/${selectedProject}`).catch(() => ({ data: [] }))
      ]);
      setWorks(worksRes.data);
      setGoods(goodsRes.data);
      setMonitoring(monRes.data);
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const getTotalContractValue = () => {
    const worksTotal = works.reduce((sum, w) => sum + (parseFloat(w.contractValue) || 0), 0);
    const goodsTotal = goods.reduce((sum, g) => sum + (parseFloat(g.contractValue) || 0), 0);
    return worksTotal + goodsTotal;
  };

  const getAddButtonLabel = () => {
    if (activeTab === 'works') return t('projectActions.addWorksContract');
    if (activeTab === 'goods') return t('projectActions.addGoodsContract');
    return t('projectActions.addContractMonitoring');
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleMonitoringSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      contractRefNo: data.contractRefNo,
      monitoringDate: data.monitoringDate || null,
      milestoneStartDate: data.milestoneStartDate || null,
      milestoneEndDate: data.milestoneEndDate || null,
      target: data.target,
      achievedStatus: data.achievedStatus,
      remarks: data.remarks,
      project: { projectId: selectedProject },
      quarter: data.quarterId ? { id: parseInt(data.quarterId) } : null,
      monitoringType: data.monitoringTypeId ? { id: parseInt(data.monitoringTypeId) } : null
    };

    try {
      if (editingItem) {
        await axios.put(`/api/project-actions/monitoring/${editingItem.id}`, payload);
        toast.success('Contract monitoring updated successfully');
      } else {
        await axios.post('/api/project-actions/monitoring', payload);
        toast.success('Contract monitoring created successfully');
      }
      handleCloseModal();
      loadContracts();
    } catch (error) {
      console.error('Error saving monitoring:', error);
      toast.error('Error saving contract monitoring');
    }
  };

  const handleDeleteMonitoring = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await axios.delete(`/api/project-actions/monitoring/${id}`);
      toast.success('Record deleted successfully');
      loadContracts();
    } catch (error) {
      console.error('Error deleting monitoring:', error);
      toast.error('Error deleting record');
    }
  };

  const renderWorksGoodsTable = () => {
    const data = activeTab === 'works' ? works : goods;
    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>{t('projectActions.contractNumber')}</th>
              <th>{activeTab === 'works' ? t('projectActions.contractor') : t('projectActions.supplier')}</th>
              <th>{t('common.consultant')}</th>
              <th className="text-end">{t('projectActions.contractValue')}</th>
              <th>{t('common.startDate')}</th>
              <th>{t('common.endDate')}</th>
              <th>{t('common.duration')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan="8" className="text-center text-muted">{t('table.noData')}</td></tr>
            ) : (
              data.map((item, index) => (
                <tr key={index}>
                  <td><strong>{item.contractRefNo}</strong></td>
                  <td>{activeTab === 'works' ? item.nameOfContractor : item.nameOfSupplier}</td>
                  <td>{item.nameOfConsultant}</td>
                  <td className="text-end">${formatCurrency(item.contractValue)}</td>
                  <td>{formatDate(item.contractStartDate)}</td>
                  <td>{formatDate(item.contractEndDate)}</td>
                  <td>{item.duration}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1"><FiEdit2 /></button>
                    <button className="btn btn-sm btn-outline-danger"><FiTrash2 /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMonitoringTable = () => {
    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>{t('projectActions.contractNumber')}</th>
              <th>{t('projectActions.monitoringDate')}</th>
              <th>{t('projectActions.monitoringType')}</th>
              <th>{t('projectActions.milestoneStartDate')}</th>
              <th>{t('projectActions.milestoneEndDate')}</th>
              <th>{t('projectActions.target')}</th>
              <th>{t('projectActions.achievedStatus')}</th>
              <th>{t('projectActions.remarks')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {monitoring.length === 0 ? (
              <tr><td colSpan="9" className="text-center text-muted">{t('table.noData')}</td></tr>
            ) : (
              monitoring.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.contractRefNo || '-'}</strong></td>
                  <td>{formatDate(item.monitoringDate)}</td>
                  <td>{item.monitoringType?.monitoringType || '-'}</td>
                  <td>{formatDate(item.milestoneStartDate)}</td>
                  <td>{formatDate(item.milestoneEndDate)}</td>
                  <td>{item.target || '-'}</td>
                  <td>{item.achievedStatus || '-'}</td>
                  <td>{item.remarks || '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleOpenModal(item)}><FiEdit2 /></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteMonitoring(item.id)}><FiTrash2 /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('projectActions.title')}</h2>
        <div className="d-flex gap-3">
          <select className="form-select" value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ width: '250px' }}>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
          </select>
          <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => handleOpenModal()}>
            <FiPlus className="me-2" /> {getAddButtonLabel()}
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <FiFileText size={32} className="me-3" />
                <div>
                  <h6>{t('projectActions.worksContracts')}</h6>
                  <h3>{works.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <FiPackage size={32} className="me-3" />
                <div>
                  <h6>{t('projectActions.goodsContracts')}</h6>
                  <h3>{goods.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <FiActivity size={32} className="me-3" />
                <div>
                  <h6>{t('projectActions.contractMonitoring')}</h6>
                  <h3>{monitoring.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h6>{t('projectActions.totalValue')}</h6>
              <h3>${formatCurrency(getTotalContractValue())}</h3>
            </div>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'works' ? 'active' : ''}`} onClick={() => setActiveTab('works')}>
            <FiFileText className="me-2" /> {t('projectActions.worksContracts')}
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'goods' ? 'active' : ''}`} onClick={() => setActiveTab('goods')}>
            <FiPackage className="me-2" /> {t('projectActions.goodsContracts')}
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'monitoring' ? 'active' : ''}`} onClick={() => setActiveTab('monitoring')}>
            <FiActivity className="me-2" /> {t('projectActions.contractMonitoring')}
          </button>
        </li>
      </ul>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>
          ) : (
            activeTab === 'monitoring' ? renderMonitoringTable() : renderWorksGoodsTable()
          )}
        </div>
      </div>

      {showModal && activeTab === 'monitoring' && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{editingItem ? t('projectActions.addContractMonitoring') : t('projectActions.addContractMonitoring')}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleMonitoringSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('projectActions.contractNumber')} *</label>
                      <input name="contractRefNo" defaultValue={editingItem?.contractRefNo} className="form-control" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('projectActions.monitoringDate')}</label>
                      <input type="date" name="monitoringDate" defaultValue={editingItem?.monitoringDate} className="form-control" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('common.quarter')}</label>
                      <select name="quarterId" defaultValue={editingItem?.quarter?.id} className="form-select">
                        <option value="">----------</option>
                        {quarters.map(q => (
                          <option key={q.id} value={q.id}>{q.quarter}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('projectActions.monitoringType')}</label>
                      <select name="monitoringTypeId" defaultValue={editingItem?.monitoringType?.id} className="form-select">
                        <option value="">----------</option>
                        {monitoringTypes.map(mt => (
                          <option key={mt.id} value={mt.id}>{mt.monitoringType}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('projectActions.milestoneStartDate')}</label>
                      <input type="date" name="milestoneStartDate" defaultValue={editingItem?.milestoneStartDate} className="form-control" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('projectActions.milestoneEndDate')}</label>
                      <input type="date" name="milestoneEndDate" defaultValue={editingItem?.milestoneEndDate} className="form-control" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('projectActions.target')}</label>
                      <input name="target" defaultValue={editingItem?.target} className="form-control" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('projectActions.achievedStatus')}</label>
                      <input name="achievedStatus" defaultValue={editingItem?.achievedStatus} className="form-control" />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">{t('projectActions.remarks')}</label>
                      <textarea name="remarks" defaultValue={editingItem?.remarks} className="form-control" rows="3"></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={handleCloseModal}>{t('common.cancel')}</button>
                  <button type="submit" className="btn btn-primary">{editingItem ? t('common.update') : t('common.create')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showModal && activeTab !== 'monitoring' && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{activeTab === 'works' ? t('projectActions.addWorksContract') : t('projectActions.addGoodsContract')}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">{t('projectActions.contractNumber')}</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">{activeTab === 'works' ? t('projectActions.contractor') : t('projectActions.supplier')}</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">{t('projectActions.contractValue')}</label>
                    <input type="number" className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">{t('common.duration')}</label>
                    <input type="text" className="form-control" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCloseModal}>
                  {t('common.cancel')}
                </button>
                <button type="button" className="btn btn-primary" onClick={handleCloseModal}>
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectActions;
