import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FiTrendingUp, FiTarget, FiActivity, FiBarChart2, FiPlus, FiEdit2, FiTrash2, FiSettings } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function StatCard({ icon: Icon, label, value, trend, bgColor }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div 
            className={`rounded-3 d-flex align-items-center justify-content-center ${bgColor}`}
            style={{ width: '48px', height: '48px' }}
          >
            <Icon size={22} className="text-white" />
          </div>
          {trend && (
            <span className={`small fw-semibold ${trend > 0 ? 'text-success' : 'text-danger'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <h3 className="fw-bold text-dark mb-1">{value}</h3>
        <p className="text-muted small mb-0">{label}</p>
      </div>
    </div>
  );
}

function KPIMonitoring() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [kpiContracts, setKpiContracts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [monitoringTypes, setMonitoringTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [kpiRes, projRes, mtRes] = await Promise.all([
        axios.get('/api/project-actions/kpi-for-contracts'),
        axios.get('/api/projects'),
        axios.get('/api/setup/monitoring-types')
      ]);
      setKpiContracts(Array.isArray(kpiRes.data) ? kpiRes.data : []);
      setProjects(Array.isArray(projRes.data) ? projRes.data : []);
      setMonitoringTypes(Array.isArray(mtRes.data) ? mtRes.data : []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      monitoringTypeCode: data.monitoringTypeCode,
      typeOfInvestment: data.typeOfInvestment,
      kpiDescription: data.kpiDescription,
      project: data.projectId ? { projectId: data.projectId } : null,
      monitoringType: data.monitoringTypeId ? { monitoringTypeCode: data.monitoringTypeId } : null
    };

    try {
      if (editingItem) {
        await axios.put(`/api/project-actions/kpi-for-contracts/${editingItem.monitoringTypeCode}`, payload);
        toast.success(t('common.updateSuccess'));
      } else {
        await axios.post('/api/project-actions/kpi-for-contracts', payload);
        toast.success(t('common.createSuccess'));
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error(t('common.error'));
    }
  };

  const handleDelete = async (monitoringTypeCode) => {
    if (!window.confirm(t('kpi.confirmDeleteKPI'))) return;
    try {
      await axios.delete(`/api/project-actions/kpi-for-contracts/${monitoringTypeCode}`);
      toast.success(t('common.deleteSuccess'));
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error(t('common.error'));
    }
  };

  const kpiData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'ROA (%)',
        data: [-12, -8, -4, 2],
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        tension: 0.4,
      },
      {
        label: 'NPM (%)',
        data: [-15, -10, -5, 3],
        borderColor: '#198754',
        backgroundColor: 'rgba(25, 135, 84, 0.1)',
        tension: 0.4,
      },
      {
        label: 'DSCR',
        data: [0.8, 0.9, 1.0, 1.2],
        borderColor: '#ffc107',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: t('kpi.performanceTrends'),
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark">{t('kpi.title')}</h1>
        <p className="text-muted mb-0">{t('kpi.subtitle')}</p>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <FiBarChart2 className="me-2" />{t('kpi.kpiDetails')}
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'contractSetup' ? 'active' : ''}`} onClick={() => setActiveTab('contractSetup')}>
            <FiSettings className="me-2" />{t('kpi.contractSetup')}
          </button>
        </li>
      </ul>

      {activeTab === 'dashboard' && (
        <>
          <div className="row g-4 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard icon={FiTrendingUp} label={t('kpi.returnOnAssets')} value="2.5%" trend={15} bgColor="bg-primary" />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard icon={FiTarget} label={t('kpi.netProfitMargin')} value="3.2%" trend={20} bgColor="bg-success" />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard icon={FiActivity} label={t('kpi.debtServiceCoverage')} value="1.2x" trend={8} bgColor="bg-warning" />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard icon={FiBarChart2} label={t('kpi.mwhGenerated')} value="45,230" trend={12} bgColor="bg-info" />
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-semibold">{t('kpi.performanceTrends')}</h5>
            </div>
            <div className="card-body">
              <Line data={kpiData} options={chartOptions} />
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-semibold">{t('kpi.kpiDetails')}</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 px-4 py-3">{t('kpi.indicator')}</th>
                      <th className="border-0 px-4 py-3">{t('kpi.baseline')}</th>
                      <th className="border-0 px-4 py-3">{t('kpi.target')}</th>
                      <th className="border-0 px-4 py-3">{t('kpi.achieved')}</th>
                      <th className="border-0 px-4 py-3" style={{ minWidth: '150px' }}>{t('kpi.progress')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 fw-medium">{t('kpi.returnOnAssets')}</td>
                      <td className="px-4 py-3">-12%</td>
                      <td className="px-4 py-3">6%</td>
                      <td className="px-4 py-3">2.5%</td>
                      <td className="px-4 py-3">
                        <div className="progress" style={{ height: '8px' }}>
                          <div className="progress-bar bg-primary" style={{ width: '80%' }}></div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 fw-medium">{t('kpi.netProfitMargin')}</td>
                      <td className="px-4 py-3">-15%</td>
                      <td className="px-4 py-3">10%</td>
                      <td className="px-4 py-3">3.2%</td>
                      <td className="px-4 py-3">
                        <div className="progress" style={{ height: '8px' }}>
                          <div className="progress-bar bg-success" style={{ width: '73%' }}></div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 fw-medium">{t('kpi.debtServiceCoverage')}</td>
                      <td className="px-4 py-3">0.8x</td>
                      <td className="px-4 py-3">1.5x</td>
                      <td className="px-4 py-3">1.2x</td>
                      <td className="px-4 py-3">
                        <div className="progress" style={{ height: '8px' }}>
                          <div className="progress-bar bg-warning" style={{ width: '57%' }}></div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 fw-medium">{t('kpi.mwhGenerated')}</td>
                      <td className="px-4 py-3">30,000</td>
                      <td className="px-4 py-3">50,000</td>
                      <td className="px-4 py-3">45,230</td>
                      <td className="px-4 py-3">
                        <div className="progress" style={{ height: '8px' }}>
                          <div className="progress-bar bg-info" style={{ width: '76%' }}></div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'contractSetup' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-semibold">{t('kpi.contractSetup')}</h5>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <FiPlus className="me-1" /> {t('kpi.addContractKPI')}
            </button>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : kpiContracts.length === 0 ? (
              <div className="text-center py-5 text-muted">{t('kpi.noContractKPIs')}</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 px-4 py-3">{t('kpi.monitoringTypeCode')}</th>
                      <th className="border-0 px-4 py-3">{t('common.project')}</th>
                      <th className="border-0 px-4 py-3">{t('kpi.typeOfInvestment')}</th>
                      <th className="border-0 px-4 py-3">{t('kpi.kpiDescription')}</th>
                      <th className="border-0 px-4 py-3">{t('kpi.selectMonitoringType')}</th>
                      <th className="border-0 px-4 py-3">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpiContracts.map(item => (
                      <tr key={item.monitoringTypeCode}>
                        <td className="px-4 py-3 fw-medium">{item.monitoringTypeCode}</td>
                        <td className="px-4 py-3">{item.project?.project || item.project?.projectId || '-'}</td>
                        <td className="px-4 py-3">{item.typeOfInvestment || '-'}</td>
                        <td className="px-4 py-3">{item.kpiDescription || '-'}</td>
                        <td className="px-4 py-3">{item.monitoringType?.monitoringType || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary" onClick={() => handleOpenModal(item)}>
                              <FiEdit2 size={14} />
                            </button>
                            <button className="btn btn-outline-danger" onClick={() => handleDelete(item.monitoringTypeCode)}>
                              <FiTrash2 size={14} />
                            </button>
                          </div>
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <h5 className="modal-title text-white">
                  {editingItem ? t('kpi.editContractKPI') : t('kpi.addContractKPI')}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('kpi.monitoringTypeCode')} *</label>
                      <input 
                        type="text" 
                        name="monitoringTypeCode" 
                        defaultValue={editingItem?.monitoringTypeCode || ''} 
                        className="form-control" 
                        required 
                        readOnly={!!editingItem}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('kpi.selectProject')}</label>
                      <select name="projectId" defaultValue={editingItem?.project?.projectId || ''} className="form-select">
                        <option value="">----------</option>
                        {projects.map(p => (
                          <option key={p.projectId} value={p.projectId}>{p.project || p.projectId}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('kpi.typeOfInvestment')} *</label>
                      <input 
                        type="text" 
                        name="typeOfInvestment" 
                        defaultValue={editingItem?.typeOfInvestment || ''} 
                        className="form-control" 
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('kpi.kpiDescription')} *</label>
                      <input 
                        type="text" 
                        name="kpiDescription" 
                        defaultValue={editingItem?.kpiDescription || ''} 
                        className="form-control" 
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('kpi.selectMonitoringType')} *</label>
                      <select name="monitoringTypeId" defaultValue={editingItem?.monitoringType?.monitoringTypeCode || ''} className="form-select" required>
                        <option value="">----------</option>
                        {monitoringTypes.map(mt => (
                          <option key={mt.monitoringTypeCode} value={mt.monitoringTypeCode}>{mt.monitoringType}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>{t('common.cancel')}</button>
                  <button type="submit" className="btn btn-primary">
                    {editingItem ? t('common.update') : t('common.create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KPIMonitoring;
