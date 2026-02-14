import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiTrendingUp, FiTarget, FiEye, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

function MonitoringEvaluation() {
  const { t } = useTranslation();
  const [monitoring, setMonitoring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  const [projects, setProjects] = useState([]);
  const [years, setYears] = useState([]);
  const [quarters, setQuarters] = useState([]);
  const [pdos, setPdos] = useState([]);
  const [outcomes, setOutcomes] = useState([]);
  const [results, setResults] = useState([]);
  const [indicatorTypes, setIndicatorTypes] = useState([]);
  const [measurementUnits, setMeasurementUnits] = useState([]);
  const [frequencies, setFrequencies] = useState([]);

  const [formProjectId, setFormProjectId] = useState('');
  const [formPdoId, setFormPdoId] = useState('');
  const [formOutcomeId, setFormOutcomeId] = useState('');
  const [formResultId, setFormResultId] = useState('');
  const [formBaseline, setFormBaseline] = useState('');
  const [formAchieved, setFormAchieved] = useState('');
  const [formEndTarget, setFormEndTarget] = useState('');

  const pctVsBaseline = useMemo(() => {
    const b = parseFloat(formBaseline);
    const a = parseFloat(formAchieved);
    if (!isNaN(b) && !isNaN(a) && b !== 0) return ((a / b) * 100).toFixed(2);
    return '';
  }, [formBaseline, formAchieved]);

  const pctVsEndTarget = useMemo(() => {
    const t = parseFloat(formEndTarget);
    const a = parseFloat(formAchieved);
    if (!isNaN(t) && !isNaN(a) && t !== 0) return ((a / t) * 100).toFixed(2);
    return '';
  }, [formEndTarget, formAchieved]);

  const loadReferenceData = useCallback(async () => {
    try {
      const [projRes, yearRes, quarterRes, pdoRes, outcomeRes, resultRes, indRes, muRes, freqRes] = await Promise.all([
        api.get('/projects').catch(() => ({ data: [] })),
        api.get('/setup/years').catch(() => ({ data: [] })),
        api.get('/setup/quarters').catch(() => ({ data: [] })),
        api.get('/setup/pdos').catch(() => ({ data: [] })),
        api.get('/setup/outcomes').catch(() => ({ data: [] })),
        api.get('/setup/results').catch(() => ({ data: [] })),
        api.get('/setup/indicator-types').catch(() => ({ data: [] })),
        api.get('/setup/measurement-units').catch(() => ({ data: [] })),
        api.get('/setup/data-frequencies').catch(() => ({ data: [] }))
      ]);
      setProjects(projRes.data);
      setYears(yearRes.data);
      setQuarters(quarterRes.data);
      setPdos(pdoRes.data);
      setOutcomes(outcomeRes.data);
      setResults(resultRes.data);
      setIndicatorTypes(indRes.data);
      setMeasurementUnits(muRes.data);
      setFrequencies(freqRes.data);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  }, []);

  const loadMonitoring = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/monitoring');
      setMonitoring(res.data);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
      setMonitoring([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReferenceData();
    loadMonitoring();
  }, [loadReferenceData, loadMonitoring]);

  const filteredOutcomes = useMemo(() => {
    if (!formPdoId) return [];
    return outcomes.filter(o => o.pdo?.id?.toString() === formPdoId);
  }, [outcomes, formPdoId]);

  const filteredResults = useMemo(() => {
    if (!formOutcomeId) return [];
    return results.filter(r => r.projectOutcome?.id?.toString() === formOutcomeId);
  }, [results, formOutcomeId]);

  const calculateProgress = (baseline, achieved, target) => {
    if (!target || target === 0) return 0;
    return Math.round((achieved / target) * 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };

  const handleOpenAdd = useCallback(() => {
    setEditingItem(null);
    setFormProjectId('');
    setFormPdoId('');
    setFormOutcomeId('');
    setFormResultId('');
    setFormBaseline('');
    setFormAchieved('');
    setFormEndTarget('');
    setShowModal(true);
  }, []);

  const handleOpenEdit = useCallback((item) => {
    setEditingItem(item);
    setFormProjectId(item.project?.projectId || '');
    setFormPdoId(item.pdo?.id?.toString() || '');
    setFormOutcomeId(item.projectOutcome?.id?.toString() || '');
    setFormResultId(item.projectResult?.id?.toString() || '');
    setFormBaseline(item.baselineValue != null ? String(item.baselineValue) : '');
    setFormAchieved(item.achievedValue != null ? String(item.achievedValue) : '');
    setFormEndTarget(item.endTargetValue != null ? String(item.endTargetValue) : '');
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingItem(null);
    setFormProjectId('');
    setFormPdoId('');
    setFormOutcomeId('');
    setFormResultId('');
    setFormBaseline('');
    setFormAchieved('');
    setFormEndTarget('');
  }, []);

  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    const baseline = parseFloat(data.baselineValue) || 0;
    const achieved = parseFloat(data.achievedValue) || 0;
    const endTarget = parseFloat(data.endTargetValue) || 0;

    const pctBaseline = baseline !== 0 ? Math.round((achieved / baseline) * 100 * 100) / 100 : 0;
    const pctEndTarget = endTarget !== 0 ? Math.round((achieved / endTarget) * 100 * 100) / 100 : 0;

    const payload = {
      year: data.yearId ? { id: parseInt(data.yearId) } : null,
      quarter: data.quarterId ? { id: parseInt(data.quarterId) } : null,
      project: data.projectId ? { projectId: data.projectId } : null,
      pdo: data.pdoId ? { id: parseInt(data.pdoId) } : null,
      projectOutcome: data.outcomeId ? { id: parseInt(data.outcomeId) } : null,
      projectResult: data.resultId ? { id: parseInt(data.resultId) } : null,
      indicatorType: data.indicatorTypeId ? { id: parseInt(data.indicatorTypeId) } : null,
      indicatorDescription: data.indicatorDescription,
      measurementUnit: data.measurementUnitId ? { id: parseInt(data.measurementUnitId) } : null,
      collectionFrequency: data.frequencyId ? { id: parseInt(data.frequencyId) } : null,
      baselineValue: baseline,
      achievedValue: achieved,
      endTargetValue: endTarget,
      percentageAchievedVsBaseline: pctBaseline,
      percentageAchievedVsEndTarget: pctEndTarget,
      remarks: data.remarks
    };

    try {
      if (editingItem) {
        await api.put(`/monitoring/${editingItem.id}`, payload);
        toast.success('Record updated successfully');
      } else {
        await api.post('/monitoring', payload);
        toast.success('Record created successfully');
      }
      handleCloseModal();
      loadMonitoring();
    } catch (error) {
      console.error('Error saving monitoring record:', error);
      toast.error('Error saving record');
    }
  }, [editingItem, handleCloseModal, loadMonitoring, formResultId]);

  const handleDelete = useCallback(async (item) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/monitoring/${item.id}`);
      toast.success('Record deleted successfully');
      loadMonitoring();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Error deleting record');
    }
  }, [loadMonitoring]);

  const onTrackCount = useMemo(() => monitoring.filter(m => calculateProgress(m.baselineValue, m.achievedValue, m.endTargetValue) >= 75).length, [monitoring]);
  const atRiskCount = useMemo(() => monitoring.filter(m => { const p = calculateProgress(m.baselineValue, m.achievedValue, m.endTargetValue); return p >= 50 && p < 75; }).length, [monitoring]);
  const offTrackCount = useMemo(() => monitoring.filter(m => calculateProgress(m.baselineValue, m.achievedValue, m.endTargetValue) < 50).length, [monitoring]);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('monitoring.title')}</h2>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <FiPlus className="me-2" /> Add New
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <FiTarget size={32} className="me-3" />
                <div><h6>{t('monitoring.totalIndicators')}</h6><h3>{monitoring.length}</h3></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <FiTrendingUp size={32} className="me-3" />
                <div><h6>{t('monitoring.onTrack')}</h6><h3>{onTrackCount}</h3></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <FiTrendingUp size={32} className="me-3" />
                <div><h6>{t('monitoring.atRisk')}</h6><h3>{atRiskCount}</h3></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <FiTrendingUp size={32} className="me-3" />
                <div><h6>{t('monitoring.offTrack')}</h6><h3>{offTrackCount}</h3></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h5>{t('monitoring.resultsMonitoring')}</h5></div>
        <div className="card-body">
          {loading ? (
            <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Year</th>
                    <th>Quarter</th>
                    <th>Project</th>
                    <th>PDO</th>
                    <th>Indicator</th>
                    <th className="text-center">Baseline</th>
                    <th className="text-center">Achieved</th>
                    <th className="text-center">Target</th>
                    <th className="text-center">Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {monitoring.length === 0 ? (
                    <tr><td colSpan="10" className="text-center text-muted">{t('table.noData')}</td></tr>
                  ) : (
                    monitoring.map((item) => {
                      const progress = calculateProgress(item.baselineValue, item.achievedValue, item.endTargetValue);
                      return (
                        <tr key={item.id}>
                          <td>{item.year?.profileYear || '-'}</td>
                          <td>{item.quarter?.quarter || '-'}</td>
                          <td>{item.project?.project || '-'}</td>
                          <td>{item.pdo?.pdoStatement ? (item.pdo.pdoStatement.length > 30 ? item.pdo.pdoStatement.substring(0, 30) + '...' : item.pdo.pdoStatement) : '-'}</td>
                          <td>{item.indicatorDescription ? (item.indicatorDescription.length > 40 ? item.indicatorDescription.substring(0, 40) + '...' : item.indicatorDescription) : '-'}</td>
                          <td className="text-center">{item.baselineValue ?? '-'}</td>
                          <td className="text-center">{item.achievedValue ?? '-'}</td>
                          <td className="text-center">{item.endTargetValue ?? '-'}</td>
                          <td className="text-center" style={{ minWidth: '120px' }}>
                            <div className="progress" style={{ height: '20px' }}>
                              <div className={`progress-bar bg-${getProgressColor(progress)}`} role="progressbar" style={{ width: `${Math.min(progress, 100)}%` }}>
                                {progress}%
                              </div>
                            </div>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-info me-1" onClick={() => setViewingItem(item)} title="View"><FiEye /></button>
                            <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleOpenEdit(item)} title="Edit"><FiEdit2 /></button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item)} title="Delete"><FiTrash2 /></button>
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{editingItem ? 'Edit M&E Record' : 'Add M&E Record'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="card border-0 bg-light mb-3">
                    <div className="card-header bg-dark text-white py-2 fw-bold" style={{ fontSize: '0.9rem' }}>Results Oriented Monitoring</div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label fw-medium">Year</label>
                          <select name="yearId" defaultValue={editingItem?.year?.id || ''} className="form-select">
                            <option value="">----------</option>
                            {years.map(y => <option key={y.id} value={y.id}>{y.profileYear}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-medium">Quarter</label>
                          <select name="quarterId" defaultValue={editingItem?.quarter?.id || ''} className="form-select">
                            <option value="">----------</option>
                            {quarters.map(q => <option key={q.id} value={q.id}>{q.quarter}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-medium">Project</label>
                          <select name="projectId" value={formProjectId} onChange={(e) => setFormProjectId(e.target.value)} className="form-select">
                            <option value="">----------</option>
                            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-medium">PDO</label>
                          <select name="pdoId" value={formPdoId} onChange={(e) => { setFormPdoId(e.target.value); setFormOutcomeId(''); }} className="form-select">
                            <option value="">----------</option>
                            {pdos.map(p => <option key={p.id} value={p.id}>{p.pdoStatement}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-medium">Project Outcome</label>
                          <select name="outcomeId" value={formOutcomeId} onChange={(e) => { setFormOutcomeId(e.target.value); setFormResultId(''); }} className="form-select">
                            <option value="">{formPdoId ? '----------' : 'First select a PDO...'}</option>
                            {filteredOutcomes.map(o => <option key={o.id} value={o.id}>{o.projectOutcome}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-medium">Project Result</label>
                          <select name="resultId" value={formResultId} onChange={(e) => setFormResultId(e.target.value)} className="form-select">
                            <option value="">{formOutcomeId ? '----------' : 'First select an outcome...'}</option>
                            {filteredResults.map(r => <option key={r.id} value={r.id}>{r.projectResult}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-medium">Indicator Type</label>
                          <select name="indicatorTypeId" defaultValue={editingItem?.indicatorType?.id || ''} className="form-select">
                            <option value="">----------</option>
                            {indicatorTypes.map(it => <option key={it.id} value={it.id}>{it.indicatorType}</option>)}
                          </select>
                        </div>
                        <div className="col-md-8">
                          <label className="form-label fw-medium">Indicator Description</label>
                          <input name="indicatorDescription" defaultValue={editingItem?.indicatorDescription || ''} className="form-control" />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-medium">Measurement Unit</label>
                          <select name="measurementUnitId" defaultValue={editingItem?.measurementUnit?.id || ''} className="form-select">
                            <option value="">----------</option>
                            {measurementUnits.map(mu => <option key={mu.id} value={mu.id}>{mu.unit}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-medium">Collection Frequency</label>
                          <select name="frequencyId" defaultValue={editingItem?.collectionFrequency?.id || ''} className="form-select">
                            <option value="">----------</option>
                            {frequencies.map(f => <option key={f.id} value={f.id}>{f.frequency}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-medium">Baseline Value</label>
                          <input type="number" step="0.01" name="baselineValue" value={formBaseline} onChange={(e) => setFormBaseline(e.target.value)} className="form-control" />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-medium">Achieved Value</label>
                          <input type="number" step="0.01" name="achievedValue" value={formAchieved} onChange={(e) => setFormAchieved(e.target.value)} className="form-control" />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-medium">End Target Value</label>
                          <input type="number" step="0.01" name="endTargetValue" value={formEndTarget} onChange={(e) => setFormEndTarget(e.target.value)} className="form-control" />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-medium">% Achieved vs Baseline</label>
                          <input type="text" className="form-control bg-light" readOnly value={pctVsBaseline ? pctVsBaseline + '%' : '-'} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-medium">% Achieved vs End Target</label>
                          <input type="text" className="form-control bg-light" readOnly value={pctVsEndTarget ? pctVsEndTarget + '%' : '-'} />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-medium">Remarks</label>
                          <textarea name="remarks" defaultValue={editingItem?.remarks || ''} className="form-control" rows={2}></textarea>
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
                <h5 className="modal-title fw-bold">M&E Record Details</h5>
                <button type="button" className="btn-close" onClick={() => setViewingItem(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-4"><label className="form-label text-muted small">Year</label><p className="fw-medium">{viewingItem.year?.profileYear || '-'}</p></div>
                  <div className="col-md-4"><label className="form-label text-muted small">Quarter</label><p className="fw-medium">{viewingItem.quarter?.quarter || '-'}</p></div>
                  <div className="col-md-4"><label className="form-label text-muted small">Project</label><p className="fw-medium">{viewingItem.project?.project || '-'}</p></div>
                  <div className="col-md-4"><label className="form-label text-muted small">PDO</label><p className="fw-medium">{viewingItem.pdo?.pdoStatement || '-'}</p></div>
                  <div className="col-md-4"><label className="form-label text-muted small">Project Outcome</label><p className="fw-medium">{viewingItem.projectOutcome?.projectOutcome || '-'}</p></div>
                  <div className="col-md-4"><label className="form-label text-muted small">Project Result</label><p className="fw-medium">{viewingItem.projectResult?.projectResult || '-'}</p></div>
                  <div className="col-md-4"><label className="form-label text-muted small">Indicator Type</label><p className="fw-medium">{viewingItem.indicatorType?.indicatorType || '-'}</p></div>
                  <div className="col-md-8"><label className="form-label text-muted small">Indicator Description</label><p className="fw-medium">{viewingItem.indicatorDescription || '-'}</p></div>
                  <div className="col-md-4"><label className="form-label text-muted small">Measurement Unit</label><p className="fw-medium">{viewingItem.measurementUnit?.unit || '-'}</p></div>
                  <div className="col-md-4"><label className="form-label text-muted small">Collection Frequency</label><p className="fw-medium">{viewingItem.collectionFrequency?.frequency || '-'}</p></div>
                  <div className="col-md-4"><label className="form-label text-muted small">Baseline Value</label><p className="fw-medium">{viewingItem.baselineValue ?? '-'}</p></div>
                  <div className="col-md-4"><label className="form-label text-muted small">Achieved Value</label><p className="fw-medium">{viewingItem.achievedValue ?? '-'}</p></div>
                  <div className="col-md-4"><label className="form-label text-muted small">End Target Value</label><p className="fw-medium">{viewingItem.endTargetValue ?? '-'}</p></div>
                  <div className="col-md-4"><label className="form-label text-muted small">% vs Baseline</label><p className="fw-medium">{viewingItem.percentageAchievedVsBaseline != null ? viewingItem.percentageAchievedVsBaseline + '%' : '-'}</p></div>
                  <div className="col-md-4"><label className="form-label text-muted small">% vs End Target</label><p className="fw-medium">{viewingItem.percentageAchievedVsEndTarget != null ? viewingItem.percentageAchievedVsEndTarget + '%' : '-'}</p></div>
                  <div className="col-12"><label className="form-label text-muted small">Remarks</label><p className="fw-medium">{viewingItem.remarks || '-'}</p></div>
                  {viewingItem.dateCreated && (
                    <div className="col-12"><label className="form-label text-muted small">Date Created</label><p className="fw-medium">{new Date(viewingItem.dateCreated).toLocaleDateString()}</p></div>
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

export default MonitoringEvaluation;
