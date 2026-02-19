import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { projectAPI, issueAPI } from '../services/api';
import axios from 'axios';
import { FiFolder, FiAlertCircle, FiCheckCircle, FiClock, FiMapPin } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useMemo, memo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
  '#FF6D00', '#00BCD4', '#795548', '#E91E63', '#3F51B5'
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

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const StatCard = memo(function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="card border-0 shadow-sm" style={{ minWidth: '160px', maxWidth: '200px' }}>
      <div className="card-body d-flex align-items-center gap-2 py-2 px-3">
        <div 
          className={`rounded-2 d-flex align-items-center justify-content-center ${bgColor}`}
          style={{ width: '36px', height: '36px', minWidth: '36px' }}
        >
          <Icon size={16} className={color} />
        </div>
        <div>
          <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.1rem', lineHeight: 1.2 }}>{value}</h5>
          <p className="mb-0 text-muted" style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>{label}</p>
        </div>
      </div>
    </div>
  );
});

const ProjectRow = memo(function ProjectRow({ project, t }) {
  return (
    <tr>
      <td className="px-4 py-3 fw-medium">{project.projectId}</td>
      <td className="px-4 py-3">{project.project}</td>
      <td className="px-4 py-3">
        {project.currency?.currency} {project.funding?.toLocaleString()}
      </td>
      <td className="px-4 py-3">
        <span className="badge bg-success bg-opacity-10 text-success">
          {t('common.active')}
        </span>
      </td>
    </tr>
  );
});

function Dashboard() {
  const { t } = useTranslation();
  const [mappings, setMappings] = useState([]);
  
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectAPI.getAll();
      return response.data;
    },
  });

  const { data: issues = [] } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const response = await issueAPI.getAll();
      return response.data;
    },
  });

  useEffect(() => {
    axios.get('/api/mapping').then(res => setMappings(res.data || [])).catch(() => setMappings([]));
  }, []);

  const { completeIssues, incompleteIssues, criticalIssues } = useMemo(() => ({
    completeIssues: issues.filter(i => i.status === 'complete').length,
    incompleteIssues: issues.filter(i => i.status === 'incomplete').length,
    criticalIssues: issues.filter(i => i.priority === 'critical').length,
  }), [issues]);

  const issueStatusData = useMemo(() => ({
    labels: [t('common.completed'), t('common.pending')],
    datasets: [{
      data: [completeIssues, incompleteIssues],
      backgroundColor: ['#198754', '#ffc107'],
      borderWidth: 0,
    }],
  }), [completeIssues, incompleteIssues, t]);

  const priorityData = useMemo(() => ({
    labels: [t('issues.low'), t('issues.medium'), t('issues.high'), t('issues.critical')],
    datasets: [{
      label: t('issues.title'),
      data: [
        issues.filter(i => i.priority === 'low').length,
        issues.filter(i => i.priority === 'medium').length,
        issues.filter(i => i.priority === 'high').length,
        issues.filter(i => i.priority === 'critical').length,
      ],
      backgroundColor: ['#6c757d', '#0d6efd', '#ffc107', '#dc3545'],
    }],
  }), [issues, t]);

  const doughnutOptions = useMemo(() => ({
    plugins: { legend: { position: 'bottom' } }
  }), []);

  const barOptions = useMemo(() => ({
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
    maintainAspectRatio: false,
    responsive: true
  }), []);

  const recentProjects = useMemo(() => projects.slice(0, 5), [projects]);

  const projectRows = useMemo(() => (
    recentProjects.map((project) => (
      <ProjectRow key={project.projectId} project={project} t={t} />
    ))
  ), [recentProjects, t]);

  const projectColorMap = useMemo(() => {
    const map = {};
    projects.forEach((p, i) => {
      map[p.projectId] = PROJECT_COLORS[i % PROJECT_COLORS.length];
    });
    return map;
  }, [projects]);

  const mapMarkers = useMemo(() => {
    return mappings.filter(m => m.latitude && m.longitude).map((m, i) => {
      const color = projectColorMap[m.project?.projectId] || '#4285F4';
      return (
        <Marker key={m.id || i} position={[m.latitude, m.longitude]} icon={getColoredMarkerIcon(color)}>
          <Popup>
            <div style={{ minWidth: '160px' }}>
              <strong>{m.settlement?.settlement || m.settlementName || 'Location'}</strong>
              {m.project && <div className="text-muted small">{m.project.project}</div>}
              {m.region && <div className="small"><FiMapPin size={12} className="me-1" />{m.region.region}</div>}
            </div>
          </Popup>
        </Marker>
      );
    });
  }, [mappings, projectColorMap]);

  return (
    <div>
      <div className="mb-3">
        <h1 className="h2 fw-bold text-dark">{t('dashboard.title')}</h1>
        <p className="text-muted mb-0">{t('dashboard.welcomeMessage')}</p>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <StatCard
          icon={FiFolder}
          label={t('dashboard.totalProjects')}
          value={projects.length}
          color="text-primary"
          bgColor="bg-primary bg-opacity-10"
        />
        <StatCard
          icon={FiAlertCircle}
          label={t('dashboard.openIssues')}
          value={incompleteIssues}
          color="text-warning"
          bgColor="bg-warning bg-opacity-10"
        />
        <StatCard
          icon={FiCheckCircle}
          label={t('dashboard.resolvedIssues')}
          value={completeIssues}
          color="text-success"
          bgColor="bg-success bg-opacity-10"
        />
        <StatCard
          icon={FiClock}
          label={t('dashboard.criticalIssues')}
          value={criticalIssues}
          color="text-danger"
          bgColor="bg-danger bg-opacity-10"
        />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-2">
              <h6 className="mb-0 fw-semibold" style={{ fontSize: '0.85rem' }}>{t('dashboard.issuesSummary')}</h6>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center p-2">
              <div style={{ width: '90%' }}>
                <Doughnut data={issueStatusData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-2">
              <h6 className="mb-0 fw-semibold" style={{ fontSize: '0.85rem' }}>{t('issues.priority')}</h6>
            </div>
            <div className="card-body p-2" style={{ position: 'relative', height: '90%' }}>
              <Bar data={priorityData} options={barOptions} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-2">
              <h6 className="mb-0 fw-semibold" style={{ fontSize: '0.85rem' }}>{t('map.projectLocations')}</h6>
            </div>
            <div className="card-body p-0" style={{ minHeight: '400px' }}>
              <MapContainer
                center={[13.45, -15.4]}
                zoom={8}
                style={{ height: '100%', minHeight: '400px', borderRadius: '0 0 0.375rem 0.375rem' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mapMarkers}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-2">
          <h6 className="mb-0 fw-semibold">{t('dashboard.recentProjects')}</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 px-4 py-2">{t('projects.projectId')}</th>
                  <th className="border-0 px-4 py-2">{t('common.name')}</th>
                  <th className="border-0 px-4 py-2">{t('projects.budget')}</th>
                  <th className="border-0 px-4 py-2">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody>
                {projectRows}
              </tbody>
            </table>
            {projects.length === 0 && (
              <p className="text-center text-muted py-5 mb-0">{t('projects.noProjects')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
