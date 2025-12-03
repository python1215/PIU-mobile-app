import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectAPI, issueAPI } from '../services/api';
import { FiArrowLeft, FiCalendar, FiDollarSign, FiAlertCircle, FiUsers, FiUserCheck } from 'react-icons/fi';
import { useMemo, useCallback, memo } from 'react';

const InfoCard = memo(function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex align-items-center gap-2 text-muted mb-2">
          <Icon />
          <span className="fw-medium">{label}</span>
        </div>
        <h4 className="fw-bold text-dark mb-0">{value}</h4>
      </div>
    </div>
  );
});

const DonorBadge = memo(function DonorBadge({ donor }) {
  return (
    <span className="badge bg-light text-dark border px-3 py-2">
      {donor.name}
    </span>
  );
});

const ContributorBadge = memo(function ContributorBadge({ contributor }) {
  return (
    <span className="badge bg-light text-dark border px-3 py-2">
      {contributor.name}
    </span>
  );
});

const IssueRow = memo(function IssueRow({ issue, getPriorityBadge }) {
  return (
    <tr>
      <td className="px-4 py-3 fw-medium">{issue.issueCode}</td>
      <td className="px-4 py-3" style={{ maxWidth: '300px' }}>
        <span className="text-truncate d-block">{issue.descriptionOfIssueOrAction}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`badge ${issue.status === 'complete' ? 'bg-success' : 'bg-warning text-dark'}`}>
          {issue.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`badge ${getPriorityBadge(issue.priority)}`}>
          {issue.priority}
        </span>
      </td>
      <td className="px-4 py-3">{issue.assignedTo || '-'}</td>
    </tr>
  );
});

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

  const getPriorityBadge = useCallback((priority) => {
    const badges = {
      critical: 'bg-danger',
      high: 'bg-warning text-dark',
      medium: 'bg-primary',
      low: 'bg-secondary',
    };
    return badges[priority] || badges.medium;
  }, []);

  const fundingDisplay = useMemo(() => {
    if (!project) return 'N/A';
    const currency = project.currency?.currency || '';
    const funding = project.funding?.toLocaleString() || 'N/A';
    return `${currency} ${funding}`;
  }, [project?.currency?.currency, project?.funding]);

  const donorsList = useMemo(() => {
    if (!project?.donors || project.donors.length === 0) {
      return <p className="text-muted mb-0">No donors assigned</p>;
    }
    return (
      <div className="d-flex flex-wrap gap-2">
        {project.donors.map((donor) => (
          <DonorBadge key={donor.donorId} donor={donor} />
        ))}
      </div>
    );
  }, [project?.donors]);

  const contributorsList = useMemo(() => {
    if (!project?.contributors || project.contributors.length === 0) {
      return <p className="text-muted mb-0">No contributors assigned</p>;
    }
    return (
      <div className="d-flex flex-wrap gap-2">
        {project.contributors.map((contributor) => (
          <ContributorBadge key={contributor.id} contributor={contributor} />
        ))}
      </div>
    );
  }, [project?.contributors]);

  const issueRows = useMemo(() => {
    return issues.map((issue) => (
      <IssueRow
        key={issue.issueId}
        issue={issue}
        getPriorityBadge={getPriorityBadge}
      />
    ));
  }, [issues, getPriorityBadge]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-5">
        <p className="text-muted mb-3">Project not found</p>
        <Link to="/projects" className="btn btn-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link
          to="/financial"
          className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: '42px', height: '42px' }}
        >
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="h2 fw-bold text-dark mb-0">{project.project}</h1>
          <p className="text-muted mb-0">{project.projectId}</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <InfoCard icon={FiDollarSign} label="Funding" value={fundingDisplay} />
        </div>
        <div className="col-12 col-md-4">
          <InfoCard icon={FiCalendar} label="Effectiveness Date" value={project.effectivenessDate || 'Not Set'} />
        </div>
        <div className="col-12 col-md-4">
          <InfoCard icon={FiCalendar} label="Closure Date" value={project.closureDate || 'Not Set'} />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted mb-3">
                <FiUsers />
                <span className="fw-medium">Donors</span>
                <span className="badge bg-primary ms-auto">{project.donors?.length || 0}</span>
              </div>
              {donorsList}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-muted mb-3">
                <FiUserCheck />
                <span className="fw-medium">Contributors</span>
                <span className="badge bg-success ms-auto">{project.contributors?.length || 0}</span>
              </div>
              {contributorsList}
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3 d-flex align-items-center justify-content-between">
          <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
            <FiAlertCircle /> Project Issues
          </h5>
          <span className="badge bg-secondary">{issues.length} issues</span>
        </div>
        <div className="card-body p-0">
          {issues.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 px-4 py-3">Issue Code</th>
                    <th className="border-0 px-4 py-3">Description</th>
                    <th className="border-0 px-4 py-3">Status</th>
                    <th className="border-0 px-4 py-3">Priority</th>
                    <th className="border-0 px-4 py-3">Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {issueRows}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted py-5 mb-0">No issues found for this project</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
