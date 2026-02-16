import { useTranslation } from 'react-i18next';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FiTrendingUp, FiTarget, FiActivity, FiBarChart2 } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function StatCard({ icon: Icon, label, value, trend, bgColor }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div 
            className={`rounded-3 d-flex align-items-center justify-content-center ${bgColor}`}
            style={{ width: '48px', height: '48px' }}
          >
            <Icon size={22} className="text-white" />
          </div>
          {trend && (
            <span className={`small fw-semibold ${trend > 0 ? 'text-success' : 'text-danger'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <h3 className="fw-bold text-dark mb-1">{value}</h3>
        <p className="text-muted small mb-0">{label}</p>
      </div>
    </div>
  );
}

function KPIMonitoring() {
  const { t } = useTranslation();
  const kpiData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'ROA (%)',
        data: [-12, -8, -4, 2],
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        tension: 0.4,
      },
      {
        label: 'NPM (%)',
        data: [-15, -10, -5, 3],
        borderColor: '#198754',
        backgroundColor: 'rgba(25, 135, 84, 0.1)',
        tension: 0.4,
      },
      {
        label: 'DSCR',
        data: [0.8, 0.9, 1.0, 1.2],
        borderColor: '#ffc107',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: t('kpi.performanceTrends'),
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark">{t('kpi.title')}</h1>
        <p className="text-muted mb-0">{t('kpi.subtitle')}</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={FiTrendingUp}
            label={t('kpi.returnOnAssets')}
            value="2.5%"
            trend={15}
            bgColor="bg-primary"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={FiTarget}
            label={t('kpi.netProfitMargin')}
            value="3.2%"
            trend={20}
            bgColor="bg-success"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={FiActivity}
            label={t('kpi.debtServiceCoverage')}
            value="1.2x"
            trend={8}
            bgColor="bg-warning"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={FiBarChart2}
            label={t('kpi.mwhGenerated')}
            value="45,230"
            trend={12}
            bgColor="bg-info"
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="mb-0 fw-semibold">{t('kpi.performanceTrends')}</h5>
        </div>
        <div className="card-body">
          <Line data={kpiData} options={chartOptions} />
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="mb-0 fw-semibold">{t('kpi.kpiDetails')}</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 px-4 py-3">{t('kpi.indicator')}</th>
                  <th className="border-0 px-4 py-3">{t('kpi.baseline')}</th>
                  <th className="border-0 px-4 py-3">{t('kpi.target')}</th>
                  <th className="border-0 px-4 py-3">{t('kpi.achieved')}</th>
                  <th className="border-0 px-4 py-3" style={{ minWidth: '150px' }}>{t('kpi.progress')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 fw-medium">{t('kpi.returnOnAssets')}</td>
                  <td className="px-4 py-3">-12%</td>
                  <td className="px-4 py-3">6%</td>
                  <td className="px-4 py-3">2.5%</td>
                  <td className="px-4 py-3">
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-primary" style={{ width: '80%' }}></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 fw-medium">{t('kpi.netProfitMargin')}</td>
                  <td className="px-4 py-3">-15%</td>
                  <td className="px-4 py-3">10%</td>
                  <td className="px-4 py-3">3.2%</td>
                  <td className="px-4 py-3">
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-success" style={{ width: '73%' }}></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 fw-medium">{t('kpi.debtServiceCoverage')}</td>
                  <td className="px-4 py-3">0.8x</td>
                  <td className="px-4 py-3">1.5x</td>
                  <td className="px-4 py-3">1.2x</td>
                  <td className="px-4 py-3">
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-warning" style={{ width: '57%' }}></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 fw-medium">{t('kpi.mwhGenerated')}</td>
                  <td className="px-4 py-3">30,000</td>
                  <td className="px-4 py-3">50,000</td>
                  <td className="px-4 py-3">45,230</td>
                  <td className="px-4 py-3">
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-info" style={{ width: '76%' }}></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KPIMonitoring;
