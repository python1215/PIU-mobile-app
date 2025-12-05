import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { projectAPI, issueAPI } from '../services/api';
import { FiFolder, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useMemo, memo } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const StatCard = memo(function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body d-flex align-items-center gap-3">
        <div 
          className={`rounded-3 d-flex align-items-center justify-content-center ${bgColor}`}
          style={{ width: '56px', height: '56px', minWidth: '56px' }}
        >
          <Icon size={24} className={color} />
        </div>
        <div>
          <h3 className="mb-0 fw-bold text-dark">{value}</h3>
          <p className="mb-0 text-muted small">{label}</p>
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
    maintainAspectRatio: true
  }), []);

  const recentProjects = useMemo(() => projects.slice(0, 5), [projects]);

  const projectRows = useMemo(() => (
    recentProjects.map((project) => (
      <ProjectRow key={project.projectId} project={project} t={t} />
    ))
  ), [recentProjects, t]);

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark">{t('dashboard.title')}</h1>
        <p className="text-muted mb-0">{t('dashboard.welcomeMessage')}</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={FiFolder}
            label={t('dashboard.totalProjects')}
            value={projects.length}
            color="text-primary"
            bgColor="bg-primary bg-opacity-10"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={FiAlertCircle}
            label={t('dashboard.openIssues')}
            value={incompleteIssues}
            color="text-warning"
            bgColor="bg-warning bg-opacity-10"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={FiCheckCircle}
            label={t('dashboard.resolvedIssues')}
            value={completeIssues}
            color="text-success"
            bgColor="bg-success bg-opacity-10"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={FiClock}
            label={t('dashboard.criticalIssues')}
            value={criticalIssues}
            color="text-danger"
            bgColor="bg-danger bg-opacity-10"
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-semibold">{t('dashboard.issuesSummary')}</h5>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
              <div style={{ maxWidth: '280px', width: '100%' }}>
                <Doughnut data={issueStatusData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-semibold">{t('issues.priority')}</h5>
            </div>
            <div className="card-body">
              <Bar data={priorityData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="mb-0 fw-semibold">{t('dashboard.recentProjects')}</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 px-4 py-3">{t('projects.projectId')}</th>
                  <th className="border-0 px-4 py-3">{t('common.name')}</th>
                  <th className="border-0 px-4 py-3">{t('projects.budget')}</th>
                  <th className="border-0 px-4 py-3">{t('common.status')}</th>
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
