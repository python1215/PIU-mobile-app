import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiTrendingUp, FiTarget } from 'react-icons/fi';
import toast from 'react-hot-toast';

function MonitoringEvaluation() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [monitoring, setMonitoring] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadMonitoring();
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

  const loadMonitoring = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/monitoring/project/${selectedProject}`);
      setMonitoring(res.data);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
      setMonitoring([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (baseline, achieved, target) => {
    if (!target || target === 0) return 0;
    return Math.round((achieved / target) * 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('monitoring.title')}</h2>
        <div className="d-flex gap-3">
          <select className="form-select" value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ width: '250px' }}>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus className="me-2" /> {t('monitoring.addResult')}
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <FiTarget size={32} className="me-3" />
                <div>
                  <h6>{t('monitoring.totalIndicators')}</h6>
                  <h3>{monitoring.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <FiTrendingUp size={32} className="me-3" />
                <div>
                  <h6>{t('monitoring.onTrack')}</h6>
                  <h3>{monitoring.filter(m => calculateProgress(m.baselineValue, m.achievedValue, m.endTargetValue) >= 75).length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <FiTrendingUp size={32} className="me-3" />
                <div>
                  <h6>{t('monitoring.atRisk')}</h6>
                  <h3>{monitoring.filter(m => {
                    const p = calculateProgress(m.baselineValue, m.achievedValue, m.endTargetValue);
                    return p >= 50 && p < 75;
                  }).length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <FiTrendingUp size={32} className="me-3" />
                <div>
                  <h6>{t('monitoring.offTrack')}</h6>
                  <h3>{monitoring.filter(m => calculateProgress(m.baselineValue, m.achievedValue, m.endTargetValue) < 50).length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>{t('monitoring.resultsMonitoring')}</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>{t('monitoring.indicatorDescription')}</th>
                    <th className="text-center">{t('monitoring.baseline')}</th>
                    <th className="text-center">{t('monitoring.achieved')}</th>
                    <th className="text-center">{t('monitoring.target')}</th>
                    <th className="text-center">{t('monitoring.progress')}</th>
                    <th>{t('common.remarks')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {monitoring.length === 0 ? (
                    <tr><td colSpan="7" className="text-center text-muted">{t('table.noData')}</td></tr>
                  ) : (
                    monitoring.map((item, index) => {
                      const progress = calculateProgress(item.baselineValue, item.achievedValue, item.endTargetValue);
                      return (
                        <tr key={index}>
                          <td>{item.indicatorDescription}</td>
                          <td className="text-center">{item.baselineValue}</td>
                          <td className="text-center">{item.achievedValue}</td>
                          <td className="text-center">{item.endTargetValue}</td>
                          <td className="text-center">
                            <div className="progress" style={{ height: '20px' }}>
                              <div 
                                className={`progress-bar bg-${getProgressColor(progress)}`} 
                                role="progressbar" 
                                style={{ width: `${progress}%` }}
                              >
                                {progress}%
                              </div>
                            </div>
                          </td>
                          <td>{item.remarks}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-1"><FiEdit2 /></button>
                            <button className="btn btn-sm btn-outline-danger"><FiTrash2 /></button>
                          </td>
                        </tr>
                      );
                    })
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
                <h5 className="modal-title">{t('monitoring.addResult')}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">{t('monitoring.indicatorDescription')}</label>
                  <textarea className="form-control" rows={3}></textarea>
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <label className="form-label">{t('monitoring.baseline')}</label>
                    <input type="number" className="form-control" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">{t('monitoring.achieved')}</label>
                    <input type="number" className="form-control" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">{t('monitoring.target')}</label>
                    <input type="number" className="form-control" />
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

export default MonitoringEvaluation;
