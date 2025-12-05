import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiFileText, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';

function ProjectActions() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('works');
  const [projects, setProjects] = useState([]);
  const [works, setWorks] = useState([]);
  const [goods, setGoods] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadProjects();
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

  const loadContracts = async () => {
    setLoading(true);
    try {
      const [worksRes, goodsRes] = await Promise.all([
        axios.get(`/api/project-actions/works/project/${selectedProject}`).catch(() => ({ data: [] })),
        axios.get(`/api/project-actions/goods/project/${selectedProject}`).catch(() => ({ data: [] }))
      ]);
      setWorks(worksRes.data);
      setGoods(goodsRes.data);
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

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('projectActions.title')}</h2>
        <div className="d-flex gap-3">
          <select className="form-select" value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ width: '250px' }}>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus className="me-2" /> {activeTab === 'works' ? t('projectActions.addWorksContract') : t('projectActions.addGoodsContract')}
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
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
        <div className="col-md-4">
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
        <div className="col-md-4">
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
      </ul>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>
          ) : (
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
                  {(activeTab === 'works' ? works : goods).length === 0 ? (
                    <tr><td colSpan="8" className="text-center text-muted">{t('table.noData')}</td></tr>
                  ) : (
                    (activeTab === 'works' ? works : goods).map((item, index) => (
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
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{activeTab === 'works' ? t('projectActions.addWorksContract') : t('projectActions.addGoodsContract')}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
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
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                  {t('common.cancel')}
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setShowModal(false)}>
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
