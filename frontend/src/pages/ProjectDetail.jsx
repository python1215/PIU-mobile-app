import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectAPI, issueAPI } from '../services/api';
import { FiArrowLeft, FiCalendar, FiDollarSign, FiAlertCircle } from 'react-icons/fi';

function ProjectDetail() {
  const { id } = useParams();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await projectAPI.getById(id);
      return response.data;
    },
  });

  const { data: issues = [] } = useQuery({
    queryKey: ['issues', 'project', id],
    queryFn: async () => {
      const response = await issueAPI.getByProject(id);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Project not found</p>
        <Link to="/projects" className="text-primary-600 hover:underline mt-2 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/projects"
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
        >
          <FiArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{project.project}</h1>
          <p className="text-gray-500">{project.projectId}</p>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <FiDollarSign />
            <span className="font-medium">Funding</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {project.currency?.currency} {project.funding?.toLocaleString() || 'N/A'}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <FiCalendar />
            <span className="font-medium">Effectiveness Date</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {project.effectivenessDate || 'Not Set'}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <FiCalendar />
            <span className="font-medium">Closure Date</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {project.closureDate || 'Not Set'}
          </p>
        </div>
      </div>

      {/* Project Issues */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiAlertCircle /> Project Issues
          </h2>
          <span className="text-sm text-gray-500">{issues.length} issues</span>
        </div>

        {issues.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Issue Code</th>
                  <th className="table-header">Description</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Priority</th>
                  <th className="table-header">Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.issueId} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="table-cell font-medium">{issue.issueCode}</td>
                    <td className="table-cell max-w-xs truncate">{issue.descriptionOfIssueOrAction}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        issue.status === 'complete'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        issue.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        issue.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        issue.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="table-cell">{issue.assignedTo || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No issues found for this project</p>
        )}
      </div>
    </div>
  );
}

export default ProjectDetail;
