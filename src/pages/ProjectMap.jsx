import { useState, useEffect } from 'react';
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
        <h2>Project Site Mapping</h2>
        <div className="d-flex gap-3">
          <select className="form-select" value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ width: '250px' }}>
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus className="me-2" /> Add Location
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
                  <h6>Mapped Sites</h6>
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
                  <h6>Total Households</h6>
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
                  <h6>Connected</h6>
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
                  <h6>Regions Covered</h6>
                  <h3>{stats.regions}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5>Project Sites Map</h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>
              ) : (
                <MapContainer center={center} zoom={7} style={{ height: '500px', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {mappings.filter(m => m.latitude && m.longitude).map((mapping, index) => (
                    <Marker key={index} position={[mapping.latitude, mapping.longitude]}>
                      <Popup>
                        <strong>{mapping.settlement?.settlementName || 'Unknown'}</strong><br />
                        Region: {mapping.region?.regionName}<br />
                        District: {mapping.district?.districtName}<br />
                        Households: {mapping.totalHouseholds}<br />
                        Connected: {mapping.connectedHouseholds}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Site List</h5>
            </div>
            <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {mappings.length === 0 ? (
                <p className="text-muted text-center">No sites mapped yet</p>
              ) : (
                <ul className="list-group">
                  {mappings.map((mapping, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{mapping.settlement?.settlementName || 'Unknown'}</strong>
                        <br />
                        <small className="text-muted">{mapping.region?.regionName} - {mapping.district?.districtName}</small>
                      </div>
                      <span className="badge bg-primary rounded-pill">{mapping.totalHouseholds}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectMap;
