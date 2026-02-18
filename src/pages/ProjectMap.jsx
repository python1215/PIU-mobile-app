import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { FiPlus, FiMapPin, FiHome, FiUsers, FiEdit2, FiTrash2, FiMaximize2, FiMinimize2, FiMap, FiList, FiLayers, FiChevronDown, FiChevronUp, FiFilter, FiMinus, FiSearch, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PROJECT_COLORS = [
  '#4285F4', '#EA4335', '#34A853', '#FBBC05', '#9C27B0',
  '#FF6D00', '#00BCD4', '#795548', '#E91E63', '#3F51B5',
  '#009688', '#FF5722', '#607D8B', '#8BC34A', '#CDDC39'
];

const coloredMarkerCache = {};
function getColoredMarkerIcon(color) {
  if (coloredMarkerCache[color]) return coloredMarkerCache[color];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
    <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
    <circle cx="12.5" cy="12.5" r="5" fill="#fff"/>
  </svg>`;
  const icon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svg),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41]
  });
  coloredMarkerCache[color] = icon;
  return icon;
}

function ProjectMap() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [stats, setStats] = useState({ totalHouseholds: 0, connected: 0, regions: 0 });
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [visibleProjects, setVisibleProjects] = useState({});
  const [layersPanelOpen, setLayersPanelOpen] = useState(true);
  const [panelPos, setPanelPos] = useState({ x: 10, y: 10 });

  const [filterPanelOpen, setFilterPanelOpen] = useState(true);
  const [filterPos, setFilterPos] = useState({ x: 10, y: 60 });
  const [filterVisible, setFilterVisible] = useState(false);
  const [mapFilter, setMapFilter] = useState({ projectId: '', regionCode: '', districtCode: '', settlementCode: '' });
  const [appliedFilter, setAppliedFilter] = useState({ projectId: '', regionCode: '', districtCode: '', settlementCode: '' });

  const [tableFilter, setTableFilter] = useState({
    regionCode: '', districtCode: '', settlementCode: '', projectId: '',
    donorId: '', yearId: '', accessTypeId: '', searchSettlement: ''
  });
  const [appliedTableFilter, setAppliedTableFilter] = useState({
    regionCode: '', districtCode: '', settlementCode: '', projectId: '',
    donorId: '', yearId: '', accessTypeId: '', searchSettlement: ''
  });

  const makeDraggable = useCallback((panelRef, setPos, setOpen, onClickToggle) => {
    return (e) => {
      if (e.target.closest('input, select, button, label')) return;
      const ref = panelRef.current;
      if (!ref) return;
      let didMove = false;
      const startX = e.clientX;
      const startY = e.clientY;
      const rect = ref.getBoundingClientRect();
      const parentRect = ref.parentElement.getBoundingClientRect();
      const offX = e.clientX - (rect.left - parentRect.left);
      const offY = e.clientY - (rect.top - parentRect.top);
      e.preventDefault();

      const onMove = (ev) => {
        if (Math.abs(ev.clientX - startX) > 3 || Math.abs(ev.clientY - startY) > 3) didMove = true;
        const pRect = ref.parentElement.getBoundingClientRect();
        setPos({
          x: Math.max(0, Math.min(ev.clientX - offX, pRect.width - 50)),
          y: Math.max(0, Math.min(ev.clientY - offY, pRect.height - 50))
        });
      };
      const onUp = () => {
        if (!didMove && onClickToggle) onClickToggle();
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };
  }, []);

  const layersDragRef = useRef(null);
  const filterDragRef = useRef(null);

  const handleLayersDrag = useCallback((e) => {
    makeDraggable(layersDragRef, setPanelPos, setLayersPanelOpen, () => setLayersPanelOpen(p => !p))(e);
  }, [makeDraggable]);

  const handleFilterDrag = useCallback((e) => {
    makeDraggable(filterDragRef, setFilterPos, setFilterPanelOpen, () => setFilterPanelOpen(p => !p))(e);
  }, [makeDraggable]);

  const [years, setYears] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [accessTypes, setAccessTypes] = useState([]);
  const [donors, setDonors] = useState([]);

  useEffect(() => {
    loadProjects();
    loadReferenceData();
  }, []);

  useEffect(() => {
    loadMappings();
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [yearsRes, regionsRes, districtsRes, settlementsRes, accessRes, donorsRes] = await Promise.all([
        axios.get('/api/setup/years'),
        axios.get('/api/setup/regions'),
        axios.get('/api/setup/districts'),
        axios.get('/api/setup/settlements'),
        axios.get('/api/setup/access-types'),
        axios.get('/api/donors')
      ]);
      setYears(yearsRes.data);
      setRegions(regionsRes.data);
      setDistricts(districtsRes.data);
      setSettlements(settlementsRes.data);
      setAccessTypes(accessRes.data);
      setDonors(donorsRes.data);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const loadMappings = async () => {
    setLoading(true);
    try {
      const isAll = selectedProject === 'all' || !selectedProject;
      const res = isAll
        ? await axios.get('/api/mapping')
        : await axios.get(`/api/mapping/project/${selectedProject}`);
      setMappings(res.data);
      calculateStats(res.data);
    } catch (error) {
      console.error('Error loading mappings:', error);
      setMappings([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalHouseholds = data.reduce((sum, m) => sum + (m.totalHouseholds || 0), 0);
    const connected = data.reduce((sum, m) => sum + (m.connectedHouseholds || 0), 0);
    const regionSet = new Set(data.map(m => m.region?.regionCode)).size;
    setStats({ totalHouseholds, connected, regions: regionSet });
  };

  const projectColorMap = useMemo(() => {
    const map = {};
    projects.forEach((p, i) => {
      map[p.projectId] = PROJECT_COLORS[i % PROJECT_COLORS.length];
    });
    map['__no_project__'] = '#9E9E9E';
    return map;
  }, [projects]);

  useEffect(() => {
    if (projects.length > 0 && Object.keys(visibleProjects).length === 0) {
      const initial = { __all__: true };
      projects.forEach(p => { initial[p.projectId] = true; });
      initial['__no_project__'] = true;
      setVisibleProjects(initial);
    }
  }, [projects]);

  const toggleProjectLayer = useCallback((projectId) => {
    setVisibleProjects(prev => {
      const next = { ...prev, [projectId]: !prev[projectId] };
      const allProjectKeys = projects.map(p => p.projectId).concat('__no_project__');
      const allChecked = allProjectKeys.every(k => next[k]);
      next.__all__ = allChecked;
      return next;
    });
  }, [projects]);

  const toggleAllProjects = useCallback(() => {
    setVisibleProjects(prev => {
      const newAll = !prev.__all__;
      const next = { __all__: newAll };
      projects.forEach(p => { next[p.projectId] = newAll; });
      next['__no_project__'] = newAll;
      return next;
    });
  }, [projects]);

  const visibleMappings = useMemo(() => {
    return mappings.filter(m => {
      const pid = m.project?.projectId || '__no_project__';
      if (visibleProjects[pid] === false) return false;
      if (appliedFilter.projectId && (m.project?.projectId || '') !== appliedFilter.projectId) return false;
      if (appliedFilter.regionCode && (m.region?.regionCode || '') !== appliedFilter.regionCode) return false;
      if (appliedFilter.districtCode && (m.district?.districtCode || '') !== appliedFilter.districtCode) return false;
      if (appliedFilter.settlementCode && (m.settlement?.settlementCode || '') !== appliedFilter.settlementCode) return false;
      return true;
    });
  }, [mappings, visibleProjects, appliedFilter]);

  const uniqueProjectsOnMap = useMemo(() => {
    const ids = new Set(mappings.map(m => m.project?.projectId || '__no_project__'));
    const list = projects.filter(p => ids.has(p.projectId));
    if (ids.has('__no_project__')) {
      list.push({ projectId: '__no_project__', project: t('map.noProject') });
    }
    return list;
  }, [mappings, projects, t]);

  const filterDistricts = useMemo(() => {
    if (!mapFilter.regionCode) return districts;
    return districts.filter(d => d.lga?.region?.regionCode === mapFilter.regionCode);
  }, [districts, mapFilter.regionCode]);

  const filterSettlements = useMemo(() => {
    if (!mapFilter.districtCode) return settlements;
    return settlements.filter(s =>
      s.district?.districtCode === mapFilter.districtCode ||
      s.ward?.district?.districtCode === mapFilter.districtCode
    );
  }, [settlements, mapFilter.districtCode]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'regionCode') {
      setMapFilter(prev => ({ ...prev, regionCode: value, districtCode: '', settlementCode: '' }));
    } else if (name === 'districtCode') {
      setMapFilter(prev => ({ ...prev, districtCode: value, settlementCode: '' }));
    } else {
      setMapFilter(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const applyFilter = useCallback(() => {
    setAppliedFilter({ ...mapFilter });
  }, [mapFilter]);

  const clearFilter = useCallback(() => {
    const empty = { projectId: '', regionCode: '', districtCode: '', settlementCode: '' };
    setMapFilter(empty);
    setAppliedFilter(empty);
  }, []);

  const tableFilterDistricts = useMemo(() => {
    if (!tableFilter.regionCode) return districts;
    return districts.filter(d => d.lga?.region?.regionCode === tableFilter.regionCode);
  }, [districts, tableFilter.regionCode]);

  const tableFilterSettlements = useMemo(() => {
    if (!tableFilter.districtCode) return settlements;
    return settlements.filter(s =>
      s.district?.districtCode === tableFilter.districtCode ||
      s.ward?.district?.districtCode === tableFilter.districtCode
    );
  }, [settlements, tableFilter.districtCode]);

  const handleTableFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'regionCode') {
      setTableFilter(prev => ({ ...prev, regionCode: value, districtCode: '', settlementCode: '' }));
    } else if (name === 'districtCode') {
      setTableFilter(prev => ({ ...prev, districtCode: value, settlementCode: '' }));
    } else {
      setTableFilter(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const applyTableFilter = useCallback(() => {
    setAppliedTableFilter({ ...tableFilter });
  }, [tableFilter]);

  const clearTableFilter = useCallback(() => {
    const empty = { regionCode: '', districtCode: '', settlementCode: '', projectId: '', donorId: '', yearId: '', accessTypeId: '', searchSettlement: '' };
    setTableFilter(empty);
    setAppliedTableFilter(empty);
  }, []);

  const filteredTableMappings = useMemo(() => {
    return mappings.filter(m => {
      const f = appliedTableFilter;
      if (f.projectId && (m.project?.projectId || '') !== f.projectId) return false;
      if (f.regionCode && (m.region?.regionCode || '') !== f.regionCode) return false;
      if (f.districtCode && (m.district?.districtCode || '') !== f.districtCode) return false;
      if (f.settlementCode && (m.settlement?.settlementCode || '') !== f.settlementCode) return false;
      if (f.yearId && String(m.profileYear?.id || '') !== f.yearId) return false;
      if (f.accessTypeId && String(m.accessType?.id || '') !== f.accessTypeId) return false;
      if (f.donorId && !(m.donors || []).some(d => String(d.donorId) === f.donorId)) return false;
      if (f.searchSettlement) {
        const search = f.searchSettlement.toLowerCase();
        if (!(m.settlement?.settlementName || '').toLowerCase().includes(search)) return false;
      }
      return true;
    });
  }, [mappings, appliedTableFilter]);

  const filteredDistricts = useMemo(() => {
    if (!formData.regionCode) return districts;
    return districts.filter(d => d.lga?.region?.regionCode === formData.regionCode);
  }, [districts, formData.regionCode]);

  const filteredSettlements = useMemo(() => {
    if (!formData.districtCode) return settlements;
    return settlements.filter(s =>
      s.district?.districtCode === formData.districtCode ||
      s.ward?.district?.districtCode === formData.districtCode
    );
  }, [settlements, formData.districtCode]);

  const handleOpenModal = useCallback((item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        projectId: item.project?.projectId || '',
        yearId: item.profileYear?.id || '',
        regionCode: item.region?.regionCode || '',
        districtCode: item.district?.districtCode || '',
        settlementCode: item.settlement?.settlementCode || '',
        totalHouseholds: item.totalHouseholds || '',
        connectedHouseholds: item.connectedHouseholds || '',
        customerConnections: item.customerConnections || '',
        femaleHouseholds: item.femaleHouseholds || '',
        maleHouseholds: item.maleHouseholds || '',
        latitude: item.latitude || '',
        longitude: item.longitude || '',
        accessTypeId: item.accessType?.id || '',
        donorIds: item.donors ? item.donors.map(d => String(d.donorId)) : []
      });
    } else {
      setEditingItem(null);
      setFormData({
        projectId: selectedProject !== 'all' ? selectedProject : '',
        yearId: '', regionCode: '', districtCode: '', settlementCode: '',
        totalHouseholds: '', connectedHouseholds: '', customerConnections: '',
        femaleHouseholds: '', maleHouseholds: '',
        latitude: '', longitude: '', accessTypeId: '', donorIds: []
      });
    }
    setShowModal(true);
  }, [selectedProject]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'regionCode') {
      setFormData(prev => ({ ...prev, [name]: value, districtCode: '', settlementCode: '' }));
    } else if (name === 'districtCode') {
      setFormData(prev => ({ ...prev, [name]: value, settlementCode: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleDonorChange = useCallback((e) => {
    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
    setFormData(prev => ({ ...prev, donorIds: selected }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      project: formData.projectId ? { projectId: formData.projectId } : null,
      profileYear: formData.yearId ? { id: parseInt(formData.yearId) } : null,
      region: formData.regionCode ? { regionCode: formData.regionCode } : null,
      district: formData.districtCode ? { districtCode: formData.districtCode } : null,
      settlement: formData.settlementCode ? { settlementCode: formData.settlementCode } : null,
      accessType: formData.accessTypeId ? { id: parseInt(formData.accessTypeId) } : null,
      donors: formData.donorIds?.length > 0
        ? formData.donorIds.map(id => ({ donorId: parseInt(id) }))
        : [],
      totalHouseholds: formData.totalHouseholds ? parseInt(formData.totalHouseholds) : null,
      connectedHouseholds: formData.connectedHouseholds ? parseInt(formData.connectedHouseholds) : null,
      customerConnections: formData.customerConnections ? parseInt(formData.customerConnections) : null,
      femaleHouseholds: formData.femaleHouseholds ? parseInt(formData.femaleHouseholds) : null,
      maleHouseholds: formData.maleHouseholds ? parseInt(formData.maleHouseholds) : null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null
    };

    try {
      if (editingItem) {
        await axios.put(`/api/mapping/${editingItem.id}`, payload);
        toast.success(t('map.mappingUpdated'));
      } else {
        await axios.post('/api/mapping', payload);
        toast.success(t('map.mappingCreated'));
      }
      handleCloseModal();
      loadMappings();
    } catch (error) {
      console.error('Error saving mapping:', error);
      toast.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      await axios.delete(`/api/mapping/${id}`);
      toast.success(t('map.mappingDeleted'));
      loadMappings();
    } catch (error) {
      console.error('Error deleting mapping:', error);
      toast.error(error.response?.data?.message || t('common.error'));
    }
  };

  const center = [13.45, -15.4];

  const selectedProjectName = useMemo(() => {
    if (selectedProject === 'all') return t('common.allProjects');
    const p = projects.find(pr => pr.projectId === selectedProject);
    return p?.project || selectedProject;
  }, [selectedProject, projects, t]);

  return (
    <div className="container-fluid" style={{ paddingBottom: '2rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>{t('map.title')}</h2>
          {selectedProject !== 'all' && (
            <small className="text-muted">{selectedProjectName}</small>
          )}
        </div>
        <div className="d-flex gap-2 align-items-center">
          <select
            className="form-select form-select-sm shadow-sm"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            style={{ width: '240px', borderRadius: '8px' }}
          >
            <option value="all">{t('common.allProjects')}</option>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
          </select>
          <button className="btn btn-primary btn-sm shadow-sm d-flex align-items-center gap-1" style={{ borderRadius: '8px', whiteSpace: 'nowrap' }} onClick={() => handleOpenModal()}>
            <FiPlus size={16} /> {t('map.addLocation')}
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: t('map.mappedSites'), value: mappings.length, icon: <FiMapPin size={28} />, gradient: 'linear-gradient(135deg, #4A7BF7 0%, #6C63FF 100%)' },
          { label: t('map.totalHouseholds'), value: stats.totalHouseholds.toLocaleString(), icon: <FiHome size={28} />, gradient: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)' },
          { label: t('map.connected'), value: stats.connected.toLocaleString(), icon: <FiUsers size={28} />, gradient: 'linear-gradient(135deg, #00B4D8 0%, #0096C7 100%)' },
          { label: t('map.regionsCovered'), value: stats.regions, icon: <FiMapPin size={28} />, gradient: 'linear-gradient(135deg, #F7B731 0%, #F5A623 100%)' }
        ].map((card, idx) => (
          <div className="col-6 col-lg-3" key={idx}>
            <div
              className="text-white p-3 h-100"
              style={{
                background: card.gradient,
                borderRadius: '14px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'; }}
            >
              <div className="d-flex align-items-center gap-3">
                <div style={{ opacity: 0.85 }}>{card.icon}</div>
                <div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.9, fontWeight: 500 }}>{card.label}</div>
                  <div className="fw-bold" style={{ fontSize: '1.6rem', lineHeight: 1.2 }}>{card.value}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ul className="nav nav-tabs mb-3" style={{ borderBottom: '2px solid #e9ecef' }}>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2${activeTab === 'map' ? ' active fw-semibold' : ''}`}
            onClick={() => setActiveTab('map')}
            style={activeTab === 'map' ? { borderColor: '#4A7BF7', borderBottomColor: '#fff', color: '#4A7BF7' } : {}}
          >
            <FiMap size={16} />{t('map.mapView')}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2${activeTab === 'table' ? ' active fw-semibold' : ''}`}
            onClick={() => setActiveTab('table')}
            style={activeTab === 'table' ? { borderColor: '#4A7BF7', borderBottomColor: '#fff', color: '#4A7BF7' } : {}}
          >
            <FiList size={16} />{t('map.dataTable')}
          </button>
        </li>
      </ul>

      {activeTab === 'map' && (
        <div className={`card mb-4 border-0 shadow-sm${mapFullscreen ? ' position-fixed top-0 start-0 w-100 h-100 rounded-0' : ''}`} style={mapFullscreen ? { zIndex: 1050 } : { borderRadius: '14px', overflow: 'hidden' }}>
          <div className="card-body p-0 position-relative">
            <button
              type="button"
              className="btn btn-light btn-sm position-absolute shadow-sm"
              style={{ top: '10px', right: '10px', zIndex: 1000 }}
              onClick={() => setMapFullscreen(prev => !prev)}
              title={mapFullscreen ? t('map.exitFullscreen') : t('map.fullscreen')}
            >
              {mapFullscreen ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
            </button>

            <div
              ref={layersDragRef}
              className="position-absolute bg-white rounded shadow"
              style={{
                top: panelPos.y + 'px',
                left: panelPos.x + 'px',
                zIndex: 1000,
                width: layersPanelOpen ? '280px' : 'auto',
                maxHeight: mapFullscreen ? 'calc(100vh - 30px)' : '460px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div
                className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
                style={{ cursor: 'grab', userSelect: 'none' }}
                onMouseDown={handleLayersDrag}
              >
                <div className="d-flex align-items-center gap-2">
                  <FiLayers size={16} />
                  <strong style={{ fontSize: '0.85rem' }}>{t('map.projectLayers')}</strong>
                </div>
                {layersPanelOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </div>
              {layersPanelOpen && (
                <div style={{ overflowY: 'auto', padding: '8px 12px' }}>
                  <div className="form-check mb-2 pb-2 border-bottom">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="layer-all"
                      checked={visibleProjects.__all__ || false}
                      onChange={toggleAllProjects}
                    />
                    <label className="form-check-label fw-bold" htmlFor="layer-all" style={{ fontSize: '0.95rem' }}>
                      {t('common.allProjects')}
                    </label>
                  </div>
                  {uniqueProjectsOnMap.map((p) => (
                    <div className="form-check mb-1" key={p.projectId}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`layer-${p.projectId}`}
                        checked={visibleProjects[p.projectId] !== false}
                        onChange={() => toggleProjectLayer(p.projectId)}
                      />
                      <label className="form-check-label d-flex align-items-center gap-2" htmlFor={`layer-${p.projectId}`} style={{ fontSize: '0.82rem', lineHeight: '1.3' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: projectColorMap[p.projectId] || '#9E9E9E',
                          flexShrink: 0
                        }}></span>
                        {p.project}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-light btn-sm position-absolute shadow-sm"
              style={{ top: '10px', right: '50px', zIndex: 1000 }}
              onClick={() => setFilterVisible(prev => !prev)}
              title={t('map.filterLocations')}
            >
              <FiFilter size={18} />
            </button>

            {filterVisible && (
              <div
                ref={filterDragRef}
                className="position-absolute bg-white rounded shadow"
                style={{
                  top: filterPos.y + 'px',
                  left: filterPos.x + 'px',
                  zIndex: 1001,
                  width: filterPanelOpen ? '260px' : 'auto',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
                  style={{ cursor: 'grab', userSelect: 'none' }}
                  onMouseDown={handleFilterDrag}
                >
                  <div className="d-flex align-items-center gap-2">
                    <FiFilter size={14} />
                    <strong style={{ fontSize: '0.85rem' }}>{t('map.filterLocations')}</strong>
                  </div>
                  <FiMinus size={14} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setFilterPanelOpen(p => !p); }} />
                </div>
                {filterPanelOpen && (
                  <div style={{ padding: '10px 14px' }}>
                    <div className="mb-2">
                      <label className="form-label mb-1 fw-semibold" style={{ fontSize: '0.8rem' }}>{t('common.project')}:</label>
                      <select className="form-select form-select-sm" name="projectId" value={mapFilter.projectId} onChange={handleFilterChange}>
                        <option value="">{t('common.allProjects')}</option>
                        {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="form-label mb-1 fw-semibold" style={{ fontSize: '0.8rem' }}>{t('setup.region')}:</label>
                      <select className="form-select form-select-sm" name="regionCode" value={mapFilter.regionCode} onChange={handleFilterChange}>
                        <option value="">{t('map.allRegions')}</option>
                        {regions.map(r => <option key={r.regionCode} value={r.regionCode}>{r.regionName}</option>)}
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="form-label mb-1 fw-semibold" style={{ fontSize: '0.8rem' }}>{t('setup.district')}:</label>
                      <select className="form-select form-select-sm" name="districtCode" value={mapFilter.districtCode} onChange={handleFilterChange}>
                        <option value="">{t('map.allDistricts')}</option>
                        {filterDistricts.map(d => <option key={d.districtCode} value={d.districtCode}>{d.districtName}</option>)}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label mb-1 fw-semibold" style={{ fontSize: '0.8rem' }}>{t('setup.settlement')}:</label>
                      <select className="form-select form-select-sm" name="settlementCode" value={mapFilter.settlementCode} onChange={handleFilterChange}>
                        <option value="">{t('map.allSettlements')}</option>
                        {filterSettlements.map(s => <option key={s.settlementCode} value={s.settlementCode}>{s.settlementName}</option>)}
                      </select>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-primary btn-sm flex-fill" onClick={applyFilter}>{t('map.apply')}</button>
                      <button className="btn btn-secondary btn-sm flex-fill" onClick={clearFilter}>{t('map.clear')}</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>
            ) : (
              <div style={{ height: mapFullscreen ? '100vh' : '500px' }}>
                <MapContainer center={center} zoom={8} style={{ height: '100%', width: '100%' }} maxBounds={[[12.5, -17.5], [14.5, -13.0]]} minZoom={7}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {visibleMappings.map((mapping) => {
                    if (mapping.latitude && mapping.longitude) {
                      const pid = mapping.project?.projectId || '__no_project__';
                      const color = projectColorMap[pid] || '#9E9E9E';
                      return (
                        <Marker key={mapping.id} position={[mapping.latitude, mapping.longitude]} icon={getColoredMarkerIcon(color)}>
                          <Popup>
                            <strong>{mapping.settlement?.settlementName || t('map.unknownLocation')}</strong><br />
                            {t('common.project')}: {mapping.project?.project || t('map.noProject')}<br />
                            {t('setup.region')}: {mapping.region?.regionName || '-'}<br />
                            {t('map.totalHouseholds')}: {mapping.totalHouseholds || 0}<br />
                            {t('map.connected')}: {mapping.connectedHouseholds || 0}
                          </Popup>
                        </Marker>
                      );
                    }
                    return null;
                  })}
                </MapContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'table' && (
        <>
          <div className="card mb-3 border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <div className="card-header py-2 bg-white border-bottom">
              <div className="d-flex align-items-center gap-2">
                <FiFilter size={14} className="text-primary" />
                <strong style={{ fontSize: '0.85rem' }}>{t('map.filterOptions')}</strong>
                <small className="text-muted">({t('map.filterHint')})</small>
              </div>
            </div>
            <div className="card-body py-3 px-3" style={{ backgroundColor: '#fafbfc' }}>
              <div className="row g-2 mb-2">
                <div className="col-md-2">
                  <label className="form-label mb-1" style={{ fontSize: '0.78rem' }}>{t('setup.region')}</label>
                  <select className="form-select form-select-sm" name="regionCode" value={tableFilter.regionCode} onChange={handleTableFilterChange}>
                    <option value="">{t('map.allRegions')}</option>
                    {regions.map(r => <option key={r.regionCode} value={r.regionCode}>{r.regionName}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label mb-1" style={{ fontSize: '0.78rem' }}>{t('setup.district')}</label>
                  <select className="form-select form-select-sm" name="districtCode" value={tableFilter.districtCode} onChange={handleTableFilterChange}>
                    <option value="">{t('map.allDistricts')}</option>
                    {tableFilterDistricts.map(d => <option key={d.districtCode} value={d.districtCode}>{d.districtName}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label mb-1" style={{ fontSize: '0.78rem' }}>{t('setup.settlement')}</label>
                  <select className="form-select form-select-sm" name="settlementCode" value={tableFilter.settlementCode} onChange={handleTableFilterChange}>
                    <option value="">{t('map.allSettlements')}</option>
                    {tableFilterSettlements.map(s => <option key={s.settlementCode} value={s.settlementCode}>{s.settlementName}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label mb-1" style={{ fontSize: '0.78rem' }}>{t('common.project')}</label>
                  <select className="form-select form-select-sm" name="projectId" value={tableFilter.projectId} onChange={handleTableFilterChange}>
                    <option value="">{t('common.allProjects')}</option>
                    {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label mb-1" style={{ fontSize: '0.78rem' }}>{t('map.donors')}</label>
                  <select className="form-select form-select-sm" name="donorId" value={tableFilter.donorId} onChange={handleTableFilterChange}>
                    <option value="">{t('map.allDonors')}</option>
                    {donors.map(d => <option key={d.donorId} value={d.donorId}>{d.name}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label mb-1" style={{ fontSize: '0.78rem' }}>{t('map.profileYear')}</label>
                  <select className="form-select form-select-sm" name="yearId" value={tableFilter.yearId} onChange={handleTableFilterChange}>
                    <option value="">{t('map.allYears')}</option>
                    {years.map(y => <option key={y.id} value={y.id}>{y.profileYear}</option>)}
                  </select>
                </div>
              </div>
              <div className="row g-2 align-items-end">
                <div className="col-md-2">
                  <label className="form-label mb-1" style={{ fontSize: '0.78rem' }}>{t('map.accessType')}</label>
                  <select className="form-select form-select-sm" name="accessTypeId" value={tableFilter.accessTypeId} onChange={handleTableFilterChange}>
                    <option value="">{t('map.allAccessTypes')}</option>
                    {accessTypes.map(a => <option key={a.id} value={a.id}>{a.accessType}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label mb-1" style={{ fontSize: '0.78rem' }}>{t('map.searchSettlement')}</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text"><FiSearch size={14} /></span>
                    <input type="text" className="form-control" name="searchSettlement" placeholder={t('map.searchSettlementPlaceholder')} value={tableFilter.searchSettlement} onChange={handleTableFilterChange} />
                  </div>
                </div>
                <div className="col-md-auto ms-auto d-flex gap-2">
                  <button className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm" style={{ borderRadius: '8px', padding: '6px 16px' }} onClick={applyTableFilter}>
                    <FiSearch size={14} /> {t('map.applyFilters')}
                  </button>
                  <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" style={{ borderRadius: '8px', padding: '6px 16px' }} onClick={clearTableFilter}>
                    <FiXCircle size={14} /> {t('map.clear')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom">
              <h6 className="mb-0 fw-bold">{t('map.projectLocations')}</h6>
              <span className="badge bg-light text-dark border" style={{ fontSize: '0.8rem' }}>{filteredTableMappings.length} / {mappings.length} {t('table.records')}</span>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead style={{ backgroundColor: '#f0f4ff' }}>
                      <tr>
                        <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>ID</th>
                        <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('common.project')}</th>
                        <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('map.profileYear')}</th>
                        <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('setup.region')}</th>
                        <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('setup.district')}</th>
                        <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('setup.settlement')}</th>
                        <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('map.totalHouseholds')}</th>
                        <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('map.connected')}</th>
                        <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('map.latitude')}</th>
                        <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('map.longitude')}</th>
                        <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('map.accessType')}</th>
                        <th className="fw-semibold" style={{ fontSize: '0.82rem', color: '#4A5568' }}>{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTableMappings.length === 0 ? (
                        <tr><td colSpan="12" className="text-center text-muted py-4">{t('table.noData')}</td></tr>
                      ) : (
                        filteredTableMappings.map((m) => (
                          <tr key={m.id}>
                            <td className="fw-semibold text-primary">{m.id}</td>
                            <td style={{ fontSize: '0.85rem', maxWidth: '180px' }}>{m.project?.project || '-'}</td>
                            <td style={{ fontSize: '0.85rem' }}>{m.profileYear?.profileYear || '-'}</td>
                            <td style={{ fontSize: '0.85rem' }}>{m.region?.regionName || '-'}</td>
                            <td style={{ fontSize: '0.85rem' }}>{m.district?.districtName || '-'}</td>
                            <td style={{ fontSize: '0.85rem' }}>{m.settlement?.settlementName || '-'}</td>
                            <td style={{ fontSize: '0.85rem' }}>{m.totalHouseholds || 0}</td>
                            <td style={{ fontSize: '0.85rem' }}>{m.connectedHouseholds || 0}</td>
                            <td style={{ fontSize: '0.85rem' }}>{m.latitude?.toFixed(6) || '-'}</td>
                            <td style={{ fontSize: '0.85rem' }}>{m.longitude?.toFixed(6) || '-'}</td>
                            <td><span className="badge" style={{ backgroundColor: '#E8F4FD', color: '#1976D2', fontWeight: 500 }}>{m.accessType?.accessType || '-'}</span></td>
                            <td>
                              <div className="d-flex gap-1">
                                <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: '6px', padding: '3px 8px' }} onClick={() => handleOpenModal(m)} title={t('common.edit')}><FiEdit2 size={14} /></button>
                                <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: '6px', padding: '3px 8px' }} onClick={() => handleDelete(m.id)} title={t('common.delete')}><FiTrash2 size={14} /></button>
                              </div>
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
        </>
      )}

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-fullscreen-md-down modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header py-2">
                <h6 className="modal-title mb-0">{editingItem ? t('map.editLocation') : t('map.addLocation')}</h6>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">{t('map.profileYear')} *</label>
                      <select className="form-select" name="yearId" value={formData.yearId || ''} onChange={handleChange} required>
                        <option value="">---------</option>
                        {years.map(y => <option key={y.id} value={y.id}>{y.profileYear}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">{t('common.project')}</label>
                      <select className="form-select" name="projectId" value={formData.projectId || ''} onChange={handleChange}>
                        <option value="">---------</option>
                        {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">{t('setup.region')} *</label>
                      <select className="form-select" name="regionCode" value={formData.regionCode || ''} onChange={handleChange} required>
                        <option value="">---------</option>
                        {regions.map(r => <option key={r.regionCode} value={r.regionCode}>{r.regionName}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">{t('setup.district')} *</label>
                      <select className="form-select" name="districtCode" value={formData.districtCode || ''} onChange={handleChange} required>
                        <option value="">---------</option>
                        {filteredDistricts.map(d => <option key={d.districtCode} value={d.districtCode}>{d.districtName}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">{t('setup.settlement')} *</label>
                      <select className="form-select" name="settlementCode" value={formData.settlementCode || ''} onChange={handleChange} required>
                        <option value="">---------</option>
                        {filteredSettlements.map(s => <option key={s.settlementCode} value={s.settlementCode}>{s.settlementName}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">{t('map.totalHouseholds')} *</label>
                      <input type="number" className="form-control" name="totalHouseholds" value={formData.totalHouseholds || ''} onChange={handleChange} required min="0" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">{t('map.connectedHouseholds')}</label>
                      <input type="number" className="form-control" name="connectedHouseholds" value={formData.connectedHouseholds || ''} onChange={handleChange} min="0" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">{t('map.customerConnections')}</label>
                      <input type="number" className="form-control" name="customerConnections" value={formData.customerConnections || ''} onChange={handleChange} min="0" />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">{t('map.femaleHouseholds')}</label>
                      <input type="number" className="form-control" name="femaleHouseholds" value={formData.femaleHouseholds || ''} onChange={handleChange} min="0" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">{t('map.maleHouseholds')}</label>
                      <input type="number" className="form-control" name="maleHouseholds" value={formData.maleHouseholds || ''} onChange={handleChange} min="0" />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">{t('map.latitude')} *</label>
                      <input type="number" className="form-control" name="latitude" value={formData.latitude || ''} onChange={handleChange} step="0.000001" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">{t('map.longitude')} *</label>
                      <input type="number" className="form-control" name="longitude" value={formData.longitude || ''} onChange={handleChange} step="0.000001" required />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">{t('map.accessType')} *</label>
                      <select className="form-select" name="accessTypeId" value={formData.accessTypeId || ''} onChange={handleChange} required>
                        <option value="">---------</option>
                        {accessTypes.map(a => <option key={a.id} value={a.id}>{a.accessType}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">{t('map.donors')}</label>
                      <select className="form-select" multiple name="donorIds" value={formData.donorIds || []} onChange={handleDonorChange} style={{ minHeight: '80px' }}>
                        {donors.map(d => <option key={d.donorId} value={d.donorId}>{d.name}</option>)}
                      </select>
                      <small className="text-muted">{t('map.donorsHelp')}</small>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <button type="button" className="btn btn-outline-secondary" onClick={handleCloseModal}>
                      {t('common.cancel')}
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingItem ? t('common.update') : t('common.save')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectMap;
