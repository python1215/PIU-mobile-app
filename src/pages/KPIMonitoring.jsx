import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FiTrendingUp, FiTarget, FiActivity, FiBarChart2 } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function StatCard({ icon: Icon, label, value, trend, color }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
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
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'NPM (%)',
        data: [-15, -10, -5, 3],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'DSCR',
        data: [0.8, 0.9, 1.0, 1.2],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">KPI Monitoring</h1>
        <p className="text-gray-500 mt-1">Track key performance indicators</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiTrendingUp}
          label="Return on Assets (ROA)"
          value="2.5%"
          trend={15}
          color="bg-blue-500"
        />
        <StatCard
          icon={FiTarget}
          label="Net Profit Margin"
          value="3.2%"
          trend={20}
          color="bg-emerald-500"
        />
        <StatCard
          icon={FiActivity}
          label="Debt Service Coverage"
          value="1.2x"
          trend={8}
          color="bg-amber-500"
        />
        <StatCard
          icon={FiBarChart2}
          label="MWh Generated"
          value="45,230"
          trend={12}
          color="bg-purple-500"
        />
      </div>

      {/* KPI Chart */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Performance Trends</h2>
        <div className="h-80">
          <Line data={kpiData} options={chartOptions} />
        </div>
      </div>

      {/* KPI Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">KPI Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Indicator</th>
                <th className="table-header">Baseline</th>
                <th className="table-header">Target</th>
                <th className="table-header">Achieved</th>
                <th className="table-header">Progress</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="table-cell font-medium">Return on Assets (ROA)</td>
                <td className="table-cell">-12%</td>
                <td className="table-cell">6%</td>
                <td className="table-cell">2.5%</td>
                <td className="table-cell">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="table-cell font-medium">Net Profit Margin</td>
                <td className="table-cell">-15%</td>
                <td className="table-cell">10%</td>
                <td className="table-cell">3.2%</td>
                <td className="table-cell">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '73%' }}></div>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="table-cell font-medium">Debt Service Coverage Ratio</td>
                <td className="table-cell">0.5x</td>
                <td className="table-cell">1.5x</td>
                <td className="table-cell">1.2x</td>
                <td className="table-cell">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="table-cell font-medium">MWh Generated</td>
                <td className="table-cell">30,000</td>
                <td className="table-cell">60,000</td>
                <td className="table-cell">45,230</td>
                <td className="table-cell">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default KPIMonitoring;
