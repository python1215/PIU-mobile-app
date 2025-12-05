import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { FiPlus, FiMapPin, FiHome, FiUsers } from 'react-icons/fi';
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
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({ totalHouseholds: 0, connected: 0, regions: 0 });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadMappings();
    } else {
      loadAllMappings();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadMappings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/mapping/project/${selectedProject}`);
      setMappings(res.data);
      calculateStats(res.data);
    } catch (error) {
      console.error('Error loading mappings:', error);
      setMappings([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllMappings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/mapping');
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
    const regions = new Set(data.map(m => m.region?.regionCode)).size;
    setStats({ totalHouseholds, connected, regions });
  };

  const center = [-13.4, 16.5];

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('map.title')}</h2>
        <div className="d-flex gap-3">
          <select className="form-select" value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ width: '250px' }}>
            <option value="">{t('map.showAllProjects')}</option>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
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

      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border" role="status"></div>
            </div>
          ) : (
            <div style={{ height: '500px' }}>
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
                          <strong>{mapping.settlement?.settlementName || t('map.unknownLocation')}</strong>
                          <br />
                          {t('setup.region')}: {mapping.region?.regionName || '-'}
                          <br />
                          {t('map.totalHouseholds')}: {mapping.totalHouseholds || 0}
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

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{t('map.addLocation')}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted">{t('map.addLocationDescription')}</p>
                <div className="mb-3">
                  <label className="form-label">{t('projects.selectProject')}</label>
                  <select className="form-select">
                    <option value="">{t('common.select')}</option>
                    {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">{t('map.latitude')}</label>
                  <input type="number" className="form-control" step="0.000001" />
                </div>
                <div className="mb-3">
                  <label className="form-label">{t('map.longitude')}</label>
                  <input type="number" className="form-control" step="0.000001" />
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
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

export default ProjectMap;
