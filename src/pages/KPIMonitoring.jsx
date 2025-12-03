import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FiTrendingUp, FiTarget, FiActivity, FiBarChart2 } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function StatCard({ icon: Icon, label, value, trend, bgColor, textColor }) {
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
        text: 'KPI Performance Trends',
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
        <h1 className="h2 fw-bold text-dark">KPI Monitoring</h1>
        <p className="text-muted mb-0">Track key performance indicators</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={FiTrendingUp}
            label="Return on Assets (ROA)"
            value="2.5%"
            trend={15}
            bgColor="bg-primary"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={FiTarget}
            label="Net Profit Margin"
            value="3.2%"
            trend={20}
            bgColor="bg-success"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={FiActivity}
            label="Debt Service Coverage"
            value="1.2x"
            trend={8}
            bgColor="bg-warning"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={FiBarChart2}
            label="MWh Generated"
            value="45,230"
            trend={12}
            bgColor="bg-info"
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="mb-0 fw-semibold">Performance Trends</h5>
        </div>
        <div className="card-body">
          <Line data={kpiData} options={chartOptions} />
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="mb-0 fw-semibold">KPI Details</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 px-4 py-3">Indicator</th>
                  <th className="border-0 px-4 py-3">Baseline</th>
                  <th className="border-0 px-4 py-3">Target</th>
                  <th className="border-0 px-4 py-3">Achieved</th>
                  <th className="border-0 px-4 py-3" style={{ minWidth: '150px' }}>Progress</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 fw-medium">Return on Assets (ROA)</td>
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
                  <td className="px-4 py-3 fw-medium">Net Profit Margin</td>
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
                  <td className="px-4 py-3 fw-medium">Debt Service Coverage Ratio</td>
                  <td className="px-4 py-3">0.5x</td>
                  <td className="px-4 py-3">1.5x</td>
                  <td className="px-4 py-3">1.2x</td>
                  <td className="px-4 py-3">
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-warning" style={{ width: '70%' }}></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 fw-medium">MWh Generated</td>
                  <td className="px-4 py-3">30,000</td>
                  <td className="px-4 py-3">60,000</td>
                  <td className="px-4 py-3">45,230</td>
                  <td className="px-4 py-3">
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-info" style={{ width: '75%' }}></div>
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
