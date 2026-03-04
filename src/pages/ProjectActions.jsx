import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiFileText, FiPackage, FiActivity, FiSearch, FiCheck, FiEye, FiClipboard } from 'react-icons/fi';
import toast from 'react-hot-toast';

function ProjectActions() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('works');
  const [projects, setProjects] = useState([]);
  const [works, setWorks] = useState([]);
  const [goods, setGoods] = useState([]);
  const [monitoring, setMonitoring] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [quarters, setQuarters] = useState([]);
  const [monitoringTypes, setMonitoringTypes] = useState([]);
  const [kpiForContracts, setKpiForContracts] = useState([]);
  const [filteredKpiForContracts, setFilteredKpiForContracts] = useState([]);
  const [selectedInvestmentType, setSelectedInvestmentType] = useState('');
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

  const [showContractSelector, setShowContractSelector] = useState(false);
  const [contractSelectorList, setContractSelectorList] = useState([]);
  const [contractSelectorType, setContractSelectorType] = useState('');
  const [contractSelectorProject, setContractSelectorProject] = useState('');
  const [contractSelectorLoading, setContractSelectorLoading] = useState(false);
  const [selectedContractRef, setSelectedContractRef] = useState('');
  const [contractDetailView, setContractDetailView] = useState(null);

  const [designWorkItems, setDesignWorkItems] = useState([]);
  const [dwpDate, setDwpDate] = useState('');
  const [dwpProject, setDwpProject] = useState('');
  const [dwpContractType, setDwpContractType] = useState('');
  const [dwpContractRefNo, setDwpContractRefNo] = useState('');
  const [dwpContractOptions, setDwpContractOptions] = useState([]);
  const [dwpRows, setDwpRows] = useState([]);
  const [dwpSaving, setDwpSaving] = useState(false);
  const [dwpModalItem, setDwpModalItem] = useState(null);
  const [dwpModalMode, setDwpModalMode] = useState('view');
  const [dwpEditForm, setDwpEditForm] = useState({});

  const uniqueInvestmentTypes = useMemo(() => {
    const types = [...new Set(filteredKpiForContracts.map(k => k.typeOfInvestment).filter(Boolean))];
    return types;
  }, [filteredKpiForContracts]);

  const filteredKpiDescriptions = useMemo(() => {
    if (!selectedInvestmentType) return [];
    return filteredKpiForContracts.filter(k => k.typeOfInvestment === selectedInvestmentType);
  }, [filteredKpiForContracts, selectedInvestmentType]);

  useEffect(() => {
    loadProjects();
    loadReferenceData();
  }, []);

  useEffect(() => {
    loadContracts();
    loadFinancialData();
  }, [selectedProject]);

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

  const handleMonitoringTypeChange = async (monitoringTypeCode) => {
    setFilteredKpiForContracts([]);
    setSelectedInvestmentType('');
    if (monitoringTypeCode) {
      try {
        const res = await axios.get(`/api/setup/kpi-contracts/monitoring-type/${monitoringTypeCode}`);
        setFilteredKpiForContracts(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Error loading KPI for contracts by monitoring type:', error);
        setFilteredKpiForContracts([]);
      }
    }
  };

  const loadContracts = async () => {
    setLoading(true);
    try {
      const isAll = selectedProject === 'all';
      const [worksRes, goodsRes, monRes, dwpRes] = await Promise.all([
        isAll ? axios.get('/api/project-actions/works').catch(() => ({ data: [] })) : axios.get(`/api/project-actions/works/project/${selectedProject}`).catch(() => ({ data: [] })),
        isAll ? axios.get('/api/project-actions/goods').catch(() => ({ data: [] })) : axios.get(`/api/project-actions/goods/project/${selectedProject}`).catch(() => ({ data: [] })),
        isAll ? axios.get('/api/project-actions/monitoring').catch(() => ({ data: [] })) : axios.get(`/api/project-actions/monitoring/project/${selectedProject}`).catch(() => ({ data: [] })),
        isAll ? axios.get('/api/project-actions/design-work-progress').catch(() => ({ data: [] })) : axios.get(`/api/project-actions/design-work-progress/project/${selectedProject}`).catch(() => ({ data: [] }))
      ]);
      setWorks(worksRes.data);
      setGoods(goodsRes.data);
      setMonitoring(monRes.data);
      setDesignWorkItems(dwpRes.data);
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
    if (activeTab === 'monitoring' && item?.monitoringType?.monitoringTypeCode) {
      handleMonitoringTypeChange(item.monitoringType.monitoringTypeCode);
      if (item?.investmentType?.typeOfInvestment) {
        setSelectedInvestmentType(item.investmentType.typeOfInvestment);
      }
    } else {
      setFilteredKpiForContracts([]);
      setSelectedInvestmentType('');
    }
    setSelectedContractRef(item?.contractRefNo || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setSelectedContractRef('');
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
      const msg = error.response?.data?.message || 'Error deleting record';
      toast.error(msg);
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
      project: { projectId: data.monitoringProjectId || selectedProject },
      quarter: data.quarterId ? { id: parseInt(data.quarterId) } : null,
      monitoringType: data.monitoringTypeCode ? { monitoringTypeCode: data.monitoringTypeCode } : null,
      investmentType: data.investmentTypeCode ? { id: parseInt(data.investmentTypeCode) } : null,
      kpiDescription: data.kpiDescriptionCode ? { id: parseInt(data.kpiDescriptionCode) } : null,
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
      const msg = error.response?.data?.message || 'Error deleting record';
      toast.error(msg);
    }
  };

  const handleOpenContractSelector = async (projectId, contractType) => {
    if (!projectId || !contractType) {
      toast.error(t('projectActions.selectProjectAndType'));
      return;
    }
    setContractSelectorProject(projectId);
    setContractSelectorType(contractType);
    setContractSelectorLoading(true);
    setShowContractSelector(true);
    setContractDetailView(null);
    try {
      const endpoint = contractType === 'works'
        ? `/api/project-actions/works/project/${projectId}`
        : `/api/project-actions/goods/project/${projectId}`;
      const res = await axios.get(endpoint);
      setContractSelectorList(res.data);
    } catch (error) {
      console.error('Error loading contracts for selector:', error);
      setContractSelectorList([]);
    } finally {
      setContractSelectorLoading(false);
    }
  };

  const handleSelectContract = (contractRefNo) => {
    setSelectedContractRef(contractRefNo);
    setShowContractSelector(false);
    setContractDetailView(null);
  };

  const handleDeleteMonitoring = async (id) => {
    if (!confirm(t('common.confirmDelete') || 'Are you sure?')) return;
    try {
      await axios.delete(`/api/project-actions/monitoring/${id}`);
      toast.success('Record deleted successfully');
      loadContracts();
    } catch (error) {
      console.error('Error deleting monitoring:', error);
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
          <div className="modal-header text-white" style={{ background: 'linear-gradient(135deg, #4a4eb8, #6366f1)' }}>
            <h5 className="modal-title fw-bold">
              <FiActivity className="me-2" />
              {editingItem ? t('projectActions.editContractMonitoring') : t('projectActions.contractMonitoringInfo')}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
          </div>
          <form onSubmit={handleMonitoringSave}>
            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>

              <div className="d-flex align-items-center mb-3 mt-1">
                <span className="badge bg-primary rounded-circle me-2" style={{ width: 8, height: 8 }}></span>
                <h6 className="fw-bold mb-0">{t('projectActions.projectContractInfo')}</h6>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('projectActions.selectProject')} *</label>
                  <select name="monitoringProjectId" defaultValue={selectedProject} className="form-select" required>
                    <option value="">----------</option>
                    {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('projectActions.selectContractType')} *</label>
                  <select name="contractType" defaultValue={editingItem ? 'works' : ''} className="form-select">
                    <option value="">-- {t('projectActions.pleaseSelect')} --</option>
                    <option value="works">{t('projectActions.worksContracts')}</option>
                    <option value="goods">{t('projectActions.goodsContracts')}</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">{t('projectActions.contractReference')} *</label>
                  <div className="d-flex gap-2">
                    <input name="contractRefNo" value={selectedContractRef} onChange={e => setSelectedContractRef(e.target.value)} className="form-control" required placeholder={t('projectActions.contractRefPlaceholder')} />
                    <button type="button" className="btn btn-outline-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => {
                      const form = document.querySelector('form');
                      const projId = form?.querySelector('[name="monitoringProjectId"]')?.value;
                      const cType = form?.querySelector('[name="contractType"]')?.value;
                      handleOpenContractSelector(projId, cType);
                    }}>
                      <FiSearch className="me-1" /> {t('projectActions.selectContract')}
                    </button>
                  </div>
                  <small className="text-muted">{t('projectActions.selectContractHint')}</small>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('projectActions.monitoringDate')} *</label>
                  <input type="date" name="monitoringDate" defaultValue={editingItem?.monitoringDate || new Date().toISOString().split('T')[0]} className="form-control" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('projectActions.reportFrequency')} *</label>
                  <select name="quarterId" defaultValue={editingItem?.quarter?.id || ''} className="form-select" required>
                    <option value="">----------</option>
                    {quarters.map(q => (
                      <option key={q.id} value={q.id}>{q.quarter}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">{t('projectActions.monitoringType')} *</label>
                  <select name="monitoringTypeCode" defaultValue={editingItem?.monitoringType?.monitoringTypeCode || ''} className="form-select" required onChange={(e) => handleMonitoringTypeChange(e.target.value)}>
                    <option value="">----------</option>
                    {monitoringTypes.map(mt => (
                      <option key={mt.monitoringTypeCode} value={mt.monitoringTypeCode}>{mt.monitoringType}</option>
                    ))}
                  </select>
                </div>
              </div>

              <hr className="my-4" />
              <div className="d-flex align-items-center mb-3">
                <span className="badge bg-info rounded-circle me-2" style={{ width: 8, height: 8 }}></span>
                <h6 className="fw-bold mb-0">{t('projectActions.investmentKpiDetails')}</h6>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('projectActions.typeOfInvestment')} *</label>
                  <select value={selectedInvestmentType} onChange={(e) => setSelectedInvestmentType(e.target.value)} className="form-select" required>
                    <option value="">----------</option>
                    {uniqueInvestmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <input type="hidden" name="investmentTypeCode" value={selectedInvestmentType ? (filteredKpiForContracts.find(k => k.typeOfInvestment === selectedInvestmentType)?.id || '') : ''} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('projectActions.kpiDescription')} *</label>
                  <select name="kpiDescriptionCode" defaultValue={editingItem?.kpiDescription?.id || ''} className="form-select" required>
                    <option value="">----------</option>
                    {filteredKpiDescriptions.map(k => (
                      <option key={k.id} value={k.id}>{k.kpiDescription}</option>
                    ))}
                  </select>
                </div>
              </div>

              <hr className="my-4" />
              <div className="d-flex align-items-center mb-3">
                <span className="badge bg-warning rounded-circle me-2" style={{ width: 8, height: 8 }}></span>
                <h6 className="fw-bold mb-0">{t('projectActions.milestoneInformation')}</h6>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('projectActions.milestoneStartDate')} *</label>
                  <input type="date" name="milestoneStartDate" defaultValue={editingItem?.milestoneStartDate || new Date().toISOString().split('T')[0]} className="form-control" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('projectActions.milestoneEndDate')} *</label>
                  <input type="date" name="milestoneEndDate" defaultValue={editingItem?.milestoneEndDate} className="form-control" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('projectActions.target')} *</label>
                  <textarea name="target" defaultValue={editingItem?.target} className="form-control" rows="3" required></textarea>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('projectActions.achievedStatus')} *</label>
                  <textarea name="achievedStatus" defaultValue={editingItem?.achievedStatus} className="form-control" rows="3" required></textarea>
                </div>
              </div>

              <hr className="my-4" />
              <div className="d-flex align-items-center mb-3">
                <span className="badge bg-secondary rounded-circle me-2" style={{ width: 8, height: 8 }}></span>
                <h6 className="fw-bold mb-0">{t('projectActions.implementationStatusSection')}</h6>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('projectActions.implementationStatus')} *</label>
                  <select name="implementationStatusId" defaultValue={editingItem?.implementationStatus?.id || ''} className="form-select" required>
                    <option value="">----------</option>
                    {implementationStatuses.map(s => (
                      <option key={s.id} value={s.id}>{s.progressScale}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">{t('projectActions.pictureOfStatus')}</label>
                  <input type="file" name="pictureOfStatusFile" accept="image/*" className="form-control" />
                  {editingItem?.pictureOfStatus ? (
                    <small className="text-muted">{t('projectActions.currentFile')}: {editingItem.pictureOfStatus}</small>
                  ) : (
                    <small className="text-muted">{t('projectActions.noExistingPicture')}</small>
                  )}
                  <input type="hidden" name="pictureOfStatus" defaultValue={editingItem?.pictureOfStatus || ''} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">{t('projectActions.remarks')} *</label>
                  <textarea name="remarks" defaultValue={editingItem?.remarks} className="form-control" rows="3" required></textarea>
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
      observations: ''
    }]);
  };

  const updateDwpRow = (idx, field, value) => {
    setDwpRows(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
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
    if (!dwpDate || !dwpProject || !dwpContractType || !dwpContractRefNo) {
      toast.error('Please fill in Date, Project, Contract Type, and Contract Reference');
      return;
    }
    if (dwpRows.length === 0) {
      toast.error('Please add at least one activity row');
      return;
    }
    setDwpSaving(true);
    try {
      const items = dwpRows.map(row => ({
        monitoringDate: dwpDate,
        project: { projectId: dwpProject },
        contractType: dwpContractType,
        contractRefNo: dwpContractRefNo,
        activityId: row.activityId,
        activity: row.activity,
        rate: parseFloat(row.rate) || 0,
        unit: row.unit,
        provisionalQuantities: parseFloat(row.provisionalQuantities) || 0,
        executedQuantities: parseFloat(row.executedQuantities) || 0,
        percentage: calcPercentage(row.provisionalQuantities, row.executedQuantities),
        globalProgressRate: calcGlobalProgressRate(row.rate),
        observations: row.observations
      }));
      await axios.post('/api/project-actions/design-work-progress/batch', items);
      toast.success('Design work progress saved successfully');
      setDwpRows([]);
      setDwpDate('');
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
        monitoringDate: item.monitoringDate || '',
        contractType: item.contractType || '',
        contractRefNo: item.contractRefNo || '',
        activityId: item.activityId || '',
        activity: item.activity || '',
        rate: item.rate ?? '',
        unit: item.unit || '',
        provisionalQuantities: item.provisionalQuantities ?? '',
        executedQuantities: item.executedQuantities ?? '',
        observations: item.observations || ''
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
      const pct = calcPercentage(dwpEditForm.provisionalQuantities, dwpEditForm.executedQuantities);
      const gpr = calcGlobalProgressRate(dwpEditForm.rate);
      await axios.put(`/api/project-actions/design-work-progress/${dwpModalItem.id}`, {
        ...dwpModalItem,
        monitoringDate: dwpEditForm.monitoringDate,
        contractType: dwpEditForm.contractType,
        contractRefNo: dwpEditForm.contractRefNo,
        activityId: dwpEditForm.activityId,
        activity: dwpEditForm.activity,
        rate: parseFloat(dwpEditForm.rate) || 0,
        unit: dwpEditForm.unit,
        provisionalQuantities: parseFloat(dwpEditForm.provisionalQuantities) || 0,
        executedQuantities: parseFloat(dwpEditForm.executedQuantities) || 0,
        percentage: pct,
        globalProgressRate: gpr,
        observations: dwpEditForm.observations
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
    const editPct = !isView ? calcPercentage(form.provisionalQuantities, form.executedQuantities) : null;
    const editGpr = !isView ? calcGlobalProgressRate(form.rate) : null;

    return (
      <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeDwpModal}>
        <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isView ? 'View Record' : 'Edit Record'}</h5>
              <button type="button" className="btn-close" onClick={closeDwpModal}></button>
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Date</label>
                  {isView ? (
                    <p className="form-control-plaintext">{item.monitoringDate || '-'}</p>
                  ) : (
                    <input type="date" className="form-control" value={form.monitoringDate} onChange={e => setDwpEditForm(f => ({...f, monitoringDate: e.target.value}))} />
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Project</label>
                  <p className="form-control-plaintext">{item.project?.projectId || '-'}</p>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Contract Type</label>
                  {isView ? (
                    <p className="form-control-plaintext"><span className={`badge ${item.contractType === 'works' ? 'bg-primary' : 'bg-success'}`}>{item.contractType === 'works' ? 'Works' : 'Goods & Services'}</span></p>
                  ) : (
                    <select className="form-select" value={form.contractType} onChange={e => setDwpEditForm(f => ({...f, contractType: e.target.value}))}>
                      <option value="works">Works Contracts</option>
                      <option value="goods">Goods and Services</option>
                    </select>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Contract Ref No.</label>
                  {isView ? (
                    <p className="form-control-plaintext">{item.contractRefNo || '-'}</p>
                  ) : (
                    <input type="text" className="form-control" value={form.contractRefNo} onChange={e => setDwpEditForm(f => ({...f, contractRefNo: e.target.value}))} />
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Activity ID</label>
                  {isView ? (
                    <p className="form-control-plaintext"><code>{item.activityId}</code></p>
                  ) : (
                    <input type="text" className="form-control bg-light" value={form.activityId} readOnly />
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Activity</label>
                  {isView ? (
                    <p className="form-control-plaintext">{item.activity || '-'}</p>
                  ) : (
                    <input type="text" className="form-control" value={form.activity} onChange={e => setDwpEditForm(f => ({...f, activity: e.target.value}))} />
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Rate (%)</label>
                  {isView ? (
                    <p className="form-control-plaintext">{item.rate}%</p>
                  ) : (
                    <input type="number" className="form-control" value={form.rate} onChange={e => setDwpEditForm(f => ({...f, rate: e.target.value}))} step="0.01" min="0" max="100" />
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Unit</label>
                  {isView ? (
                    <p className="form-control-plaintext">{item.unit || '-'}</p>
                  ) : (
                    <input type="text" className="form-control" value={form.unit} onChange={e => setDwpEditForm(f => ({...f, unit: e.target.value}))} />
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Provisional Qty</label>
                  {isView ? (
                    <p className="form-control-plaintext">{item.provisionalQuantities}</p>
                  ) : (
                    <input type="number" className="form-control" value={form.provisionalQuantities} onChange={e => setDwpEditForm(f => ({...f, provisionalQuantities: e.target.value}))} step="0.01" />
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Executed Qty</label>
                  {isView ? (
                    <p className="form-control-plaintext">{item.executedQuantities}</p>
                  ) : (
                    <input type="number" className="form-control" value={form.executedQuantities} onChange={e => setDwpEditForm(f => ({...f, executedQuantities: e.target.value}))} step="0.01" />
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Percentage</label>
                  <p className="form-control-plaintext">{isView ? (item.percentage != null ? `${item.percentage}%` : '-') : `${editPct}%`}</p>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Global Progress Rate</label>
                  <p className="form-control-plaintext">{isView ? (item.globalProgressRate != null ? `${item.globalProgressRate}%` : '-') : `${editGpr}%`}</p>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Observations</label>
                  {isView ? (
                    <p className="form-control-plaintext" style={{whiteSpace:'pre-wrap'}}>{item.observations || '-'}</p>
                  ) : (
                    <textarea className="form-control" rows="3" value={form.observations} onChange={e => setDwpEditForm(f => ({...f, observations: e.target.value}))} />
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {isView ? (
                <>
                  <button className="btn btn-primary" onClick={() => { setDwpModalMode('edit'); setDwpEditForm({ monitoringDate: item.monitoringDate || '', contractType: item.contractType || '', contractRefNo: item.contractRefNo || '', activityId: item.activityId || '', activity: item.activity || '', rate: item.rate ?? '', unit: item.unit || '', provisionalQuantities: item.provisionalQuantities ?? '', executedQuantities: item.executedQuantities ?? '', observations: item.observations || '' }); }}>
                    <FiEdit2 className="me-1" /> Edit
                  </button>
                  <button className="btn btn-secondary" onClick={closeDwpModal}>Close</button>
                </>
              ) : (
                <>
                  <button className="btn btn-success" onClick={handleDwpEditSave}>Save Changes</button>
                  <button className="btn btn-secondary" onClick={closeDwpModal}>Cancel</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDesignWorkProgress = () => (
    <div>
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h6 className="mb-0">Design Work Progress Monitoring & Reporting</h6>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Date</label>
              <input type="date" className="form-control" value={dwpDate} onChange={e => setDwpDate(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Project</label>
              <select className="form-select" value={dwpProject} onChange={e => handleDwpProjectChange(e.target.value)}>
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p.projectId} value={p.projectId}>{p.projectId} - {p.projectName || p.projectId}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Contract Type</label>
              <select className="form-select" value={dwpContractType} onChange={e => handleDwpContractTypeChange(e.target.value)} disabled={!dwpProject}>
                <option value="">Select Type</option>
                <option value="works">Works Contracts</option>
                <option value="goods">Goods and Services</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Contract Reference No.</label>
              <select className="form-select" value={dwpContractRefNo} onChange={e => {
                setDwpContractRefNo(e.target.value);
                setDwpRows(prev => prev.map(row => ({ ...row, activityId: generateActivityId(e.target.value) })));
              }} disabled={!dwpContractType}>
                <option value="">Select Reference</option>
                {dwpContractOptions.map((c, i) => (
                  <option key={i} value={c.contractRefNo}>{c.contractRefNo}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Activity Rows</h6>
            <button type="button" className="btn btn-sm btn-primary" onClick={addDwpRow} disabled={!dwpContractRefNo}>
              <FiPlus className="me-1" /> Add Row
            </button>
          </div>

          {dwpRows.length > 0 && (
            <div className="table-responsive">
              <table className="table table-bordered table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{minWidth:'120px'}}>Activity ID</th>
                    <th style={{minWidth:'150px'}}>Activity</th>
                    <th style={{minWidth:'80px'}}>Rate (%)</th>
                    <th style={{minWidth:'80px'}}>Unit</th>
                    <th style={{minWidth:'120px'}}>Provisional Qty</th>
                    <th style={{minWidth:'120px'}}>Executed Qty</th>
                    <th style={{minWidth:'90px'}}>Percentage</th>
                    <th style={{minWidth:'120px'}}>Global Progress Rate</th>
                    <th style={{minWidth:'180px'}}>Observations</th>
                    <th style={{width:'50px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {dwpRows.map((row, idx) => {
                    const pct = calcPercentage(row.provisionalQuantities, row.executedQuantities);
                    const gpr = calcGlobalProgressRate(row.rate);
                    return (
                      <tr key={row.tempId}>
                        <td><input type="text" className="form-control form-control-sm bg-light" value={row.activityId} readOnly /></td>
                        <td><input type="text" className="form-control form-control-sm" value={row.activity} onChange={e => updateDwpRow(idx, 'activity', e.target.value)} placeholder="Activity name" /></td>
                        <td><input type="number" className="form-control form-control-sm" value={row.rate} onChange={e => updateDwpRow(idx, 'rate', e.target.value)} step="0.01" min="0" max="100" /></td>
                        <td><input type="text" className="form-control form-control-sm" value={row.unit} onChange={e => updateDwpRow(idx, 'unit', e.target.value)} placeholder="e.g. m2" /></td>
                        <td><input type="number" className="form-control form-control-sm" value={row.provisionalQuantities} onChange={e => updateDwpRow(idx, 'provisionalQuantities', e.target.value)} step="0.01" /></td>
                        <td><input type="number" className="form-control form-control-sm" value={row.executedQuantities} onChange={e => updateDwpRow(idx, 'executedQuantities', e.target.value)} step="0.01" /></td>
                        <td><input type="text" className="form-control form-control-sm bg-light" value={`${pct}%`} readOnly /></td>
                        <td><input type="text" className="form-control form-control-sm bg-light" value={`${gpr}%`} readOnly /></td>
                        <td><textarea className="form-control form-control-sm" value={row.observations} onChange={e => updateDwpRow(idx, 'observations', e.target.value)} rows="1" /></td>
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
                {dwpSaving ? 'Saving...' : 'Save All Rows'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h6 className="mb-0">Saved Records</h6>
        </div>
        <div className="card-body p-0">
          {designWorkItems.length === 0 ? (
            <div className="text-center text-muted p-4">No design work progress records yet</div>
          ) : (
            <div style={{overflowX:'hidden', width:'100%'}}>
              <table className="table table-striped table-sm mb-0" style={{fontSize:'clamp(0.65rem, 1.1vw, 0.85rem)', width:'100%', tableLayout:'auto'}}>
                <thead className="table-light">
                  <tr>
                    <th style={{whiteSpace:'nowrap'}}>Date</th>
                    <th>Project</th>
                    <th>Type</th>
                    <th style={{whiteSpace:'nowrap'}}>Contract Ref</th>
                    <th style={{whiteSpace:'nowrap'}}>Activity ID</th>
                    <th>Activity</th>
                    <th style={{whiteSpace:'nowrap'}}>Rate(%)</th>
                    <th>Unit</th>
                    <th style={{whiteSpace:'nowrap'}}>Prov.Qty</th>
                    <th style={{whiteSpace:'nowrap'}}>Exec.Qty</th>
                    <th>%</th>
                    <th style={{whiteSpace:'nowrap'}}>Global Rate</th>
                    <th>Observations</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {designWorkItems.map(item => (
                    <tr key={item.id}>
                      <td style={{whiteSpace:'nowrap'}}>{item.monitoringDate}</td>
                      <td style={{maxWidth:'80px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.project?.projectId || '-'}</td>
                      <td><span className={`badge ${item.contractType === 'works' ? 'bg-primary' : 'bg-success'}`} style={{fontSize:'inherit'}}>{item.contractType === 'works' ? 'Works' : 'Goods'}</span></td>
                      <td>{item.contractRefNo}</td>
                      <td><code style={{fontSize:'inherit'}}>{item.activityId}</code></td>
                      <td style={{maxWidth:'100px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.activity}</td>
                      <td>{item.rate}%</td>
                      <td>{item.unit}</td>
                      <td>{item.provisionalQuantities}</td>
                      <td>{item.executedQuantities}</td>
                      <td>{item.percentage != null ? `${item.percentage}%` : '-'}</td>
                      <td>{item.globalProgressRate != null ? `${item.globalProgressRate}%` : '-'}</td>
                      <td style={{maxWidth:'100px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.observations}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-info p-1" title="View" onClick={() => openDwpModal(item, 'view')} style={{fontSize:'inherit'}}><FiEye /></button>
                          <button className="btn btn-sm btn-outline-primary p-1" title="Edit" onClick={() => openDwpModal(item, 'edit')} style={{fontSize:'inherit'}}><FiEdit2 /></button>
                          <button className="btn btn-sm btn-outline-danger p-1" title="Delete" onClick={() => handleDeleteDwpItem(item.id)} style={{fontSize:'inherit'}}><FiTrash2 /></button>
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
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'designWork' ? 'active' : ''}`} onClick={() => setActiveTab('designWork')}>
            <FiClipboard className="me-2" /> Design Work Progress
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
            activeTab === 'designWork' ? renderDesignWorkProgress() :
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

      {showContractSelector && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{t('projectActions.selectContract')}</h5>
                <button type="button" className="btn-close" onClick={() => { setShowContractSelector(false); setContractDetailView(null); }}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <p className="fw-bold mb-1">
                  {contractSelectorType === 'works' ? t('projectActions.worksContracts') : t('projectActions.goodsContracts')}{' '}
                  {t('projectActions.forProject')}: {projects.find(p => p.projectId === contractSelectorProject)?.project || contractSelectorProject}
                </p>
                <p className="text-muted small mb-3">
                  {t('projectActions.foundContracts', { count: contractSelectorList.length })}
                </p>

                {contractSelectorLoading ? (
                  <div className="text-center p-4"><div className="spinner-border" role="status"></div></div>
                ) : contractSelectorList.length === 0 ? (
                  <div className="text-center text-muted p-4">{t('table.noData')}</div>
                ) : (
                  contractSelectorList.map((contract) => (
                    <div key={contract.id} className="card mb-3 border">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-1">{contract.contractRefNo || '-'}</h6>
                            <p className="mb-1">
                              <strong>{t('projectActions.contractValue')}:</strong>{' '}
                              {contract.currency?.currency || ''} {formatCurrency(contract.contractValue)}
                            </p>
                            <p className="text-muted small mb-1">
                              {contractSelectorType === 'works'
                                ? `${t('projectActions.contractor')}: ${contract.nameOfContractor || '-'}`
                                : `${t('projectActions.supplier')}: ${contract.nameOfSupplier || '-'}`}
                              {' | '}{t('projectActions.nameOfConsultant')}: {contract.nameOfConsultant || '-'}
                            </p>
                            <p className="text-muted small mb-0">
                              {t('common.duration')}: {formatDate(contract.contractStartDate)} {t('common.to')} {formatDate(contract.contractEndDate)}
                            </p>
                          </div>
                          <div className="d-flex flex-column gap-1 ms-3">
                            {contract.implementationStatus?.progressScale && (
                              <span className="badge bg-secondary">{contract.implementationStatus.progressScale}</span>
                            )}
                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleSelectContract(contract.contractRefNo)}>
                              <FiCheck className="me-1" /> {t('projectActions.select')}
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-info" onClick={() => setContractDetailView(contractDetailView === contract.id ? null : contract.id)}>
                              <FiEye className="me-1" /> {t('projectActions.viewDetails')}
                            </button>
                          </div>
                        </div>

                        {contractDetailView === contract.id && (
                          <div className="mt-3 pt-3 border-top">
                            <div className="row g-2" style={{ fontSize: '0.85rem' }}>
                              <div className="col-md-6"><strong>{t('financial.project')}:</strong> {contract.project?.project || '-'}</div>
                              <div className="col-md-6"><strong>{t('financial.components')}:</strong> {contract.component?.projectComponents || '-'}</div>
                              <div className="col-md-6"><strong>{t('financial.subcomponents')}:</strong> {contract.subcomponent?.subcomponent || '-'}</div>
                              <div className="col-md-6"><strong>{t('financial.activities')}:</strong> {contract.activity?.activity || '-'}</div>
                              <div className="col-md-6"><strong>{t('projectActions.projectCategory')}:</strong> {contract.projectCategory?.category || '-'}</div>
                              <div className="col-md-6"><strong>{t('projectActions.fundingSource')}:</strong> {contract.fundingSource?.name || '-'}</div>
                              <div className="col-md-6"><strong>{t('financial.currency')}:</strong> {contract.currency?.currency || '-'}</div>
                              <div className="col-md-6"><strong>{t('projectActions.amendments')}:</strong> {contract.amendments ? t('common.yes') : t('common.no')}</div>
                              {contractSelectorType === 'works' && (
                                <>
                                  <div className="col-md-6"><strong>{t('projectActions.locationOfInvestment')}:</strong> {contract.locationOfInvestment || '-'}</div>
                                  <div className="col-md-6"><strong>{t('projectActions.grossFloorArea')}:</strong> {contract.grossFloorAreaM2 || '-'}</div>
                                  <div className="col-md-6"><strong>{t('projectActions.mainInterventionFocus')}:</strong> {contract.mainInterventionFocus || '-'}</div>
                                </>
                              )}
                              <div className="col-12"><strong>{t('projectActions.remarks')}:</strong> {contract.remarks || '-'}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => { setShowContractSelector(false); setContractDetailView(null); }}>
                  {t('common.cancel')}
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
