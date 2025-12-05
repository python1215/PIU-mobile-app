import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiShield, FiAlertTriangle, FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';

function SocialEnvironmental() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('esia');
  const [projects, setProjects] = useState([]);
  const [esia, setEsia] = useState([]);
  const [pap, setPap] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [ohs, setOhs] = useState([]);
  const [engagements, setEngagements] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadData();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
      if (res.data.length > 0) {
        setSelectedProject(res.data[0].projectId);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [esiaRes, papRes, grievRes, ohsRes, engRes] = await Promise.all([
        axios.get(`/api/social-environmental/esia/project/${selectedProject}`).catch(() => ({ data: [] })),
        axios.get(`/api/social-environmental/pap/project/${selectedProject}`).catch(() => ({ data: [] })),
        axios.get(`/api/social-environmental/grievance/project/${selectedProject}`).catch(() => ({ data: [] })),
        axios.get(`/api/social-environmental/ohs/project/${selectedProject}`).catch(() => ({ data: [] })),
        axios.get(`/api/social-environmental/community-engagement/project/${selectedProject}`).catch(() => ({ data: [] }))
      ]);
      setEsia(esiaRes.data);
      setPap(papRes.data);
      setGrievances(grievRes.data);
      setOhs(ohsRes.data);
      setEngagements(engRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'esia', label: 'ESIA', icon: FiShield, data: esia },
    { id: 'pap', label: 'PAP Monitoring', icon: FiUsers, data: pap },
    { id: 'grievance', label: 'Grievances', icon: FiAlertTriangle, data: grievances },
    { id: 'ohs', label: 'OHS Monitoring', icon: FiHeart, data: ohs },
    { id: 'engagement', label: 'Community Engagement', icon: FiUsers, data: engagements }
  ];

  const renderTable = () => {
    if (loading) {
      return <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>;
    }

    const currentTab = tabs.find(t => t.id === activeTab);
    const data = currentTab?.data || [];

    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              {activeTab === 'esia' && <><th>ID</th><th>Duration (months)</th><th>Phase</th><th>Locations</th><th>Communities</th><th>Findings</th></>}
              {activeTab === 'pap' && <><th>PAP ID</th><th>Name</th><th>Sex</th><th>Location</th><th>Amount</th><th>Compensated</th></>}
              {activeTab === 'grievance' && <><th>Case No</th><th>Complainant</th><th>Date Received</th><th>Outcome</th><th>Satisfied</th></>}
              {activeTab === 'ohs' && <><th>ID</th><th>Date</th><th>Region</th><th>Male</th><th>Female</th><th>Youth</th></>}
              {activeTab === 'engagement' && <><th>Ref</th><th>Place</th><th>Date</th><th>Male</th><th>Female</th><th>Total</th></>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan="7" className="text-center text-muted">No data available</td></tr>
            ) : (
              data.map((item, index) => (
                <tr key={index}>
                  {activeTab === 'esia' && (
                    <><td>{item.id}</td><td>{item.projectDuration}</td><td>{item.projectPhase}</td><td>{item.projectLocations}</td><td>{item.numberOfCommunities}</td><td className="text-truncate" style={{maxWidth: '200px'}}>{item.esiaFindings}</td></>
                  )}
                  {activeTab === 'pap' && (
                    <><td>{item.papIdentificationNumber}</td><td>{item.papName}</td><td>{item.sex}</td><td>{item.locationOfImpact}</td><td>${item.amount}</td><td><span className={`badge bg-${item.papCompensated === 'Y' ? 'success' : 'warning'}`}>{item.papCompensated === 'Y' ? 'Yes' : 'No'}</span></td></>
                  )}
                  {activeTab === 'grievance' && (
                    <><td>{item.caseNo}</td><td>{item.nameOfComplainant}</td><td>{item.dateClaimReceived}</td><td>{item.decisionOutcome?.outcome}</td><td><span className={`badge bg-${item.complainantSatisfied === 'Y' ? 'success' : 'danger'}`}>{item.complainantSatisfied === 'Y' ? 'Yes' : 'No'}</span></td></>
                  )}
                  {activeTab === 'ohs' && (
                    <><td>{item.id}</td><td>{item.monitoringDate}</td><td>{item.region?.regionName}</td><td>{item.male}</td><td>{item.female}</td><td>{(item.youthMale || 0) + (item.youthFemale || 0)}</td></>
                  )}
                  {activeTab === 'engagement' && (
                    <><td>{item.referenceNumber}</td><td>{item.placeOfEvent}</td><td>{item.dateOfConsultation}</td><td>{item.male}</td><td>{item.female}</td><td>{item.totalParticipants}</td></>
                  )}
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1"><FiEdit2 /></button>
                    <button className="btn btn-sm btn-outline-danger"><FiTrash2 /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('socialEnvironmental.title')}</h2>
        <div className="d-flex gap-3">
          <select className="form-select" value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ width: '250px' }}>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus className="me-2" /> Add New
          </button>
        </div>
      </div>

      <div className="row mb-4">
        {tabs.map(tab => (
          <div className="col" key={tab.id}>
            <div className="card">
              <div className="card-body text-center">
                <tab.icon size={24} className="mb-2 text-primary" />
                <h6>{tab.label}</h6>
                <h3>{tab.data.length}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ul className="nav nav-tabs mb-4">
        {tabs.map(tab => (
          <li className="nav-item" key={tab.id}>
            <button 
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="me-2" />
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="card">
        <div className="card-body">
          {renderTable()}
        </div>
      </div>
    </div>
  );
}

export default SocialEnvironmental;
