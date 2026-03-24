import { useState, useEffect, useMemo, useCallback, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiFileText, FiPackage, FiEye, FiClipboard, FiDownload, FiSettings, FiAlertTriangle, FiCheck, FiX, FiChevronDown, FiChevronRight, FiRefreshCw, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PATH_TO_TAB = {
  'works': 'works',
  'goods': 'goods',
  'design-work': 'designWork',
  'design-monitoring': 'designMonitoring',
  'boq': 'boq',
  'supply-progress': 'supplyProgress',
  'installation': 'installation',
};

const DM_STATUS_COLORS = {
  'Complete': '#28a745',
  'Incomplete': '#ffc107',
  'Stagnant': '#dc3545',
  'Cancelled': '#6c757d',
};

function ProjectActions() {
  const { t } = useTranslation();
  const location = useLocation();
  const activeTab = useMemo(() => {
    const segment = location.pathname.split('/').pop() || 'works';
    return PATH_TO_TAB[segment] || 'works';
  }, [location.pathname]);
  const [projects, setProjects] = useState([]);
  const [works, setWorks] = useState([]);
  const [goods, setGoods] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [quarters, setQuarters] = useState([]);
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
  const [worksStartDate, setWorksStartDate] = useState('');
  const [worksEndDate, setWorksEndDate] = useState('');

  const calcDuration = (start, end) => {
    if (!start || !end) return '';
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s) || isNaN(e) || e <= s) return '';
    let years = e.getFullYear() - s.getFullYear();
    let months = e.getMonth() - s.getMonth();
    let days = e.getDate() - s.getDate();
    if (days < 0) {
      months--;
      const prev = new Date(e.getFullYear(), e.getMonth(), 0).getDate();
      days += prev;
    }
    if (months < 0) { years--; months += 12; }
    const parts = [];
    if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    return parts.join(', ') || '0 days';
  };

  const [designWorkItems, setDesignWorkItems] = useState([]);
  const [dwpYear, setDwpYear] = useState('');
  const [dwpProject, setDwpProject] = useState('');
  const [dwpContractType, setDwpContractType] = useState('');
  const [dwpContractRefNo, setDwpContractRefNo] = useState('');
  const [dwpContractOptions, setDwpContractOptions] = useState([]);
  const [dwpRows, setDwpRows] = useState([]);
  const [dwpSaving, setDwpSaving] = useState(false);
  const [dwpModalItem, setDwpModalItem] = useState(null);
  const [dwpModalMode, setDwpModalMode] = useState('view');
  const [dwpEditForm, setDwpEditForm] = useState({});

  const [boqItems, setBoqItems] = useState([]);
  const [boqDate, setBoqDate] = useState('');
  const [boqProject, setBoqProject] = useState('');
  const [boqContractType, setBoqContractType] = useState('');
  const [boqContractRefNo, setBoqContractRefNo] = useState('');
  const [boqContractOptions, setBoqContractOptions] = useState([]);
  const [boqRows, setBoqRows] = useState([]);
  const [boqSaving, setBoqSaving] = useState(false);
  const [boqModalItem, setBoqModalItem] = useState(null);
  const [boqModalMode, setBoqModalMode] = useState('view');
  const [boqEditForm, setBoqEditForm] = useState({});

  const [spItems, setSpItems] = useState([]);
  const [spDate, setSpDate] = useState('');
  const [spProject, setSpProject] = useState('');
  const [spContractType, setSpContractType] = useState('');
  const [spContractRefNo, setSpContractRefNo] = useState('');
  const [spContractOptions, setSpContractOptions] = useState([]);
  const [spBoqActivities, setSpBoqActivities] = useState([]);
  const [spRows, setSpRows] = useState([]);
  const [spSaving, setSpSaving] = useState(false);
  const [spModalItem, setSpModalItem] = useState(null);
  const [spModalMode, setSpModalMode] = useState('view');
  const [spEditForm, setSpEditForm] = useState({});

  const [instItems, setInstItems] = useState([]);
  const [instDate, setInstDate] = useState('');
  const [instProject, setInstProject] = useState('');
  const [instContractType, setInstContractType] = useState('');
  const [instContractRefNo, setInstContractRefNo] = useState('');
  const [instContractOptions, setInstContractOptions] = useState([]);
  const [instSpActivities, setInstSpActivities] = useState([]);
  const [instRows, setInstRows] = useState([]);
  const [instSaving, setInstSaving] = useState(false);
  const [instModalItem, setInstModalItem] = useState(null);
  const [instModalMode, setInstModalMode] = useState('view');
  const [instEditForm, setInstEditForm] = useState({});

  const [dmItems, setDmItems] = useState([]);
  const [dmProject, setDmProject] = useState('');
  const [dmContractType, setDmContractType] = useState('');
  const [dmContractRefNo, setDmContractRefNo] = useState('');
  const [dmContractOptions, setDmContractOptions] = useState([]);
  const [dmActivityFilter, setDmActivityFilter] = useState('');
  const [dmActivitySuggestions, setDmActivitySuggestions] = useState([]);
  const [dmShowSuggestions, setDmShowSuggestions] = useState(false);
  const [dmYear, setDmYear] = useState('');
  const [dmYears, setDmYears] = useState([]);
  const [dmUnits, setDmUnits] = useState([]);
  const [dmFrequencies, setDmFrequencies] = useState([]);
  const [dmImporting, setDmImporting] = useState(false);
  const [dmExpandedRow, setDmExpandedRow] = useState(null);
  const [dmMilestones, setDmMilestones] = useState({});
  const [dmMilestoneForm, setDmMilestoneForm] = useState(null);
  const [dmEditingMilestone, setDmEditingMilestone] = useState(null);
  const [dmEditingActivity, setDmEditingActivity] = useState(null);
  const [dmEditForm, setDmEditForm] = useState({});
  const [dmMonitoringMap, setDmMonitoringMap] = useState({});
  const [dmAllRecords, setDmAllRecords] = useState([]);
  const [dmAllMilestones, setDmAllMilestones] = useState({});
  const [dmAllLoading, setDmAllLoading] = useState(false);
  const [dmSavedModalItem, setDmSavedModalItem] = useState(null);
  const [dmSavedModalMode, setDmSavedModalMode] = useState('view');
  const [dmSavedEditForm, setDmSavedEditForm] = useState({});

  useEffect(() => {
    loadProjects();
    loadReferenceData();
  }, []);

  useEffect(() => {
    loadContracts();
    loadFinancialData();
  }, [selectedProject]);

  useEffect(() => {
    if (activeTab === 'designMonitoring') {
      loadAllDmRecords();
    }
  }, [activeTab]);

  const loadProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
      if (res.data.length > 0) {
        setSelectedProject('all');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [qRes, catRes, donorRes, curRes, implRes, yrRes, unitRes, freqRes] = await Promise.all([
        axios.get('/api/setup/quarters').catch(() => ({ data: [] })),
        axios.get('/api/setup/categories').catch(() => ({ data: [] })),
        axios.get('/api/donors').catch(() => ({ data: [] })),
        axios.get('/api/setup/currencies').catch(() => ({ data: [] })),
        axios.get('/api/project-actions/implementation-status').catch(() => ({ data: [] })),
        axios.get('/api/setup/years').catch(() => ({ data: [] })),
        axios.get('/api/setup/measurement-units').catch(() => ({ data: [] })),
        axios.get('/api/setup/data-frequencies').catch(() => ({ data: [] }))
      ]);
      setQuarters(qRes.data);
      setCategories(catRes.data);
      setDonors(donorRes.data);
      setCurrencies(curRes.data);
      setImplementationStatuses(implRes.data);
      setDmYears(yrRes.data);
      setDmUnits(unitRes.data);
      setDmFrequencies(freqRes.data);
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
      const isAll = selectedProject === 'all';
      const [worksRes, goodsRes, dwpRes, boqRes, spRes, instRes] = await Promise.all([
        isAll ? axios.get('/api/project-actions/works').catch(() => ({ data: [] })) : axios.get(`/api/project-actions/works/project/${selectedProject}`).catch(() => ({ data: [] })),
        isAll ? axios.get('/api/project-actions/goods').catch(() => ({ data: [] })) : axios.get(`/api/project-actions/goods/project/${selectedProject}`).catch(() => ({ data: [] })),
        isAll ? axios.get('/api/project-actions/design-work-progress').catch(() => ({ data: [] })) : axios.get(`/api/project-actions/design-work-progress/project/${selectedProject}`).catch(() => ({ data: [] })),
        isAll ? axios.get('/api/project-actions/boq').catch(() => ({ data: [] })) : axios.get(`/api/project-actions/boq/project/${selectedProject}`).catch(() => ({ data: [] })),
        isAll ? axios.get('/api/project-actions/supply-progress').catch(() => ({ data: [] })) : axios.get(`/api/project-actions/supply-progress/project/${selectedProject}`).catch(() => ({ data: [] })),
        isAll ? axios.get('/api/project-actions/installation').catch(() => ({ data: [] })) : axios.get(`/api/project-actions/installation/project/${selectedProject}`).catch(() => ({ data: [] }))
      ]);
      setWorks(worksRes.data);
      setGoods(goodsRes.data);
      setDesignWorkItems(dwpRes.data);
      setBoqItems(boqRes.data);
      setSpItems(spRes.data);
      setInstItems(instRes.data);
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
    return t('projectActions.addGoodsContract');
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (activeTab === 'works' || activeTab === 'goods') {
      setWorksFormProject(item?.project?.projectId || selectedProject);
      setWorksFormComp(item?.component?.id?.toString() || '');
      setWorksFormSubcomp(item?.subcomponent?.subcompId?.toString() || '');
      setWorksStartDate(item?.contractStartDate || '');
      setWorksEndDate(item?.contractEndDate || '');
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
      grossFloorAreaM2: data.grossFloorAreaM2 ? parseInt(data.grossFloorAreaM2) : null,
      currency: data.currencyId ? { id: parseInt(data.currencyId) } : null,
      contractValue: data.contractValue ? parseFloat(data.contractValue) : null,
      amendments: data.amendments === 'true',
      contractRefNo: data.contractRefNo || null,
      nameOfContractor: data.nameOfContractor || null,
      nameOfConsultant: data.nameOfConsultant || null,
      contractStartDate: worksStartDate || null,
      contractEndDate: worksEndDate || null,
      duration: calcDuration(worksStartDate, worksEndDate) || null,
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
      const msg = error.response?.data?.message || 'Error deleting record';
      toast.error(msg);
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
      const msg = error.response?.data?.message || 'Error deleting record';
      toast.error(msg);
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
              <tr><td colSpan="20" className="text-center text-muted">{t('table.noData')}</td></tr>
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
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('financial.project')}</label>
                  <select className="form-select" value={worksFormProject} onChange={e => { setWorksFormProject(e.target.value); setWorksFormComp(''); setWorksFormSubcomp(''); }}>
                    <option value="">----------</option>
                    {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('financial.components')}</label>
                  <select name="componentId" value={worksFormComp} onChange={e => { setWorksFormComp(e.target.value); setWorksFormSubcomp(''); }} className="form-select">
                    <option value="">----------</option>
                    {filteredComponents.map(c => (
                      <option key={c.id} value={c.id}>{c.projectComponents}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('financial.subcomponents')}</label>
                  <select name="subcomponentId" value={worksFormSubcomp} onChange={e => setWorksFormSubcomp(e.target.value)} className="form-select" disabled={!worksFormComp}>
                    <option value="">----------</option>
                    {filteredSubcomponents.map(s => (
                      <option key={s.subcompId} value={s.subcompId}>{s.subcomponent}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
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
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('projectActions.mainInterventionFocus')}</label>
                  <input name="mainInterventionFocus" defaultValue={editingItem?.mainInterventionFocus} className="form-control" />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('projectActions.targetBeneficiarySettlements')}</label>
                  <input type="number" name="targetBeneficiarySettlements" defaultValue={editingItem?.targetBeneficiarySettlements} className="form-control" />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('projectActions.grossFloorArea')}</label>
                  <input type="number" name="grossFloorAreaM2" defaultValue={editingItem?.grossFloorAreaM2} className="form-control" />
                </div>
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
                  <label className="form-label fw-medium">{t('common.startDate')}</label>
                  <input type="date" className="form-control" value={worksStartDate} onChange={e => setWorksStartDate(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('common.endDate')}</label>
                  <input type="date" className="form-control" value={worksEndDate} onChange={e => setWorksEndDate(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('common.duration')}</label>
                  <input className="form-control bg-light" value={calcDuration(worksStartDate, worksEndDate)} readOnly />
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


  const generateActivityId = (refNo) => {
    const rand = Math.floor(100 + Math.random() * 900);
    return `${refNo || 'ACT'}-${rand}`;
  };

  const handleDwpContractTypeChange = async (type) => {
    setDwpContractType(type);
    setDwpContractRefNo('');
    setDwpContractOptions([]);
    if (!type || !dwpProject) return;
    try {
      const endpoint = type === 'works'
        ? `/api/project-actions/works/project/${dwpProject}`
        : `/api/project-actions/goods/project/${dwpProject}`;
      const res = await axios.get(endpoint);
      setDwpContractOptions(res.data.filter(c => c.contractRefNo));
    } catch (e) {
      console.error('Error loading contracts:', e);
    }
  };

  const handleDwpProjectChange = (projId) => {
    setDwpProject(projId);
    setDwpContractType('');
    setDwpContractRefNo('');
    setDwpContractOptions([]);
  };

  const addDwpRow = () => {
    setDwpRows(prev => [...prev, {
      tempId: Date.now(),
      activityId: generateActivityId(dwpContractRefNo),
      activity: '',
      rate: '',
      unit: '',
      provisionalQuantities: '',
      executedQuantities: '',
      activityStartDate: '',
      activityEndDate: '',
      duration: '',
      durationUnit: 'Days'
    }]);
  };

  const calcDwpDuration = (startDate, endDate, unit = 'Days') => {
    if (!startDate || !endDate) return '';
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s) || isNaN(e) || e < s) return '';
    const diffDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    if (unit === 'Months') return Math.round((diffDays / 30.44) * 100) / 100;
    if (unit === 'Years') return Math.round((diffDays / 365.25) * 100) / 100;
    return diffDays;
  };

  const updateDwpRow = (idx, field, value) => {
    setDwpRows(prev => prev.map((row, i) => {
      if (i !== idx) return row;
      const updated = { ...row, [field]: value };
      if (field === 'activityStartDate' || field === 'activityEndDate' || field === 'durationUnit') {
        updated.duration = calcDwpDuration(
          field === 'activityStartDate' ? value : row.activityStartDate,
          field === 'activityEndDate' ? value : row.activityEndDate,
          field === 'durationUnit' ? value : (row.durationUnit || 'Days')
        );
      }
      return updated;
    }));
  };

  const removeDwpRow = (idx) => {
    setDwpRows(prev => prev.filter((_, i) => i !== idx));
  };

  const calcPercentage = (prov, exec) => {
    const p = parseFloat(prov);
    const e = parseFloat(exec);
    if (!p || p === 0) return 0;
    return Math.round((e / p) * 10000) / 100;
  };

  const calcGlobalProgressRate = (rate) => {
    const r = parseFloat(rate);
    if (isNaN(r)) return 0;
    return Math.round((r / 100) * 10000) / 100;
  };

  const handleDwpSave = async () => {
    if (!dwpYear || !dwpProject || !dwpContractType || !dwpContractRefNo) {
      toast.error('Please fill in Year, Project, Contract Type, and Contract Reference');
      return;
    }
    if (dwpRows.length === 0) {
      toast.error('Please add at least one activity row');
      return;
    }
    setDwpSaving(true);
    try {
      const items = dwpRows.map(row => ({
        year: { id: parseInt(dwpYear) },
        project: { projectId: dwpProject },
        contractType: dwpContractType,
        contractRefNo: dwpContractRefNo,
        activityId: row.activityId,
        activity: row.activity,
        rate: parseFloat(row.rate) || 0,
        unit: row.unit,
        provisionalQuantities: parseFloat(row.provisionalQuantities) || 0,
        activityStartDate: row.activityStartDate || null,
        activityEndDate: row.activityEndDate || null,
        duration: row.duration !== '' ? parseFloat(row.duration) : null,
        durationUnit: row.durationUnit || 'Days'
      }));
      await axios.post('/api/project-actions/design-work-progress/batch', items);
      toast.success('Design work progress saved successfully');
      setDwpRows([]);
      setDwpYear('');
      setDwpContractType('');
      setDwpContractRefNo('');
      setDwpContractOptions([]);
      loadContracts();
    } catch (e) {
      toast.error('Error saving design work progress');
      console.error(e);
    } finally {
      setDwpSaving(false);
    }
  };

  const handleDeleteDwpItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`/api/project-actions/design-work-progress/${id}`);
      toast.success('Item deleted');
      loadContracts();
    } catch (e) {
      toast.error('Error deleting item');
    }
  };

  const openDwpModal = (item, mode) => {
    setDwpModalMode(mode);
    setDwpModalItem(item);
    if (mode === 'edit') {
      setDwpEditForm({
        yearId: item.year?.id || '',
        contractType: item.contractType || '',
        contractRefNo: item.contractRefNo || '',
        activityId: item.activityId || '',
        activity: item.activity || '',
        rate: item.rate ?? '',
        unit: item.unit || '',
        provisionalQuantities: item.provisionalQuantities ?? '',
        activityStartDate: item.activityStartDate || '',
        activityEndDate: item.activityEndDate || '',
        duration: item.duration ?? '',
        durationUnit: item.durationUnit || 'Days'
      });
    }
  };

  const closeDwpModal = () => {
    setDwpModalItem(null);
    setDwpModalMode('view');
    setDwpEditForm({});
  };

  const handleDwpEditSave = async () => {
    if (!dwpModalItem) return;
    try {
      await axios.put(`/api/project-actions/design-work-progress/${dwpModalItem.id}`, {
        ...dwpModalItem,
        year: dwpEditForm.yearId ? { id: parseInt(dwpEditForm.yearId) } : null,
        contractType: dwpEditForm.contractType,
        contractRefNo: dwpEditForm.contractRefNo,
        activityId: dwpEditForm.activityId,
        activity: dwpEditForm.activity,
        rate: parseFloat(dwpEditForm.rate) || 0,
        unit: dwpEditForm.unit,
        provisionalQuantities: parseFloat(dwpEditForm.provisionalQuantities) || 0,
        activityStartDate: dwpEditForm.activityStartDate || null,
        activityEndDate: dwpEditForm.activityEndDate || null,
        duration: dwpEditForm.duration !== '' ? parseFloat(dwpEditForm.duration) : null,
        durationUnit: dwpEditForm.durationUnit || 'Days'
      });
      toast.success('Record updated successfully');
      closeDwpModal();
      loadContracts();
    } catch (e) {
      toast.error('Error updating record');
      console.error(e);
    }
  };

  const renderDwpModal = () => {
    if (!dwpModalItem) return null;
    const isView = dwpModalMode === 'view';
    const item = dwpModalItem;
    const form = dwpEditForm;
    return (
      <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeDwpModal}>
        <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isView ? t('projectActions.viewRecord') : t('projectActions.editRecord')}</h5>
              <button type="button" className="btn-close" onClick={closeDwpModal}></button>
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.year')}</label>
                  {isView ? (
                    <p className="form-control-plaintext">{item.year?.profileYear || '-'}</p>
                  ) : (
                    <select className="form-select" value={form.yearId} onChange={e => setDwpEditForm(f => ({...f, yearId: e.target.value}))}>
                      <option value="">{t('projectActions.selectYear')}</option>
                      {dmYears.map(y => <option key={y.id} value={y.id}>{y.profileYear}</option>)}
                    </select>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.project')}</label>
                  <p className="form-control-plaintext">{item.project?.project || item.project?.projectId || '-'}</p>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.contractType')}</label>
                  {isView ? (
                    <p className="form-control-plaintext"><span className={`badge ${item.contractType === 'works' ? 'bg-primary' : 'bg-success'}`}>{item.contractType === 'works' ? t('projectActions.works') : t('projectActions.goodsContracts')}</span></p>
                  ) : (
                    <select className="form-select" value={form.contractType} onChange={e => setDwpEditForm(f => ({...f, contractType: e.target.value}))}>
                      <option value="works">{t('projectActions.worksContracts')}</option>
                      <option value="goods">{t('projectActions.goodsAndServices')}</option>
                    </select>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.contractRefNo')}</label>
                  {isView ? (
                    <p className="form-control-plaintext">{item.contractRefNo || '-'}</p>
                  ) : (
                    <input type="text" className="form-control" value={form.contractRefNo} onChange={e => setDwpEditForm(f => ({...f, contractRefNo: e.target.value}))} />
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.activityId')}</label>
                  {isView ? (
                    <p className="form-control-plaintext"><code>{item.activityId}</code></p>
                  ) : (
                    <input type="text" className="form-control bg-light" value={form.activityId} readOnly />
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.activityDescription')}</label>
                  {isView ? (
                    <p className="form-control-plaintext">{item.activity || '-'}</p>
                  ) : (
                    <input type="text" className="form-control" value={form.activity} onChange={e => setDwpEditForm(f => ({...f, activity: e.target.value}))} />
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">{t('projectActions.ratePercent')}</label>
                  {isView ? (
                    <p className="form-control-plaintext">{item.rate}%</p>
                  ) : (
                    <input type="number" className="form-control" value={form.rate} onChange={e => setDwpEditForm(f => ({...f, rate: e.target.value}))} step="0.01" min="0" max="100" />
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">{t('projectActions.unit')}</label>
                  {isView ? (
                    <p className="form-control-plaintext">{item.unit || '-'}</p>
                  ) : (
                    <select className="form-select" value={form.unit} onChange={e => setDwpEditForm(f => ({...f, unit: e.target.value}))}>
                      <option value="">--</option>
                      {dmUnits.map(u => <option key={u.id} value={u.unit}>{u.unit}</option>)}
                    </select>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">{t('projectActions.provisionalQty')}</label>
                  {isView ? (
                    <p className="form-control-plaintext">{item.provisionalQuantities}</p>
                  ) : (
                    <input type="number" className="form-control" value={form.provisionalQuantities} onChange={e => setDwpEditForm(f => ({...f, provisionalQuantities: e.target.value}))} step="0.01" />
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.activityStartDate')}</label>
                  {isView ? (
                    <p className="form-control-plaintext">{item.activityStartDate || '-'}</p>
                  ) : (
                    <input type="date" className="form-control" value={form.activityStartDate} onChange={e => {
                      const val = e.target.value;
                      setDwpEditForm(f => ({...f, activityStartDate: val, duration: calcDwpDuration(val, f.activityEndDate, f.durationUnit || 'Days')}));
                    }} />
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.activityEndDate')}</label>
                  {isView ? (
                    <p className="form-control-plaintext">{item.activityEndDate || '-'}</p>
                  ) : (
                    <input type="date" className="form-control" value={form.activityEndDate} onChange={e => {
                      const val = e.target.value;
                      setDwpEditForm(f => ({...f, activityEndDate: val, duration: calcDwpDuration(f.activityStartDate, val, f.durationUnit || 'Days')}));
                    }} />
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.duration')}</label>
                  {isView ? (
                    <p className="form-control-plaintext">{item.duration ?? '-'} {item.duration != null ? t('projectActions.' + (item.durationUnit || 'Days').toLowerCase()) : ''}</p>
                  ) : (
                    <div className="d-flex gap-2">
                      <input className="form-control bg-light" value={form.duration} readOnly style={{flex:'1'}} />
                      <select className="form-select" value={form.durationUnit || 'Days'} onChange={e => {
                        const unit = e.target.value;
                        setDwpEditForm(f => ({...f, durationUnit: unit, duration: calcDwpDuration(f.activityStartDate, f.activityEndDate, unit)}));
                      }} style={{flex:'1'}}>
                        <option value="Days">{t('projectActions.days')}</option>
                        <option value="Months">{t('projectActions.months')}</option>
                        <option value="Years">{t('projectActions.years')}</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {isView ? (
                <>
                  <button className="btn btn-primary" onClick={() => { setDwpModalMode('edit'); setDwpEditForm({ yearId: item.year?.id || '', contractType: item.contractType || '', contractRefNo: item.contractRefNo || '', activityId: item.activityId || '', activity: item.activity || '', rate: item.rate ?? '', unit: item.unit || '', provisionalQuantities: item.provisionalQuantities ?? '', activityStartDate: item.activityStartDate || '', activityEndDate: item.activityEndDate || '', duration: item.duration ?? '', durationUnit: item.durationUnit || 'Days' }); }}>
                    <FiEdit2 className="me-1" /> {t('common.edit')}
                  </button>
                  <button className="btn btn-secondary" onClick={closeDwpModal}>{t('common.close')}</button>
                </>
              ) : (
                <>
                  <button className="btn btn-success" onClick={handleDwpEditSave}>{t('projectActions.saveChanges')}</button>
                  <button className="btn btn-secondary" onClick={closeDwpModal}>{t('common.cancel')}</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleBoqContractTypeChange = async (type) => {
    setBoqContractType(type);
    setBoqContractRefNo('');
    setBoqContractOptions([]);
    if (!type || !boqProject) return;
    try {
      const endpoint = type === 'works'
        ? `/api/project-actions/works/project/${boqProject}`
        : `/api/project-actions/goods/project/${boqProject}`;
      const res = await axios.get(endpoint);
      setBoqContractOptions(res.data.filter(c => c.contractRefNo));
    } catch (e) {
      console.error('Error loading contracts:', e);
    }
  };

  const handleBoqProjectChange = (projId) => {
    setBoqProject(projId);
    setBoqContractType('');
    setBoqContractRefNo('');
    setBoqContractOptions([]);
  };

  const generateBoqItemId = (refNo) => {
    const rand = Math.floor(100 + Math.random() * 900);
    return `${refNo || 'ITM'}-${rand}`;
  };

  const addBoqRow = () => {
    setBoqRows(prev => [...prev, {
      tempId: Date.now(),
      itemId: generateBoqItemId(boqContractRefNo),
      activity: '',
      unit: '',
      boqQuantity: ''
    }]);
  };

  const updateBoqRow = (idx, field, value) => {
    setBoqRows(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const removeBoqRow = (idx) => {
    setBoqRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleBoqSave = async () => {
    if (!boqDate || !boqProject || !boqContractType || !boqContractRefNo) {
      toast.error('Please fill in Date, Project, Contract Type, and Contract Reference');
      return;
    }
    if (boqRows.length === 0) {
      toast.error('Please add at least one item row');
      return;
    }
    setBoqSaving(true);
    try {
      const items = boqRows.map(row => ({
        entryDate: boqDate,
        project: { projectId: boqProject },
        contractType: boqContractType,
        contractRefNo: boqContractRefNo,
        itemId: row.itemId,
        activity: row.activity,
        unit: row.unit,
        boqQuantity: parseFloat(row.boqQuantity) || 0
      }));
      await axios.post('/api/project-actions/boq/batch', items);
      toast.success('BOQ items saved successfully');
      setBoqRows([]);
      setBoqDate('');
      setBoqContractType('');
      setBoqContractRefNo('');
      setBoqContractOptions([]);
      loadContracts();
    } catch (e) {
      toast.error('Error saving BOQ items');
      console.error(e);
    } finally {
      setBoqSaving(false);
    }
  };

  const handleDeleteBoqItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`/api/project-actions/boq/${id}`);
      toast.success('Item deleted');
      loadContracts();
    } catch (e) {
      toast.error('Error deleting item');
    }
  };

  const openBoqModal = (item, mode) => {
    setBoqModalMode(mode);
    setBoqModalItem(item);
    if (mode === 'edit') {
      setBoqEditForm({
        entryDate: item.entryDate || '',
        contractType: item.contractType || '',
        contractRefNo: item.contractRefNo || '',
        itemId: item.itemId || '',
        activity: item.activity || '',
        unit: item.unit || '',
        boqQuantity: item.boqQuantity ?? ''
      });
    }
  };

  const closeBoqModal = () => {
    setBoqModalItem(null);
    setBoqModalMode('view');
    setBoqEditForm({});
  };

  const handleBoqEditSave = async () => {
    if (!boqModalItem) return;
    try {
      await axios.put(`/api/project-actions/boq/${boqModalItem.id}`, {
        ...boqModalItem,
        entryDate: boqEditForm.entryDate,
        contractType: boqEditForm.contractType,
        contractRefNo: boqEditForm.contractRefNo,
        itemId: boqEditForm.itemId,
        activity: boqEditForm.activity,
        unit: boqEditForm.unit,
        boqQuantity: parseFloat(boqEditForm.boqQuantity) || 0
      });
      toast.success('Record updated successfully');
      closeBoqModal();
      loadContracts();
    } catch (e) {
      toast.error('Error updating record');
      console.error(e);
    }
  };

  const renderBoqModal = () => {
    if (!boqModalItem) return null;
    const isView = boqModalMode === 'view';
    const item = boqModalItem;
    const form = boqEditForm;
    return (
      <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeBoqModal}>
        <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isView ? t('projectActions.viewBoqRecord') : t('projectActions.editBoqRecord')}</h5>
              <button type="button" className="btn-close" onClick={closeBoqModal}></button>
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.date')}</label>
                  {isView ? <p className="form-control-plaintext">{item.entryDate || '-'}</p> : <input type="date" className="form-control" value={form.entryDate} onChange={e => setBoqEditForm(f => ({...f, entryDate: e.target.value}))} />}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.project')}</label>
                  <p className="form-control-plaintext">{item.project?.project || item.project?.projectId || '-'}</p>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.contractType')}</label>
                  {isView ? <p className="form-control-plaintext"><span className={`badge ${item.contractType === 'works' ? 'bg-primary' : 'bg-success'}`}>{item.contractType === 'works' ? t('projectActions.works') : t('projectActions.goodsContracts')}</span></p> : <select className="form-select" value={form.contractType} onChange={e => setBoqEditForm(f => ({...f, contractType: e.target.value}))}><option value="works">{t('projectActions.worksContracts')}</option><option value="goods">{t('projectActions.goodsAndServices')}</option></select>}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.contractRefNo')}</label>
                  {isView ? <p className="form-control-plaintext">{item.contractRefNo || '-'}</p> : <input type="text" className="form-control" value={form.contractRefNo} onChange={e => setBoqEditForm(f => ({...f, contractRefNo: e.target.value}))} />}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.itemId')}</label>
                  {isView ? <p className="form-control-plaintext"><code>{item.itemId}</code></p> : <input type="text" className="form-control bg-light" value={form.itemId} readOnly />}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.activity')}</label>
                  {isView ? <p className="form-control-plaintext">{item.activity || '-'}</p> : <input type="text" className="form-control" value={form.activity} onChange={e => setBoqEditForm(f => ({...f, activity: e.target.value}))} />}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">{t('projectActions.unit')}</label>
                  {isView ? <p className="form-control-plaintext">{item.unit || '-'}</p> : <input type="text" className="form-control" value={form.unit} onChange={e => setBoqEditForm(f => ({...f, unit: e.target.value}))} />}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">{t('projectActions.boqQuantity')}</label>
                  {isView ? <p className="form-control-plaintext">{item.boqQuantity}</p> : <input type="number" className="form-control" value={form.boqQuantity} onChange={e => setBoqEditForm(f => ({...f, boqQuantity: e.target.value}))} step="0.01" />}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {isView ? (
                <>
                  <button className="btn btn-primary" onClick={() => { setBoqModalMode('edit'); setBoqEditForm({ entryDate: item.entryDate || '', contractType: item.contractType || '', contractRefNo: item.contractRefNo || '', itemId: item.itemId || '', activity: item.activity || '', unit: item.unit || '', boqQuantity: item.boqQuantity ?? '' }); }}><FiEdit2 className="me-1" /> {t('common.edit')}</button>
                  <button className="btn btn-secondary" onClick={closeBoqModal}>{t('common.close')}</button>
                </>
              ) : (
                <>
                  <button className="btn btn-success" onClick={handleBoqEditSave}>{t('projectActions.saveChanges')}</button>
                  <button className="btn btn-secondary" onClick={closeBoqModal}>{t('common.cancel')}</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleSpContractTypeChange = async (type) => {
    setSpContractType(type);
    setSpContractRefNo('');
    setSpContractOptions([]);
    setSpBoqActivities([]);
    if (!type || !spProject) return;
    try {
      const endpoint = type === 'works'
        ? `/api/project-actions/works/project/${spProject}`
        : `/api/project-actions/goods/project/${spProject}`;
      const res = await axios.get(endpoint);
      setSpContractOptions(res.data.filter(c => c.contractRefNo));
    } catch (e) { console.error('Error loading contracts:', e); }
  };

  const handleSpProjectChange = (projId) => {
    setSpProject(projId);
    setSpContractType('');
    setSpContractRefNo('');
    setSpContractOptions([]);
    setSpBoqActivities([]);
  };

  const handleSpContractRefChange = async (refNo) => {
    setSpContractRefNo(refNo);
    setSpBoqActivities([]);
    setSpRows(prev => prev.map(row => ({ ...row, itemId: generateSpItemId(refNo) })));
    if (!refNo) return;
    try {
      const res = await axios.get(`/api/project-actions/boq/contract/${refNo}`);
      setSpBoqActivities(res.data);
    } catch (e) { console.error('Error loading BOQ activities:', e); }
  };

  const generateSpItemId = (refNo) => {
    const rand = Math.floor(100 + Math.random() * 900);
    return `${refNo || 'SP'}-${rand}`;
  };

  const addSpRow = () => {
    setSpRows(prev => [...prev, {
      tempId: Date.now(),
      itemId: generateSpItemId(spContractRefNo),
      activity: '',
      rate: '',
      unit: '',
      boqQuantities: '',
      executedQuantities: '',
      observation: ''
    }]);
  };

  const updateSpRow = (idx, field, value) => {
    setSpRows(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleSpActivitySelect = (idx, activityName) => {
    const boqMatch = spBoqActivities.find(b => b.activity === activityName);
    setSpRows(prev => prev.map((row, i) => i === idx ? {
      ...row,
      activity: activityName,
      unit: boqMatch?.unit || row.unit,
      boqQuantities: boqMatch?.boqQuantity ?? ''
    } : row));
  };

  const removeSpRow = (idx) => {
    setSpRows(prev => prev.filter((_, i) => i !== idx));
  };

  const calcSpPerformance = (boqQty, execQty) => {
    const b = parseFloat(boqQty);
    const e = parseFloat(execQty);
    if (!b || b === 0) return 0;
    return Math.round((e / b) * 10000) / 100;
  };

  const calcSpGlobalRate = (rate) => {
    const r = parseFloat(rate);
    if (isNaN(r)) return 0;
    return Math.round((r / 100) * 10000) / 100;
  };

  const handleSpSave = async () => {
    if (!spDate || !spProject || !spContractType || !spContractRefNo) {
      toast.error('Please fill in Date, Project, Contract Type, and Contract Reference');
      return;
    }
    if (spRows.length === 0) {
      toast.error('Please add at least one row');
      return;
    }
    setSpSaving(true);
    try {
      const items = spRows.map(row => ({
        entryDate: spDate,
        project: { projectId: spProject },
        contractType: spContractType,
        contractRefNo: spContractRefNo,
        itemId: row.itemId,
        activity: row.activity,
        rate: parseFloat(row.rate) || 0,
        unit: row.unit,
        boqQuantities: parseFloat(row.boqQuantities) || 0,
        executedQuantities: parseFloat(row.executedQuantities) || 0,
        performancePercentage: calcSpPerformance(row.boqQuantities, row.executedQuantities),
        globalProgressRate: calcSpGlobalRate(row.rate),
        observation: row.observation
      }));
      await axios.post('/api/project-actions/supply-progress/batch', items);
      toast.success('Supply progress saved successfully');
      setSpRows([]);
      setSpDate('');
      setSpContractType('');
      setSpContractRefNo('');
      setSpContractOptions([]);
      setSpBoqActivities([]);
      loadContracts();
    } catch (e) {
      toast.error('Error saving supply progress');
      console.error(e);
    } finally {
      setSpSaving(false);
    }
  };

  const handleDeleteSpItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`/api/project-actions/supply-progress/${id}`);
      toast.success('Item deleted');
      loadContracts();
    } catch (e) { toast.error('Error deleting item'); }
  };

  const openSpModal = (item, mode) => {
    setSpModalMode(mode);
    setSpModalItem(item);
    if (mode === 'edit') {
      setSpEditForm({
        entryDate: item.entryDate || '', contractType: item.contractType || '', contractRefNo: item.contractRefNo || '',
        itemId: item.itemId || '', activity: item.activity || '', rate: item.rate ?? '',
        unit: item.unit || '', boqQuantities: item.boqQuantities ?? '', executedQuantities: item.executedQuantities ?? '',
        observation: item.observation || ''
      });
    }
  };

  const closeSpModal = () => { setSpModalItem(null); setSpModalMode('view'); setSpEditForm({}); };

  const handleSpEditSave = async () => {
    if (!spModalItem) return;
    try {
      const pct = calcSpPerformance(spEditForm.boqQuantities, spEditForm.executedQuantities);
      const gpr = calcSpGlobalRate(spEditForm.rate);
      await axios.put(`/api/project-actions/supply-progress/${spModalItem.id}`, {
        ...spModalItem,
        entryDate: spEditForm.entryDate, contractType: spEditForm.contractType, contractRefNo: spEditForm.contractRefNo,
        itemId: spEditForm.itemId, activity: spEditForm.activity, rate: parseFloat(spEditForm.rate) || 0,
        unit: spEditForm.unit, boqQuantities: parseFloat(spEditForm.boqQuantities) || 0,
        executedQuantities: parseFloat(spEditForm.executedQuantities) || 0,
        performancePercentage: pct, globalProgressRate: gpr, observation: spEditForm.observation
      });
      toast.success('Record updated successfully');
      closeSpModal();
      loadContracts();
    } catch (e) { toast.error('Error updating record'); console.error(e); }
  };

  const renderSpModal = () => {
    if (!spModalItem) return null;
    const isView = spModalMode === 'view';
    const item = spModalItem;
    const form = spEditForm;
    const editPct = !isView ? calcSpPerformance(form.boqQuantities, form.executedQuantities) : null;
    const editGpr = !isView ? calcSpGlobalRate(form.rate) : null;
    return (
      <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeSpModal}>
        <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isView ? t('projectActions.viewRecord') : t('projectActions.editRecord')}</h5>
              <button type="button" className="btn-close" onClick={closeSpModal}></button>
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.date')}</label>
                  {isView ? <p className="form-control-plaintext">{item.entryDate || '-'}</p> : <input type="date" className="form-control" value={form.entryDate} onChange={e => setSpEditForm(f => ({...f, entryDate: e.target.value}))} />}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.project')}</label>
                  <p className="form-control-plaintext">{item.project?.project || item.project?.projectId || '-'}</p>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.contractType')}</label>
                  {isView ? <p className="form-control-plaintext"><span className={`badge ${item.contractType === 'works' ? 'bg-primary' : 'bg-success'}`}>{item.contractType === 'works' ? t('projectActions.works') : t('projectActions.goodsContracts')}</span></p> : <select className="form-select" value={form.contractType} onChange={e => setSpEditForm(f => ({...f, contractType: e.target.value}))}><option value="works">{t('projectActions.works')}</option><option value="goods">{t('projectActions.goodsContracts')}</option></select>}
                </div>
                <div className="col-md-4"><label className="form-label fw-semibold">{t('projectActions.contractRef')}</label>{isView ? <p className="form-control-plaintext">{item.contractRefNo || '-'}</p> : <input type="text" className="form-control" value={form.contractRefNo} onChange={e => setSpEditForm(f => ({...f, contractRefNo: e.target.value}))} />}</div>
                <div className="col-md-4"><label className="form-label fw-semibold">{t('projectActions.itemId')}</label>{isView ? <p className="form-control-plaintext"><code>{item.itemId}</code></p> : <input type="text" className="form-control bg-light" value={form.itemId} readOnly />}</div>
                <div className="col-md-4"><label className="form-label fw-semibold">{t('projectActions.activity')}</label>{isView ? <p className="form-control-plaintext">{item.activity || '-'}</p> : <input type="text" className="form-control" value={form.activity} onChange={e => setSpEditForm(f => ({...f, activity: e.target.value}))} />}</div>
                <div className="col-md-3"><label className="form-label fw-semibold">{t('projectActions.ratePercent')}</label>{isView ? <p className="form-control-plaintext">{item.rate}%</p> : <input type="number" className="form-control" value={form.rate} onChange={e => setSpEditForm(f => ({...f, rate: e.target.value}))} step="0.01" min="0" max="100" />}</div>
                <div className="col-md-3"><label className="form-label fw-semibold">{t('projectActions.unit')}</label>{isView ? <p className="form-control-plaintext">{item.unit || '-'}</p> : <input type="text" className="form-control" value={form.unit} onChange={e => setSpEditForm(f => ({...f, unit: e.target.value}))} />}</div>
                <div className="col-md-3"><label className="form-label fw-semibold">{t('projectActions.boqQty')}</label>{isView ? <p className="form-control-plaintext">{item.boqQuantities}</p> : <input type="number" className="form-control" value={form.boqQuantities} onChange={e => setSpEditForm(f => ({...f, boqQuantities: e.target.value}))} step="0.01" />}</div>
                <div className="col-md-3"><label className="form-label fw-semibold">{t('projectActions.execQty')}</label>{isView ? <p className="form-control-plaintext">{item.executedQuantities}</p> : <input type="number" className="form-control" value={form.executedQuantities} onChange={e => setSpEditForm(f => ({...f, executedQuantities: e.target.value}))} step="0.01" />}</div>
                <div className="col-md-4"><label className="form-label fw-semibold">{t('projectActions.performancePercent')}</label><p className="form-control-plaintext">{isView ? (item.performancePercentage != null ? `${item.performancePercentage}%` : '-') : `${editPct}%`}</p></div>
                <div className="col-md-4"><label className="form-label fw-semibold">{t('projectActions.globalProgressRate')}</label><p className="form-control-plaintext">{isView ? (item.globalProgressRate != null ? `${item.globalProgressRate}%` : '-') : `${editGpr}%`}</p></div>
                <div className="col-12"><label className="form-label fw-semibold">{t('projectActions.observation')}</label>{isView ? <p className="form-control-plaintext" style={{whiteSpace:'pre-wrap'}}>{item.observation || '-'}</p> : <textarea className="form-control" rows="3" value={form.observation} onChange={e => setSpEditForm(f => ({...f, observation: e.target.value}))} />}</div>
              </div>
            </div>
            <div className="modal-footer">
              {isView ? (
                <>
                  <button className="btn btn-primary" onClick={() => { setSpModalMode('edit'); setSpEditForm({ entryDate: item.entryDate || '', contractType: item.contractType || '', contractRefNo: item.contractRefNo || '', itemId: item.itemId || '', activity: item.activity || '', rate: item.rate ?? '', unit: item.unit || '', boqQuantities: item.boqQuantities ?? '', executedQuantities: item.executedQuantities ?? '', observation: item.observation || '' }); }}><FiEdit2 className="me-1" /> {t('common.edit')}</button>
                  <button className="btn btn-secondary" onClick={closeSpModal}>{t('common.close')}</button>
                </>
              ) : (
                <>
                  <button className="btn btn-success" onClick={handleSpEditSave}>{t('projectActions.saveChanges')}</button>
                  <button className="btn btn-secondary" onClick={closeSpModal}>{t('common.cancel')}</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const exportSpPdf = () => {
    if (spItems.length === 0) { toast.error('No records to export'); return; }
    const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(16); doc.setFont(undefined, 'bold');
    doc.text('ROMEOT DIGITAL M&E SYSTEM', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(13);
    doc.text('Supply Progress Monitoring', pageWidth / 2, 23, { align: 'center' });
    doc.setFontSize(9); doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    const grouped = {};
    spItems.forEach(item => { const key = item.contractRefNo || 'Unknown'; if (!grouped[key]) grouped[key] = []; grouped[key].push(item); });
    let startY = 36;
    Object.keys(grouped).forEach(contractRef => {
      const items = grouped[contractRef];
      const projectName = items[0]?.project?.project || items[0]?.project?.projectId || '-';
      const contractType = items[0]?.contractType === 'works' ? 'Works Contract' : 'Goods & Services';
      if (startY > pageHeight - 40) { doc.addPage(); startY = 15; }
      doc.setFontSize(10); doc.setFont(undefined, 'bold');
      doc.text(`Contract Ref: ${contractRef}`, 14, startY);
      doc.setFont(undefined, 'normal'); doc.setFontSize(8);
      doc.text(`Project: ${projectName}  |  Type: ${contractType}`, 14, startY + 5);
      autoTable(doc, {
        head: [['#', 'Date', 'Item ID', 'Activity', 'Rate(%)', 'Unit', 'BOQ Qty', 'Exec Qty', 'Perf.%', 'Global Rate', 'Observation']],
        body: items.map((item, idx) => [idx + 1, item.entryDate || '-', item.itemId || '-', item.activity || '-', item.rate != null ? `${item.rate}%` : '-', item.unit || '-', item.boqQuantities ?? '-', item.executedQuantities ?? '-', item.performancePercentage != null ? `${item.performancePercentage}%` : '-', item.globalProgressRate != null ? `${item.globalProgressRate}%` : '-', item.observation || '-']),
        startY: startY + 8,
        styles: { fontSize: 6, cellPadding: 1.5, overflow: 'linebreak' },
        headStyles: { fillColor: [67, 97, 238], textColor: 255, fontSize: 6.5, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 10, right: 10 }, tableWidth: pageWidth - 20
      });
      startY = doc.lastAutoTable.finalY + 12;
    });
    doc.save(`Supply_Progress_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF report downloaded');
  };

  const renderSupplyProgress = () => (
    <div>
      <div className="card mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{t('projectActions.supplyProgressMonitoring')}</h6>
          {spItems.length > 0 && (
            <button className="btn btn-sm btn-light" onClick={exportSpPdf}>
              <FiDownload className="me-1" /> {t('projectActions.exportPdf')}
            </button>
          )}
        </div>
        <div className="card-body">
          <div className="row g-3 mb-2">
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.date')}</label>
              <input type="date" className="form-control" value={spDate} onChange={e => setSpDate(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.project')}</label>
              <select className="form-select" value={spProject} onChange={e => handleSpProjectChange(e.target.value)}>
                <option value="">{t('projectActions.selectProject')}</option>
                {projects.map(p => (<option key={p.projectId} value={p.projectId}>{p.project || p.projectId}</option>))}
              </select>
            </div>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.contractType')}</label>
              <select className="form-select" value={spContractType} onChange={e => handleSpContractTypeChange(e.target.value)} disabled={!spProject}>
                <option value="">{t('projectActions.selectType')}</option>
                <option value="works">{t('projectActions.worksContracts')}</option>
                <option value="goods">{t('projectActions.goodsAndServices')}</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.contractReferenceNo')}</label>
              <select className="form-select" value={spContractRefNo} onChange={e => handleSpContractRefChange(e.target.value)} disabled={!spContractType}>
                <option value="">{t('projectActions.selectReference')}</option>
                {spContractOptions.map((c, i) => (<option key={i} value={c.contractRefNo}>{c.contractRefNo}</option>))}
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">{t('projectActions.activityRows')}</h6>
            <button type="button" className="btn btn-sm btn-primary" onClick={addSpRow} disabled={!spContractRefNo}>
              <FiPlus className="me-1" /> {t('projectActions.addRow')}
            </button>
          </div>

          {spRows.length > 0 && (
            <div className="table-responsive">
              <table className="table table-bordered table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{minWidth:'120px'}}>{t('projectActions.itemId')}</th>
                    <th style={{minWidth:'180px'}}>{t('projectActions.activity')}</th>
                    <th style={{minWidth:'80px'}}>{t('projectActions.ratePercent')}</th>
                    <th style={{minWidth:'80px'}}>{t('projectActions.unit')}</th>
                    <th style={{minWidth:'110px'}}>{t('projectActions.boqQty')}</th>
                    <th style={{minWidth:'110px'}}>{t('projectActions.execQty')}</th>
                    <th style={{minWidth:'90px'}}>{t('projectActions.perfPercent')}</th>
                    <th style={{minWidth:'100px'}}>{t('projectActions.globalRate')}</th>
                    <th style={{minWidth:'150px'}}>{t('projectActions.observation')}</th>
                    <th style={{width:'50px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {spRows.map((row, idx) => {
                    const pct = calcSpPerformance(row.boqQuantities, row.executedQuantities);
                    const gpr = calcSpGlobalRate(row.rate);
                    return (
                      <tr key={row.tempId}>
                        <td><input type="text" className="form-control form-control-sm bg-light" value={row.itemId} readOnly /></td>
                        <td>
                          <input type="text" className="form-control form-control-sm" list={`sp-activities-${row.tempId}`} value={row.activity} onChange={e => handleSpActivitySelect(idx, e.target.value)} placeholder={t('projectActions.placeholderSelectOrType')} />
                          <datalist id={`sp-activities-${row.tempId}`}>
                            {spBoqActivities.map((b, bi) => (<option key={bi} value={b.activity} />))}
                          </datalist>
                        </td>
                        <td><input type="number" className="form-control form-control-sm" value={row.rate} onChange={e => updateSpRow(idx, 'rate', e.target.value)} step="0.01" min="0" max="100" /></td>
                        <td><input type="text" className="form-control form-control-sm" value={row.unit} onChange={e => updateSpRow(idx, 'unit', e.target.value)} placeholder={t('projectActions.placeholderUnit')} /></td>
                        <td><input type="number" className="form-control form-control-sm" value={row.boqQuantities} onChange={e => updateSpRow(idx, 'boqQuantities', e.target.value)} step="0.01" /></td>
                        <td><input type="number" className="form-control form-control-sm" value={row.executedQuantities} onChange={e => updateSpRow(idx, 'executedQuantities', e.target.value)} step="0.01" /></td>
                        <td><input type="text" className="form-control form-control-sm bg-light" value={`${pct}%`} readOnly /></td>
                        <td><input type="text" className="form-control form-control-sm bg-light" value={`${gpr}%`} readOnly /></td>
                        <td><textarea className="form-control form-control-sm" value={row.observation} onChange={e => updateSpRow(idx, 'observation', e.target.value)} rows="1" /></td>
                        <td><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeSpRow(idx)}><FiTrash2 /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {spRows.length > 0 && (
            <div className="text-end mt-2">
              <button className="btn btn-success" onClick={handleSpSave} disabled={spSaving}>
                {spSaving ? t('projectActions.savingText') : t('projectActions.saveAllRows')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h6 className="mb-0">{t('projectActions.savedRecords')}</h6></div>
        <div className="card-body p-0">
          {spItems.length === 0 ? (
            <div className="text-center text-muted p-4">{t('projectActions.noSupplyProgressRecords')}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-sm mb-0" style={{fontSize:'clamp(0.65rem, 1.1vw, 0.85rem)'}}>
                <thead className="table-light">
                  <tr>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.date')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.project')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.contractType')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.contractRef')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.itemId')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.activity')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.ratePercent')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.unit')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.boqQty')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.executedQty')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.perfPercent')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.globalRate')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.observation')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {spItems.map(item => (
                    <tr key={item.id}>
                      <td style={{whiteSpace:'nowrap'}}>{item.entryDate}</td>
                      <td style={{whiteSpace:'nowrap',maxWidth:'120px',overflow:'hidden',textOverflow:'ellipsis'}} title={item.project?.project || ''}>{item.project?.project || item.project?.projectId || '-'}</td>
                      <td style={{whiteSpace:'nowrap'}}><span className={`badge ${item.contractType === 'works' ? 'bg-primary' : 'bg-success'}`} style={{fontSize:'inherit'}}>{item.contractType === 'works' ? t('projectActions.works') : t('projectActions.goods')}</span></td>
                      <td style={{whiteSpace:'nowrap'}}>{item.contractRefNo}</td>
                      <td style={{whiteSpace:'nowrap'}}><code style={{fontSize:'inherit'}}>{item.itemId}</code></td>
                      <td style={{whiteSpace:'nowrap',maxWidth:'100px',overflow:'hidden',textOverflow:'ellipsis'}} title={item.activity}>{item.activity}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.rate}%</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.unit}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.boqQuantities}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.executedQuantities}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.performancePercentage != null ? `${item.performancePercentage}%` : '-'}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.globalProgressRate != null ? `${item.globalProgressRate}%` : '-'}</td>
                      <td style={{maxWidth:'100px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={item.observation}>{item.observation}</td>
                      <td style={{whiteSpace:'nowrap'}}>
                        <div className="d-flex gap-1 flex-nowrap">
                          <button className="btn btn-sm btn-outline-info p-1" title={t('common.view')} onClick={() => openSpModal(item, 'view')}><FiEye /></button>
                          <button className="btn btn-sm btn-outline-primary p-1" title={t('common.edit')} onClick={() => openSpModal(item, 'edit')}><FiEdit2 /></button>
                          <button className="btn btn-sm btn-outline-danger p-1" title={t('common.delete')} onClick={() => handleDeleteSpItem(item.id)}><FiTrash2 /></button>
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
      {renderSpModal()}
    </div>
  );

  // --- Installation ---
  const handleInstProjectChange = async (projectId) => {
    setInstProject(projectId);
    setInstContractType('');
    setInstContractRefNo('');
    setInstContractOptions([]);
    setInstSpActivities([]);
    setInstRows([]);
  };

  const handleInstContractTypeChange = async (type) => {
    setInstContractType(type);
    setInstContractRefNo('');
    setInstContractOptions([]);
    setInstSpActivities([]);
    setInstRows([]);
    if (!type || !instProject) return;
    try {
      const url = type === 'works'
        ? `/api/project-actions/works/project/${instProject}`
        : `/api/project-actions/goods/project/${instProject}`;
      const res = await axios.get(url);
      const opts = res.data.map(c => ({ contractRefNo: c.contractRefNo })).filter(c => c.contractRefNo);
      const unique = [...new Map(opts.map(o => [o.contractRefNo, o])).values()];
      setInstContractOptions(unique);
    } catch { setInstContractOptions([]); }
  };

  const handleInstContractRefChange = async (ref) => {
    setInstContractRefNo(ref);
    setInstSpActivities([]);
    setInstRows([]);
    if (!ref) return;
    try {
      const [spRes, boqRes] = await Promise.all([
        axios.get(`/api/project-actions/supply-progress/contract/${ref}`).catch(() => ({ data: [] })),
        axios.get(`/api/project-actions/boq/contract/${ref}`).catch(() => ({ data: [] }))
      ]);
      const spData = spRes.data.map(sp => {
        const boqMatch = boqRes.data.find(b => b.activity === sp.activity);
        return {
          activity: sp.activity,
          unit: sp.unit || boqMatch?.unit || '',
          suppliedQty: sp.executedQuantities || 0,
          boqQty: boqMatch?.boqQuantity || sp.boqQuantities || 0
        };
      });
      setInstSpActivities(spData);
    } catch { setInstSpActivities([]); }
  };

  const generateInstItemId = (ref) => {
    const count = instRows.length + 1;
    return `${ref || 'INST'}-${String(count).padStart(3, '0')}`;
  };

  const addInstRow = () => {
    setInstRows(prev => [...prev, {
      tempId: Date.now(), itemId: generateInstItemId(instContractRefNo),
      activity: '', rate: '', unit: '', boqQty: '', suppliedQty: '', provisionalStakingQty: '', executedQty: '', observation: ''
    }]);
  };

  const updateInstRow = (idx, field, value) => {
    setInstRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const removeInstRow = (idx) => {
    setInstRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleInstActivitySelect = (idx, activityName) => {
    const match = instSpActivities.find(a => a.activity === activityName);
    if (match) {
      setInstRows(prev => prev.map((r, i) => i === idx ? {
        ...r, activity: activityName, unit: match.unit, suppliedQty: match.suppliedQty, boqQty: match.boqQty
      } : r));
    } else {
      updateInstRow(idx, 'activity', activityName);
    }
  };

  const calcInstPercentage = (boqQty, executedQty) => {
    const b = parseFloat(boqQty); const e = parseFloat(executedQty);
    if (!b || b === 0) return 0;
    return Math.round((e / b) * 10000) / 100;
  };

  const calcInstGlobalRate = (rate) => {
    const r = parseFloat(rate);
    if (isNaN(r)) return 0;
    return Math.round(r * 100) / 100;
  };

  const validateInstRow = (row) => {
    const supplied = parseFloat(row.suppliedQty) || 0;
    const boq = parseFloat(row.boqQty) || 0;
    const provStaking = parseFloat(row.provisionalStakingQty) || 0;
    if (supplied > boq) return 'Supplied Qty cannot be greater than BOQ Qty';
    if (provStaking > supplied) return 'Provisional Staking Qty cannot be greater than Supplied Qty';
    return null;
  };

  const handleInstSave = async () => {
    if (!instDate || !instProject || !instContractType || !instContractRefNo) {
      toast.error('Please fill all header fields');
      return;
    }
    if (instRows.length === 0) { toast.error('Please add at least one activity row'); return; }
    for (let i = 0; i < instRows.length; i++) {
      const err = validateInstRow(instRows[i]);
      if (err) { toast.error(`Row ${i + 1}: ${err}`); return; }
    }
    setInstSaving(true);
    try {
      const items = instRows.map(row => ({
        entryDate: instDate,
        project: { projectId: instProject },
        contractType: instContractType,
        contractRefNo: instContractRefNo,
        itemId: row.itemId,
        activity: row.activity,
        rate: parseFloat(row.rate) || 0,
        unit: row.unit,
        boqQty: parseFloat(row.boqQty) || 0,
        suppliedQty: parseFloat(row.suppliedQty) || 0,
        provisionalStakingQty: parseFloat(row.provisionalStakingQty) || 0,
        executedQty: parseFloat(row.executedQty) || 0,
        percentage: calcInstPercentage(row.boqQty, row.executedQty),
        globalProgressRate: calcInstGlobalRate(row.rate),
        observation: row.observation
      }));
      await axios.post('/api/project-actions/installation/batch', items);
      toast.success('Installation records saved successfully');
      setInstRows([]);
      setInstDate('');
      setInstContractType('');
      setInstContractRefNo('');
      setInstContractOptions([]);
      setInstSpActivities([]);
      loadContracts();
    } catch (e) { toast.error('Error saving installation records'); console.error(e); }
    finally { setInstSaving(false); }
  };

  const handleDeleteInstItem = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await axios.delete(`/api/project-actions/installation/${id}`);
      toast.success('Record deleted');
      loadContracts();
    } catch { toast.error('Error deleting record'); }
  };

  const openInstModal = (item, mode) => {
    setInstModalItem(item);
    setInstModalMode(mode);
    if (mode === 'edit') {
      setInstEditForm({
        entryDate: item.entryDate || '', contractType: item.contractType || '', contractRefNo: item.contractRefNo || '',
        itemId: item.itemId || '', activity: item.activity || '', rate: item.rate ?? '',
        unit: item.unit || '', boqQty: item.boqQty ?? '', suppliedQty: item.suppliedQty ?? '',
        provisionalStakingQty: item.provisionalStakingQty ?? '', executedQty: item.executedQty ?? '', observation: item.observation || ''
      });
    }
  };

  const closeInstModal = () => { setInstModalItem(null); setInstModalMode('view'); setInstEditForm({}); };

  const handleInstEditSave = async () => {
    if (!instModalItem) return;
    const supplied = parseFloat(instEditForm.suppliedQty) || 0;
    const boq = parseFloat(instEditForm.boqQty) || 0;
    const provStaking = parseFloat(instEditForm.provisionalStakingQty) || 0;
    if (supplied > boq) { toast.error('Supplied Qty cannot be greater than BOQ Qty'); return; }
    if (provStaking > supplied) { toast.error('Provisional Staking Qty cannot be greater than Supplied Qty'); return; }
    try {
      const pct = calcInstPercentage(instEditForm.boqQty, instEditForm.executedQty);
      const gpr = calcInstGlobalRate(instEditForm.rate);
      await axios.put(`/api/project-actions/installation/${instModalItem.id}`, {
        ...instModalItem,
        entryDate: instEditForm.entryDate, contractType: instEditForm.contractType, contractRefNo: instEditForm.contractRefNo,
        itemId: instEditForm.itemId, activity: instEditForm.activity, rate: parseFloat(instEditForm.rate) || 0,
        unit: instEditForm.unit, boqQty: parseFloat(instEditForm.boqQty) || 0,
        suppliedQty: parseFloat(instEditForm.suppliedQty) || 0,
        provisionalStakingQty: parseFloat(instEditForm.provisionalStakingQty) || 0,
        executedQty: parseFloat(instEditForm.executedQty) || 0,
        percentage: pct, globalProgressRate: gpr, observation: instEditForm.observation
      });
      toast.success('Record updated successfully');
      closeInstModal();
      loadContracts();
    } catch (e) { toast.error('Error updating record'); console.error(e); }
  };

  const renderInstModal = () => {
    if (!instModalItem) return null;
    const isView = instModalMode === 'view';
    const item = instModalItem;
    const form = instEditForm;
    const editPct = !isView ? calcInstPercentage(form.boqQty, form.executedQty) : null;
    const editGpr = !isView ? calcInstGlobalRate(form.rate) : null;
    return (
      <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeInstModal}>
        <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isView ? t('projectActions.viewRecord') : t('projectActions.editRecord')}</h5>
              <button type="button" className="btn-close" onClick={closeInstModal}></button>
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.date')}</label>
                  {isView ? <p className="form-control-plaintext">{item.entryDate || '-'}</p> : <input type="date" className="form-control" value={form.entryDate} onChange={e => setInstEditForm(f => ({...f, entryDate: e.target.value}))} />}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.project')}</label>
                  <p className="form-control-plaintext">{item.project?.project || item.project?.projectId || '-'}</p>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.contractType')}</label>
                  {isView ? <p className="form-control-plaintext"><span className={`badge ${item.contractType === 'works' ? 'bg-primary' : 'bg-success'}`}>{item.contractType === 'works' ? t('projectActions.works') : t('projectActions.goodsContracts')}</span></p> : <select className="form-select" value={form.contractType} onChange={e => setInstEditForm(f => ({...f, contractType: e.target.value}))}><option value="works">{t('projectActions.worksContracts')}</option><option value="goods">{t('projectActions.goodsAndServices')}</option></select>}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.contractRefNo')}</label>
                  {isView ? <p className="form-control-plaintext">{item.contractRefNo || '-'}</p> : <input type="text" className="form-control" value={form.contractRefNo} onChange={e => setInstEditForm(f => ({...f, contractRefNo: e.target.value}))} />}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.activity')}</label>
                  {isView ? <p className="form-control-plaintext">{item.activity || '-'}</p> : <input type="text" className="form-control" value={form.activity} onChange={e => setInstEditForm(f => ({...f, activity: e.target.value}))} />}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('projectActions.ratePercent')}</label>
                  {isView ? <p className="form-control-plaintext">{item.rate}%</p> : <input type="number" className="form-control" value={form.rate} onChange={e => setInstEditForm(f => ({...f, rate: e.target.value}))} step="0.01" min="0" max="100" />}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">{t('projectActions.unit')}</label>
                  {isView ? <p className="form-control-plaintext">{item.unit || '-'}</p> : <input type="text" className="form-control" value={form.unit} onChange={e => setInstEditForm(f => ({...f, unit: e.target.value}))} />}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">{t('projectActions.boqQty')}</label>
                  {isView ? <p className="form-control-plaintext">{item.boqQty}</p> : <input type="number" className="form-control bg-light" value={form.boqQty} readOnly />}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">{t('projectActions.suppliedQty')}</label>
                  {isView ? <p className="form-control-plaintext">{item.suppliedQty}</p> : <input type="number" className="form-control bg-light" value={form.suppliedQty} readOnly />}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">{t('projectActions.provStakingQty')}</label>
                  {isView ? <p className="form-control-plaintext">{item.provisionalStakingQty}</p> : <input type="number" className={`form-control ${!isView && (parseFloat(form.provisionalStakingQty) || 0) > (parseFloat(form.suppliedQty) || 0) && (parseFloat(form.suppliedQty) || 0) > 0 ? 'border-danger' : ''}`} value={form.provisionalStakingQty} onChange={e => setInstEditForm(f => ({...f, provisionalStakingQty: e.target.value}))} step="0.01" />}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">{t('projectActions.executedQty')}</label>
                  {isView ? <p className="form-control-plaintext">{item.executedQty}</p> : <input type="number" className="form-control" value={form.executedQty} onChange={e => setInstEditForm(f => ({...f, executedQty: e.target.value}))} step="0.01" />}
                </div>
                {!isView && (() => {
                  const mSupplied = parseFloat(form.suppliedQty) || 0;
                  const mBoq = parseFloat(form.boqQty) || 0;
                  const mProv = parseFloat(form.provisionalStakingQty) || 0;
                  const mSupErr = mSupplied > mBoq && mBoq > 0;
                  const mStaErr = mProv > mSupplied && mSupplied > 0;
                  return (mSupErr || mStaErr) ? (
                    <div className="col-12">
                      <div className="alert alert-warning py-2 px-3 small d-flex align-items-center">
                        <FiAlertTriangle className="me-2 flex-shrink-0" />
                        <div>
                          {mSupErr && <div>{t('projectActions.suppliedQtyError', { supplied: mSupplied, boq: mBoq })}</div>}
                          {mStaErr && <div>{t('projectActions.provStakingQtyError', { prov: mProv, supplied: mSupplied })}</div>}
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
                <div className="col-md-3">
                  <label className="form-label fw-semibold">{t('projectActions.percentage')}</label>
                  <p className="form-control-plaintext">{isView ? (item.percentage != null ? `${item.percentage}%` : '-') : `${editPct}%`}</p>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">{t('projectActions.globalRate')}</label>
                  <p className="form-control-plaintext">{isView ? (item.globalProgressRate != null ? `${item.globalProgressRate}%` : '-') : `${editGpr}%`}</p>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">{t('projectActions.observation')}</label>
                  {isView ? <p className="form-control-plaintext" style={{whiteSpace:'pre-wrap'}}>{item.observation || '-'}</p> : <textarea className="form-control" rows="3" value={form.observation} onChange={e => setInstEditForm(f => ({...f, observation: e.target.value}))} />}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {isView ? (
                <>
                  <button className="btn btn-primary" onClick={() => { setInstModalMode('edit'); setInstEditForm({ entryDate: item.entryDate || '', contractType: item.contractType || '', contractRefNo: item.contractRefNo || '', itemId: item.itemId || '', activity: item.activity || '', rate: item.rate ?? '', unit: item.unit || '', boqQty: item.boqQty ?? '', suppliedQty: item.suppliedQty ?? '', provisionalStakingQty: item.provisionalStakingQty ?? '', executedQty: item.executedQty ?? '', observation: item.observation || '' }); }}>
                    <FiEdit2 className="me-1" /> {t('common.edit')}
                  </button>
                  <button className="btn btn-secondary" onClick={closeInstModal}>{t('common.close')}</button>
                </>
              ) : (
                <>
                  <button className="btn btn-success" onClick={handleInstEditSave}>{t('projectActions.saveChanges')}</button>
                  <button className="btn btn-secondary" onClick={closeInstModal}>{t('common.cancel')}</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const exportInstPdf = () => {
    if (instItems.length === 0) { toast.error('No records to export'); return; }
    const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(16); doc.setFont(undefined, 'bold');
    doc.text('ROMEOT DIGITAL M&E SYSTEM', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(13);
    doc.text('Installation', pageWidth / 2, 23, { align: 'center' });
    doc.setFontSize(9); doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    const grouped = {};
    instItems.forEach(item => { const key = item.contractRefNo || 'Unknown'; if (!grouped[key]) grouped[key] = []; grouped[key].push(item); });
    let startY = 36;
    Object.keys(grouped).forEach(contractRef => {
      const items = grouped[contractRef];
      const projectName = items[0]?.project?.project || items[0]?.project?.projectId || '-';
      const contractType = items[0]?.contractType === 'works' ? 'Works Contract' : 'Goods & Services';
      if (startY > pageHeight - 40) { doc.addPage(); startY = 15; }
      doc.setFontSize(10); doc.setFont(undefined, 'bold');
      doc.text(`Contract Ref: ${contractRef}`, 14, startY);
      doc.setFont(undefined, 'normal'); doc.setFontSize(8);
      doc.text(`Project: ${projectName}  |  Type: ${contractType}`, 14, startY + 5);
      autoTable(doc, {
        head: [['#', 'Date', 'Activity', 'Rate(%)', 'Unit', 'BOQ Qty', 'Supplied Qty', 'Prov.Staking', 'Exec Qty', '%', 'Global Rate']],
        body: items.map((item, idx) => [
          idx + 1, item.entryDate || '-', item.activity || '-',
          item.rate != null ? `${item.rate}%` : '-', item.unit || '-',
          item.boqQty ?? '-', item.suppliedQty ?? '-', item.provisionalStakingQty ?? '-',
          item.executedQty ?? '-',
          item.percentage != null ? `${item.percentage}%` : '-',
          item.globalProgressRate != null ? `${item.globalProgressRate}%` : '-'
        ]),
        startY: startY + 8,
        styles: { fontSize: 6, cellPadding: 1.5, overflow: 'linebreak' },
        headStyles: { fillColor: [67, 97, 238], textColor: 255, fontSize: 6.5, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 10, right: 10 },
        tableWidth: pageWidth - 20
      });
      startY = doc.lastAutoTable.finalY + 12;
    });
    doc.save('installation.pdf');
  };

  const renderInstallation = () => (
    <div>
      <div className="card mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{t('projectActions.installationTab')}</h6>
          {instItems.length > 0 && (
            <button className="btn btn-sm btn-light" onClick={exportInstPdf}>
              <FiDownload className="me-1" /> {t('projectActions.exportPdf')}
            </button>
          )}
        </div>
        <div className="card-body">
          <div className="row g-3 mb-2">
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.date')}</label>
              <input type="date" className="form-control" value={instDate} onChange={e => setInstDate(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.project')}</label>
              <select className="form-select" value={instProject} onChange={e => handleInstProjectChange(e.target.value)}>
                <option value="">{t('projectActions.selectProject')}</option>
                {projects.map(p => (<option key={p.projectId} value={p.projectId}>{p.project || p.projectId}</option>))}
              </select>
            </div>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.contractType')}</label>
              <select className="form-select" value={instContractType} onChange={e => handleInstContractTypeChange(e.target.value)} disabled={!instProject}>
                <option value="">{t('projectActions.selectType')}</option>
                <option value="works">{t('projectActions.worksContracts')}</option>
                <option value="goods">{t('projectActions.goodsAndServices')}</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.contractReferenceNo')}</label>
              <select className="form-select" value={instContractRefNo} onChange={e => handleInstContractRefChange(e.target.value)} disabled={!instContractType}>
                <option value="">{t('projectActions.selectReference')}</option>
                {instContractOptions.map((c, i) => (<option key={i} value={c.contractRefNo}>{c.contractRefNo}</option>))}
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">{t('projectActions.activityRows')}</h6>
            <button type="button" className="btn btn-sm btn-primary" onClick={addInstRow} disabled={!instContractRefNo}>
              <FiPlus className="me-1" /> {t('projectActions.addRow')}
            </button>
          </div>

          {instRows.length > 0 && (
            <div className="table-responsive">
              <table className="table table-bordered table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{minWidth:'120px'}}>{t('projectActions.itemId')}</th>
                    <th style={{minWidth:'180px'}}>{t('projectActions.activity')}</th>
                    <th style={{minWidth:'80px'}}>{t('projectActions.ratePercent')}</th>
                    <th style={{minWidth:'80px'}}>{t('projectActions.unit')}</th>
                    <th style={{minWidth:'100px'}}>{t('projectActions.boqQty')}</th>
                    <th style={{minWidth:'100px'}}>{t('projectActions.suppliedQty')}</th>
                    <th style={{minWidth:'120px'}}>{t('projectActions.provStakingQty')}</th>
                    <th style={{minWidth:'100px'}}>{t('projectActions.execQty')}</th>
                    <th style={{minWidth:'80px'}}>%</th>
                    <th style={{minWidth:'90px'}}>{t('projectActions.globalRate')}</th>
                    <th style={{minWidth:'150px'}}>{t('projectActions.observation')}</th>
                    <th style={{width:'50px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {instRows.map((row, idx) => {
                    const pct = calcInstPercentage(row.boqQty, row.executedQty);
                    const gpr = calcInstGlobalRate(row.rate);
                    const supplied = parseFloat(row.suppliedQty) || 0;
                    const boq = parseFloat(row.boqQty) || 0;
                    const provStaking = parseFloat(row.provisionalStakingQty) || 0;
                    const suppliedError = supplied > boq && boq > 0;
                    const stakingError = provStaking > supplied && supplied > 0;
                    return (
                      <Fragment key={row.tempId}>
                      <tr>
                        <td><input type="text" className="form-control form-control-sm bg-light" value={row.itemId} readOnly /></td>
                        <td>
                          <input type="text" className="form-control form-control-sm" list={`inst-activities-${row.tempId}`} value={row.activity} onChange={e => handleInstActivitySelect(idx, e.target.value)} placeholder={t('projectActions.placeholderSelectOrType')} />
                          <datalist id={`inst-activities-${row.tempId}`}>
                            {instSpActivities.map((a, ai) => (<option key={ai} value={a.activity} />))}
                          </datalist>
                        </td>
                        <td><input type="number" className="form-control form-control-sm" value={row.rate} onChange={e => updateInstRow(idx, 'rate', e.target.value)} step="0.01" min="0" max="100" /></td>
                        <td><input type="text" className="form-control form-control-sm" value={row.unit} onChange={e => updateInstRow(idx, 'unit', e.target.value)} placeholder={t('projectActions.placeholderUnit')} /></td>
                        <td><input type="number" className={`form-control form-control-sm bg-light`} value={row.boqQty} readOnly /></td>
                        <td><input type="number" className={`form-control form-control-sm bg-light ${suppliedError ? 'border-danger' : ''}`} value={row.suppliedQty} readOnly /></td>
                        <td><input type="number" className={`form-control form-control-sm ${stakingError ? 'border-danger' : ''}`} value={row.provisionalStakingQty} onChange={e => updateInstRow(idx, 'provisionalStakingQty', e.target.value)} step="0.01" /></td>
                        <td><input type="number" className="form-control form-control-sm" value={row.executedQty} onChange={e => updateInstRow(idx, 'executedQty', e.target.value)} step="0.01" /></td>
                        <td><input type="text" className="form-control form-control-sm bg-light" value={`${pct}%`} readOnly /></td>
                        <td><input type="text" className="form-control form-control-sm bg-light" value={`${gpr}%`} readOnly /></td>
                        <td><textarea className="form-control form-control-sm" value={row.observation} onChange={e => updateInstRow(idx, 'observation', e.target.value)} rows="1" /></td>
                        <td><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeInstRow(idx)}><FiTrash2 /></button></td>
                      </tr>
                      {(suppliedError || stakingError) && (
                        <tr>
                          <td colSpan="12" className="p-0 border-0">
                            <div className="alert alert-warning py-1 px-2 mb-0 small d-flex align-items-center" style={{borderRadius: 0}}>
                              <FiAlertTriangle className="me-1 flex-shrink-0" />
                              {suppliedError && <span className="me-3"><strong>{t('projectActions.row')} {idx + 1}:</strong> {t('projectActions.suppliedQtyError', { supplied, boq })}</span>}
                              {stakingError && <span><strong>{t('projectActions.row')} {idx + 1}:</strong> {t('projectActions.provStakingQtyError', { prov: provStaking, supplied })}</span>}
                            </div>
                          </td>
                        </tr>
                      )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {instRows.length > 0 && (
            <div className="text-end mt-2">
              <button className="btn btn-success" onClick={handleInstSave} disabled={instSaving}>
                {instSaving ? t('projectActions.savingText') : t('projectActions.saveAllRows')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h6 className="mb-0">{t('projectActions.savedRecords')}</h6></div>
        <div className="card-body p-0">
          {instItems.length === 0 ? (
            <div className="text-center text-muted p-4">{t('projectActions.noInstallationRecords')}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-sm mb-0" style={{fontSize:'clamp(0.65rem, 1.1vw, 0.85rem)'}}>
                <thead className="table-light">
                  <tr>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.date')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.project')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.contractType')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.contractRef')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.activity')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.ratePercent')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.unit')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.boqQty')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.supplied')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.provStaking')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.executedQty')}</th>
                    <th style={{whiteSpace:'nowrap'}}>%</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.globalRate')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {instItems.map(item => (
                    <tr key={item.id}>
                      <td style={{whiteSpace:'nowrap'}}>{item.entryDate}</td>
                      <td style={{whiteSpace:'nowrap',maxWidth:'120px',overflow:'hidden',textOverflow:'ellipsis'}} title={item.project?.project || ''}>{item.project?.project || item.project?.projectId || '-'}</td>
                      <td style={{whiteSpace:'nowrap'}}><span className={`badge ${item.contractType === 'works' ? 'bg-primary' : 'bg-success'}`} style={{fontSize:'inherit'}}>{item.contractType === 'works' ? t('projectActions.works') : t('projectActions.goods')}</span></td>
                      <td style={{whiteSpace:'nowrap'}}>{item.contractRefNo}</td>
                      <td style={{whiteSpace:'nowrap',maxWidth:'100px',overflow:'hidden',textOverflow:'ellipsis'}} title={item.activity}>{item.activity}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.rate}%</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.unit}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.boqQty}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.suppliedQty}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.provisionalStakingQty}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.executedQty}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.percentage != null ? `${item.percentage}%` : '-'}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.globalProgressRate != null ? `${item.globalProgressRate}%` : '-'}</td>
                      <td style={{whiteSpace:'nowrap'}}>
                        <div className="d-flex gap-1 flex-nowrap">
                          <button className="btn btn-sm btn-outline-info p-1" title={t('common.view')} onClick={() => openInstModal(item, 'view')}><FiEye /></button>
                          <button className="btn btn-sm btn-outline-primary p-1" title={t('common.edit')} onClick={() => openInstModal(item, 'edit')}><FiEdit2 /></button>
                          <button className="btn btn-sm btn-outline-danger p-1" title={t('common.delete')} onClick={() => handleDeleteInstItem(item.id)}><FiTrash2 /></button>
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
      {renderInstModal()}
    </div>
  );

  const exportBoqPdf = () => {
    if (boqItems.length === 0) { toast.error('No records to export'); return; }
    const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(16); doc.setFont(undefined, 'bold');
    doc.text('ROMEOT DIGITAL M&E SYSTEM', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(13);
    doc.text('Bill of Quantities (BOQ)', pageWidth / 2, 23, { align: 'center' });
    doc.setFontSize(9); doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    const grouped = {};
    boqItems.forEach(item => { const key = item.contractRefNo || 'Unknown'; if (!grouped[key]) grouped[key] = []; grouped[key].push(item); });
    let startY = 36;
    Object.keys(grouped).forEach(contractRef => {
      const items = grouped[contractRef];
      const projectName = items[0]?.project?.project || items[0]?.project?.projectId || '-';
      const contractType = items[0]?.contractType === 'works' ? 'Works Contract' : 'Goods & Services';
      if (startY > pageHeight - 40) { doc.addPage(); startY = 15; }
      doc.setFontSize(10); doc.setFont(undefined, 'bold');
      doc.text(`Contract Ref: ${contractRef}`, 14, startY);
      doc.setFont(undefined, 'normal'); doc.setFontSize(8);
      doc.text(`Project: ${projectName}  |  Type: ${contractType}`, 14, startY + 5);
      autoTable(doc, {
        head: [['#', 'Date', 'Item ID', 'Activity', 'Unit', 'BOQ Quantity']],
        body: items.map((item, idx) => [idx + 1, item.entryDate || '-', item.itemId || '-', item.activity || '-', item.unit || '-', item.boqQuantity != null ? item.boqQuantity : '-']),
        startY: startY + 8,
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [67, 97, 238], textColor: 255, fontSize: 8, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 },
        tableWidth: pageWidth - 28
      });
      startY = doc.lastAutoTable.finalY + 12;
    });
    doc.save(`BOQ_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF report downloaded');
  };

  const renderBoq = () => (
    <div>
      <div className="card mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{t('projectActions.billOfQuantities')}</h6>
          {boqItems.length > 0 && (
            <button className="btn btn-sm btn-light" onClick={exportBoqPdf}>
              <FiDownload className="me-1" /> {t('projectActions.exportPdf')}
            </button>
          )}
        </div>
        <div className="card-body">
          <div className="row g-3 mb-2">
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.date')}</label>
              <input type="date" className="form-control" value={boqDate} onChange={e => setBoqDate(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.project')}</label>
              <select className="form-select" value={boqProject} onChange={e => handleBoqProjectChange(e.target.value)}>
                <option value="">{t('projectActions.selectProject')}</option>
                {projects.map(p => (
                  <option key={p.projectId} value={p.projectId}>{p.project || p.projectId}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.contractType')}</label>
              <select className="form-select" value={boqContractType} onChange={e => handleBoqContractTypeChange(e.target.value)} disabled={!boqProject}>
                <option value="">{t('projectActions.selectType')}</option>
                <option value="works">{t('projectActions.worksContracts')}</option>
                <option value="goods">{t('projectActions.goodsAndServices')}</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.contractReferenceNo')}</label>
              <select className="form-select" value={boqContractRefNo} onChange={e => {
                setBoqContractRefNo(e.target.value);
                setBoqRows(prev => prev.map(row => ({ ...row, itemId: generateBoqItemId(e.target.value) })));
              }} disabled={!boqContractType}>
                <option value="">{t('projectActions.selectReference')}</option>
                {boqContractOptions.map((c, i) => (
                  <option key={i} value={c.contractRefNo}>{c.contractRefNo}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">{t('projectActions.itemRows')}</h6>
            <button type="button" className="btn btn-sm btn-primary" onClick={addBoqRow} disabled={!boqContractRefNo}>
              <FiPlus className="me-1" /> {t('projectActions.addRow')}
            </button>
          </div>

          {boqRows.length > 0 && (
            <div className="table-responsive">
              <table className="table table-bordered table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{minWidth:'120px'}}>{t('projectActions.itemId')}</th>
                    <th style={{minWidth:'180px'}}>{t('projectActions.activity')}</th>
                    <th style={{minWidth:'80px'}}>{t('projectActions.unit')}</th>
                    <th style={{minWidth:'120px'}}>{t('projectActions.boqQuantity')}</th>
                    <th style={{width:'50px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {boqRows.map((row, idx) => (
                    <tr key={row.tempId}>
                      <td><input type="text" className="form-control form-control-sm bg-light" value={row.itemId} readOnly /></td>
                      <td><input type="text" className="form-control form-control-sm" value={row.activity} onChange={e => updateBoqRow(idx, 'activity', e.target.value)} placeholder={t('projectActions.placeholderActivityName')} /></td>
                      <td><input type="text" className="form-control form-control-sm" value={row.unit} onChange={e => updateBoqRow(idx, 'unit', e.target.value)} placeholder={t('projectActions.placeholderUnit')} /></td>
                      <td><input type="number" className="form-control form-control-sm" value={row.boqQuantity} onChange={e => updateBoqRow(idx, 'boqQuantity', e.target.value)} step="0.01" /></td>
                      <td><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeBoqRow(idx)}><FiTrash2 /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {boqRows.length > 0 && (
            <div className="text-end mt-2">
              <button className="btn btn-success" onClick={handleBoqSave} disabled={boqSaving}>
                {boqSaving ? t('projectActions.savingText') : t('projectActions.saveAllRows')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h6 className="mb-0">{t('projectActions.savedRecords')}</h6>
        </div>
        <div className="card-body p-0">
          {boqItems.length === 0 ? (
            <div className="text-center text-muted p-4">{t('projectActions.noBoqRecords')}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-sm mb-0" style={{fontSize:'clamp(0.65rem, 1.1vw, 0.85rem)'}}>
                <thead className="table-light">
                  <tr>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.date')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.project')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.contractType')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.contractRef')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.itemId')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.activity')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.unit')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.boqQty')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {boqItems.map(item => (
                    <tr key={item.id}>
                      <td style={{whiteSpace:'nowrap'}}>{item.entryDate}</td>
                      <td style={{whiteSpace:'nowrap',maxWidth:'120px',overflow:'hidden',textOverflow:'ellipsis'}} title={item.project?.project || item.project?.projectId || ''}>{item.project?.project || item.project?.projectId || '-'}</td>
                      <td style={{whiteSpace:'nowrap'}}><span className={`badge ${item.contractType === 'works' ? 'bg-primary' : 'bg-success'}`} style={{fontSize:'inherit'}}>{item.contractType === 'works' ? t('projectActions.works') : t('projectActions.goods')}</span></td>
                      <td style={{whiteSpace:'nowrap'}}>{item.contractRefNo}</td>
                      <td style={{whiteSpace:'nowrap'}}><code style={{fontSize:'inherit'}}>{item.itemId}</code></td>
                      <td style={{whiteSpace:'nowrap',maxWidth:'150px',overflow:'hidden',textOverflow:'ellipsis'}} title={item.activity}>{item.activity}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.unit}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.boqQuantity}</td>
                      <td style={{whiteSpace:'nowrap'}}>
                        <div className="d-flex gap-1 flex-nowrap">
                          <button className="btn btn-sm btn-outline-info p-1" title={t('common.view')} onClick={() => openBoqModal(item, 'view')}><FiEye /></button>
                          <button className="btn btn-sm btn-outline-primary p-1" title={t('common.edit')} onClick={() => openBoqModal(item, 'edit')}><FiEdit2 /></button>
                          <button className="btn btn-sm btn-outline-danger p-1" title={t('common.delete')} onClick={() => handleDeleteBoqItem(item.id)}><FiTrash2 /></button>
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
      {renderBoqModal()}
    </div>
  );

  const exportDwpPdf = () => {
    if (designWorkItems.length === 0) {
      toast.error('No records to export');
      return;
    }

    const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('ROMEOT DIGITAL M&E SYSTEM', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(13);
    doc.text('Design Work Plan', pageWidth / 2, 23, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

    const grouped = {};
    designWorkItems.forEach(item => {
      const key = item.contractRefNo || 'Unknown';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    let startY = 36;

    Object.keys(grouped).forEach((contractRef, groupIdx) => {
      const items = grouped[contractRef];
      const projectName = items[0]?.project?.project || items[0]?.project?.projectId || '-';
      const contractType = items[0]?.contractType === 'works' ? 'Works Contract' : 'Goods & Services';

      if (startY > pageHeight - 40) {
        doc.addPage();
        startY = 15;
      }

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`Contract Ref: ${contractRef}`, 14, startY);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      doc.text(`Project: ${projectName}  |  Type: ${contractType}`, 14, startY + 5);

      autoTable(doc, {
        head: [['#', 'Year', 'Activity ID', 'Activity', 'Rate (%)', 'Unit', 'Prov. Qty', 'Observations']],
        body: items.map((item, idx) => [
          idx + 1,
          item.year?.profileYear || '-',
          item.activityId || '-',
          item.activity || '-',
          item.rate != null ? `${item.rate}%` : '-',
          item.unit || '-',
          item.provisionalQuantities != null ? item.provisionalQuantities : '-',
          item.observations || '-'
        ]),
        startY: startY + 8,
        styles: { fontSize: 6, cellPadding: 1.5, overflow: 'linebreak' },
        headStyles: { fillColor: [67, 97, 238], textColor: 255, fontSize: 6.5, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 10, right: 10 },
        tableWidth: pageWidth - 20,
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 20 },
          2: { cellWidth: 22 },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 16 },
          5: { cellWidth: 14 },
          6: { cellWidth: 20 },
          7: { cellWidth: 'auto' }
        }
      });

      startY = doc.lastAutoTable.finalY + 12;
    });

    doc.save(`Design_Work_Progress_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF report downloaded');
  };

  const handleDmProjectChange = (projId) => {
    setDmProject(projId);
    setDmContractType('');
    setDmContractRefNo('');
    setDmContractOptions([]);
    setDmItems([]);
  };

  const handleDmContractTypeChange = async (type) => {
    setDmContractType(type);
    setDmContractRefNo('');
    setDmContractOptions([]);
    setDmItems([]);
    if (!type || !dmProject) return;
    try {
      const encodedProject = encodeURIComponent(dmProject);
      const endpoint = type === 'works'
        ? `/api/project-actions/works/project/${encodedProject}`
        : `/api/project-actions/goods/project/${encodedProject}`;
      const res = await axios.get(endpoint);
      setDmContractOptions(res.data.filter(c => c.contractRefNo));
    } catch (e) {
      console.error('Error loading contracts:', e);
    }
  };

  const loadAllDmRecords = async () => {
    setDmAllLoading(true);
    try {
      let url = '/api/project-actions/design-monitoring';
      if (dmProject && dmContractType && dmContractRefNo) {
        const savedParams = new URLSearchParams({ projectId: dmProject, contractType: dmContractType, contractRefNo: dmContractRefNo });
        url = `/api/project-actions/design-monitoring/filter?${savedParams}`;
      }
      const res = await axios.get(url);
      setDmAllRecords(res.data);
      const allMs = {};
      res.data.forEach(rec => { allMs[rec.id] = rec.milestones || []; });
      setDmAllMilestones(allMs);
    } catch (e) {
      console.error('Error loading all DM records:', e);
    } finally {
      setDmAllLoading(false);
    }
  };

  const handleDmContractRefChange = async (refNo) => {
    setDmContractRefNo(refNo);
    setDmItems([]);
    setDmExpandedRow(null);
    if (!refNo || !dmProject || !dmContractType) return;
    try {
      const filterParams = new URLSearchParams({ projectId: dmProject, contractType: dmContractType, contractRefNo: refNo });
      if (dmYear) filterParams.set('yearId', dmYear);
      const res = await axios.get(`/api/project-actions/design-work-progress/filter?${filterParams}`);
      setDmItems(res.data);
      if (res.data.length > 0) {
        try { await axios.post(`/api/project-actions/design-monitoring/import-from-design-work?${filterParams}`); } catch (importErr) { console.warn('Import skipped:', importErr); }
      }
      const monFilterParams = new URLSearchParams({ projectId: dmProject, contractType: dmContractType, contractRefNo: refNo });
      const monRes = await axios.get(`/api/project-actions/design-monitoring/filter?${monFilterParams}`);
      const monItems = monRes.data;
      if (monItems.length > 0) {
        const milestonePromises = monItems.map(mi =>
          axios.get(`/api/project-actions/design-monitoring/${mi.id}/milestones`)
            .then(r => ({ activityId: mi.activityId, monitoringId: mi.id, milestones: r.data }))
            .catch(() => ({ activityId: mi.activityId, monitoringId: mi.id, milestones: [] }))
        );
        const results = await Promise.all(milestonePromises);
        const allMilestones = {};
        const monMap = {};
        results.forEach(r => {
          allMilestones[r.activityId] = r.milestones;
          monMap[r.activityId] = r.monitoringId;
        });
        setDmMilestones(allMilestones);
        setDmMonitoringMap(monMap);
        setDmAllRecords(monItems);
        const savedMs = {};
        monItems.forEach(mi => {
          const found = results.find(r => r.monitoringId === mi.id);
          savedMs[mi.id] = found ? found.milestones : [];
        });
        setDmAllMilestones(savedMs);
      } else {
        setDmAllRecords([]);
        setDmAllMilestones({});
        setDmMilestones({});
        setDmMonitoringMap({});
      }
    } catch (e) {
      console.error('Error loading design work plan data:', e);
    }
  };

  const handleDmImportFromDesignWork = async () => {
    if (!dmProject || !dmContractType || !dmContractRefNo) {
      toast.error(t('projectActions.selectProjectContractFirst'));
      return;
    }
    setDmImporting(true);
    try {
      const importParams = new URLSearchParams({ projectId: dmProject, contractType: dmContractType, contractRefNo: dmContractRefNo });
      if (dmYear) importParams.set('yearId', dmYear);
      const res = await axios.post(`/api/project-actions/design-monitoring/import-from-design-work?${importParams}`);
      if (res.data.imported > 0) {
        toast.success(`${res.data.imported} ${t('projectActions.activitiesImported')}`);
        handleDmContractRefChange(dmContractRefNo);
      } else {
        toast.info(t('projectActions.noNewActivities'));
      }
    } catch (e) {
      toast.error(t('projectActions.importError'));
    } finally {
      setDmImporting(false);
    }
  };

  const handleDmDeleteActivity = async (id) => {
    if (!confirm(t('common.confirmDelete'))) return;
    try {
      await axios.delete(`/api/project-actions/design-monitoring/${id}`);
      setDmItems(prev => prev.filter(item => item.id !== id));
      toast.success(t('common.deleted'));
    } catch (e) {
      toast.error(t('common.deleteError'));
    }
  };

  const openDmSavedModal = (rec, mode) => {
    setDmSavedModalMode(mode);
    setDmSavedModalItem(rec);
    if (mode === 'edit') {
      setDmSavedEditForm({
        activityDescription: rec.activityDescription || '',
        rate: rec.rate ?? '',
        unit: rec.unit || '',
        overallPlannedQuantities: rec.overallPlannedQuantities ?? '',
        contractType: rec.contractType || '',
        contractRefNo: rec.contractRefNo || ''
      });
    }
  };

  const closeDmSavedModal = () => {
    setDmSavedModalItem(null);
    setDmSavedModalMode('view');
    setDmSavedEditForm({});
  };

  const handleDmSavedEditSave = async () => {
    if (!dmSavedModalItem) return;
    try {
      const { milestones, ...itemWithoutMilestones } = dmSavedModalItem;
      const payload = {
        ...itemWithoutMilestones,
        activityDescription: dmSavedEditForm.activityDescription,
        rate: dmSavedEditForm.rate !== '' ? parseFloat(dmSavedEditForm.rate) : null,
        unit: dmSavedEditForm.unit,
        overallPlannedQuantities: dmSavedEditForm.overallPlannedQuantities !== '' ? parseFloat(dmSavedEditForm.overallPlannedQuantities) : null,
        contractType: dmSavedEditForm.contractType,
        contractRefNo: dmSavedEditForm.contractRefNo
      };
      await axios.put(`/api/project-actions/design-monitoring/${dmSavedModalItem.id}`, payload);
      toast.success(t('common.saved'));
      closeDmSavedModal();
      loadAllDmRecords();
    } catch (e) {
      toast.error(t('common.saveError'));
    }
  };

  const handleDmSavedMilestoneDelete = async (milestoneId, monitoringId) => {
    if (!confirm(t('common.confirmDelete'))) return;
    try {
      await axios.delete(`/api/project-actions/design-monitoring/milestones/${milestoneId}`);
      const msRes = await axios.get(`/api/project-actions/design-monitoring/${monitoringId}/milestones`);
      setDmAllMilestones(prev => ({ ...prev, [monitoringId]: msRes.data }));
      toast.success(t('common.deleted'));
    } catch (e) {
      toast.error(t('common.deleteError'));
    }
  };

  const [dmSavedMsEditId, setDmSavedMsEditId] = useState(null);
  const [dmSavedMsEditForm, setDmSavedMsEditForm] = useState({});

  const startDmSavedMsEdit = (ms) => {
    setDmSavedMsEditId(ms.id);
    setDmSavedMsEditForm({
      logDate: ms.logDate || '',
      quarterId: ms.quarter?.id || '',
      overallPlannedQuantities: ms.overallPlannedQuantities ?? '',
      achievedValues: ms.achievedValues ?? '',
      status: ms.status || '',
      remarks: ms.remarks || ''
    });
  };

  const handleDmSavedMsSave = async (monitoringId) => {
    try {
      const payload = {
        logDate: dmSavedMsEditForm.logDate || null,
        quarter: dmSavedMsEditForm.quarterId ? { id: parseInt(dmSavedMsEditForm.quarterId) } : null,
        overallPlannedQuantities: dmSavedMsEditForm.overallPlannedQuantities !== '' ? parseFloat(dmSavedMsEditForm.overallPlannedQuantities) : null,
        achievedValues: dmSavedMsEditForm.achievedValues !== '' ? parseFloat(dmSavedMsEditForm.achievedValues) : null,
        status: dmSavedMsEditForm.status || null,
        remarks: dmSavedMsEditForm.remarks || null
      };
      await axios.put(`/api/project-actions/design-monitoring/milestones/${dmSavedMsEditId}`, payload);
      const msRes = await axios.get(`/api/project-actions/design-monitoring/${monitoringId}/milestones`);
      setDmAllMilestones(prev => ({ ...prev, [monitoringId]: msRes.data }));
      setDmSavedMsEditId(null);
      toast.success(t('common.saved'));
    } catch (e) {
      toast.error(t('common.saveError'));
    }
  };

  const handleDmSavedDelete = async (id) => {
    if (!confirm(t('common.confirmDelete'))) return;
    try {
      await axios.delete(`/api/project-actions/design-monitoring/${id}`);
      setDmAllRecords(prev => prev.filter(r => r.id !== id));
      toast.success(t('common.deleted'));
    } catch (e) {
      toast.error(t('common.deleteError'));
    }
  };

  const handleDmEditActivity = (item) => {
    setDmEditingActivity(item);
    setDmEditForm({
      activityDescription: item.activityDescription || '',
      rate: item.rate || '',
      unit: item.unit || '',
      overallPlannedQuantities: item.overallPlannedQuantities || '',
      yearId: item.year?.id || ''
    });
  };

  const handleDmSaveActivity = async () => {
    if (!dmEditingActivity) return;
    try {
      const { milestones, ...activityWithoutMilestones } = dmEditingActivity;
      const payload = {
        ...activityWithoutMilestones,
        activityDescription: dmEditForm.activityDescription,
        rate: dmEditForm.rate ? parseFloat(dmEditForm.rate) : null,
        unit: dmEditForm.unit,
        overallPlannedQuantities: dmEditForm.overallPlannedQuantities ? parseFloat(dmEditForm.overallPlannedQuantities) : null,
        year: dmEditForm.yearId ? { id: parseInt(dmEditForm.yearId) } : null
      };
      await axios.put(`/api/project-actions/design-monitoring/${dmEditingActivity.id}`, payload);
      toast.success(t('common.saved'));
      setDmEditingActivity(null);
      handleDmContractRefChange(dmContractRefNo);
    } catch (e) {
      toast.error(t('common.saveError'));
    }
  };

  const loadDmMilestonesByActivity = async (activityId) => {
    const monitoringId = dmMonitoringMap[activityId];
    if (!monitoringId) return;
    try {
      const res = await axios.get(`/api/project-actions/design-monitoring/${monitoringId}/milestones`);
      setDmMilestones(prev => ({ ...prev, [activityId]: res.data }));
    } catch (e) {
      console.error('Error loading milestones:', e);
    }
  };

  const toggleDmExpand = (activityId) => {
    if (dmExpandedRow === activityId) {
      setDmExpandedRow(null);
    } else {
      setDmExpandedRow(activityId);
    }
  };

  const handleDmAddMilestone = (activityId) => {
    const monitoringId = dmMonitoringMap[activityId];
    if (!monitoringId) { toast.error('No monitoring record linked'); return; }
    setDmMilestoneForm({ monitoringId, activityId, logDate: '', quarterId: '', frequencyId: '', overallPlannedQuantities: '', achievedValues: '', plannedVsAchievedPct: '', status: '', remarks: '' });
    setDmEditingMilestone(null);
  };

  const handleDmEditMilestone = (milestone, activityId) => {
    setDmEditingMilestone(milestone);
    const monitoringId = dmMonitoringMap[activityId];
    setDmMilestoneForm({
      monitoringId: monitoringId || milestone.designProgressMonitoring?.id,
      activityId,
      logDate: milestone.logDate || '',
      quarterId: milestone.quarter?.id || '',
      frequencyId: milestone.frequency?.id || '',
      overallPlannedQuantities: milestone.overallPlannedQuantities ?? '',
      achievedValues: milestone.achievedValues ?? '',
      plannedVsAchievedPct: milestone.plannedVsAchievedPct ?? '',
      status: milestone.status || '',
      remarks: milestone.remarks || ''
    });
  };

  const handleDmSaveMilestone = async () => {
    if (!dmMilestoneForm) return;
    const payload = {
      logDate: dmMilestoneForm.logDate || null,
      quarter: dmMilestoneForm.quarterId ? { id: parseInt(dmMilestoneForm.quarterId) } : null,
      frequency: dmMilestoneForm.frequencyId ? { id: parseInt(dmMilestoneForm.frequencyId) } : null,
      overallPlannedQuantities: dmMilestoneForm.overallPlannedQuantities !== '' ? parseFloat(dmMilestoneForm.overallPlannedQuantities) : null,
      achievedValues: dmMilestoneForm.achievedValues !== '' ? parseFloat(dmMilestoneForm.achievedValues) : null,
      plannedVsAchievedPct: dmMilestoneForm.plannedVsAchievedPct !== '' ? parseFloat(dmMilestoneForm.plannedVsAchievedPct) : null,
      status: dmMilestoneForm.status || null,
      remarks: dmMilestoneForm.remarks || null
    };
    try {
      if (dmEditingMilestone) {
        await axios.put(`/api/project-actions/design-monitoring/milestones/${dmEditingMilestone.id}`, payload);
        toast.success(t('common.saved'));
      } else {
        await axios.post(`/api/project-actions/design-monitoring/${dmMilestoneForm.monitoringId}/milestones`, payload);
        toast.success(t('common.saved'));
      }
      loadDmMilestonesByActivity(dmMilestoneForm.activityId);
      setDmMilestoneForm(null);
      setDmEditingMilestone(null);
    } catch (e) {
      toast.error(t('common.saveError'));
    }
  };

  const handleDmDeleteMilestone = async (milestoneId, activityId) => {
    if (!confirm(t('common.confirmDelete'))) return;
    try {
      await axios.delete(`/api/project-actions/design-monitoring/milestones/${milestoneId}`);
      loadDmMilestonesByActivity(activityId);
      toast.success(t('common.deleted'));
    } catch (e) {
      toast.error(t('common.deleteError'));
    }
  };

  const renderDesignMonitoring = () => (
    <div>
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h6 className="mb-0">{t('projectActions.designMonitoring')}</h6>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">{t('projectActions.year')}</label>
              <select className="form-select" value={dmYear} onChange={e => setDmYear(e.target.value)}>
                <option value="">{t('projectActions.selectYear')}</option>
                {dmYears.map(y => (
                  <option key={y.id} value={y.id}>{y.profileYear}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">{t('projectActions.project')}</label>
              <select className="form-select" value={dmProject} onChange={e => handleDmProjectChange(e.target.value)}>
                <option value="">{t('projectActions.selectProject')}</option>
                {projects.map(p => (
                  <option key={p.projectId} value={p.projectId}>{p.project || p.projectId}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">{t('projectActions.contractType')}</label>
              <select className="form-select" value={dmContractType} onChange={e => handleDmContractTypeChange(e.target.value)} disabled={!dmProject}>
                <option value="">{t('projectActions.selectType')}</option>
                <option value="works">{t('projectActions.worksContracts')}</option>
                <option value="goods">{t('projectActions.goodsAndServices')}</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">{t('projectActions.contractReferenceNo')}</label>
              <select className="form-select" value={dmContractRefNo} onChange={e => handleDmContractRefChange(e.target.value)} disabled={!dmContractType}>
                <option value="">{t('projectActions.selectReference')}</option>
                {dmContractOptions.map((c, i) => (
                  <option key={i} value={c.contractRefNo}>{c.contractRefNo}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="row g-3 mt-1">
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.activityDescription')}</label>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder={t('projectActions.typeToSearch')}
                  value={dmActivityFilter}
                  onChange={e => {
                    const val = e.target.value;
                    setDmActivityFilter(val);
                    if (val.length >= 3) {
                      const lower = val.toLowerCase();
                      const matches = dmAllRecords
                        .map(r => r.activityDescription)
                        .filter((desc, idx, arr) => desc && desc.toLowerCase().includes(lower) && arr.indexOf(desc) === idx);
                      setDmActivitySuggestions(matches);
                      setDmShowSuggestions(matches.length > 0);
                    } else {
                      setDmActivitySuggestions([]);
                      setDmShowSuggestions(false);
                    }
                  }}
                  onFocus={() => { if (dmActivityFilter.length >= 3 && dmActivitySuggestions.length > 0) setDmShowSuggestions(true); }}
                  onBlur={() => setTimeout(() => setDmShowSuggestions(false), 200)}
                />
                {dmShowSuggestions && (
                  <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}>
                    {dmActivitySuggestions.map((s, i) => (
                      <li key={i} className="list-group-item list-group-item-action py-1 px-2" style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                        onMouseDown={() => { setDmActivityFilter(s); setDmShowSuggestions(false); }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          {(dmYear || dmProject || dmContractType || dmContractRefNo || dmActivityFilter) && (
            <div className="d-flex justify-content-end mt-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => { setDmYear(''); setDmProject(''); setDmContractType(''); setDmContractRefNo(''); setDmContractOptions([]); setDmItems([]); setDmExpandedRow(null); setDmMilestones({}); setDmMonitoringMap({}); setDmMilestoneForm(null); setDmEditingMilestone(null); setDmActivityFilter(''); setDmActivitySuggestions([]); }}>
                <FiRefreshCw className="me-1" /> {t('common.reset')}
              </button>
            </div>
          )}

        </div>
      </div>

      {dmContractRefNo && dmItems.length === 0 && (
        <div className="card">
          <div className="card-body text-center text-muted py-4">
            <p className="mb-0">{t('projectActions.noDesignMonitoringRecords')}</p>
          </div>
        </div>
      )}

      <div className="card mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h6 className="mb-0"><FiClipboard className="me-2" />{t('projectActions.designMonitoring')}</h6>
            <button className="btn btn-sm btn-outline-primary" onClick={loadAllDmRecords} disabled={dmAllLoading}>
              <FiRefreshCw className={`me-1 ${dmAllLoading ? 'spin' : ''}`} /> {t('common.refresh') || 'Refresh'}
            </button>
          </div>
          <div className="card-body p-0">
            {dmAllLoading ? (
              <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary" /></div>
            ) : dmAllRecords.length === 0 ? (
              <div className="text-center text-muted py-4">{t('common.noData')}</div>
            ) : (() => {
              const filteredDmRecords = dmAllRecords.filter(r => {
                if (dmYear && String(r.year?.id) !== String(dmYear)) return false;
                if (dmProject) {
                  const recProjId = r.project?.projectId || r.projectId || '';
                  if (recProjId !== dmProject) return false;
                }
                if (dmContractType && r.contractType !== dmContractType) return false;
                if (dmContractRefNo && r.contractRefNo !== dmContractRefNo) return false;
                if (dmActivityFilter && !(r.activityDescription && r.activityDescription.toLowerCase().includes(dmActivityFilter.toLowerCase()))) return false;
                return true;
              });
              return filteredDmRecords.length === 0 ? (
                <div className="text-center text-muted py-4">{t('common.noData')}</div>
              ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover table-sm mb-0" style={{ fontSize: 'clamp(0.65rem, 1vw, 0.82rem)' }}>
                  <thead className="table-light">
                    <tr>
                      <th>{t('projectActions.activityId')}</th>
                      <th>{t('projectActions.activityDescription')}</th>
                      <th>{t('projectActions.project')}</th>
                      <th>{t('projectActions.contractReferenceNo')}</th>
                      <th>{t('projectActions.contractType')}</th>
                      <th>{t('projectActions.ratePercent')}</th>
                      <th>{t('projectActions.unit')}</th>
                      <th>{t('projectActions.overallPlannedQty')}</th>
                      <th>{t('projectActions.designMilestones')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDmRecords.map(rec => (
                      <Fragment key={rec.id}>
                        <tr>
                          <td><code>{rec.activityId}</code></td>
                          <td>{rec.activityDescription || '-'}</td>
                          <td>{rec.project?.project || rec.project?.projectId || '-'}</td>
                          <td>{rec.contractRefNo || '-'}</td>
                          <td><span className="badge bg-info bg-opacity-25 text-dark">{rec.contractType || '-'}</span></td>
                          <td className="text-center">{rec.rate != null ? `${rec.rate}%` : '-'}</td>
                          <td className="text-center">{rec.unit || '-'}</td>
                          <td className="text-center">{rec.overallPlannedQuantities ?? '-'}</td>
                          <td className="text-center">
                            <span className="badge bg-secondary bg-opacity-25 text-dark">
                              {(dmAllMilestones[rec.id] || []).length}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-1 flex-nowrap">
                              <button className="btn btn-sm btn-outline-info p-1" title={t('common.view')} onClick={() => openDmSavedModal(rec, 'view')}><FiEye /></button>
                              <button className="btn btn-sm btn-outline-primary p-1" title={t('common.edit')} onClick={() => openDmSavedModal(rec, 'edit')}><FiEdit2 /></button>
                              <button className="btn btn-sm btn-outline-danger p-1" title={t('common.delete')} onClick={() => handleDmSavedDelete(rec.id)}><FiTrash2 /></button>
                            </div>
                          </td>
                        </tr>
                        {(dmAllMilestones[rec.id] || []).length > 0 && (
                          <tr>
                            <td colSpan="10" className="p-0">
                              <table className="table table-sm table-bordered mb-0 ms-4" style={{ fontSize: 'inherit', width: 'calc(100% - 2rem)' }}>
                                <thead className="table-warning">
                                  <tr>
                                    <th>{t('projectActions.logDate')}</th>
                                    <th>{t('projectActions.quarter')}</th>
                                    <th>{t('projectActions.overallPlannedQty')}</th>
                                    <th>{t('projectActions.achievedValues')}</th>
                                    <th>{t('projectActions.plannedVsAchieved')}</th>
                                    <th>{t('common.status')}</th>
                                    <th>{t('projectActions.remarks')}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(dmAllMilestones[rec.id] || []).map(ms => (
                                    <tr key={ms.id}>
                                      <td>{ms.logDate || '-'}</td>
                                      <td>{ms.quarter?.quarter || '-'}</td>
                                      <td>{ms.overallPlannedQuantities ?? '-'}</td>
                                      <td>{ms.achievedValues ?? '-'}</td>
                                      <td>{ms.plannedVsAchievedPct != null ? `${ms.plannedVsAchievedPct}%` : '-'}</td>
                                      <td>
                                        {ms.status && (
                                          <span className="badge" style={{ backgroundColor: DM_STATUS_COLORS[ms.status] || '#6c757d', fontSize: 'inherit' }}>
                                            {t(`projectActions.status${ms.status}`) || ms.status}
                                          </span>
                                        )}
                                      </td>
                                      <td>{ms.remarks || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            );
            })()}
          </div>
        </div>

      {dmSavedModalItem && (
        <div className="modal show d-block" style={{backgroundColor:'rgba(0,0,0,0.5)',zIndex:1055}} onClick={closeDmSavedModal}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{dmSavedModalMode === 'edit' ? t('common.edit') : t('common.view')} — {t('projectActions.designMonitoring')}</h5>
                <button className="btn-close" onClick={closeDmSavedModal}></button>
              </div>
              <div className="modal-body">
                {(() => {
                  const item = dmSavedModalItem;
                  const isView = dmSavedModalMode === 'view';
                  const form = dmSavedEditForm;
                  return (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">{t('projectActions.activityId')}</label>
                        <p className="form-control-plaintext"><code>{item.activityId}</code></p>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">{t('projectActions.project')}</label>
                        <p className="form-control-plaintext">{item.project?.project || item.project?.projectId || '-'}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">{t('projectActions.activityDescription')}</label>
                        {isView ? (
                          <p className="form-control-plaintext">{item.activityDescription || '-'}</p>
                        ) : (
                          <input type="text" className="form-control" value={form.activityDescription} onChange={e => setDmSavedEditForm(f => ({...f, activityDescription: e.target.value}))} />
                        )}
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">{t('projectActions.contractType')}</label>
                        {isView ? (
                          <p className="form-control-plaintext"><span className="badge bg-info bg-opacity-25 text-dark">{item.contractType || '-'}</span></p>
                        ) : (
                          <select className="form-select" value={form.contractType} onChange={e => setDmSavedEditForm(f => ({...f, contractType: e.target.value}))}>
                            <option value="">{t('common.select')}</option>
                            <option value="works">{t('projectActions.works')}</option>
                            <option value="goods">{t('projectActions.goods')}</option>
                          </select>
                        )}
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">{t('projectActions.contractReferenceNo')}</label>
                        {isView ? (
                          <p className="form-control-plaintext">{item.contractRefNo || '-'}</p>
                        ) : (
                          <input type="text" className="form-control" value={form.contractRefNo} onChange={e => setDmSavedEditForm(f => ({...f, contractRefNo: e.target.value}))} />
                        )}
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">{t('projectActions.ratePercent')}</label>
                        {isView ? (
                          <p className="form-control-plaintext">{item.rate != null ? `${item.rate}%` : '-'}</p>
                        ) : (
                          <input type="number" className="form-control" value={form.rate} onChange={e => setDmSavedEditForm(f => ({...f, rate: e.target.value}))} step="0.01" min="0" max="100" />
                        )}
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">{t('projectActions.unit')}</label>
                        {isView ? (
                          <p className="form-control-plaintext">{item.unit || '-'}</p>
                        ) : (
                          <select className="form-select" value={form.unit} onChange={e => setDmSavedEditForm(f => ({...f, unit: e.target.value}))}>
                            <option value="">{t('projectActions.placeholderUnit')}</option>
                            {dmUnits.map(u => <option key={u.id} value={u.unit}>{u.unit}</option>)}
                          </select>
                        )}
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">{t('projectActions.overallPlannedQty')}</label>
                        {isView ? (
                          <p className="form-control-plaintext">{item.overallPlannedQuantities ?? '-'}</p>
                        ) : (
                          <input type="number" className="form-control" value={form.overallPlannedQuantities} onChange={e => setDmSavedEditForm(f => ({...f, overallPlannedQuantities: e.target.value}))} step="0.01" />
                        )}
                      </div>
                      {(dmAllMilestones[item.id] || []).length > 0 && (
                        <div className="col-12">
                          <label className="form-label fw-semibold">{t('projectActions.designMilestones')} ({(dmAllMilestones[item.id] || []).length})</label>
                          <div className="table-responsive">
                            <table className="table table-sm table-bordered mb-0">
                              <thead className="table-warning">
                                <tr>
                                  <th>{t('projectActions.logDate')}</th>
                                  <th>{t('projectActions.quarter')}</th>
                                  <th>{t('projectActions.overallPlannedQty')}</th>
                                  <th>{t('projectActions.achievedValues')}</th>
                                  <th>{t('projectActions.plannedVsAchieved')}</th>
                                  <th>{t('common.status')}</th>
                                  <th>{t('projectActions.remarks')}</th>
                                  {!isView && <th>{t('common.actions')}</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {(dmAllMilestones[item.id] || []).map(ms => (
                                  <tr key={ms.id}>
                                    {!isView && dmSavedMsEditId === ms.id ? (
                                      <>
                                        <td><input type="date" className="form-control form-control-sm" value={dmSavedMsEditForm.logDate} onChange={e => setDmSavedMsEditForm(f => ({...f, logDate: e.target.value}))} /></td>
                                        <td><select className="form-select form-select-sm" value={dmSavedMsEditForm.quarterId} onChange={e => setDmSavedMsEditForm(f => ({...f, quarterId: e.target.value}))}><option value="">-</option>{quarters.map(q => <option key={q.id} value={q.id}>{q.quarter}</option>)}</select></td>
                                        <td><input type="number" className="form-control form-control-sm" value={dmSavedMsEditForm.overallPlannedQuantities} onChange={e => setDmSavedMsEditForm(f => ({...f, overallPlannedQuantities: e.target.value}))} step="0.01" /></td>
                                        <td><input type="number" className="form-control form-control-sm" value={dmSavedMsEditForm.achievedValues} onChange={e => setDmSavedMsEditForm(f => ({...f, achievedValues: e.target.value}))} step="0.01" /></td>
                                        <td>{dmSavedMsEditForm.overallPlannedQuantities && dmSavedMsEditForm.achievedValues ? `${Math.round((parseFloat(dmSavedMsEditForm.achievedValues) / parseFloat(dmSavedMsEditForm.overallPlannedQuantities)) * 10000) / 100}%` : '-'}</td>
                                        <td><select className="form-select form-select-sm" value={dmSavedMsEditForm.status} onChange={e => setDmSavedMsEditForm(f => ({...f, status: e.target.value}))}><option value="">-</option>{['NotStarted','InProgress','Complete','Delayed','OnHold'].map(s => <option key={s} value={s}>{t(`projectActions.status${s}`) || s}</option>)}</select></td>
                                        <td><input type="text" className="form-control form-control-sm" value={dmSavedMsEditForm.remarks} onChange={e => setDmSavedMsEditForm(f => ({...f, remarks: e.target.value}))} /></td>
                                        <td>
                                          <div className="d-flex gap-1">
                                            <button className="btn btn-sm btn-success p-1" onClick={() => handleDmSavedMsSave(item.id)}><FiCheck /></button>
                                            <button className="btn btn-sm btn-secondary p-1" onClick={() => setDmSavedMsEditId(null)}><FiX /></button>
                                          </div>
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        <td>{ms.logDate || '-'}</td>
                                        <td>{ms.quarter?.quarter || '-'}</td>
                                        <td>{ms.overallPlannedQuantities ?? '-'}</td>
                                        <td>{ms.achievedValues ?? '-'}</td>
                                        <td>{ms.plannedVsAchievedPct != null ? `${ms.plannedVsAchievedPct}%` : '-'}</td>
                                        <td>
                                          {ms.status && (
                                            <span className="badge" style={{ backgroundColor: DM_STATUS_COLORS[ms.status] || '#6c757d', fontSize: 'inherit' }}>
                                              {t(`projectActions.status${ms.status}`) || ms.status}
                                            </span>
                                          )}
                                        </td>
                                        <td>{ms.remarks || '-'}</td>
                                        {!isView && (
                                          <td>
                                            <div className="d-flex gap-1">
                                              <button className="btn btn-sm btn-outline-primary p-1" onClick={() => startDmSavedMsEdit(ms)}><FiEdit2 /></button>
                                              <button className="btn btn-sm btn-outline-danger p-1" onClick={() => handleDmSavedMilestoneDelete(ms.id, item.id)}><FiTrash2 /></button>
                                            </div>
                                          </td>
                                        )}
                                      </>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              <div className="modal-footer">
                {dmSavedModalMode === 'view' ? (
                  <>
                    <button className="btn btn-primary" onClick={() => { setDmSavedModalMode('edit'); setDmSavedEditForm({ activityDescription: dmSavedModalItem.activityDescription || '', rate: dmSavedModalItem.rate ?? '', unit: dmSavedModalItem.unit || '', overallPlannedQuantities: dmSavedModalItem.overallPlannedQuantities ?? '', contractType: dmSavedModalItem.contractType || '', contractRefNo: dmSavedModalItem.contractRefNo || '' }); }}>
                      <FiEdit2 className="me-1" /> {t('common.edit')}
                    </button>
                    <button className="btn btn-secondary" onClick={closeDmSavedModal}>{t('common.close')}</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-success" onClick={handleDmSavedEditSave}><FiSave className="me-1" /> {t('common.save')}</button>
                    <button className="btn btn-secondary" onClick={closeDmSavedModal}>{t('common.cancel')}</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {dmItems.map(item => (
        <div className="card mb-3" key={item.id}>
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-2" style={{ borderLeft: '4px solid #4361ee' }}>
            <div className="d-flex align-items-center gap-3 flex-wrap" style={{ fontSize: 'clamp(0.7rem, 1.1vw, 0.88rem)' }}>
              <span className="fw-bold text-primary"><code style={{ fontSize: 'inherit' }}>{item.activityId}</code></span>
              <span className="text-dark" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.activity}>{item.activity}</span>
            </div>
            <span className="badge bg-secondary bg-opacity-25 text-dark" style={{ fontSize: '0.72rem' }}>
              {(dmMilestones[item.activityId] || []).length} {t('projectActions.designMilestones').toLowerCase()}
            </span>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-sm mb-0 align-middle" style={{ fontSize: 'clamp(0.65rem, 1.05vw, 0.82rem)' }}>
                <thead className="table-light">
                  <tr>
                    <th className="text-center" style={{ whiteSpace: 'nowrap' }}>{t('projectActions.ratePercent')}</th>
                    <th className="text-center" style={{ whiteSpace: 'nowrap' }}>{t('projectActions.unit')}</th>
                    <th className="text-center" style={{ whiteSpace: 'nowrap' }}>{t('projectActions.provisionalQty')}</th>
                    <th className="text-center" style={{ whiteSpace: 'nowrap' }}>{t('projectActions.year')}</th>
                    <th className="text-center" style={{ whiteSpace: 'nowrap' }}>{t('projectActions.observations')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-center">{item.rate != null ? `${item.rate}%` : '-'}</td>
                    <td className="text-center">{item.unit || '-'}</td>
                    <td className="text-center">{item.provisionalQuantities ?? '-'}</td>
                    <td className="text-center">{item.year?.profileYear || '-'}</td>
                    <td className="text-center" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.observations}>{item.observations || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-footer bg-white p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 text-primary" style={{ fontSize: 'clamp(0.72rem, 1.1vw, 0.88rem)' }}>
                  <FiClipboard className="me-2" />
                  {t('projectActions.designMilestones')}
                </h6>
                <button className="btn btn-sm btn-primary" onClick={() => handleDmAddMilestone(item.activityId)}>
                  <FiPlus className="me-1" /> {t('projectActions.addMilestone')}
                </button>
              </div>

              {dmMilestoneForm && dmMilestoneForm.activityId === item.activityId && (
                <div className="card mb-3 border-primary">
                  <div className="card-header bg-primary bg-opacity-10 py-2">
                    <strong>{dmEditingMilestone ? t('projectActions.editMilestone') : t('projectActions.addMilestone')}</strong>
                  </div>
                  <div className="card-body">
                    <div className="row g-2">
                      <div className="col-md-3">
                        <label className="form-label small fw-semibold">{t('projectActions.logDate')}</label>
                        <input type="date" className="form-control form-control-sm" value={dmMilestoneForm.logDate} onChange={e => setDmMilestoneForm(f => ({ ...f, logDate: e.target.value }))} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-semibold">{t('projectActions.quarter')}</label>
                        <select className="form-select form-select-sm" value={dmMilestoneForm.quarterId} onChange={e => setDmMilestoneForm(f => ({ ...f, quarterId: e.target.value }))}>
                          <option value="">--</option>
                          {quarters.map(q => <option key={q.id} value={q.id}>{q.quarter}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-semibold">{t('projectActions.frequency')}</label>
                        <select className="form-select form-select-sm" value={dmMilestoneForm.frequencyId} onChange={e => setDmMilestoneForm(f => ({ ...f, frequencyId: e.target.value }))}>
                          <option value="">--</option>
                          {dmFrequencies.map(f => <option key={f.id} value={f.id}>{f.frequency}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-semibold">{t('projectActions.overallPlannedQty')}</label>
                        <input type="number" className="form-control form-control-sm" value={dmMilestoneForm.overallPlannedQuantities} onChange={e => setDmMilestoneForm(f => ({ ...f, overallPlannedQuantities: e.target.value }))} step="0.01" />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-semibold">{t('projectActions.achievedValues')}</label>
                        <input type="number" className="form-control form-control-sm" value={dmMilestoneForm.achievedValues} onChange={e => setDmMilestoneForm(f => ({ ...f, achievedValues: e.target.value }))} step="0.01" />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-semibold">{t('projectActions.plannedVsAchieved')}</label>
                        <input type="number" className="form-control form-control-sm bg-light" value={
                          dmMilestoneForm.overallPlannedQuantities && dmMilestoneForm.achievedValues && parseFloat(dmMilestoneForm.overallPlannedQuantities) > 0
                            ? (Math.round((parseFloat(dmMilestoneForm.achievedValues) / parseFloat(dmMilestoneForm.overallPlannedQuantities)) * 10000) / 100)
                            : (dmMilestoneForm.plannedVsAchievedPct || '')
                        } readOnly />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-semibold">{t('common.status')}</label>
                        <select className="form-select form-select-sm" value={dmMilestoneForm.status} onChange={e => setDmMilestoneForm(f => ({ ...f, status: e.target.value }))}>
                          <option value="">--</option>
                          <option value="Complete">{t('projectActions.statusComplete')}</option>
                          <option value="Incomplete">{t('projectActions.statusIncomplete')}</option>
                          <option value="Stagnant">{t('projectActions.statusStagnant')}</option>
                          <option value="Cancelled">{t('projectActions.statusCancelled')}</option>
                        </select>
                      </div>
                      <div className="col-md-8">
                        <label className="form-label small fw-semibold">{t('projectActions.remarks')}</label>
                        <textarea className="form-control form-control-sm" value={dmMilestoneForm.remarks} onChange={e => setDmMilestoneForm(f => ({ ...f, remarks: e.target.value }))} rows="1" />
                      </div>
                    </div>
                    <div className="text-end mt-2">
                      <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => { setDmMilestoneForm(null); setDmEditingMilestone(null); }}>{t('common.cancel')}</button>
                      <button className="btn btn-sm btn-success" onClick={handleDmSaveMilestone}>{t('common.save')}</button>
                    </div>
                  </div>
                </div>
              )}

              {(dmMilestones[item.activityId] || []).length === 0 ? (
                <div className="text-center text-muted py-2" style={{ fontSize: '0.82rem' }}>{t('projectActions.noMilestones')}</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-sm mb-0" style={{ fontSize: 'clamp(0.6rem, 1vw, 0.8rem)' }}>
                    <thead className="table-light">
                      <tr>
                        <th>{t('projectActions.logDate')}</th>
                        <th>{t('projectActions.quarter')}</th>
                        <th>{t('projectActions.frequency')}</th>
                        <th>{t('projectActions.overallPlannedQty')}</th>
                        <th>{t('projectActions.achievedValues')}</th>
                        <th>{t('projectActions.plannedVsAchieved')}</th>
                        <th>{t('common.status')}</th>
                        <th>{t('projectActions.remarks')}</th>
                        <th>{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dmMilestones[item.activityId] || []).map(ms => (
                        <tr key={ms.id}>
                          <td style={{ whiteSpace: 'nowrap' }}>{ms.logDate || '-'}</td>
                          <td>{ms.quarter?.quarter || '-'}</td>
                          <td>{ms.frequency?.frequency || '-'}</td>
                          <td>{ms.overallPlannedQuantities ?? '-'}</td>
                          <td>{ms.achievedValues ?? '-'}</td>
                          <td>{ms.plannedVsAchievedPct != null ? `${ms.plannedVsAchievedPct}%` : '-'}</td>
                          <td>
                            {ms.status && (
                              <span className="badge" style={{ backgroundColor: DM_STATUS_COLORS[ms.status] || '#6c757d', fontSize: 'inherit' }}>
                                {t(`projectActions.status${ms.status}`) || ms.status}
                              </span>
                            )}
                          </td>
                          <td style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ms.remarks}>{ms.remarks || '-'}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <div className="d-flex gap-1">
                              <button className="btn btn-sm btn-outline-primary p-1" onClick={() => handleDmEditMilestone(ms, item.activityId)}><FiEdit2 /></button>
                              <button className="btn btn-sm btn-outline-danger p-1" onClick={() => handleDmDeleteMilestone(ms.id, item.activityId)}><FiTrash2 /></button>
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
      ))}
    </div>
  );

  const renderDesignWorkProgress = () => (
    <div>
      <div className="card mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{t('projectActions.designWorkPlan')}</h6>
          {designWorkItems.length > 0 && (
            <button className="btn btn-sm btn-light" onClick={exportDwpPdf}>
              <FiDownload className="me-1" /> {t('projectActions.exportPdf')}
            </button>
          )}
        </div>
        <div className="card-body">
          <div className="row g-3 mb-2">
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.year')}</label>
              <select className="form-select" value={dwpYear} onChange={e => setDwpYear(e.target.value)}>
                <option value="">{t('projectActions.selectYear')}</option>
                {dmYears.map(y => (
                  <option key={y.id} value={y.id}>{y.profileYear}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.project')}</label>
              <select className="form-select" value={dwpProject} onChange={e => handleDwpProjectChange(e.target.value)}>
                <option value="">{t('projectActions.selectProject')}</option>
                {projects.map(p => (
                  <option key={p.projectId} value={p.projectId}>{p.project || p.projectId}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.contractType')}</label>
              <select className="form-select" value={dwpContractType} onChange={e => handleDwpContractTypeChange(e.target.value)} disabled={!dwpProject}>
                <option value="">{t('projectActions.selectType')}</option>
                <option value="works">{t('projectActions.worksContracts')}</option>
                <option value="goods">{t('projectActions.goodsAndServices')}</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">{t('projectActions.contractReferenceNo')}</label>
              <select className="form-select" value={dwpContractRefNo} onChange={e => {
                setDwpContractRefNo(e.target.value);
                setDwpRows(prev => prev.map(row => ({ ...row, activityId: generateActivityId(e.target.value) })));
              }} disabled={!dwpContractType}>
                <option value="">{t('projectActions.selectReference')}</option>
                {dwpContractOptions.map((c, i) => (
                  <option key={i} value={c.contractRefNo}>{c.contractRefNo}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">{t('projectActions.activityRows')}</h6>
            <button type="button" className="btn btn-sm btn-primary" onClick={addDwpRow} disabled={!dwpContractRefNo}>
              <FiPlus className="me-1" /> {t('projectActions.addRow')}
            </button>
          </div>

          {dwpRows.length > 0 && (
            <div className="table-responsive">
              <table className="table table-bordered table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{minWidth:'120px'}}>{t('projectActions.activityId')}</th>
                    <th style={{minWidth:'150px'}}>{t('projectActions.activityDescription')}</th>
                    <th style={{minWidth:'80px'}}>{t('projectActions.ratePercent')}</th>
                    <th style={{minWidth:'80px'}}>{t('projectActions.unit')}</th>
                    <th style={{minWidth:'120px'}}>{t('projectActions.provisionalQty')}</th>
                    <th style={{minWidth:'130px'}}>{t('projectActions.activityStartDate')}</th>
                    <th style={{minWidth:'130px'}}>{t('projectActions.activityEndDate')}</th>
                    <th style={{minWidth:'80px'}}>{t('projectActions.duration')}</th>
                    <th style={{minWidth:'90px'}}>{t('projectActions.durationUnit')}</th>
                    <th style={{width:'50px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {dwpRows.map((row, idx) => {
                    return (
                      <tr key={row.tempId}>
                        <td><input type="text" className="form-control form-control-sm bg-light" value={row.activityId} readOnly /></td>
                        <td><input type="text" className="form-control form-control-sm" value={row.activity} onChange={e => updateDwpRow(idx, 'activity', e.target.value)} placeholder={t('projectActions.placeholderActivityName')} /></td>
                        <td><input type="number" className="form-control form-control-sm" value={row.rate} onChange={e => updateDwpRow(idx, 'rate', e.target.value)} step="0.01" min="0" max="100" /></td>
                        <td><select className="form-select form-select-sm" value={row.unit} onChange={e => updateDwpRow(idx, 'unit', e.target.value)}><option value="">{t('projectActions.placeholderUnit')}</option>{dmUnits.map(u => <option key={u.id} value={u.unit}>{u.unit}</option>)}</select></td>
                        <td><input type="number" className="form-control form-control-sm" value={row.provisionalQuantities} onChange={e => updateDwpRow(idx, 'provisionalQuantities', e.target.value)} step="0.01" /></td>
                        <td><input type="date" className="form-control form-control-sm" value={row.activityStartDate} onChange={e => updateDwpRow(idx, 'activityStartDate', e.target.value)} /></td>
                        <td><input type="date" className="form-control form-control-sm" value={row.activityEndDate} onChange={e => updateDwpRow(idx, 'activityEndDate', e.target.value)} /></td>
                        <td><input type="text" className="form-control form-control-sm bg-light text-center" value={row.duration !== '' ? `${row.duration}` : ''} readOnly placeholder="-" /></td>
                        <td><select className="form-select form-select-sm" value={row.durationUnit || 'Days'} onChange={e => updateDwpRow(idx, 'durationUnit', e.target.value)}><option value="Days">{t('projectActions.days')}</option><option value="Months">{t('projectActions.months')}</option><option value="Years">{t('projectActions.years')}</option></select></td>
                        <td><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeDwpRow(idx)}><FiTrash2 /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {dwpRows.length > 0 && (
            <div className="text-end mt-2">
              <button className="btn btn-success" onClick={handleDwpSave} disabled={dwpSaving}>
                {dwpSaving ? t('projectActions.savingText') : t('projectActions.saveAllRows')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h6 className="mb-0">{t('projectActions.savedRecords')}</h6>
        </div>
        <div className="card-body p-0">
          {designWorkItems.length === 0 ? (
            <div className="text-center text-muted p-4">{t('projectActions.noDesignWorkRecords')}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-sm mb-0" style={{fontSize:'clamp(0.65rem, 1.1vw, 0.85rem)'}}>
                <thead className="table-light">
                  <tr>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.year')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.project')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.contractType')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.contractRef')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.activityId')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.activityDescription')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.ratePercent')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.unit')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.provisionalQty')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.activityStartDate')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.activityEndDate')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('projectActions.duration')}</th>
                    <th style={{whiteSpace:'nowrap'}}>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {designWorkItems.map(item => (
                    <tr key={item.id}>
                      <td style={{whiteSpace:'nowrap'}}>{item.year?.profileYear || '-'}</td>
                      <td style={{whiteSpace:'nowrap',maxWidth:'120px',overflow:'hidden',textOverflow:'ellipsis'}} title={item.project?.project || item.project?.projectId || ''}>{item.project?.project || item.project?.projectId || '-'}</td>
                      <td style={{whiteSpace:'nowrap'}}><span className={`badge ${item.contractType === 'works' ? 'bg-primary' : 'bg-success'}`} style={{fontSize:'inherit'}}>{item.contractType === 'works' ? t('projectActions.works') : t('projectActions.goods')}</span></td>
                      <td style={{whiteSpace:'nowrap'}}>{item.contractRefNo}</td>
                      <td style={{whiteSpace:'nowrap'}}><code style={{fontSize:'inherit'}}>{item.activityId}</code></td>
                      <td style={{whiteSpace:'nowrap',maxWidth:'100px',overflow:'hidden',textOverflow:'ellipsis'}} title={item.activity}>{item.activity}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.rate}%</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.unit}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.provisionalQuantities}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.activityStartDate || '-'}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.activityEndDate || '-'}</td>
                      <td style={{whiteSpace:'nowrap'}}>{item.duration != null ? `${item.duration} ${t('projectActions.' + (item.durationUnit || 'Days').toLowerCase())}` : '-'}</td>
                      <td style={{whiteSpace:'nowrap'}}>
                        <div className="d-flex gap-1 flex-nowrap">
                          <button className="btn btn-sm btn-outline-info p-1" title={t('common.view')} onClick={() => openDwpModal(item, 'view')}><FiEye /></button>
                          <button className="btn btn-sm btn-outline-primary p-1" title={t('common.edit')} onClick={() => openDwpModal(item, 'edit')}><FiEdit2 /></button>
                          <button className="btn btn-sm btn-outline-danger p-1" title={t('common.delete')} onClick={() => handleDeleteDwpItem(item.id)}><FiTrash2 /></button>
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
      {renderDwpModal()}
    </div>
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('projectActions.title')}</h2>
        <div className="d-flex gap-3">
          <select className="form-select" value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ width: '250px' }}>
            <option value="all">{t('common.all')}</option>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
          </select>
          <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => handleOpenModal()}>
            <FiPlus className="me-2" /> {getAddButtonLabel()}
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

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>
          ) : (
            activeTab === 'works' ? renderWorksTable() :
            activeTab === 'goods' ? renderGoodsTable() :
            activeTab === 'designWork' ? renderDesignWorkProgress() :
            activeTab === 'designMonitoring' ? renderDesignMonitoring() :
            activeTab === 'boq' ? renderBoq() :
            activeTab === 'supplyProgress' ? renderSupplyProgress() :
            activeTab === 'installation' ? renderInstallation() :
            renderWorksTable()
          )}
        </div>
      </div>

      {showModal && activeTab === 'works' && renderWorksModal()}

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
