import { useQuery } from '@tanstack/react-query';
import { projectAPI, issueAPI } from '../services/api';
import { FiFolder, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
    </div>
  );
}

function Dashboard() {
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

  const completeIssues = issues.filter(i => i.status === 'complete').length;
  const incompleteIssues = issues.filter(i => i.status === 'incomplete').length;
  const criticalIssues = issues.filter(i => i.priority === 'critical').length;

  const issueStatusData = {
    labels: ['Complete', 'Incomplete'],
    datasets: [{
      data: [completeIssues, incompleteIssues],
      backgroundColor: ['#10b981', '#f59e0b'],
      borderWidth: 0,
    }],
  };

  const priorityData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [{
      label: 'Issues by Priority',
      data: [
        issues.filter(i => i.priority === 'low').length,
        issues.filter(i => i.priority === 'medium').length,
        issues.filter(i => i.priority === 'high').length,
        issues.filter(i => i.priority === 'critical').length,
      ],
      backgroundColor: ['#6366f1', '#3b82f6', '#f59e0b', '#ef4444'],
    }],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to PIU Project Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiFolder}
          label="Total Projects"
          value={projects.length}
          color="bg-primary-500"
        />
        <StatCard
          icon={FiAlertCircle}
          label="Open Issues"
          value={incompleteIssues}
          color="bg-amber-500"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Resolved Issues"
          value={completeIssues}
          color="bg-emerald-500"
        />
        <StatCard
          icon={FiClock}
          label="Critical Issues"
          value={criticalIssues}
          color="bg-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Issue Status</h2>
          <div className="w-64 mx-auto">
            <Doughnut data={issueStatusData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Issues by Priority</h2>
          <Bar data={priorityData} options={{ 
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
          }} />
        </div>
      </div>

      {/* Recent Projects */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Projects</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Project ID</th>
                <th className="table-header">Name</th>
                <th className="table-header">Funding</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.slice(0, 5).map((project) => (
                <tr key={project.projectId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="table-cell font-medium">{project.projectId}</td>
                  <td className="table-cell">{project.project}</td>
                  <td className="table-cell">
                    {project.currency?.currency} {project.funding?.toLocaleString()}
                  </td>
                  <td className="table-cell">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {projects.length === 0 && (
            <p className="text-center text-gray-500 py-8">No projects found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
