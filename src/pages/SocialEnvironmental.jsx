import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiShield, FiAlertTriangle, FiHeart, FiCamera, FiUpload, FiX, FiImage, FiFileText, FiMapPin, FiEye } from 'react-icons/fi';
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
  const filteredDistricts = useMemo(() => {
    if (!formData.regionCode) return [];
    return districts.filter(d => d.lga?.region?.regionCode === formData.regionCode);
  }, [formData.regionCode, districts]);
  const [settlements, setSettlements] = useState([]);
  const [papTypes, setPapTypes] = useState([]);
  const [papCategories, setPapCategories] = useState([]);
  const [vulnerabilityCategories, setVulnerabilityCategories] = useState([]);
  const [decisionOutcomes, setDecisionOutcomes] = useState([]);
  const [years, setYears] = useState([]);
  const [identificationDocuments, setIdentificationDocuments] = useState([]);
  const [electricityFeeders, setElectricityFeeders] = useState([]);
  const [settlementNatures, setSettlementNatures] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [quarters, setQuarters] = useState([]);
  const [engagementTypes, setEngagementTypes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [idDocUploading, setIdDocUploading] = useState(false);
  const [viewingPAP, setViewingPAP] = useState(null);
  const fileInputRef = useRef(null);
  const idDocInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('socialEnvironmental.onlyImages'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('socialEnvironmental.fileTooLarge'));
      return;
    }

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await axios.post('/api/uploads', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, picture: res.data.url }));
      toast.success(t('socialEnvironmental.photoUploaded'));
    } catch (err) {
      toast.error(err.response?.data?.error || t('socialEnvironmental.uploadFailed'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  }, [t]);

  const handleRemovePicture = useCallback(() => {
    setFormData(prev => ({ ...prev, picture: null }));
  }, []);

  const handleIdDocUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      toast.error(t('socialEnvironmental.onlyImagesOrPdf'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('socialEnvironmental.fileTooLarge'));
      return;
    }
    setIdDocUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);
    try {
      const res = await axios.post('/api/uploads', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, idDocumentUpload: res.data.url }));
      toast.success(t('socialEnvironmental.idDocUploaded'));
    } catch (err) {
      toast.error(err.response?.data?.error || t('socialEnvironmental.uploadFailed'));
    } finally {
      setIdDocUploading(false);
      if (idDocInputRef.current) idDocInputRef.current.value = '';
    }
  }, [t]);

  const handleRemoveIdDoc = useCallback(() => {
    setFormData(prev => ({ ...prev, idDocumentUpload: null }));
  }, []);

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
      const [regRes, distRes, settRes, ptRes, pcRes, vcRes, itRes, doRes, yrRes, qrRes, etRes, idRes, efRes, snRes, curRes] = await Promise.all([
        axios.get('/api/setup/regions').catch(() => ({ data: [] })),
        axios.get('/api/setup/districts').catch(() => ({ data: [] })),
        axios.get('/api/setup/settlements').catch(() => ({ data: [] })),
        axios.get('/api/setup/pap-types').catch(() => ({ data: [] })),
        axios.get('/api/setup/pap-categories').catch(() => ({ data: [] })),
        axios.get('/api/setup/vulnerability-categories').catch(() => ({ data: [] })),
        axios.get('/api/setup/kpi-contracts').catch(() => ({ data: [] })),
        axios.get('/api/setup/decision-outcomes').catch(() => ({ data: [] })),
        axios.get('/api/setup/years').catch(() => ({ data: [] })),
        axios.get('/api/setup/quarters').catch(() => ({ data: [] })),
        axios.get('/api/social-environmental/engagement-types').catch(() => ({ data: [] })),
        axios.get('/api/setup/identification-documents').catch(() => ({ data: [] })),
        axios.get('/api/setup/electricity-feeders').catch(() => ({ data: [] })),
        axios.get('/api/setup/settlement-natures').catch(() => ({ data: [] })),
        axios.get('/api/setup/currencies').catch(() => ({ data: [] }))
      ]);
      setRegions(regRes.data);
      setDistricts(distRes.data);
      setSettlements(settRes.data);
      setPapTypes(ptRes.data);
      setPapCategories(pcRes.data);
      setVulnerabilityCategories(vcRes.data);
      setInvestmentTypes(itRes.data);
      setDecisionOutcomes(doRes.data);
      setYears(yrRes.data);
      setQuarters(qrRes.data);
      setEngagementTypes(etRes.data);
      setIdentificationDocuments(idRes.data);
      setElectricityFeeders(efRes.data);
      setSettlementNatures(snRes.data);
      setCurrencies(curRes.data);
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
    if (activeTab === 'esia' || activeTab === 'pap' || activeTab === 'grievance' || activeTab === 'ohs' || activeTab === 'engagement') {
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
          electricityFeederId: item.electricityFeeder?.id || '',
          impactLatitude: item.impactLatitude || '',
          impactLongitude: item.impactLongitude || '',
          compensationTypeId: item.compensationType?.id || '',
          compensationCurrencyId: item.compensationCurrency?.id || '',
          compensationCashAmount: item.compensationCashAmount || '',
          compensationLandArea: item.compensationLandArea || '',
          regionCode: regionCode,
          districtCode: item.district?.districtCode || '',
          sex: item.sex || '',
          papTypeId: item.papType?.id || '',
          papCategoryId: item.papCategory?.id || '',
          vulnerabilityCategoryId: item.vulnerabilityCategory?.id || '',
          papCompensated: item.papCompensated || '',
          papIdentificationNumber: item.papIdentificationNumber || '',
          profileYearId: item.profileYear?.id || '',
          identificationDocumentId: item.identificationDocument?.id || '',
          idDocumentUpload: item.idDocumentUpload || '',
          settlementCode: item.currentAddress?.settlementCode || '',
          remarks: item.remarks || '',
          dateReceivedFrom: item.dateReceivedFrom || '',
          dateReceivedTo: item.dateReceivedTo || ''
        });
      } else if (activeTab === 'grievance') {
        setFormData({
          caseNo: item.caseNo || '',
          projectId: item.project?.projectId || '',
          investmentTypeId: item.investmentType?.id || '',
          sex: item.sex || '',
          dateClaimReceived: item.dateClaimReceived || '',
          personReceivingComplaint: item.personReceivingComplaint || '',
          howComplaintReceived: item.howComplaintReceived || '',
          nameOfComplainant: item.nameOfComplainant || '',
          phoneNumber: item.phoneNumber || '',
          complaintContent: item.complaintContent || '',
          complaintAcknowledged: item.complaintAcknowledged || '',
          expectedDecisionDate: item.expectedDecisionDate || '',
          decisionOutcomeId: item.decisionOutcome?.id || '',
          resolution: item.resolution || '',
          decisionCommunicated: item.decisionCommunicated || '',
          communicationMethod: item.communicationMethod || '',
          complainantSatisfied: item.complainantSatisfied || '',
          briefNoteNoAnswer: item.briefNoteNoAnswer || '',
          followUpActions: item.followUpActions || ''
        });
      } else if (activeTab === 'ohs') {
        setFormData({
          projectId: item.project?.projectId || '',
          investmentTypeId: item.investmentType?.id || '',
          yearId: item.year?.id || '',
          quarterId: item.quarter?.id || '',
          monitoringDate: item.monitoringDate || '',
          regionCode: item.region?.regionCode || '',
          districtCode: item.district?.districtCode || '',
          settlementCode: item.settlement?.settlementCode || '',
          qualityAtEntryRequirement: item.qualityAtEntryRequirement || '',
          workingEnvironment: item.workingEnvironment || '',
          remarks: item.remarks || '',
          male: item.male ?? '',
          female: item.female ?? '',
          youthMale: item.youthMale ?? '',
          youthFemale: item.youthFemale ?? '',
          kpiDescriptionId: item.kpiDescription?.id || '',
          picture: item.picture || ''
        });
      } else if (activeTab === 'engagement') {
        setFormData({
          referenceNumber: item.referenceNumber || '',
          projectId: item.project?.projectId || '',
          yearId: item.year?.id || '',
          placeOfEvent: item.placeOfEvent || '',
          dateOfConsultation: item.dateOfConsultation || '',
          male: item.male ?? '',
          female: item.female ?? '',
          totalParticipants: item.totalParticipants ?? '',
          engagementTypeId: item.engagementType?.id || '',
          keyIssuesDiscussed: item.keyIssuesDiscussed || '',
          followUpActions: item.followUpActions || '',
          picture: item.picture || ''
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
          electricityFeederId: '',
          impactLatitude: '',
          impactLongitude: '',
          compensationTypeId: '',
          compensationCurrencyId: '',
          compensationCashAmount: '',
          compensationLandArea: '',
          regionCode: '',
          districtCode: '',
          sex: '',
          papTypeId: '',
          papCategoryId: '',
          vulnerabilityCategoryId: '',
          papCompensated: '',
          papIdentificationNumber: '',
          profileYearId: '',
          identificationDocumentId: '',
          idDocumentUpload: '',
          settlementCode: '',
          remarks: '',
          dateReceivedFrom: '',
          dateReceivedTo: ''
        });
      } else if (activeTab === 'grievance') {
        setFormData({
          caseNo: '',
          projectId: pid,
          investmentTypeId: '',
          sex: '',
          dateClaimReceived: '',
          personReceivingComplaint: '',
          howComplaintReceived: '',
          nameOfComplainant: '',
          phoneNumber: '',
          complaintContent: '',
          complaintAcknowledged: '',
          expectedDecisionDate: '',
          decisionOutcomeId: '',
          resolution: '',
          decisionCommunicated: '',
          communicationMethod: '',
          complainantSatisfied: '',
          briefNoteNoAnswer: '',
          followUpActions: ''
        });
      } else if (activeTab === 'ohs') {
        setFormData({
          projectId: pid,
          investmentTypeId: '',
          yearId: '',
          quarterId: '',
          monitoringDate: '',
          regionCode: '',
          districtCode: '',
          settlementCode: '',
          qualityAtEntryRequirement: '',
          workingEnvironment: '',
          remarks: '',
          male: '',
          female: '',
          youthMale: '',
          youthFemale: '',
          kpiDescriptionId: '',
          picture: ''
        });
      } else if (activeTab === 'engagement') {
        setFormData({
          referenceNumber: '',
          projectId: pid,
          yearId: '',
          placeOfEvent: '',
          dateOfConsultation: '',
          male: '',
          female: '',
          totalParticipants: '',
          engagementTypeId: '',
          keyIssuesDiscussed: '',
          followUpActions: '',
          picture: ''
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


  const filteredSettlements = useMemo(() => {
    if (!formData.districtCode) return [];
    return settlements.filter(s => s.ward?.district?.districtCode === formData.districtCode);
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
      electricityFeeder: formData.electricityFeederId ? { id: parseInt(formData.electricityFeederId) } : null,
      impactLatitude: formData.impactLatitude ? parseFloat(formData.impactLatitude) : null,
      impactLongitude: formData.impactLongitude ? parseFloat(formData.impactLongitude) : null,
      compensationType: formData.compensationTypeId ? { id: parseInt(formData.compensationTypeId) } : null,
      compensationCurrency: formData.compensationCurrencyId ? { id: parseInt(formData.compensationCurrencyId) } : null,
      compensationCashAmount: formData.compensationCashAmount ? parseFloat(formData.compensationCashAmount) : null,
      compensationLandArea: formData.compensationLandArea ? parseFloat(formData.compensationLandArea) : null,
      region: formData.regionCode ? { regionCode: formData.regionCode } : null,
      district: formData.districtCode ? { districtCode: formData.districtCode } : null,
      sex: formData.sex || null,
      papType: formData.papTypeId ? { id: parseInt(formData.papTypeId) } : null,
      papCategory: formData.papCategoryId ? { id: parseInt(formData.papCategoryId) } : null,
      vulnerabilityCategory: formData.vulnerabilityCategoryId ? { id: parseInt(formData.vulnerabilityCategoryId) } : null,
      papCompensated: formData.papCompensated || null,
      profileYear: formData.profileYearId ? { id: parseInt(formData.profileYearId) } : null,
      identificationDocument: formData.identificationDocumentId ? { id: parseInt(formData.identificationDocumentId) } : null,
      idDocumentUpload: formData.idDocumentUpload || null,
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

  const handleSubmitGrievance = async (e) => {
    e.preventDefault();
    const payload = {
      caseNo: formData.caseNo,
      project: formData.projectId ? { projectId: formData.projectId } : null,
      investmentType: formData.investmentTypeId ? { id: parseInt(formData.investmentTypeId) } : null,
      sex: formData.sex || null,
      dateClaimReceived: formData.dateClaimReceived || null,
      personReceivingComplaint: formData.personReceivingComplaint || null,
      howComplaintReceived: formData.howComplaintReceived || null,
      nameOfComplainant: formData.nameOfComplainant || null,
      phoneNumber: formData.phoneNumber || null,
      complaintContent: formData.complaintContent || null,
      complaintAcknowledged: formData.complaintAcknowledged || null,
      expectedDecisionDate: formData.expectedDecisionDate || null,
      decisionOutcome: formData.decisionOutcomeId ? { id: parseInt(formData.decisionOutcomeId) } : null,
      resolution: formData.resolution || null,
      decisionCommunicated: formData.decisionCommunicated || null,
      communicationMethod: formData.communicationMethod || null,
      complainantSatisfied: formData.complainantSatisfied || null,
      briefNoteNoAnswer: formData.briefNoteNoAnswer || null,
      followUpActions: formData.followUpActions || null
    };

    try {
      if (editingItem) {
        await axios.put(`/api/social-environmental/grievance/${editingItem.caseNo}`, payload);
        toast.success(t('socialEnvironmental.grievanceUpdated'));
      } else {
        await axios.post('/api/social-environmental/grievance', payload);
        toast.success(t('socialEnvironmental.grievanceCreated'));
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error saving grievance:', error);
      const msg = error.response?.data?.message || t('common.error');
      toast.error(msg);
    }
  };

  const handleDeleteGrievance = async (caseNo) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      await axios.delete(`/api/social-environmental/grievance/${caseNo}`);
      toast.success(t('socialEnvironmental.grievanceDeleted'));
      loadData();
    } catch (error) {
      console.error('Error deleting grievance:', error);
      const msg = error.response?.data?.message || t('common.error');
      toast.error(msg);
    }
  };

  const handleSubmitOHS = async (e) => {
    e.preventDefault();
    const payload = {
      project: formData.projectId ? { projectId: formData.projectId } : null,
      investmentType: formData.investmentTypeId ? { id: parseInt(formData.investmentTypeId) } : null,
      year: formData.yearId ? { id: parseInt(formData.yearId) } : null,
      quarter: formData.quarterId ? { id: parseInt(formData.quarterId) } : null,
      monitoringDate: formData.monitoringDate || null,
      region: formData.regionCode ? { regionCode: formData.regionCode } : null,
      district: formData.districtCode ? { districtCode: formData.districtCode } : null,
      settlement: formData.settlementCode ? { settlementCode: formData.settlementCode } : null,
      qualityAtEntryRequirement: formData.qualityAtEntryRequirement || null,
      workingEnvironment: formData.workingEnvironment || null,
      remarks: formData.remarks || null,
      male: formData.male !== '' ? parseInt(formData.male) : null,
      female: formData.female !== '' ? parseInt(formData.female) : null,
      youthMale: formData.youthMale !== '' ? parseInt(formData.youthMale) : null,
      youthFemale: formData.youthFemale !== '' ? parseInt(formData.youthFemale) : null,
      kpiDescription: formData.kpiDescriptionId ? { id: parseInt(formData.kpiDescriptionId) } : null,
      picture: formData.picture || null
    };

    try {
      if (editingItem) {
        await axios.put(`/api/social-environmental/ohs/${editingItem.id}`, payload);
        toast.success(t('socialEnvironmental.ohsUpdated'));
      } else {
        await axios.post('/api/social-environmental/ohs', payload);
        toast.success(t('socialEnvironmental.ohsCreated'));
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error saving OHS:', error);
      const msg = error.response?.data?.message || t('common.error');
      toast.error(msg);
    }
  };

  const handleDeleteOHS = async (id) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      await axios.delete(`/api/social-environmental/ohs/${id}`);
      toast.success(t('socialEnvironmental.ohsDeleted'));
      loadData();
    } catch (error) {
      console.error('Error deleting OHS:', error);
      const msg = error.response?.data?.message || t('common.error');
      toast.error(msg);
    }
  };

  const handleSubmitEngagement = async (e) => {
    e.preventDefault();
    const payload = {
      referenceNumber: formData.referenceNumber || null,
      project: formData.projectId ? { projectId: formData.projectId } : null,
      year: formData.yearId ? { id: parseInt(formData.yearId) } : null,
      placeOfEvent: formData.placeOfEvent || null,
      dateOfConsultation: formData.dateOfConsultation || null,
      male: formData.male !== '' ? parseInt(formData.male) : null,
      female: formData.female !== '' ? parseInt(formData.female) : null,
      totalParticipants: formData.totalParticipants !== '' ? parseInt(formData.totalParticipants) : null,
      engagementType: formData.engagementTypeId ? { id: parseInt(formData.engagementTypeId) } : null,
      keyIssuesDiscussed: formData.keyIssuesDiscussed || null,
      followUpActions: formData.followUpActions || null,
      picture: formData.picture || null
    };

    try {
      if (editingItem) {
        await axios.put(`/api/social-environmental/community-engagement/${editingItem.referenceNumber}`, payload);
        toast.success(t('socialEnvironmental.engagementUpdated'));
      } else {
        await axios.post('/api/social-environmental/community-engagement', payload);
        toast.success(t('socialEnvironmental.engagementCreated'));
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error saving engagement:', error);
      const msg = error.response?.data?.message || t('common.error');
      toast.error(msg);
    }
  };

  const handleDeleteEngagement = async (refNumber) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      await axios.delete(`/api/social-environmental/community-engagement/${refNumber}`);
      toast.success(t('socialEnvironmental.engagementDeleted'));
      loadData();
    } catch (error) {
      console.error('Error deleting engagement:', error);
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

  const renderPAPViewModal = () => {
    if (!viewingPAP) return null;
    const p = viewingPAP;
    const field = (label, value) => (
      <div className="col-6 col-lg-4 mb-2">
        <div className="text-muted" style={{fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600}}>{label}</div>
        <div style={{fontSize: '0.78rem', fontWeight: 500}}>{value || '-'}</div>
      </div>
    );
    return (
      <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060}} onClick={() => setViewingPAP(null)}>
        <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header py-2">
              <h6 className="modal-title" style={{fontSize: '0.85rem'}}>{t('socialEnvironmental.papDetails')} — {p.papIdentificationNumber}</h6>
              <button type="button" className="btn-close btn-close-sm" onClick={() => setViewingPAP(null)}></button>
            </div>
            <div className="modal-body py-2">
              <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f8f9ff'}}>
                <h6 className="text-primary mb-2" style={{fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase'}}>{t('common.project')} & {t('socialEnvironmental.location')}</h6>
                <div className="row g-1">
                  {field(t('socialEnvironmental.papId'), p.papIdentificationNumber)}
                  {field(t('common.project'), p.project?.project)}
                  {field(t('socialEnvironmental.electricityFeeder'), p.electricityFeeder?.feeder)}
                  {field(t('setup.regions'), p.region?.regionName)}
                  {field(t('setup.districts'), p.district?.districtName)}
                  {field(t('socialEnvironmental.settlement'), p.currentAddress?.settlementName)}
                  {field(t('socialEnvironmental.latitude'), p.impactLatitude)}
                  {field(t('socialEnvironmental.longitude'), p.impactLongitude)}
                </div>
              </div>
              <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f8fff8'}}>
                <h6 className="text-success mb-2" style={{fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase'}}>{t('socialEnvironmental.pap')}</h6>
                <div className="row g-1">
                  {field(t('socialEnvironmental.papName'), p.papName)}
                  {field(t('socialEnvironmental.sex'), p.sex === 'M' ? t('socialEnvironmental.male') : p.sex === 'F' ? t('socialEnvironmental.female') : '-')}
                  {field(t('socialEnvironmental.papType'), p.papType?.typeOfPap)}
                  {field(t('socialEnvironmental.papCategory'), p.papCategory?.papCategory)}
                  {field(t('socialEnvironmental.vulnerabilityStatus'), p.vulnerabilityCategory?.vulnerability)}
                  {field(t('socialEnvironmental.profileYear'), p.profileYear?.profileYear)}
                  {field(t('socialEnvironmental.identificationDocument'), p.identificationDocument?.identityDocument)}
                </div>
              </div>
              <div className="border rounded p-2 mb-2" style={{backgroundColor: '#fff8f0'}}>
                <h6 className="text-warning mb-2" style={{fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase'}}>{t('socialEnvironmental.compensation')}</h6>
                <div className="row g-1">
                  {field(t('socialEnvironmental.compensated'), p.papCompensated === 'Y' ? t('common.yes') : t('common.no'))}
                  {field(t('socialEnvironmental.compensationType'), p.compensationType?.natureOfSettlement)}
                  {field(t('socialEnvironmental.compensationCurrency'), p.compensationCurrency?.currency)}
                  {field(t('socialEnvironmental.compensationCashAmount'), p.compensationCashAmount)}
                  {field(t('socialEnvironmental.compensationLandArea'), p.compensationLandArea ? `${p.compensationLandArea} m²` : null)}
                  {field(t('socialEnvironmental.natureOfCompensation'), p.natureOfCompensation?.natureOfSettlement)}
                  {field(t('socialEnvironmental.amount'), p.amount)}
                  {field(t('socialEnvironmental.area'), p.area)}
                  {field(t('socialEnvironmental.compensationDate'), p.compensationDate)}
                  {field(t('socialEnvironmental.compensationRefNo'), p.compensationRefNo)}
                </div>
              </div>
              <div className="border rounded p-2 mb-2" style={{backgroundColor: '#fdf8ff'}}>
                <h6 className="text-info mb-2" style={{fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase'}}>{t('socialEnvironmental.otherDetails')}</h6>
                <div className="row g-1">
                  {field(t('socialEnvironmental.impactType'), p.impactType?.typeOfImpact)}
                  {field(t('socialEnvironmental.locationOfImpact'), p.locationOfImpact)}
                  {field(t('socialEnvironmental.dateReceivedFrom'), p.dateReceivedFrom)}
                  {field(t('socialEnvironmental.dateReceivedTo'), p.dateReceivedTo)}
                  {field(t('socialEnvironmental.preProjectSituation'), p.preProjectSituation)}
                  {field(t('socialEnvironmental.remarks'), p.remarks)}
                </div>
              </div>
              {p.idDocumentUpload && (
                <div className="border rounded p-2 mb-2">
                  <h6 className="mb-1" style={{fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase'}}>{t('socialEnvironmental.attachIdDocument')}</h6>
                  {p.idDocumentUpload.match(/\.pdf$/i) ? (
                    <a href={p.idDocumentUpload} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info"><FiFileText size={13} className="me-1" />{t('socialEnvironmental.viewDocument')}</a>
                  ) : (
                    <a href={p.idDocumentUpload} target="_blank" rel="noopener noreferrer"><img src={p.idDocumentUpload} alt="ID" style={{maxHeight: 80, borderRadius: 4, border: '1px solid #dee2e6'}} /></a>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer py-1">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setViewingPAP(null)}>{t('common.close')}</button>
              <button type="button" className="btn btn-sm btn-primary" onClick={() => { setViewingPAP(null); handleOpenModal(p); }}><FiEdit2 size={13} className="me-1" />{t('common.edit')}</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPAPTable = () => (
    <div className="table-responsive">
      <table className="table table-striped table-hover table-bordered mb-0" style={{fontSize: '0.7rem'}}>
        <thead className="table-dark" style={{fontSize: '0.65rem'}}>
          <tr>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.papId')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('common.project')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.electricityFeeder')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('setup.regions')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('setup.districts')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.settlement')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.papName')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.sex')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.papType')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.papCategory')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.vulnerabilityStatus')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.compensated')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.compensationType')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.compensationCurrency')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.compensationCashAmount')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.compensationLandArea')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.profileYear')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.identificationDocument')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.latitude')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.longitude')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.dateReceivedFrom')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.dateReceivedTo')}</th>
            <th style={{whiteSpace:'nowrap'}}>{t('socialEnvironmental.remarks')}</th>
            <th style={{whiteSpace:'nowrap', position:'sticky', right:0, backgroundColor:'#212529', zIndex:1}}>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {pap.length === 0 ? (
            <tr><td colSpan="24" className="text-center text-muted">{t('table.noData')}</td></tr>
          ) : (
            pap.map((item) => (
              <tr key={item.papIdentificationNumber}>
                <td style={{whiteSpace:'nowrap'}}><strong>{item.papIdentificationNumber}</strong></td>
                <td style={{whiteSpace:'nowrap'}}>{item.project?.project || '-'}</td>
                <td style={{whiteSpace:'nowrap'}}>{item.electricityFeeder?.feeder || '-'}</td>
                <td style={{whiteSpace:'nowrap'}}>{item.region?.regionName || '-'}</td>
                <td style={{whiteSpace:'nowrap'}}>{item.district?.districtName || '-'}</td>
                <td style={{whiteSpace:'nowrap'}}>{item.currentAddress?.settlementName || '-'}</td>
                <td style={{whiteSpace:'nowrap'}}>{item.papName || '-'}</td>
                <td>{item.sex || '-'}</td>
                <td style={{whiteSpace:'nowrap'}}>{item.papType?.typeOfPap || '-'}</td>
                <td style={{whiteSpace:'nowrap'}}>{item.papCategory?.papCategory || '-'}</td>
                <td style={{whiteSpace:'nowrap'}}>{item.vulnerabilityCategory?.vulnerability || '-'}</td>
                <td>
                  <span className={`badge bg-${item.papCompensated === 'Y' ? 'success' : 'warning'}`} style={{fontSize: '0.65rem'}}>
                    {item.papCompensated === 'Y' ? t('common.yes') : t('common.no')}
                  </span>
                </td>
                <td style={{whiteSpace:'nowrap'}}>{item.compensationType?.natureOfSettlement || '-'}</td>
                <td style={{whiteSpace:'nowrap'}}>{item.compensationCurrency?.currency || '-'}</td>
                <td style={{whiteSpace:'nowrap'}}>{item.compensationCashAmount || '-'}</td>
                <td style={{whiteSpace:'nowrap'}}>{item.compensationLandArea ? `${item.compensationLandArea} m²` : '-'}</td>
                <td style={{whiteSpace:'nowrap'}}>{item.profileYear?.profileYear || '-'}</td>
                <td style={{whiteSpace:'nowrap'}}>{item.identificationDocument?.identityDocument || '-'}</td>
                <td>{item.impactLatitude || '-'}</td>
                <td>{item.impactLongitude || '-'}</td>
                <td style={{whiteSpace:'nowrap'}}>{item.dateReceivedFrom || '-'}</td>
                <td style={{whiteSpace:'nowrap'}}>{item.dateReceivedTo || '-'}</td>
                <td style={{maxWidth:'120px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.remarks || '-'}</td>
                <td style={{whiteSpace:'nowrap', position:'sticky', right:0, backgroundColor:'inherit', zIndex:1}}>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-info py-0 px-1" onClick={() => setViewingPAP(item)} title={t('common.view')}><FiEye size={12} /></button>
                    <button className="btn btn-sm btn-outline-primary py-0 px-1" onClick={() => handleOpenModal(item)} title={t('common.edit')}><FiEdit2 size={12} /></button>
                    <button className="btn btn-sm btn-outline-danger py-0 px-1" onClick={() => handleDeletePAP(item.papIdentificationNumber)} title={t('common.delete')}><FiTrash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderGrievanceTable = () => (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>{t('socialEnvironmental.caseNo')}</th>
            <th>{t('common.project')}</th>
            <th>{t('socialEnvironmental.typeOfInvestment')}</th>
            <th>{t('socialEnvironmental.complainant')}</th>
            <th>{t('socialEnvironmental.sex')}</th>
            <th>{t('socialEnvironmental.dateReceived')}</th>
            <th>{t('socialEnvironmental.howComplaintReceived')}</th>
            <th>{t('socialEnvironmental.decisionOutcome')}</th>
            <th>{t('socialEnvironmental.complainantSatisfied')}</th>
            <th>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {grievances.length === 0 ? (
            <tr><td colSpan="10" className="text-center text-muted">{t('table.noData')}</td></tr>
          ) : (
            grievances.map((item) => (
              <tr key={item.caseNo}>
                <td><strong>{item.caseNo}</strong></td>
                <td>{item.project?.project || '-'}</td>
                <td>{item.investmentType?.typeOfInvestment || '-'}</td>
                <td>{item.nameOfComplainant || '-'}</td>
                <td>{item.sex || '-'}</td>
                <td>{item.dateClaimReceived || '-'}</td>
                <td>{item.howComplaintReceived || '-'}</td>
                <td>{item.decisionOutcome?.outcome || '-'}</td>
                <td>
                  <span className={`badge bg-${item.complainantSatisfied === 'Y' ? 'success' : 'danger'}`}>
                    {item.complainantSatisfied === 'Y' ? t('common.yes') : t('common.no')}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleOpenModal(item)}><FiEdit2 /></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteGrievance(item.caseNo)}><FiTrash2 /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderOHSTable = () => (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>{t('common.project')}</th>
            <th>{t('socialEnvironmental.typeOfInvestment')}</th>
            <th>{t('socialEnvironmental.monitoringDate')}</th>
            <th>{t('setup.regions')}</th>
            <th>{t('setup.districts')}</th>
            <th>{t('socialEnvironmental.male')}</th>
            <th>{t('socialEnvironmental.female')}</th>
            <th>{t('socialEnvironmental.youthMale')}</th>
            <th>{t('socialEnvironmental.youthFemale')}</th>
            <th>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {ohs.length === 0 ? (
            <tr><td colSpan="11" className="text-center text-muted">{t('table.noData')}</td></tr>
          ) : (
            ohs.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.id}</strong></td>
                <td>{item.project?.project || '-'}</td>
                <td>{item.investmentType?.typeOfInvestment || '-'}</td>
                <td>{item.monitoringDate || '-'}</td>
                <td>{item.region?.regionName || '-'}</td>
                <td>{item.district?.districtName || '-'}</td>
                <td>{item.male ?? '-'}</td>
                <td>{item.female ?? '-'}</td>
                <td>{item.youthMale ?? '-'}</td>
                <td>{item.youthFemale ?? '-'}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleOpenModal(item)}><FiEdit2 /></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteOHS(item.id)}><FiTrash2 /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderEngagementTable = () => (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>{t('socialEnvironmental.reference')}</th>
            <th>{t('common.project')}</th>
            <th>{t('socialEnvironmental.place')}</th>
            <th>{t('common.date')}</th>
            <th>{t('socialEnvironmental.engagementType')}</th>
            <th>{t('socialEnvironmental.male')}</th>
            <th>{t('socialEnvironmental.female')}</th>
            <th>{t('common.total')}</th>
            <th>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {engagements.length === 0 ? (
            <tr><td colSpan="9" className="text-center text-muted">{t('table.noData')}</td></tr>
          ) : (
            engagements.map((item) => (
              <tr key={item.referenceNumber}>
                <td><strong>{item.referenceNumber}</strong></td>
                <td>{item.project?.project || '-'}</td>
                <td>{item.placeOfEvent || '-'}</td>
                <td>{item.dateOfConsultation || '-'}</td>
                <td>{item.engagementType?.engagementType || '-'}</td>
                <td>{item.male ?? '-'}</td>
                <td>{item.female ?? '-'}</td>
                <td>{item.totalParticipants ?? '-'}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleOpenModal(item)}><FiEdit2 /></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteEngagement(item.referenceNumber)}><FiTrash2 /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

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
      <div className="row g-2">
        <div className="col-md-6">
          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f8f9ff'}}>
            <h6 className="text-primary mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('common.project')}</h6>
            <div className="row g-2">
              <div className="col-12">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('common.project')} *</label>
                <select className="form-select form-select-sm" name="projectId" value={formData.projectId || ''} onChange={handleChange} required>
                  <option value="">{t('common.select')}</option>
                  {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.electricityFeeder')}</label>
                <select className="form-select form-select-sm" name="electricityFeederId" value={formData.electricityFeederId || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  {electricityFeeders.map(ef => <option key={ef.id} value={ef.id}>{ef.feeder}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f0f8ff'}}>
            <h6 className="text-primary mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('socialEnvironmental.geolocationOfImpact')}</h6>
            <div className="row g-2 align-items-end">
              <div className="col-5">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.latitude')}</label>
                <input type="number" step="any" className="form-control form-control-sm" name="impactLatitude" value={formData.impactLatitude || ''} onChange={handleChange} placeholder="e.g. -6.7924" />
              </div>
              <div className="col-5">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.longitude')}</label>
                <input type="number" step="any" className="form-control form-control-sm" name="impactLongitude" value={formData.impactLongitude || ''} onChange={handleChange} placeholder="e.g. 39.2083" />
              </div>
              <div className="col-2">
                <button type="button" className="btn btn-sm btn-outline-primary w-100" title={t('socialEnvironmental.useCurrentLocation')} onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => { setFormData(prev => ({ ...prev, impactLatitude: pos.coords.latitude.toFixed(6), impactLongitude: pos.coords.longitude.toFixed(6) })); toast.success(t('socialEnvironmental.locationCaptured')); },
                      (err) => { toast.error(t('socialEnvironmental.locationFailed')); console.error(err); },
                      { enableHighAccuracy: true, timeout: 10000 }
                    );
                  } else { toast.error(t('socialEnvironmental.geolocationNotSupported')); }
                }}>
                  <FiMapPin size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#fff8f0'}}>
            <h6 className="text-warning mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('socialEnvironmental.location')}</h6>
            <div className="row g-2">
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('setup.regions')}</label>
                <select className="form-select form-select-sm" name="regionCode" value={formData.regionCode || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  {regions.map(r => <option key={r.regionCode} value={r.regionCode}>{r.regionName}</option>)}
                </select>
              </div>
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('setup.districts')}</label>
                <select className="form-select form-select-sm" name="districtCode" value={formData.districtCode || ''} onChange={handleChange} disabled={!formData.regionCode}>
                  <option value="">{formData.regionCode ? t('common.select') : '--'}</option>
                  {filteredDistricts.map(d => <option key={d.districtCode} value={d.districtCode}>{d.districtName}</option>)}
                </select>
              </div>
              <div className="col-12 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.settlement')}</label>
                <select className="form-select form-select-sm" name="settlementCode" value={formData.settlementCode || ''} onChange={handleChange} disabled={!formData.districtCode}>
                  <option value="">{formData.districtCode ? t('common.select') : '--'}</option>
                  {filteredSettlements.map(s => <option key={s.settlementCode} value={s.settlementCode}>{s.settlementName}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f9f9f9'}}>
            <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.remarks')}</label>
            <textarea className="form-control form-control-sm" name="remarks" rows="2" value={formData.remarks || ''} onChange={handleChange} placeholder={t('socialEnvironmental.remarks')}></textarea>
          </div>
        </div>

        <div className="col-md-6">
          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f8fff8'}}>
            <h6 className="text-success mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('socialEnvironmental.pap')}</h6>
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.papId')} *</label>
                <input type="text" className="form-control form-control-sm" name="papIdentificationNumber" value={formData.papIdentificationNumber || ''} onChange={handleChange} required disabled={!!editingItem} placeholder="e.g. PAP-001" />
              </div>
              <div className="col-6">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.sex')}</label>
                <select className="form-select form-select-sm" name="sex" value={formData.sex || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  <option value="M">{t('socialEnvironmental.male')}</option>
                  <option value="F">{t('socialEnvironmental.female')}</option>
                </select>
              </div>
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.papType')}</label>
                <select className="form-select form-select-sm" name="papTypeId" value={formData.papTypeId || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  {papTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.typeOfPap}</option>)}
                </select>
              </div>
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.papCategory')}</label>
                <select className="form-select form-select-sm" name="papCategoryId" value={formData.papCategoryId || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  {papCategories.map(pc => <option key={pc.id} value={pc.id}>{pc.papCategory}</option>)}
                </select>
              </div>
              <div className="col-12 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.vulnerabilityStatus')}</label>
                <select className="form-select form-select-sm" name="vulnerabilityCategoryId" value={formData.vulnerabilityCategoryId || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  {vulnerabilityCategories.map(vc => <option key={vc.id} value={vc.id}>{vc.vulnerability}</option>)}
                </select>
              </div>
              <div className="col-12 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.compensated')}</label>
                <select className="form-select form-select-sm" name="papCompensated" value={formData.papCompensated || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  <option value="Y">{t('common.yes')}</option>
                  <option value="N">{t('common.no')}</option>
                </select>
              </div>
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.compensationType')}</label>
                <select className="form-select form-select-sm" name="compensationTypeId" value={formData.compensationTypeId || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  {settlementNatures.map(sn => <option key={sn.id} value={sn.id}>{sn.natureOfSettlement}</option>)}
                </select>
              </div>
              {(() => {
                const selectedType = settlementNatures.find(sn => String(sn.id) === String(formData.compensationTypeId));
                const typeName = selectedType?.natureOfSettlement?.toLowerCase() || '';
                const showCurrency = typeName === 'cash' || typeName === 'cash and land';
                const showLand = typeName === 'land' || typeName === 'cash and land';
                return (<>
                  {showCurrency && (<>
                    <div className="col-6 col-lg-4">
                      <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.compensationCurrency')}</label>
                      <select className="form-select form-select-sm" name="compensationCurrencyId" value={formData.compensationCurrencyId || ''} onChange={handleChange}>
                        <option value="">{t('common.select')}</option>
                        {currencies.map(c => <option key={c.id} value={c.id}>{c.currency}</option>)}
                      </select>
                    </div>
                    <div className="col-6 col-lg-4">
                      <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.compensationCashAmount')}</label>
                      <input type="number" step="0.01" min="0" className="form-control form-control-sm" name="compensationCashAmount" value={formData.compensationCashAmount || ''} onChange={handleChange} placeholder="0.00" />
                    </div>
                  </>)}
                  {showLand && (
                    <div className="col-6 col-lg-4">
                      <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.compensationLandArea')} (m²)</label>
                      <input type="number" step="0.01" min="0" className="form-control form-control-sm" name="compensationLandArea" value={formData.compensationLandArea || ''} onChange={handleChange} placeholder="e.g. 500.00" />
                    </div>
                  )}
                </>);
              })()}
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.profileYear')}</label>
                <select className="form-select form-select-sm" name="profileYearId" value={formData.profileYearId || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  {years.map(y => <option key={y.id} value={y.id}>{y.profileYear}</option>)}
                </select>
              </div>
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.identificationDocument')}</label>
                <select className="form-select form-select-sm" name="identificationDocumentId" value={formData.identificationDocumentId || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  {identificationDocuments.map(d => <option key={d.id} value={d.id}>{d.identityDocument}</option>)}
                </select>
              </div>
              <div className="col-12 col-lg-8">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.attachIdDocument')}</label>
                <input type="file" ref={idDocInputRef} accept="image/*,application/pdf" onChange={handleIdDocUpload} className="d-none" />
                {formData.idDocumentUpload ? (
                  <div className="d-flex align-items-center gap-2">
                    {formData.idDocumentUpload.match(/\.(pdf)$/i) ? (
                      <a href={formData.idDocumentUpload} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info">
                        <FiFileText size={13} className="me-1" />{t('socialEnvironmental.viewDocument')}
                      </a>
                    ) : (
                      <a href={formData.idDocumentUpload} target="_blank" rel="noopener noreferrer">
                        <img src={formData.idDocumentUpload} alt="ID Doc" style={{maxHeight: 40, maxWidth: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #dee2e6'}} />
                      </a>
                    )}
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleRemoveIdDoc}><FiTrash2 size={13} /></button>
                  </div>
                ) : (
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => idDocInputRef.current?.click()} disabled={idDocUploading}>
                    <FiUpload size={13} className="me-1" />{idDocUploading ? t('socialEnvironmental.uploading') : t('socialEnvironmental.browseFiles')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#fdf8ff'}}>
            <h6 className="text-info mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('socialEnvironmental.dateReceived')}</h6>
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.dateReceivedFrom')}</label>
                <input type="date" className="form-control form-control-sm" name="dateReceivedFrom" value={formData.dateReceivedFrom || ''} onChange={handleChange} />
              </div>
              <div className="col-6">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.dateReceivedTo')}</label>
                <input type="date" className="form-control form-control-sm" name="dateReceivedTo" value={formData.dateReceivedTo || ''} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-footer mt-2 px-0 pt-2">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleCloseModal}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn btn-sm btn-primary">
          {editingItem ? t('common.update') : t('common.save')}
        </button>
      </div>
    </form>
  );

  const renderGrievanceForm = () => (
    <form onSubmit={handleSubmitGrievance}>
      <div className="row g-2">
        <div className="col-md-6">
          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f8f9ff'}}>
            <h6 className="text-primary mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('common.project')}</h6>
            <div className="row g-2">
              <div className="col-12 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.caseNo')} *</label>
                <input type="text" className="form-control form-control-sm" name="caseNo" value={formData.caseNo || ''} onChange={handleChange} required disabled={!!editingItem} maxLength="15" placeholder="e.g. GRV-001" />
              </div>
              <div className="col-12 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('common.project')} *</label>
                <select className="form-select form-select-sm" name="projectId" value={formData.projectId || ''} onChange={handleChange} required>
                  <option value="">{t('common.select')}</option>
                  {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                </select>
              </div>
              <div className="col-12 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.typeOfInvestment')}</label>
                <select className="form-select form-select-sm" name="investmentTypeId" value={formData.investmentTypeId || ''} onChange={handleChange} disabled={!formData.projectId}>
                  <option value="">{formData.projectId ? t('common.select') : '--'}</option>
                  {filteredInvestmentTypes.map(it => <option key={it.id} value={it.id}>{it.typeOfInvestment}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f8fff8'}}>
            <h6 className="text-success mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('socialEnvironmental.complaintDetails')}</h6>
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.complainant')} *</label>
                <input type="text" className="form-control form-control-sm" name="nameOfComplainant" value={formData.nameOfComplainant || ''} onChange={handleChange} required maxLength="150" />
              </div>
              <div className="col-3">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.sex')}</label>
                <select className="form-select form-select-sm" name="sex" value={formData.sex || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  <option value="M">{t('socialEnvironmental.male')}</option>
                  <option value="F">{t('socialEnvironmental.female')}</option>
                </select>
              </div>
              <div className="col-3">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.phoneNumber')}</label>
                <input type="text" className="form-control form-control-sm" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} maxLength="20" />
              </div>
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.dateReceived')} *</label>
                <input type="date" className="form-control form-control-sm" name="dateClaimReceived" value={formData.dateClaimReceived || ''} onChange={handleChange} required />
              </div>
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.personReceivingComplaint')}</label>
                <input type="text" className="form-control form-control-sm" name="personReceivingComplaint" value={formData.personReceivingComplaint || ''} onChange={handleChange} maxLength="150" />
              </div>
              <div className="col-12 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.howComplaintReceived')}</label>
                <select className="form-select form-select-sm" name="howComplaintReceived" value={formData.howComplaintReceived || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  <option value="Call">{t('socialEnvironmental.phoneCall')}</option>
                  <option value="Email">{t('socialEnvironmental.email')}</option>
                  <option value="Letter">{t('socialEnvironmental.letter')}</option>
                  <option value="In Person">{t('socialEnvironmental.inPerson')}</option>
                  <option value="SMS">{t('socialEnvironmental.sms')}</option>
                  <option value="WhatsApp">{t('socialEnvironmental.whatsApp')}</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.complaintContent')} *</label>
                <textarea className="form-control form-control-sm" name="complaintContent" rows="2" value={formData.complaintContent || ''} onChange={handleChange} required></textarea>
              </div>
              <div className="col-12 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.complaintAcknowledged')}</label>
                <select className="form-select form-select-sm" name="complaintAcknowledged" value={formData.complaintAcknowledged || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  <option value="Y">{t('common.yes')}</option>
                  <option value="N">{t('common.no')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#fff8f0'}}>
            <h6 className="text-warning mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('socialEnvironmental.decisionDetails')}</h6>
            <div className="row g-2">
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.expectedDecisionDate')}</label>
                <input type="date" className="form-control form-control-sm" name="expectedDecisionDate" value={formData.expectedDecisionDate || ''} onChange={handleChange} />
              </div>
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.decisionOutcome')}</label>
                <select className="form-select form-select-sm" name="decisionOutcomeId" value={formData.decisionOutcomeId || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  {decisionOutcomes.map(d => <option key={d.id} value={d.id}>{d.outcome}</option>)}
                </select>
              </div>
              <div className="col-12 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.resolution')}</label>
                <input type="text" className="form-control form-control-sm" name="resolution" value={formData.resolution || ''} onChange={handleChange} maxLength="300" />
              </div>
            </div>
          </div>

          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#fdf8ff'}}>
            <h6 className="text-info mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('socialEnvironmental.communicationDetails')}</h6>
            <div className="row g-2">
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.decisionCommunicated')}</label>
                <select className="form-select form-select-sm" name="decisionCommunicated" value={formData.decisionCommunicated || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  <option value="Y">{t('common.yes')}</option>
                  <option value="N">{t('common.no')}</option>
                </select>
              </div>
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.communicationMethod')}</label>
                <select className="form-select form-select-sm" name="communicationMethod" value={formData.communicationMethod || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  <option value="Call">{t('socialEnvironmental.phoneCall')}</option>
                  <option value="Email">{t('socialEnvironmental.email')}</option>
                  <option value="Letter">{t('socialEnvironmental.letter')}</option>
                  <option value="In Person">{t('socialEnvironmental.inPerson')}</option>
                  <option value="SMS">{t('socialEnvironmental.sms')}</option>
                  <option value="WhatsApp">{t('socialEnvironmental.whatsApp')}</option>
                </select>
              </div>
              <div className="col-12 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.complainantSatisfied')}</label>
                <select className="form-select form-select-sm" name="complainantSatisfied" value={formData.complainantSatisfied || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  <option value="Y">{t('common.yes')}</option>
                  <option value="N">{t('common.no')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f0f8ff'}}>
            <h6 className="mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6f42c1'}}>{t('socialEnvironmental.followUpActions')}</h6>
            <div className="row g-2">
              <div className="col-12">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.briefNoteNoAnswer')}</label>
                <textarea className="form-control form-control-sm" name="briefNoteNoAnswer" rows="2" value={formData.briefNoteNoAnswer || ''} onChange={handleChange}></textarea>
              </div>
              <div className="col-12">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.followUpActions')}</label>
                <textarea className="form-control form-control-sm" name="followUpActions" rows="2" value={formData.followUpActions || ''} onChange={handleChange}></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-footer mt-2 px-0 pt-2">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleCloseModal}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn btn-sm btn-primary">
          {editingItem ? t('common.update') : t('common.save')}
        </button>
      </div>
    </form>
  );

  const renderOHSForm = () => (
    <form onSubmit={handleSubmitOHS}>
      <div className="row g-2">
        <div className="col-md-6">
          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f8f9ff'}}>
            <h6 className="text-primary mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('socialEnvironmental.ohsProjectInfo')}</h6>
            <div className="row g-2">
              <div className="col-12">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('common.project')} *</label>
                <select className="form-select form-select-sm" name="projectId" value={formData.projectId || ''} onChange={handleChange} required>
                  <option value="">{t('common.select')}</option>
                  {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.typeOfInvestment')}</label>
                <select className="form-select form-select-sm" name="investmentTypeId" value={formData.investmentTypeId || ''} onChange={handleChange} disabled={!formData.projectId}>
                  <option value="">{formData.projectId ? t('common.select') : '-- Select project first --'}</option>
                  {filteredInvestmentTypes.map(it => <option key={it.id} value={it.id}>{it.typeOfInvestment}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f8fff8'}}>
            <h6 className="text-success mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('socialEnvironmental.ohsReportingPeriod')}</h6>
            <div className="row g-2">
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.yearOfReport')}</label>
                <select className="form-select form-select-sm" name="yearId" value={formData.yearId || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  {years.map(y => <option key={y.id} value={y.id}>{y.profileYear}</option>)}
                </select>
              </div>
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.reportFrequency')}</label>
                <select className="form-select form-select-sm" name="quarterId" value={formData.quarterId || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  {quarters.map(q => <option key={q.id} value={q.id}>{q.quarter}</option>)}
                </select>
              </div>
              <div className="col-12 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.monitoringDate')} *</label>
                <input type="date" className="form-control form-control-sm" name="monitoringDate" value={formData.monitoringDate || ''} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#fff8f0'}}>
            <h6 className="text-warning mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('socialEnvironmental.ohsLocationDetails')}</h6>
            <div className="row g-2">
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('setup.regions')}</label>
                <select className="form-select form-select-sm" name="regionCode" value={formData.regionCode || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  {regions.map(r => <option key={r.regionCode} value={r.regionCode}>{r.regionName}</option>)}
                </select>
              </div>
              <div className="col-6 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('setup.districts')}</label>
                <select className="form-select form-select-sm" name="districtCode" value={formData.districtCode || ''} onChange={handleChange} disabled={!formData.regionCode}>
                  <option value="">{formData.regionCode ? t('common.select') : '--'}</option>
                  {filteredDistricts.map(d => <option key={d.districtCode} value={d.districtCode}>{d.districtName}</option>)}
                </select>
              </div>
              <div className="col-12 col-lg-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.settlement')}</label>
                <select className="form-select form-select-sm" name="settlementCode" value={formData.settlementCode || ''} onChange={handleChange} disabled={!formData.districtCode}>
                  <option value="">{formData.districtCode ? t('common.select') : '--'}</option>
                  {filteredSettlements.map(s => <option key={s.settlementCode} value={s.settlementCode}>{s.settlementName}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f9f9f9'}}>
            <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.issuesRemarks')}</label>
            <textarea className="form-control form-control-sm" name="remarks" rows="2" value={formData.remarks || ''} onChange={handleChange}></textarea>
          </div>
        </div>

        <div className="col-md-6">
          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#fdf8ff'}}>
            <h6 className="text-info mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('socialEnvironmental.ohsAssessment')}</h6>
            <div className="row g-2">
              <div className="col-12">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.qualityAtEntry')}</label>
                <textarea className="form-control form-control-sm" name="qualityAtEntryRequirement" rows="2" value={formData.qualityAtEntryRequirement || ''} onChange={handleChange} placeholder={t('socialEnvironmental.qualityAtEntryHelp')}></textarea>
              </div>
              <div className="col-12">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.workingEnvironment')}</label>
                <textarea className="form-control form-control-sm" name="workingEnvironment" rows="2" value={formData.workingEnvironment || ''} onChange={handleChange}></textarea>
              </div>
              <div className="col-12">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.kpiDescription')}</label>
                <select className="form-select form-select-sm" name="kpiDescriptionId" value={formData.kpiDescriptionId || ''} onChange={handleChange} disabled={!formData.projectId}>
                  <option value="">{formData.projectId ? t('common.select') : '-- Select project first --'}</option>
                  {filteredInvestmentTypes.map(it => <option key={it.id} value={it.id}>{it.kpiDescription || it.typeOfInvestment}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f0f8ff'}}>
            <h6 className="mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6f42c1'}}>{t('socialEnvironmental.ohsWorkforce')}</h6>
            <div className="row g-2">
              <div className="col-6 col-lg-3">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.male')}</label>
                <input type="number" className="form-control form-control-sm" name="male" value={formData.male ?? ''} onChange={handleChange} min="0" />
              </div>
              <div className="col-6 col-lg-3">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.female')}</label>
                <input type="number" className="form-control form-control-sm" name="female" value={formData.female ?? ''} onChange={handleChange} min="0" />
              </div>
              <div className="col-6 col-lg-3">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.youthMale')}</label>
                <input type="number" className="form-control form-control-sm" name="youthMale" value={formData.youthMale ?? ''} onChange={handleChange} min="0" />
              </div>
              <div className="col-6 col-lg-3">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.youthFemale')}</label>
                <input type="number" className="form-control form-control-sm" name="youthFemale" value={formData.youthFemale ?? ''} onChange={handleChange} min="0" />
              </div>
            </div>
          </div>

          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f5f5f5'}}>
            <h6 className="text-secondary mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('socialEnvironmental.picture')}</h6>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="d-none" />
            <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleFileUpload} className="d-none" />
            {formData.picture ? (
              <div className="d-flex align-items-center gap-2">
                <img src={formData.picture} alt="OHS" className="rounded" style={{height: '60px', width: '60px', objectFit: 'cover'}} />
                <span className="text-success" style={{fontSize: '0.8rem'}}><FiImage className="me-1" />{t('socialEnvironmental.photoUploaded')}</span>
                <button type="button" className="btn btn-sm btn-outline-danger ms-auto p-1" onClick={handleRemovePicture}><FiX size={12} /></button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-sm btn-outline-primary flex-fill" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <FiUpload size={13} className="me-1" />{uploading ? t('socialEnvironmental.uploadingPhoto') : t('socialEnvironmental.browseFiles')}
                </button>
                <button type="button" className="btn btn-sm btn-outline-success" onClick={() => cameraInputRef.current?.click()} disabled={uploading}>
                  <FiCamera size={13} className="me-1" />{t('socialEnvironmental.takePhoto')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="modal-footer mt-2 px-0 pt-2">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleCloseModal}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn btn-sm btn-primary">
          {editingItem ? t('common.update') : t('common.save')}
        </button>
      </div>
    </form>
  );

  const renderEngagementForm = () => (
    <form onSubmit={handleSubmitEngagement}>
      <div className="row g-2">
        <div className="col-md-6">
          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f8f9ff'}}>
            <h6 className="text-primary mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('socialEnvironmental.engagementProjectInfo')}</h6>
            <div className="row g-2">
              <div className="col-12">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.reference')} *</label>
                <input type="text" className="form-control form-control-sm" name="referenceNumber" value={formData.referenceNumber || ''} onChange={handleChange} required maxLength={15} disabled={!!editingItem} />
              </div>
              <div className="col-12">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('common.project')} *</label>
                <select className="form-select form-select-sm" name="projectId" value={formData.projectId || ''} onChange={handleChange} required>
                  <option value="">{t('common.select')}</option>
                  {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.yearOfReport')}</label>
                <select className="form-select form-select-sm" name="yearId" value={formData.yearId || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  {years.map(y => <option key={y.id} value={y.id}>{y.profileYear}</option>)}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.engagementType')}</label>
                <select className="form-select form-select-sm" name="engagementTypeId" value={formData.engagementTypeId || ''} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  {engagementTypes.map(et => <option key={et.id} value={et.id}>{et.engagementType}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f8fff8'}}>
            <h6 className="text-success mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('socialEnvironmental.engagementEventDetails')}</h6>
            <div className="row g-2">
              <div className="col-12">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.place')}</label>
                <input type="text" className="form-control form-control-sm" name="placeOfEvent" value={formData.placeOfEvent || ''} onChange={handleChange} maxLength={100} />
              </div>
              <div className="col-12">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.dateOfConsultation')}</label>
                <input type="date" className="form-control form-control-sm" name="dateOfConsultation" value={formData.dateOfConsultation || ''} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f0f8ff'}}>
            <h6 className="mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6f42c1'}}>{t('socialEnvironmental.engagementParticipants')}</h6>
            <div className="row g-2">
              <div className="col-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.male')}</label>
                <input type="number" className="form-control form-control-sm" name="male" value={formData.male ?? ''} onChange={handleChange} min="0" />
              </div>
              <div className="col-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.female')}</label>
                <input type="number" className="form-control form-control-sm" name="female" value={formData.female ?? ''} onChange={handleChange} min="0" />
              </div>
              <div className="col-4">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('common.total')}</label>
                <input type="number" className="form-control form-control-sm" name="totalParticipants" value={formData.totalParticipants ?? ''} onChange={handleChange} min="0" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#fff8f0'}}>
            <h6 className="text-warning mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('socialEnvironmental.engagementDiscussion')}</h6>
            <div className="row g-2">
              <div className="col-12">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.keyIssuesDiscussed')}</label>
                <textarea className="form-control form-control-sm" name="keyIssuesDiscussed" rows="4" value={formData.keyIssuesDiscussed || ''} onChange={handleChange}></textarea>
              </div>
              <div className="col-12">
                <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('socialEnvironmental.followUpActions')}</label>
                <textarea className="form-control form-control-sm" name="followUpActions" rows="4" value={formData.followUpActions || ''} onChange={handleChange}></textarea>
              </div>
            </div>
          </div>

          <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f5f5f5'}}>
            <h6 className="text-secondary mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('socialEnvironmental.picture')}</h6>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="d-none" />
            <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleFileUpload} className="d-none" />
            {formData.picture ? (
              <div className="d-flex align-items-center gap-2">
                <img src={formData.picture} alt="Engagement" className="rounded" style={{height: '60px', width: '60px', objectFit: 'cover'}} />
                <span className="text-success" style={{fontSize: '0.8rem'}}><FiImage className="me-1" />{t('socialEnvironmental.photoUploaded')}</span>
                <button type="button" className="btn btn-sm btn-outline-danger ms-auto p-1" onClick={handleRemovePicture}><FiX size={12} /></button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-sm btn-outline-primary flex-fill" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <FiUpload size={13} className="me-1" />{uploading ? t('socialEnvironmental.uploadingPhoto') : t('socialEnvironmental.browseFiles')}
                </button>
                <button type="button" className="btn btn-sm btn-outline-success" onClick={() => cameraInputRef.current?.click()} disabled={uploading}>
                  <FiCamera size={13} className="me-1" />{t('socialEnvironmental.takePhoto')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="modal-footer mt-2 px-0 pt-2">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleCloseModal}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn btn-sm btn-primary">
          {editingItem ? t('common.update') : t('common.save')}
        </button>
      </div>
    </form>
  );

  const getModalTitle = () => {
    if (activeTab === 'esia') return editingItem ? t('socialEnvironmental.editESIA') : t('socialEnvironmental.addESIA');
    if (activeTab === 'pap') return editingItem ? t('socialEnvironmental.editPAP') : t('socialEnvironmental.addPAP');
    if (activeTab === 'grievance') return editingItem ? t('socialEnvironmental.editGrievance') : t('socialEnvironmental.addGrievance');
    if (activeTab === 'ohs') return editingItem ? t('socialEnvironmental.editOHS') : t('socialEnvironmental.addOHS');
    if (activeTab === 'engagement') return editingItem ? t('socialEnvironmental.editEngagement') : t('socialEnvironmental.addEngagement');
    return t('common.addNew');
  };

  const renderActiveTable = () => {
    if (loading) return <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>;
    if (activeTab === 'esia') return renderESIATable();
    if (activeTab === 'pap') return renderPAPTable();
    if (activeTab === 'grievance') return renderGrievanceTable();
    if (activeTab === 'ohs') return renderOHSTable();
    if (activeTab === 'engagement') return renderEngagementTable();
    return null;
  };

  const renderActiveForm = () => {
    if (activeTab === 'esia') return renderESIAForm();
    if (activeTab === 'pap') return renderPAPForm();
    if (activeTab === 'grievance') return renderGrievanceForm();
    if (activeTab === 'ohs') return renderOHSForm();
    if (activeTab === 'engagement') return renderEngagementForm();
    return null;
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

      {renderPAPViewModal()}

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className={`modal-dialog modal-dialog-scrollable ${activeTab === 'ohs' || activeTab === 'grievance' || activeTab === 'pap' || activeTab === 'engagement' ? 'modal-xl modal-fullscreen-md-down' : 'modal-lg modal-fullscreen-sm-down'}`}>
            <div className="modal-content">
              <div className="modal-header py-2">
                <h6 className="modal-title mb-0">{getModalTitle()}</h6>
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
