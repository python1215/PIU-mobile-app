import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiLayers } from 'react-icons/fi';
import toast from 'react-hot-toast';

function FinancialManagement() {
  const [activeTab, setActiveTab] = useState('components');
  const [projects, setProjects] = useState([]);
  const [components, setComponents] = useState([]);
  const [subcomponents, setSubcomponents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [pdos, setPdos] = useState([]);
  const [outcomes, setOutcomes] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadFinancialData();
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

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const [compRes, subRes, actRes, pdoRes, outRes] = await Promise.all([
        axios.get(`/api/financial/components/project/${selectedProject}`).catch(() => ({ data: [] })),
        axios.get(`/api/financial/subcomponents`).catch(() => ({ data: [] })),
        axios.get(`/api/financial/activities/project/${selectedProject}`).catch(() => ({ data: [] })),
        axios.get(`/api/financial/pdos/project/${selectedProject}`).catch(() => ({ data: [] })),
        axios.get(`/api/financial/outcomes`).catch(() => ({ data: [] }))
      ]);
      setComponents(compRes.data);
      setSubcomponents(subRes.data);
      setActivities(actRes.data);
      setPdos(pdoRes.data);
      setOutcomes(outRes.data);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'components', label: 'Components', icon: FiLayers },
    { id: 'subcomponents', label: 'Subcomponents', icon: FiLayers },
    { id: 'activities', label: 'Activities', icon: FiDollarSign },
    { id: 'pdos', label: 'PDO Statements', icon: FiDollarSign },
    { id: 'outcomes', label: 'Outcomes', icon: FiDollarSign }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(amount || 0);
  };

  const getTotalAllocation = () => {
    return components.reduce((sum, c) => sum + (parseFloat(c.allocation) || 0), 0);
  };

  const renderTable = () => {
    if (loading) {
      return <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>;
    }

    const data = activeTab === 'components' ? components :
                 activeTab === 'subcomponents' ? subcomponents :
                 activeTab === 'activities' ? activities :
                 activeTab === 'pdos' ? pdos : outcomes;

    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              {activeTab === 'components' && <><th>ID</th><th>Component Name</th><th>Description</th><th className="text-end">Allocation</th></>}
              {activeTab === 'subcomponents' && <><th>ID</th><th>Subcomponent</th><th>Description</th><th className="text-end">Allocation</th></>}
              {activeTab === 'activities' && <><th>ID</th><th>Activity</th><th className="text-end">Allocation</th></>}
              {activeTab === 'pdos' && <><th>ID</th><th>PDO Statement</th></>}
              {activeTab === 'outcomes' && <><th>ID</th><th>Project Outcome</th></>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan="5" className="text-center text-muted">No data available</td></tr>
            ) : (
              data.map((item, index) => (
                <tr key={index}>
                  {activeTab === 'components' && (
                    <><td>{item.compId}</td><td>{item.projectComponents}</td><td>{item.componentDescription}</td><td className="text-end">{formatCurrency(item.allocation)}</td></>
                  )}
                  {activeTab === 'subcomponents' && (
                    <><td>{item.subcompId}</td><td>{item.subcomponent}</td><td>{item.subcomponentDescription}</td><td className="text-end">{formatCurrency(item.allocation)}</td></>
                  )}
                  {activeTab === 'activities' && (
                    <><td>{item.activityId}</td><td>{item.activity}</td><td className="text-end">{formatCurrency(item.allocation)}</td></>
                  )}
                  {activeTab === 'pdos' && (
                    <><td>{item.id}</td><td>{item.pdoStatement}</td></>
                  )}
                  {activeTab === 'outcomes' && (
                    <><td>{item.id}</td><td>{item.projectOutcome}</td></>
                  )}
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1"><FiEdit2 /></button>
                    <button className="btn btn-sm btn-outline-danger"><FiTrash2 /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {(activeTab === 'components' || activeTab === 'subcomponents' || activeTab === 'activities') && data.length > 0 && (
            <tfoot className="table-secondary">
              <tr>
                <td colSpan={activeTab === 'activities' ? 2 : 3} className="fw-bold">Total</td>
                <td className="text-end fw-bold">{formatCurrency(data.reduce((sum, item) => sum + (parseFloat(item.allocation) || 0), 0))}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    );
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Financial Management</h2>
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
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6>Total Components</h6>
              <h3>{components.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6>Total Allocation</h6>
              <h3>${formatCurrency(getTotalAllocation())}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h6>Total Activities</h6>
              <h3>{activities.length}</h3>
            </div>
          </div>
        </div>
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

export default FinancialManagement;
