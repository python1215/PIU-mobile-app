import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { FiPlus, FiMapPin, FiHome, FiUsers, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

  const center = [-13.4, 16.5];

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('map.title')}</h2>
        <div className="d-flex gap-3">
          <select className="form-select" value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ width: '250px' }}>
            <option value="all">{t('common.allProjects')}</option>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <FiPlus className="me-2" /> {t('map.addLocation')}
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <FiMapPin size={32} className="me-3" />
                <div>
                  <h6>{t('map.mappedSites')}</h6>
                  <h3>{mappings.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <FiHome size={32} className="me-3" />
                <div>
                  <h6>{t('map.totalHouseholds')}</h6>
                  <h3>{stats.totalHouseholds.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <FiUsers size={32} className="me-3" />
                <div>
                  <h6>{t('map.connected')}</h6>
                  <h3>{stats.connected.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <FiMapPin size={32} className="me-3" />
                <div>
                  <h6>{t('map.regionsCovered')}</h6>
                  <h3>{stats.regions}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>
          ) : (
            <div style={{ height: '400px' }}>
              <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {mappings.map((mapping) => {
                  if (mapping.latitude && mapping.longitude) {
                    return (
                      <Marker key={mapping.id} position={[mapping.latitude, mapping.longitude]}>
                        <Popup>
                          <strong>{mapping.settlement?.settlementName || t('map.unknownLocation')}</strong><br />
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

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{t('map.projectLocations')}</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>{t('common.project')}</th>
                  <th>{t('map.profileYear')}</th>
                  <th>{t('setup.region')}</th>
                  <th>{t('setup.district')}</th>
                  <th>{t('setup.settlement')}</th>
                  <th>{t('map.totalHouseholds')}</th>
                  <th>{t('map.connected')}</th>
                  <th>{t('map.latitude')}</th>
                  <th>{t('map.longitude')}</th>
                  <th>{t('map.accessType')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {mappings.length === 0 ? (
                  <tr><td colSpan="12" className="text-center text-muted">{t('table.noData')}</td></tr>
                ) : (
                  mappings.map((m) => (
                    <tr key={m.id}>
                      <td><strong>{m.id}</strong></td>
                      <td>{m.project?.project || '-'}</td>
                      <td>{m.profileYear?.profileYear || '-'}</td>
                      <td>{m.region?.regionName || '-'}</td>
                      <td>{m.district?.districtName || '-'}</td>
                      <td>{m.settlement?.settlementName || '-'}</td>
                      <td>{m.totalHouseholds || 0}</td>
                      <td>{m.connectedHouseholds || 0}</td>
                      <td>{m.latitude?.toFixed(6) || '-'}</td>
                      <td>{m.longitude?.toFixed(6) || '-'}</td>
                      <td><span className="badge bg-secondary">{m.accessType?.accessType || '-'}</span></td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleOpenModal(m)} title={t('common.edit')}><FiEdit2 /></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(m.id)} title={t('common.delete')}><FiTrash2 /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
