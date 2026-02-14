import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiFileText, FiPackage, FiActivity } from 'react-icons/fi';
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
  const [kpiForContracts, setKpiForContracts] = useState([]);
  const [implementationStatuses, setImplementationStatuses] = useState([]);

  const [components, setComponents] = useState([]);
  const [subcomponents, setSubcomponents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [donors, setDonors] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  const [worksFormProject, setWorksFormProject] = useState('');
  const [worksFormComp, setWorksFormComp] = useState('');
  const [worksFormSubcomp, setWorksFormSubcomp] = useState('');

  useEffect(() => {
    loadProjects();
    loadReferenceData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadContracts();
      loadFinancialData();
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
      const [qRes, mtRes, catRes, donorRes, curRes, kpiRes, implRes] = await Promise.all([
        axios.get('/api/setup/quarters').catch(() => ({ data: [] })),
        axios.get('/api/setup/monitoring-types').catch(() => ({ data: [] })),
        axios.get('/api/setup/categories').catch(() => ({ data: [] })),
        axios.get('/api/donors').catch(() => ({ data: [] })),
        axios.get('/api/setup/currencies').catch(() => ({ data: [] })),
        axios.get('/api/project-actions/kpi-for-contracts').catch(() => ({ data: [] })),
        axios.get('/api/project-actions/implementation-status').catch(() => ({ data: [] }))
      ]);
      setQuarters(qRes.data);
      setMonitoringTypes(mtRes.data);
      setCategories(catRes.data);
      setDonors(donorRes.data);
      setCurrencies(curRes.data);
      setKpiForContracts(kpiRes.data);
      setImplementationStatuses(implRes.data);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const loadFinancialData = async () => {
    try {
      const [compRes, subRes, actRes] = await Promise.all([
        axios.get('/api/financial/components').catch(() => ({ data: [] })),
        axios.get('/api/financial/subcomponents').catch(() => ({ data: [] })),
        axios.get('/api/financial/activities').catch(() => ({ data: [] }))
      ]);
      setComponents(compRes.data);
      setSubcomponents(subRes.data);
      setActivities(actRes.data);
    } catch (error) {
      console.error('Error loading financial data:', error);
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

  const filteredComponents = useMemo(() => {
    const projId = worksFormProject || selectedProject;
    return components.filter(c => c.project?.projectId === projId);
  }, [components, selectedProject, worksFormProject]);

  const filteredSubcomponents = useMemo(() => {
    if (!worksFormComp) return [];
    return subcomponents.filter(s => s.component?.id === parseInt(worksFormComp));
  }, [subcomponents, worksFormComp]);

  const filteredActivities = useMemo(() => {
    if (!worksFormSubcomp) return [];
    return activities.filter(a => a.subcomponent?.subcompId === parseInt(worksFormSubcomp));
  }, [activities, worksFormSubcomp]);

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
    if (activeTab === 'works' || activeTab === 'goods') {
      setWorksFormProject(item?.project?.projectId || selectedProject);
      setWorksFormComp(item?.component?.id?.toString() || '');
      setWorksFormSubcomp(item?.subcomponent?.subcompId?.toString() || '');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setWorksFormProject('');
    setWorksFormComp('');
    setWorksFormSubcomp('');
  };

  const handleWorksSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      project: { projectId: worksFormProject || selectedProject },
      component: data.componentId ? { id: parseInt(data.componentId) } : null,
      subcomponent: data.subcomponentId ? { subcompId: parseInt(data.subcomponentId) } : null,
      activity: data.activityId ? { activityId: parseInt(data.activityId) } : null,
      projectCategory: data.projectCategoryId ? { categoryId: parseInt(data.projectCategoryId) } : null,
      fundingSource: data.fundingSourceId ? { donorId: parseInt(data.fundingSourceId) } : null,
      mainInterventionFocus: data.mainInterventionFocus || null,
      targetBeneficiarySettlements: data.targetBeneficiarySettlements ? parseInt(data.targetBeneficiarySettlements) : null,
      locationOfInvestment: data.locationOfInvestment || null,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      grossFloorAreaM2: data.grossFloorAreaM2 ? parseInt(data.grossFloorAreaM2) : null,
      currency: data.currencyId ? { id: parseInt(data.currencyId) } : null,
      contractValue: data.contractValue ? parseFloat(data.contractValue) : null,
      amendments: data.amendments === 'true',
      contractRefNo: data.contractRefNo || null,
      nameOfContractor: data.nameOfContractor || null,
      nameOfConsultant: data.nameOfConsultant || null,
      contractStartDate: data.contractStartDate || null,
      contractEndDate: data.contractEndDate || null,
      duration: data.duration || null,
      remarks: data.remarks || null
    };

    try {
      if (editingItem) {
        await axios.put(`/api/project-actions/works/${editingItem.id}`, payload);
        toast.success(t('common.updateSuccess') || 'Updated successfully');
      } else {
        await axios.post('/api/project-actions/works', payload);
        toast.success(t('common.createSuccess') || 'Created successfully');
      }
      const savedProject = worksFormProject || selectedProject;
      handleCloseModal();
      if (savedProject !== selectedProject) {
        setSelectedProject(savedProject);
      } else {
        loadContracts();
      }
    } catch (error) {
      console.error('Error saving works contract:', error);
      toast.error('Error saving works contract');
    }
  };

  const handleDeleteWorks = async (id) => {
    if (!confirm(t('common.confirmDelete') || 'Are you sure?')) return;
    try {
      await axios.delete(`/api/project-actions/works/${id}`);
      toast.success(t('common.deleteSuccess') || 'Deleted successfully');
      loadContracts();
    } catch (error) {
      console.error('Error deleting works:', error);
      toast.error('Error deleting record');
    }
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
      pictureOfStatus: data.pictureOfStatus || null,
      project: { projectId: selectedProject },
      quarter: data.quarterId ? { id: parseInt(data.quarterId) } : null,
      monitoringType: data.monitoringTypeId ? { id: parseInt(data.monitoringTypeId) } : null,
      investmentType: data.investmentTypeCode ? { monitoringTypeCode: data.investmentTypeCode } : null,
      kpiDescription: data.kpiDescriptionCode ? { monitoringTypeCode: data.kpiDescriptionCode } : null,
      implementationStatus: data.implementationStatusId ? { id: parseInt(data.implementationStatusId) } : null
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

  const handleGoodsSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      project: { projectId: worksFormProject || selectedProject },
      component: data.componentId ? { id: parseInt(data.componentId) } : null,
      subcomponent: data.subcomponentId ? { subcompId: parseInt(data.subcomponentId) } : null,
      activity: data.activityId ? { activityId: parseInt(data.activityId) } : null,
      projectCategory: data.projectCategoryId ? { categoryId: parseInt(data.projectCategoryId) } : null,
      fundingSource: data.fundingSourceId ? { donorId: parseInt(data.fundingSourceId) } : null,
      currency: data.currencyId ? { id: parseInt(data.currencyId) } : null,
      contractValue: data.contractValue ? parseFloat(data.contractValue) : null,
      amendments: data.amendments === 'true',
      contractRefNo: data.contractRefNo || null,
      nameOfSupplier: data.nameOfSupplier || null,
      nameOfConsultant: data.nameOfConsultant || null,
      contractStartDate: data.contractStartDate || null,
      contractEndDate: data.contractEndDate || null,
      duration: data.duration || null,
      remarks: data.remarks || null
    };

    try {
      if (editingItem) {
        await axios.put(`/api/project-actions/goods/${editingItem.id}`, payload);
        toast.success(t('common.updateSuccess') || 'Updated successfully');
      } else {
        await axios.post('/api/project-actions/goods', payload);
        toast.success(t('common.createSuccess') || 'Created successfully');
      }
      const savedProject = worksFormProject || selectedProject;
      handleCloseModal();
      if (savedProject !== selectedProject) {
        setSelectedProject(savedProject);
      } else {
        loadContracts();
      }
    } catch (error) {
      console.error('Error saving goods contract:', error);
      toast.error('Error saving goods contract');
    }
  };

  const handleDeleteGoods = async (id) => {
    if (!confirm(t('common.confirmDelete') || 'Are you sure?')) return;
    try {
      await axios.delete(`/api/project-actions/goods/${id}`);
      toast.success(t('common.deleteSuccess') || 'Deleted successfully');
      loadContracts();
    } catch (error) {
      console.error('Error deleting goods:', error);
      toast.error('Error deleting record');
    }
  };

  const handleDeleteMonitoring = async (id) => {
    if (!confirm(t('common.confirmDelete') || 'Are you sure?')) return;
    try {
      await axios.delete(`/api/project-actions/monitoring/${id}`);
      toast.success('Record deleted successfully');
      loadContracts();
    } catch (error) {
      console.error('Error deleting monitoring:', error);
      toast.error('Error deleting record');
    }
  };

  const renderWorksTable = () => {
    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover" style={{ fontSize: '0.85rem' }}>
          <thead className="table-dark">
            <tr>
              <th>{t('financial.project')}</th>
              <th>{t('financial.components')}</th>
              <th>{t('financial.subcomponents')}</th>
              <th>{t('financial.activities')}</th>
              <th>{t('projectActions.projectCategory')}</th>
              <th>{t('projectActions.fundingSource')}</th>
              <th>{t('projectActions.mainInterventionFocus')}</th>
              <th>{t('projectActions.targetBeneficiarySettlements')}</th>
              <th>{t('projectActions.locationOfInvestment')}</th>
              <th>{t('projectActions.latitude')}</th>
              <th>{t('projectActions.longitude')}</th>
              <th>{t('projectActions.grossFloorArea')}</th>
              <th>{t('financial.currency')}</th>
              <th className="text-end">{t('projectActions.contractValue')}</th>
              <th>{t('projectActions.amendments')}</th>
              <th>{t('projectActions.contractNumber')}</th>
              <th>{t('projectActions.contractor')}</th>
              <th>{t('projectActions.nameOfConsultant')}</th>
              <th>{t('common.startDate')}</th>
              <th>{t('common.endDate')}</th>
              <th>{t('common.duration')}</th>
              <th>{t('projectActions.remarks')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {works.length === 0 ? (
              <tr><td colSpan="23" className="text-center text-muted">{t('table.noData')}</td></tr>
            ) : (
              works.map((item) => (
                <tr key={item.id}>
                  <td>{item.project?.project || '-'}</td>
                  <td>{item.component?.projectComponents || '-'}</td>
                  <td>{item.subcomponent?.subcomponent || '-'}</td>
                  <td>{item.activity?.activity || '-'}</td>
                  <td>{item.projectCategory?.category || '-'}</td>
                  <td>{item.fundingSource?.name || '-'}</td>
                  <td>{item.mainInterventionFocus || '-'}</td>
                  <td>{item.targetBeneficiarySettlements || '-'}</td>
                  <td>{item.locationOfInvestment || '-'}</td>
                  <td>{item.latitude || '-'}</td>
                  <td>{item.longitude || '-'}</td>
                  <td>{item.grossFloorAreaM2 || '-'}</td>
                  <td>{item.currency?.currency || '-'}</td>
                  <td className="text-end">{formatCurrency(item.contractValue)}</td>
                  <td>{item.amendments ? t('common.yes') : t('common.no')}</td>
                  <td><strong>{item.contractRefNo || '-'}</strong></td>
                  <td>{item.nameOfContractor || '-'}</td>
                  <td>{item.nameOfConsultant || '-'}</td>
                  <td>{formatDate(item.contractStartDate)}</td>
                  <td>{formatDate(item.contractEndDate)}</td>
                  <td>{item.duration || '-'}</td>
                  <td>{item.remarks || '-'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleOpenModal(item)}><FiEdit2 /></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteWorks(item.id)}><FiTrash2 /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderGoodsTable = () => {
    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover" style={{ fontSize: '0.85rem' }}>
          <thead className="table-dark">
            <tr>
              <th>{t('financial.project')}</th>
              <th>{t('financial.components')}</th>
              <th>{t('financial.subcomponents')}</th>
              <th>{t('financial.activities')}</th>
              <th>{t('projectActions.projectCategory')}</th>
              <th>{t('projectActions.fundingSource')}</th>
              <th>{t('financial.currency')}</th>
              <th className="text-end">{t('projectActions.contractValue')}</th>
              <th>{t('projectActions.amendments')}</th>
              <th>{t('projectActions.contractNumber')}</th>
              <th>{t('projectActions.supplier')}</th>
              <th>{t('projectActions.nameOfConsultant')}</th>
              <th>{t('common.startDate')}</th>
              <th>{t('common.endDate')}</th>
              <th>{t('common.duration')}</th>
              <th>{t('projectActions.remarks')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {goods.length === 0 ? (
              <tr><td colSpan="17" className="text-center text-muted">{t('table.noData')}</td></tr>
            ) : (
              goods.map((item) => (
                <tr key={item.id}>
                  <td>{item.project?.project || '-'}</td>
                  <td>{item.component?.projectComponents || '-'}</td>
                  <td>{item.subcomponent?.subcomponent || '-'}</td>
                  <td>{item.activity?.activity || '-'}</td>
                  <td>{item.projectCategory?.category || '-'}</td>
                  <td>{item.fundingSource?.name || '-'}</td>
                  <td>{item.currency?.currency || '-'}</td>
                  <td className="text-end">{formatCurrency(item.contractValue)}</td>
                  <td>{item.amendments ? t('common.yes') : t('common.no')}</td>
                  <td><strong>{item.contractRefNo || '-'}</strong></td>
                  <td>{item.nameOfSupplier || '-'}</td>
                  <td>{item.nameOfConsultant || '-'}</td>
                  <td>{formatDate(item.contractStartDate)}</td>
                  <td>{formatDate(item.contractEndDate)}</td>
                  <td>{item.duration || '-'}</td>
                  <td>{item.remarks || '-'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleOpenModal(item)}><FiEdit2 /></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteGoods(item.id)}><FiTrash2 /></button>
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
        <table className="table table-striped table-hover" style={{ fontSize: '0.85rem' }}>
          <thead className="table-dark">
            <tr>
              <th>{t('financial.project')}</th>
              <th>{t('projectActions.contractNumber')}</th>
              <th>{t('projectActions.monitoringDate')}</th>
              <th>{t('common.quarter')}</th>
              <th>{t('projectActions.monitoringType')}</th>
              <th>{t('projectActions.typeOfInvestment')}</th>
              <th>{t('projectActions.kpiDescription')}</th>
              <th>{t('projectActions.milestoneStartDate')}</th>
              <th>{t('projectActions.milestoneEndDate')}</th>
              <th>{t('projectActions.target')}</th>
              <th>{t('projectActions.achievedStatus')}</th>
              <th>{t('projectActions.implementationStatus')}</th>
              <th>{t('projectActions.pictureOfStatus')}</th>
              <th>{t('projectActions.remarks')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {monitoring.length === 0 ? (
              <tr><td colSpan="15" className="text-center text-muted">{t('table.noData')}</td></tr>
            ) : (
              monitoring.map((item) => (
                <tr key={item.id}>
                  <td>{item.project?.project || '-'}</td>
                  <td><strong>{item.contractRefNo || '-'}</strong></td>
                  <td>{formatDate(item.monitoringDate)}</td>
                  <td>{item.quarter?.quarter || '-'}</td>
                  <td>{item.monitoringType?.monitoringType || '-'}</td>
                  <td>{item.investmentType?.typeOfInvestment || '-'}</td>
                  <td>{item.kpiDescription?.kpiDescription || '-'}</td>
                  <td>{formatDate(item.milestoneStartDate)}</td>
                  <td>{formatDate(item.milestoneEndDate)}</td>
                  <td>{item.target || '-'}</td>
                  <td>{item.achievedStatus || '-'}</td>
                  <td>{item.implementationStatus?.progressScale || '-'}</td>
                  <td>{item.pictureOfStatus || '-'}</td>
                  <td>{item.remarks || '-'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
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

  const renderWorksModal = () => (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              {editingItem ? t('projectActions.editWorksContract') : t('projectActions.addWorksContract')}
            </h5>
            <button type="button" className="btn-close" onClick={handleCloseModal}></button>
          </div>
          <form onSubmit={handleWorksSave}>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <h6 className="text-muted border-bottom pb-2 mb-3">{t('financial.project')} & {t('financial.components')}</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('financial.project')}</label>
                  <select className="form-select" value={worksFormProject} onChange={e => { setWorksFormProject(e.target.value); setWorksFormComp(''); setWorksFormSubcomp(''); }}>
                    <option value="">----------</option>
                    {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('financial.components')}</label>
                  <select name="componentId" value={worksFormComp} onChange={e => { setWorksFormComp(e.target.value); setWorksFormSubcomp(''); }} className="form-select">
                    <option value="">----------</option>
                    {filteredComponents.map(c => (
                      <option key={c.id} value={c.id}>{c.projectComponents}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('financial.subcomponents')}</label>
                  <select name="subcomponentId" value={worksFormSubcomp} onChange={e => setWorksFormSubcomp(e.target.value)} className="form-select" disabled={!worksFormComp}>
                    <option value="">----------</option>
                    {filteredSubcomponents.map(s => (
                      <option key={s.subcompId} value={s.subcompId}>{s.subcomponent}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('financial.activities')}</label>
                  <select name="activityId" className="form-select" defaultValue={editingItem?.activity?.activityId || ''} disabled={!worksFormSubcomp}>
                    <option value="">----------</option>
                    {filteredActivities.map(a => (
                      <option key={a.activityId} value={a.activityId}>{a.activity}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('projectActions.projectCategory')}</label>
                  <select name="projectCategoryId" defaultValue={editingItem?.projectCategory?.categoryId || ''} className="form-select">
                    <option value="">----------</option>
                    {categories.map(c => (
                      <option key={c.categoryId} value={c.categoryId}>{c.category}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('projectActions.fundingSource')}</label>
                  <select name="fundingSourceId" defaultValue={editingItem?.fundingSource?.donorId || ''} className="form-select">
                    <option value="">----------</option>
                    {donors.map(d => (
                      <option key={d.donorId} value={d.donorId}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('financial.currency')}</label>
                  <select name="currencyId" defaultValue={editingItem?.currency?.id || ''} className="form-select">
                    <option value="">----------</option>
                    {currencies.map(c => (
                      <option key={c.id} value={c.id}>{c.currency}</option>
                    ))}
                  </select>
                </div>
              </div>

              <h6 className="text-muted border-bottom pb-2 mb-3 mt-4">{t('projectActions.mainInterventionFocus')}</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('projectActions.mainInterventionFocus')}</label>
                  <input name="mainInterventionFocus" defaultValue={editingItem?.mainInterventionFocus} className="form-control" />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium">{t('projectActions.targetBeneficiarySettlements')}</label>
                  <input type="number" name="targetBeneficiarySettlements" defaultValue={editingItem?.targetBeneficiarySettlements} className="form-control" />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium">{t('projectActions.grossFloorArea')}</label>
                  <input type="number" name="grossFloorAreaM2" defaultValue={editingItem?.grossFloorAreaM2} className="form-control" />
                </div>
              </div>

              <h6 className="text-muted border-bottom pb-2 mb-3 mt-4">{t('projectActions.locationOfInvestment')}</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('projectActions.locationOfInvestment')}</label>
                  <input name="locationOfInvestment" defaultValue={editingItem?.locationOfInvestment} className="form-control" />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium">{t('projectActions.latitude')}</label>
                  <input type="number" step="any" name="latitude" defaultValue={editingItem?.latitude} className="form-control" />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium">{t('projectActions.longitude')}</label>
                  <input type="number" step="any" name="longitude" defaultValue={editingItem?.longitude} className="form-control" />
                </div>
              </div>

              <h6 className="text-muted border-bottom pb-2 mb-3 mt-4">{t('projectActions.contractValue')} & {t('common.details')}</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('projectActions.contractValue')}</label>
                  <input type="number" step="0.01" name="contractValue" defaultValue={editingItem?.contractValue} className="form-control" />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('projectActions.amendments')}</label>
                  <select name="amendments" defaultValue={editingItem?.amendments?.toString() || 'false'} className="form-select">
                    <option value="false">{t('common.no')}</option>
                    <option value="true">{t('common.yes')}</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('projectActions.contractNumber')}</label>
                  <input name="contractRefNo" defaultValue={editingItem?.contractRefNo} className="form-control" />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('projectActions.contractor')}</label>
                  <input name="nameOfContractor" defaultValue={editingItem?.nameOfContractor} className="form-control" />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('projectActions.nameOfConsultant')}</label>
                  <input name="nameOfConsultant" defaultValue={editingItem?.nameOfConsultant} className="form-control" />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('common.duration')}</label>
                  <input name="duration" defaultValue={editingItem?.duration} className="form-control" />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('common.startDate')}</label>
                  <input type="date" name="contractStartDate" defaultValue={editingItem?.contractStartDate} className="form-control" />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('common.endDate')}</label>
                  <input type="date" name="contractEndDate" defaultValue={editingItem?.contractEndDate} className="form-control" />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">{t('projectActions.remarks')}</label>
                  <textarea name="remarks" defaultValue={editingItem?.remarks} className="form-control" rows="3"></textarea>
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-outline-secondary" onClick={handleCloseModal}>{t('common.cancel')}</button>
              <button type="submit" className="btn btn-primary">{t('common.save')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const renderMonitoringModal = () => (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              {editingItem ? t('projectActions.editContractMonitoring') : t('projectActions.addContractMonitoring')}
            </h5>
            <button type="button" className="btn-close" onClick={handleCloseModal}></button>
          </div>
          <form onSubmit={handleMonitoringSave}>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <h6 className="text-muted border-bottom pb-2 mb-3">{t('financial.project')} & {t('projectActions.contractNumber')}</h6>
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
              </div>

              <h6 className="text-muted border-bottom pb-2 mb-3 mt-4">{t('projectActions.typeOfInvestment')} & {t('projectActions.kpiDescription')}</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('projectActions.typeOfInvestment')}</label>
                  <select name="investmentTypeCode" defaultValue={editingItem?.investmentType?.monitoringTypeCode || ''} className="form-select">
                    <option value="">----------</option>
                    {kpiForContracts.map(k => (
                      <option key={k.monitoringTypeCode} value={k.monitoringTypeCode}>{k.typeOfInvestment}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('projectActions.kpiDescription')}</label>
                  <select name="kpiDescriptionCode" defaultValue={editingItem?.kpiDescription?.monitoringTypeCode || ''} className="form-select">
                    <option value="">----------</option>
                    {kpiForContracts.map(k => (
                      <option key={k.monitoringTypeCode} value={k.monitoringTypeCode}>{k.kpiDescription}</option>
                    ))}
                  </select>
                </div>
              </div>

              <h6 className="text-muted border-bottom pb-2 mb-3 mt-4">{t('projectActions.milestoneStartDate')} & {t('projectActions.target')}</h6>
              <div className="row g-3">
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
              </div>

              <h6 className="text-muted border-bottom pb-2 mb-3 mt-4">{t('projectActions.implementationStatus')} & {t('projectActions.remarks')}</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('projectActions.implementationStatus')}</label>
                  <select name="implementationStatusId" defaultValue={editingItem?.implementationStatus?.id || ''} className="form-select">
                    <option value="">----------</option>
                    {implementationStatuses.map(s => (
                      <option key={s.id} value={s.id}>{s.progressScale}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('projectActions.pictureOfStatus')}</label>
                  <input name="pictureOfStatus" defaultValue={editingItem?.pictureOfStatus} className="form-control" />
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
  );

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
            activeTab === 'works' ? renderWorksTable() :
            activeTab === 'goods' ? renderGoodsTable() :
            renderMonitoringTable()
          )}
        </div>
      </div>

      {showModal && activeTab === 'works' && renderWorksModal()}
      {showModal && activeTab === 'monitoring' && renderMonitoringModal()}

      {showModal && activeTab === 'goods' && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editingItem ? t('projectActions.editGoodsContract') : t('projectActions.addGoodsContract')}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleGoodsSave}>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <h6 className="text-muted border-bottom pb-2 mb-3">{t('financial.project')} & {t('financial.components')}</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('financial.project')}</label>
                      <select className="form-select" value={worksFormProject} onChange={e => { setWorksFormProject(e.target.value); setWorksFormComp(''); setWorksFormSubcomp(''); }}>
                        <option value="">----------</option>
                        {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('financial.components')}</label>
                      <select name="componentId" value={worksFormComp} onChange={e => { setWorksFormComp(e.target.value); setWorksFormSubcomp(''); }} className="form-select">
                        <option value="">----------</option>
                        {filteredComponents.map(c => (
                          <option key={c.id} value={c.id}>{c.projectComponents}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('financial.subcomponents')}</label>
                      <select name="subcomponentId" value={worksFormSubcomp} onChange={e => setWorksFormSubcomp(e.target.value)} className="form-select" disabled={!worksFormComp}>
                        <option value="">----------</option>
                        {filteredSubcomponents.map(s => (
                          <option key={s.subcompId} value={s.subcompId}>{s.subcomponent}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">{t('financial.activities')}</label>
                      <select name="activityId" className="form-select" defaultValue={editingItem?.activity?.activityId || ''} disabled={!worksFormSubcomp}>
                        <option value="">----------</option>
                        {filteredActivities.map(a => (
                          <option key={a.activityId} value={a.activityId}>{a.activity}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('projectActions.projectCategory')}</label>
                      <select name="projectCategoryId" defaultValue={editingItem?.projectCategory?.categoryId || ''} className="form-select">
                        <option value="">----------</option>
                        {categories.map(c => (
                          <option key={c.categoryId} value={c.categoryId}>{c.category}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('projectActions.fundingSource')}</label>
                      <select name="fundingSourceId" defaultValue={editingItem?.fundingSource?.donorId || ''} className="form-select">
                        <option value="">----------</option>
                        {donors.map(d => (
                          <option key={d.donorId} value={d.donorId}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('financial.currency')}</label>
                      <select name="currencyId" defaultValue={editingItem?.currency?.id || ''} className="form-select">
                        <option value="">----------</option>
                        {currencies.map(c => (
                          <option key={c.id} value={c.id}>{c.currency}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <h6 className="text-muted border-bottom pb-2 mb-3 mt-4">{t('projectActions.contractValue')} & {t('common.details')}</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('projectActions.contractValue')}</label>
                      <input type="number" step="0.01" name="contractValue" defaultValue={editingItem?.contractValue} className="form-control" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('projectActions.amendments')}</label>
                      <select name="amendments" defaultValue={editingItem?.amendments?.toString() || 'false'} className="form-select">
                        <option value="false">{t('common.no')}</option>
                        <option value="true">{t('common.yes')}</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('projectActions.contractNumber')}</label>
                      <input name="contractRefNo" defaultValue={editingItem?.contractRefNo} className="form-control" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('projectActions.supplier')}</label>
                      <input name="nameOfSupplier" defaultValue={editingItem?.nameOfSupplier} className="form-control" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('projectActions.nameOfConsultant')}</label>
                      <input name="nameOfConsultant" defaultValue={editingItem?.nameOfConsultant} className="form-control" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('common.duration')}</label>
                      <input name="duration" defaultValue={editingItem?.duration} className="form-control" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('common.startDate')}</label>
                      <input type="date" name="contractStartDate" defaultValue={editingItem?.contractStartDate} className="form-control" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-medium">{t('common.endDate')}</label>
                      <input type="date" name="contractEndDate" defaultValue={editingItem?.contractEndDate} className="form-control" />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">{t('projectActions.remarks')}</label>
                      <textarea name="remarks" defaultValue={editingItem?.remarks} className="form-control" rows="3"></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={handleCloseModal}>{t('common.cancel')}</button>
                  <button type="submit" className="btn btn-primary">{t('common.save')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectActions;
