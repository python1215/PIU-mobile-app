import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiUsers, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

function DonorModal({ donor, onClose, onSave }) {
  const [name, setName] = useState(donor?.name || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name });
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              {donor ? 'Edit Donor' : 'Add New Donor'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-medium">Donor Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  placeholder="Enter donor name"
                  required
                />
              </div>
            </div>

            <div className="modal-footer border-0 pt-0">
              <button type="button" onClick={onClose} className="btn btn-outline-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {donor ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ContributorModal({ contributor, onClose, onSave }) {
  const [name, setName] = useState(contributor?.name || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name });
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              {contributor ? 'Edit Contributor' : 'Add New Contributor'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-medium">Contributor Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  placeholder="Enter contributor name"
                  required
                />
              </div>
            </div>

            <div className="modal-footer border-0 pt-0">
              <button type="button" onClick={onClose} className="btn btn-outline-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {contributor ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SystemSetup() {
  const [activeTab, setActiveTab] = useState('donors');
  const [regions, setRegions] = useState([]);
  const [years, setYears] = useState([]);
  const [quarters, setQuarters] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [donors, setDonors] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingDonor, setEditingDonor] = useState(null);
  const [editingContributor, setEditingContributor] = useState(null);
  const [donorSearch, setDonorSearch] = useState('');
  const [contributorSearch, setContributorSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [regionsRes, yearsRes, quartersRes, currenciesRes, categoriesRes, docTypesRes, donorsRes, contributorsRes] = await Promise.all([
        axios.get('/api/setup/regions').catch(() => ({ data: [] })),
        axios.get('/api/setup/years').catch(() => ({ data: [] })),
        axios.get('/api/setup/quarters').catch(() => ({ data: [] })),
        axios.get('/api/setup/currencies').catch(() => ({ data: [] })),
        axios.get('/api/setup/categories').catch(() => ({ data: [] })),
        axios.get('/api/setup/document-types').catch(() => ({ data: [] })),
        axios.get('/api/donors').catch(() => ({ data: [] })),
        axios.get('/api/setup/contributors').catch(() => ({ data: [] }))
      ]);
      setRegions(regionsRes.data);
      setYears(yearsRes.data);
      setQuarters(quartersRes.data);
      setCurrencies(currenciesRes.data);
      setCategories(categoriesRes.data);
      setDocumentTypes(docTypesRes.data);
      setDonors(donorsRes.data);
      setContributors(contributorsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'donors', label: 'Donors', data: donors },
    { id: 'contributors', label: 'Contributors', data: contributors },
    { id: 'regions', label: 'Regions', data: regions },
    { id: 'years', label: 'Years', data: years },
    { id: 'quarters', label: 'Quarters', data: quarters },
    { id: 'currencies', label: 'Currencies', data: currencies },
    { id: 'categories', label: 'Categories', data: categories },
    { id: 'documentTypes', label: 'Document Types', data: documentTypes }
  ];

  const handleCreateDonor = async (data) => {
    try {
      await axios.post('/api/donors', data);
      toast.success('Donor created successfully');
      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create donor');
    }
  };

  const handleUpdateDonor = async (data) => {
    try {
      await axios.put(`/api/donors/${editingDonor.donorId}`, data);
      toast.success('Donor updated successfully');
      setEditingDonor(null);
      loadData();
    } catch (error) {
      toast.error('Failed to update donor');
    }
  };

  const handleDeleteDonor = async (donorId) => {
    if (confirm('Are you sure you want to delete this donor?')) {
      try {
        await axios.delete(`/api/donors/${donorId}`);
        toast.success('Donor deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete donor');
      }
    }
  };

  const handleDonorSave = (data) => {
    if (editingDonor) {
      handleUpdateDonor(data);
    } else {
      handleCreateDonor(data);
    }
  };

  const filteredDonors = donors.filter((d) =>
    d.name?.toLowerCase().includes(donorSearch.toLowerCase())
  );

  const handleCreateContributor = async (data) => {
    try {
      await axios.post('/api/setup/contributors', data);
      toast.success('Contributor created successfully');
      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create contributor');
    }
  };

  const handleUpdateContributor = async (data) => {
    try {
      await axios.put(`/api/setup/contributors/${editingContributor.id}`, data);
      toast.success('Contributor updated successfully');
      setEditingContributor(null);
      loadData();
    } catch (error) {
      toast.error('Failed to update contributor');
    }
  };

  const handleDeleteContributor = async (id) => {
    if (confirm('Are you sure you want to delete this contributor?')) {
      try {
        await axios.delete(`/api/setup/contributors/${id}`);
        toast.success('Contributor deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete contributor');
      }
    }
  };

  const handleContributorSave = (data) => {
    if (editingContributor) {
      handleUpdateContributor(data);
    } else {
      handleCreateContributor(data);
    }
  };

  const filteredContributors = contributors.filter((c) =>
    c.name?.toLowerCase().includes(contributorSearch.toLowerCase())
  );

  const handleAdd = () => {
    setFormData({});
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const endpoints = {
        regions: '/api/setup/regions',
        years: '/api/setup/years',
        quarters: '/api/setup/quarters',
        currencies: '/api/setup/currencies',
        categories: '/api/setup/categories',
        documentTypes: '/api/setup/document-types'
      };
      await axios.post(endpoints[activeTab], formData);
      toast.success('Item added successfully');
      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const renderDonorsTable = () => {
    if (loading) {
      return <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>;
    }

    return (
      <div>
        <div className="mb-4">
          <div className="input-group" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white border-end-0">
              <FiSearch className="text-muted" />
            </span>
            <input
              type="text"
              value={donorSearch}
              onChange={(e) => setDonorSearch(e.target.value)}
              placeholder="Search donors..."
              className="form-control border-start-0"
            />
          </div>
        </div>
        <div className="row g-4">
          {filteredDonors.map((donor) => (
            <div key={donor.donorId} className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                      style={{ width: '48px', height: '48px', minWidth: '48px' }}
                    >
                      <FiUsers className="text-primary" size={20} />
                    </div>
                    <div>
                      <h6 className="mb-0 fw-semibold text-dark">{donor.name}</h6>
                      <small className="text-muted">ID: {donor.donorId}</small>
                    </div>
                  </div>
                  <div className="btn-group">
                    <button
                      onClick={() => setEditingDonor(donor)}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteDonor(donor.donorId)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredDonors.length === 0 && (
            <div className="col-12">
              <p className="text-center text-muted py-5">No donors found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContributorsTable = () => {
    if (loading) {
      return <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>;
    }

    return (
      <div>
        <div className="mb-4">
          <div className="input-group" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white border-end-0">
              <FiSearch className="text-muted" />
            </span>
            <input
              type="text"
              value={contributorSearch}
              onChange={(e) => setContributorSearch(e.target.value)}
              placeholder="Search contributors..."
              className="form-control border-start-0"
            />
          </div>
        </div>
        <div className="row g-4">
          {filteredContributors.map((contributor) => (
            <div key={contributor.id} className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center"
                      style={{ width: '48px', height: '48px', minWidth: '48px' }}
                    >
                      <FiUsers className="text-success" size={20} />
                    </div>
                    <div>
                      <h6 className="mb-0 fw-semibold text-dark">{contributor.name}</h6>
                      <small className="text-muted">ID: {contributor.id}</small>
                    </div>
                  </div>
                  <div className="btn-group">
                    <button
                      onClick={() => setEditingContributor(contributor)}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteContributor(contributor.id)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredContributors.length === 0 && (
            <div className="col-12">
              <p className="text-center text-muted py-5">No contributors found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTable = () => {
    const currentTab = tabs.find(t => t.id === activeTab);
    const data = currentTab?.data || [];

    if (loading) {
      return <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>;
    }

    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              {activeTab === 'regions' && <><th>Code</th><th>Name</th><th>Description</th></>}
              {activeTab === 'years' && <><th>ID</th><th>Profile Year</th></>}
              {activeTab === 'quarters' && <><th>ID</th><th>Quarter</th></>}
              {activeTab === 'currencies' && <><th>ID</th><th>Currency</th></>}
              {activeTab === 'categories' && <><th>ID</th><th>Category</th><th>Description</th></>}
              {activeTab === 'documentTypes' && <><th>ID</th><th>Document Type</th></>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted">No data available</td></tr>
            ) : (
              data.map((item, index) => (
                <tr key={index}>
                  {activeTab === 'regions' && <><td>{item.regionCode}</td><td>{item.regionName}</td><td>{item.description}</td></>}
                  {activeTab === 'years' && <><td>{item.id}</td><td>{item.profileYear}</td></>}
                  {activeTab === 'quarters' && <><td>{item.id}</td><td>{item.quarter}</td></>}
                  {activeTab === 'currencies' && <><td>{item.id}</td><td>{item.currency}</td></>}
                  {activeTab === 'categories' && <><td>{item.categoryId}</td><td>{item.category}</td><td>{item.categoryDescription}</td></>}
                  {activeTab === 'documentTypes' && <><td>{item.id}</td><td>{item.documentType}</td></>}
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

  const renderForm = () => {
    return (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New {activeTab.replace(/([A-Z])/g, ' $1').trim()}</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <div className="modal-body">
              {activeTab === 'regions' && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Region Code</label>
                    <input type="text" className="form-control" value={formData.regionCode || ''} onChange={e => setFormData({...formData, regionCode: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Region Name</label>
                    <input type="text" className="form-control" value={formData.regionName || ''} onChange={e => setFormData({...formData, regionName: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <input type="text" className="form-control" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                </>
              )}
              {activeTab === 'years' && (
                <div className="mb-3">
                  <label className="form-label">Profile Year</label>
                  <input type="text" className="form-control" value={formData.profileYear || ''} onChange={e => setFormData({...formData, profileYear: e.target.value})} />
                </div>
              )}
              {activeTab === 'quarters' && (
                <div className="mb-3">
                  <label className="form-label">Quarter</label>
                  <input type="text" className="form-control" value={formData.quarter || ''} onChange={e => setFormData({...formData, quarter: e.target.value})} />
                </div>
              )}
              {activeTab === 'currencies' && (
                <div className="mb-3">
                  <label className="form-label">Currency</label>
                  <input type="text" className="form-control" value={formData.currency || ''} onChange={e => setFormData({...formData, currency: e.target.value})} />
                </div>
              )}
              {activeTab === 'categories' && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <input type="text" className="form-control" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <input type="text" className="form-control" value={formData.categoryDescription || ''} onChange={e => setFormData({...formData, categoryDescription: e.target.value})} />
                  </div>
                </>
              )}
              {activeTab === 'documentTypes' && (
                <div className="mb-3">
                  <label className="form-label">Document Type</label>
                  <input type="text" className="form-control" value={formData.documentType || ''} onChange={e => setFormData({...formData, documentType: e.target.value})} />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>System Setup</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FiPlus className="me-2" /> Add New
        </button>
      </div>

      <ul className="nav nav-tabs mb-4">
        {tabs.map(tab => (
          <li className="nav-item" key={tab.id}>
            <button 
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="card">
        <div className="card-body">
          {activeTab === 'donors' && renderDonorsTable()}
          {activeTab === 'contributors' && renderContributorsTable()}
          {activeTab !== 'donors' && activeTab !== 'contributors' && renderTable()}
        </div>
      </div>

      {showModal && activeTab !== 'donors' && activeTab !== 'contributors' && renderForm()}
      
      {(showModal || editingDonor) && activeTab === 'donors' && (
        <DonorModal
          donor={editingDonor}
          onClose={() => {
            setShowModal(false);
            setEditingDonor(null);
          }}
          onSave={handleDonorSave}
        />
      )}

      {(showModal || editingContributor) && activeTab === 'contributors' && (
        <ContributorModal
          contributor={editingContributor}
          onClose={() => {
            setShowModal(false);
            setEditingContributor(null);
          }}
          onSave={handleContributorSave}
        />
      )}
    </div>
  );
}

export default SystemSetup;
