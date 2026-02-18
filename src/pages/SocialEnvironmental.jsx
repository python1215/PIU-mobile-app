import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiShield, FiAlertTriangle, FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';

function SocialEnvironmental() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('esia');
  const [projects, setProjects] = useState([]);
  const [esia, setEsia] = useState([]);
  const [pap, setPap] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [ohs, setOhs] = useState([]);
  const [engagements, setEngagements] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [investmentTypes, setInvestmentTypes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [papTypes, setPapTypes] = useState([]);
  const [papCategories, setPapCategories] = useState([]);
  const [vulnerabilityCategories, setVulnerabilityCategories] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const isAll = selectedProject === 'all' || !selectedProject;
      const basePath = isAll ? '' : `/project/${selectedProject}`;
      const [esiaRes, papRes, grievRes, ohsRes, engRes] = await Promise.all([
        axios.get(`/api/social-environmental/esia${basePath}`).catch(() => ({ data: [] })),
        axios.get(`/api/social-environmental/pap${basePath}`).catch(() => ({ data: [] })),
        axios.get(`/api/social-environmental/grievance${basePath}`).catch(() => ({ data: [] })),
        axios.get(`/api/social-environmental/ohs${basePath}`).catch(() => ({ data: [] })),
        axios.get(`/api/social-environmental/community-engagement${basePath}`).catch(() => ({ data: [] }))
      ]);
      setEsia(esiaRes.data);
      setPap(papRes.data);
      setGrievances(grievRes.data);
      setOhs(ohsRes.data);
      setEngagements(engRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [regRes, distRes, settRes, ptRes, pcRes, vcRes, itRes] = await Promise.all([
        axios.get('/api/setup/regions').catch(() => ({ data: [] })),
        axios.get('/api/setup/districts').catch(() => ({ data: [] })),
        axios.get('/api/setup/settlements').catch(() => ({ data: [] })),
        axios.get('/api/setup/pap-types').catch(() => ({ data: [] })),
        axios.get('/api/setup/pap-categories').catch(() => ({ data: [] })),
        axios.get('/api/setup/vulnerability-categories').catch(() => ({ data: [] })),
        axios.get('/api/setup/kpi-contracts').catch(() => ({ data: [] }))
      ]);
      setRegions(regRes.data);
      setDistricts(distRes.data);
      setSettlements(settRes.data);
      setPapTypes(ptRes.data);
      setPapCategories(pcRes.data);
      setVulnerabilityCategories(vcRes.data);
      setInvestmentTypes(itRes.data);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const tabs = useMemo(() => [
    { id: 'esia', label: t('socialEnvironmental.esia'), icon: FiShield, data: esia },
    { id: 'pap', label: t('socialEnvironmental.pap'), icon: FiUsers, data: pap },
    { id: 'grievance', label: t('socialEnvironmental.grievances'), icon: FiAlertTriangle, data: grievances },
    { id: 'ohs', label: t('socialEnvironmental.ohs'), icon: FiHeart, data: ohs },
    { id: 'engagement', label: t('socialEnvironmental.communityEngagement'), icon: FiUsers, data: engagements }
  ], [t, esia, pap, grievances, ohs, engagements]);

  const handleOpenModal = useCallback((item = null) => {
    if (activeTab === 'esia' || activeTab === 'pap') {
      loadReferenceData();
    }
    if (item) {
      setEditingItem(item);
      if (activeTab === 'esia') {
        setFormData({
          projectId: item.project?.projectId || '',
          typeOfInvestment: item.typeOfInvestment || '',
          projectDuration: item.projectDuration || '',
          projectPhase: item.projectPhase || '',
          projectLocations: item.projectLocations || '',
          numberOfCommunities: item.numberOfCommunities || '',
          esiaFindings: item.esiaFindings || ''
        });
      } else if (activeTab === 'pap') {
        const regionCode = item.region?.regionCode || '';
        setFormData({
          projectId: item.project?.projectId || '',
          investmentTypeId: item.investmentType?.id || '',
          regionCode: regionCode,
          districtCode: item.district?.districtCode || '',
          sex: item.sex || '',
          papTypeId: item.papType?.id || '',
          papCategoryId: item.papCategory?.id || '',
          vulnerabilityCategoryId: item.vulnerabilityCategory?.id || '',
          papCompensated: item.papCompensated || '',
          papIdentificationNumber: item.papIdentificationNumber || '',
          settlementCode: item.currentAddress?.settlementCode || '',
          remarks: item.remarks || '',
          dateReceivedFrom: item.dateReceivedFrom || '',
          dateReceivedTo: item.dateReceivedTo || ''
        });
      }
    } else {
      setEditingItem(null);
      const pid = selectedProject !== 'all' ? selectedProject : '';
      if (activeTab === 'esia') {
        setFormData({
          projectId: pid,
          typeOfInvestment: '',
          projectDuration: '',
          projectPhase: '',
          projectLocations: '',
          numberOfCommunities: '',
          esiaFindings: ''
        });
      } else if (activeTab === 'pap') {
        setFormData({
          projectId: pid,
          investmentTypeId: '',
          regionCode: '',
          districtCode: '',
          sex: '',
          papTypeId: '',
          papCategoryId: '',
          vulnerabilityCategoryId: '',
          papCompensated: '',
          papIdentificationNumber: '',
          settlementCode: '',
          remarks: '',
          dateReceivedFrom: '',
          dateReceivedTo: ''
        });
      }
    }
    setShowModal(true);
  }, [activeTab, selectedProject]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'projectId') {
      setFormData(prev => ({ ...prev, projectId: value, investmentTypeId: '' }));
    }
    if (name === 'regionCode') {
      setFormData(prev => ({ ...prev, regionCode: value, districtCode: '', settlementCode: '' }));
    }
    if (name === 'districtCode') {
      setFormData(prev => ({ ...prev, districtCode: value, settlementCode: '' }));
    }
  }, []);

  useEffect(() => {
    if (formData.regionCode) {
      const filtered = districts.filter(d => d.lga?.region?.regionCode === formData.regionCode);
      setFilteredDistricts(filtered);
    } else {
      setFilteredDistricts([]);
    }
  }, [formData.regionCode, districts]);

  const filteredSettlements = useMemo(() => {
    if (!formData.districtCode) return [];
    return settlements.filter(s => s.district?.districtCode === formData.districtCode);
  }, [formData.districtCode, settlements]);

  const filteredInvestmentTypes = useMemo(() => {
    if (!formData.projectId) return [];
    return investmentTypes.filter(it => it.project?.projectId === formData.projectId);
  }, [formData.projectId, investmentTypes]);

  const handleSubmitESIA = async (e) => {
    e.preventDefault();
    const payload = {
      project: formData.projectId ? { projectId: formData.projectId } : null,
      typeOfInvestment: formData.typeOfInvestment,
      projectDuration: formData.projectDuration ? parseInt(formData.projectDuration) : null,
      projectPhase: formData.projectPhase ? parseInt(formData.projectPhase) : null,
      projectLocations: formData.projectLocations,
      numberOfCommunities: formData.numberOfCommunities ? parseInt(formData.numberOfCommunities) : null,
      esiaFindings: formData.esiaFindings
    };

    try {
      if (editingItem) {
        await axios.put(`/api/social-environmental/esia/${editingItem.id}`, payload);
        toast.success(t('socialEnvironmental.esiaUpdated'));
      } else {
        await axios.post('/api/social-environmental/esia', payload);
        toast.success(t('socialEnvironmental.esiaCreated'));
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error saving ESIA:', error);
      const msg = error.response?.data?.message || t('common.error');
      toast.error(msg);
    }
  };

  const handleSubmitPAP = async (e) => {
    e.preventDefault();
    const payload = {
      papIdentificationNumber: formData.papIdentificationNumber,
      project: formData.projectId ? { projectId: formData.projectId } : null,
      investmentType: formData.investmentTypeId ? { id: parseInt(formData.investmentTypeId) } : null,
      region: formData.regionCode ? { regionCode: formData.regionCode } : null,
      district: formData.districtCode ? { districtCode: formData.districtCode } : null,
      sex: formData.sex || null,
      papType: formData.papTypeId ? { id: parseInt(formData.papTypeId) } : null,
      papCategory: formData.papCategoryId ? { id: parseInt(formData.papCategoryId) } : null,
      vulnerabilityCategory: formData.vulnerabilityCategoryId ? { id: parseInt(formData.vulnerabilityCategoryId) } : null,
      papCompensated: formData.papCompensated || null,
      currentAddress: formData.settlementCode ? { settlementCode: formData.settlementCode } : null,
      remarks: formData.remarks || null,
      dateReceivedFrom: formData.dateReceivedFrom || null,
      dateReceivedTo: formData.dateReceivedTo || null
    };

    try {
      if (editingItem) {
        await axios.put(`/api/social-environmental/pap/${editingItem.papIdentificationNumber}`, payload);
        toast.success(t('socialEnvironmental.papUpdated'));
      } else {
        await axios.post('/api/social-environmental/pap', payload);
        toast.success(t('socialEnvironmental.papCreated'));
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error saving PAP:', error);
      const msg = error.response?.data?.message || t('common.error');
      toast.error(msg);
    }
  };

  const handleDeleteESIA = async (id) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      await axios.delete(`/api/social-environmental/esia/${id}`);
      toast.success(t('socialEnvironmental.esiaDeleted'));
      loadData();
    } catch (error) {
      console.error('Error deleting ESIA:', error);
      const msg = error.response?.data?.message || t('common.error');
      toast.error(msg);
    }
  };

  const handleDeletePAP = async (id) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      await axios.delete(`/api/social-environmental/pap/${id}`);
      toast.success(t('socialEnvironmental.papDeleted'));
      loadData();
    } catch (error) {
      console.error('Error deleting PAP:', error);
      const msg = error.response?.data?.message || t('common.error');
      toast.error(msg);
    }
  };

  const renderESIATable = () => (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>{t('socialEnvironmental.esiaId')}</th>
            <th>{t('common.project')}</th>
            <th>{t('socialEnvironmental.typeOfInvestment')}</th>
            <th>{t('socialEnvironmental.projectDuration')}</th>
            <th>{t('socialEnvironmental.projectPhase')}</th>
            <th>{t('socialEnvironmental.locations')}</th>
            <th>{t('socialEnvironmental.communities')}</th>
            <th>{t('socialEnvironmental.findings')}</th>
            <th>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {esia.length === 0 ? (
            <tr><td colSpan="9" className="text-center text-muted">{t('table.noData')}</td></tr>
          ) : (
            esia.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.esiaId || '-'}</strong></td>
                <td>{item.project?.project || '-'}</td>
                <td>{item.typeOfInvestment || '-'}</td>
                <td>{item.projectDuration || '-'}</td>
                <td>{item.projectPhase || '-'}</td>
                <td>{item.projectLocations || '-'}</td>
                <td>{item.numberOfCommunities || '-'}</td>
                <td className="text-truncate" style={{maxWidth: '200px'}}>{item.esiaFindings || '-'}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleOpenModal(item)}><FiEdit2 /></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteESIA(item.id)}><FiTrash2 /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderPAPTable = () => (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>{t('socialEnvironmental.papId')}</th>
            <th>{t('common.project')}</th>
            <th>{t('socialEnvironmental.typeOfInvestment')}</th>
            <th>{t('setup.regions')}</th>
            <th>{t('setup.districts')}</th>
            <th>{t('socialEnvironmental.sex')}</th>
            <th>{t('socialEnvironmental.papType')}</th>
            <th>{t('socialEnvironmental.papCategory')}</th>
            <th>{t('socialEnvironmental.compensated')}</th>
            <th>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {pap.length === 0 ? (
            <tr><td colSpan="10" className="text-center text-muted">{t('table.noData')}</td></tr>
          ) : (
            pap.map((item) => (
              <tr key={item.papIdentificationNumber}>
                <td><strong>{item.papIdentificationNumber}</strong></td>
                <td>{item.project?.project || '-'}</td>
                <td>{item.investmentType?.typeOfInvestment || '-'}</td>
                <td>{item.region?.regionName || '-'}</td>
                <td>{item.district?.districtName || '-'}</td>
                <td>{item.sex || '-'}</td>
                <td>{item.papType?.typeOfPap || '-'}</td>
                <td>{item.papCategory?.papCategory || '-'}</td>
                <td>
                  <span className={`badge bg-${item.papCompensated === 'Y' ? 'success' : 'warning'}`}>
                    {item.papCompensated === 'Y' ? t('common.yes') : t('common.no')}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleOpenModal(item)}><FiEdit2 /></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeletePAP(item.papIdentificationNumber)}><FiTrash2 /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderOtherTable = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    const data = currentTab?.data || [];

    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              {activeTab === 'grievance' && <><th>{t('socialEnvironmental.caseNo')}</th><th>{t('socialEnvironmental.complainant')}</th><th>{t('socialEnvironmental.dateReceived')}</th><th>{t('socialEnvironmental.outcome')}</th><th>{t('socialEnvironmental.satisfied')}</th></>}
              {activeTab === 'ohs' && <><th>ID</th><th>{t('common.date')}</th><th>{t('setup.regions')}</th><th>{t('socialEnvironmental.male')}</th><th>{t('socialEnvironmental.female')}</th><th>{t('socialEnvironmental.youth')}</th></>}
              {activeTab === 'engagement' && <><th>{t('socialEnvironmental.reference')}</th><th>{t('socialEnvironmental.place')}</th><th>{t('common.date')}</th><th>{t('socialEnvironmental.male')}</th><th>{t('socialEnvironmental.female')}</th><th>{t('common.total')}</th></>}
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan="7" className="text-center text-muted">{t('table.noData')}</td></tr>
            ) : (
              data.map((item, index) => (
                <tr key={index}>
                  {activeTab === 'grievance' && (
                    <><td>{item.caseNo}</td><td>{item.nameOfComplainant}</td><td>{item.dateClaimReceived}</td><td>{item.decisionOutcome?.outcome}</td><td><span className={`badge bg-${item.complainantSatisfied === 'Y' ? 'success' : 'danger'}`}>{item.complainantSatisfied === 'Y' ? t('common.yes') : t('common.no')}</span></td></>
                  )}
                  {activeTab === 'ohs' && (
                    <><td>{item.id}</td><td>{item.monitoringDate}</td><td>{item.region?.regionName}</td><td>{item.male}</td><td>{item.female}</td><td>{(item.youthMale || 0) + (item.youthFemale || 0)}</td></>
                  )}
                  {activeTab === 'engagement' && (
                    <><td>{item.referenceNumber}</td><td>{item.placeOfEvent}</td><td>{item.dateOfConsultation}</td><td>{item.male}</td><td>{item.female}</td><td>{item.totalParticipants}</td></>
                  )}
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

  const renderESIAForm = () => (
    <form onSubmit={handleSubmitESIA}>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">{t('common.project')} *</label>
          <select className="form-select" name="projectId" value={formData.projectId || ''} onChange={handleChange} required>
            <option value="">{t('common.select')}</option>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('socialEnvironmental.typeOfInvestment')}</label>
          <select className="form-select" name="typeOfInvestment" value={formData.typeOfInvestment || ''} onChange={handleChange}>
            <option value="">{t('common.select')}</option>
            {investmentTypes.map(it => <option key={it.id} value={it.typeOfInvestment}>{it.typeOfInvestment}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">{t('socialEnvironmental.projectDuration')}</label>
          <input type="number" className="form-control" name="projectDuration" value={formData.projectDuration || ''} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label">{t('socialEnvironmental.projectPhase')}</label>
          <input type="number" className="form-control" name="projectPhase" value={formData.projectPhase || ''} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('socialEnvironmental.locations')}</label>
          <input type="text" className="form-control" name="projectLocations" value={formData.projectLocations || ''} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('socialEnvironmental.communities')}</label>
          <input type="number" className="form-control" name="numberOfCommunities" value={formData.numberOfCommunities || ''} onChange={handleChange} />
        </div>
        <div className="col-12">
          <label className="form-label">{t('socialEnvironmental.findings')}</label>
          <textarea className="form-control" name="esiaFindings" rows="4" value={formData.esiaFindings || ''} onChange={handleChange}></textarea>
        </div>
      </div>
      <div className="modal-footer mt-3 px-0">
        <button type="button" className="btn btn-outline-secondary" onClick={handleCloseModal}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn btn-primary">
          {editingItem ? t('common.update') : t('common.save')}
        </button>
      </div>
    </form>
  );

  const renderPAPForm = () => (
    <form onSubmit={handleSubmitPAP}>
      <div className="row g-3">
        <div className="col-12">
          <h6 className="text-primary border-bottom pb-2 mb-0">{t('common.project')}</h6>
        </div>
        <div className="col-md-6">
          <label className="form-label fw-semibold">{t('common.project')} *</label>
          <select className="form-select" name="projectId" value={formData.projectId || ''} onChange={handleChange} required>
            <option value="">{t('common.select')}</option>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label fw-semibold">{t('socialEnvironmental.typeOfInvestment')}</label>
          <select className="form-select" name="investmentTypeId" value={formData.investmentTypeId || ''} onChange={handleChange} disabled={!formData.projectId}>
            <option value="">{formData.projectId ? t('common.select') : '-- Select project first --'}</option>
            {filteredInvestmentTypes.map(it => <option key={it.id} value={it.id}>{it.typeOfInvestment}</option>)}
          </select>
        </div>

        <div className="col-12 mt-3">
          <h6 className="text-primary border-bottom pb-2 mb-0">{t('socialEnvironmental.location')}</h6>
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">{t('setup.regions')}</label>
          <select className="form-select" name="regionCode" value={formData.regionCode || ''} onChange={handleChange}>
            <option value="">{t('common.select')}</option>
            {regions.map(r => <option key={r.regionCode} value={r.regionCode}>{r.regionName}</option>)}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">{t('setup.districts')}</label>
          <select className="form-select" name="districtCode" value={formData.districtCode || ''} onChange={handleChange} disabled={!formData.regionCode}>
            <option value="">{formData.regionCode ? t('common.select') : '-- Select region first --'}</option>
            {filteredDistricts.map(d => <option key={d.districtCode} value={d.districtCode}>{d.districtName}</option>)}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">{t('socialEnvironmental.settlement')}</label>
          <select className="form-select" name="settlementCode" value={formData.settlementCode || ''} onChange={handleChange} disabled={!formData.districtCode}>
            <option value="">{formData.districtCode ? t('common.select') : '-- Select district first --'}</option>
            {filteredSettlements.map(s => <option key={s.settlementCode} value={s.settlementCode}>{s.settlementName}</option>)}
          </select>
        </div>

        <div className="col-12 mt-3">
          <h6 className="text-primary border-bottom pb-2 mb-0">{t('socialEnvironmental.pap')}</h6>
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">{t('socialEnvironmental.papId')} *</label>
          <input type="text" className="form-control" name="papIdentificationNumber" value={formData.papIdentificationNumber || ''} onChange={handleChange} required disabled={!!editingItem} placeholder="e.g. PAP-001" />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">{t('socialEnvironmental.sex')}</label>
          <select className="form-select" name="sex" value={formData.sex || ''} onChange={handleChange}>
            <option value="">{t('common.select')}</option>
            <option value="M">{t('socialEnvironmental.male')}</option>
            <option value="F">{t('socialEnvironmental.female')}</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">{t('socialEnvironmental.papType')}</label>
          <select className="form-select" name="papTypeId" value={formData.papTypeId || ''} onChange={handleChange}>
            <option value="">{t('common.select')}</option>
            {papTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.typeOfPap}</option>)}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">{t('socialEnvironmental.papCategory')}</label>
          <select className="form-select" name="papCategoryId" value={formData.papCategoryId || ''} onChange={handleChange}>
            <option value="">{t('common.select')}</option>
            {papCategories.map(pc => <option key={pc.id} value={pc.id}>{pc.papCategory}</option>)}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">{t('socialEnvironmental.vulnerabilityStatus')}</label>
          <select className="form-select" name="vulnerabilityCategoryId" value={formData.vulnerabilityCategoryId || ''} onChange={handleChange}>
            <option value="">{t('common.select')}</option>
            {vulnerabilityCategories.map(vc => <option key={vc.id} value={vc.id}>{vc.vulnerability}</option>)}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">{t('socialEnvironmental.compensated')}</label>
          <select className="form-select" name="papCompensated" value={formData.papCompensated || ''} onChange={handleChange}>
            <option value="">{t('common.select')}</option>
            <option value="Y">{t('common.yes')}</option>
            <option value="N">{t('common.no')}</option>
          </select>
        </div>

        <div className="col-12 mt-3">
          <h6 className="text-primary border-bottom pb-2 mb-0">{t('socialEnvironmental.dateReceived')}</h6>
        </div>
        <div className="col-md-6">
          <label className="form-label fw-semibold">{t('socialEnvironmental.dateReceivedFrom')}</label>
          <input type="date" className="form-control" name="dateReceivedFrom" value={formData.dateReceivedFrom || ''} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-semibold">{t('socialEnvironmental.dateReceivedTo')}</label>
          <input type="date" className="form-control" name="dateReceivedTo" value={formData.dateReceivedTo || ''} onChange={handleChange} />
        </div>

        <div className="col-12 mt-2">
          <label className="form-label fw-semibold">{t('socialEnvironmental.remarks')}</label>
          <textarea className="form-control" name="remarks" rows="3" value={formData.remarks || ''} onChange={handleChange} placeholder={t('socialEnvironmental.remarks')}></textarea>
        </div>
      </div>
      <div className="modal-footer mt-3 px-0">
        <button type="button" className="btn btn-outline-secondary" onClick={handleCloseModal}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn btn-primary">
          {editingItem ? t('common.update') : t('common.save')}
        </button>
      </div>
    </form>
  );

  const getModalTitle = () => {
    if (activeTab === 'esia') return editingItem ? t('socialEnvironmental.editESIA') : t('socialEnvironmental.addESIA');
    if (activeTab === 'pap') return editingItem ? t('socialEnvironmental.editPAP') : t('socialEnvironmental.addPAP');
    return t('common.addNew');
  };

  const renderActiveTable = () => {
    if (loading) return <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>;
    if (activeTab === 'esia') return renderESIATable();
    if (activeTab === 'pap') return renderPAPTable();
    return renderOtherTable();
  };

  const renderActiveForm = () => {
    if (activeTab === 'esia') return renderESIAForm();
    if (activeTab === 'pap') return renderPAPForm();
    return (
      <>
        <p className="text-muted">{t('common.formPlaceholder')}</p>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline-secondary" onClick={handleCloseModal}>
            {t('common.cancel')}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleCloseModal}>
            {t('common.save')}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('socialEnvironmental.title')}</h2>
        <div className="d-flex gap-3">
          <select className="form-select" value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ width: '250px' }}>
            <option value="all">{t('common.allProjects')}</option>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <FiPlus className="me-2" /> {t('common.addNew')}
          </button>
        </div>
      </div>

      <div className="row mb-4">
        {tabs.map(tab => (
          <div className="col" key={tab.id}>
            <div className="card">
              <div className="card-body text-center">
                <tab.icon size={24} className="mb-2 text-primary" />
                <h6>{tab.label}</h6>
                <h3>{tab.data.length}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

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
          {renderActiveTable()}
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{getModalTitle()}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                {renderActiveForm()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SocialEnvironmental;
