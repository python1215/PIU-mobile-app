import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

function SystemSetup() {
  const [activeTab, setActiveTab] = useState('regions');
  const [regions, setRegions] = useState([]);
  const [years, setYears] = useState([]);
  const [quarters, setQuarters] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [regionsRes, yearsRes, quartersRes, currenciesRes, categoriesRes, docTypesRes] = await Promise.all([
        axios.get('/api/setup/regions').catch(() => ({ data: [] })),
        axios.get('/api/setup/years').catch(() => ({ data: [] })),
        axios.get('/api/setup/quarters').catch(() => ({ data: [] })),
        axios.get('/api/setup/currencies').catch(() => ({ data: [] })),
        axios.get('/api/setup/categories').catch(() => ({ data: [] })),
        axios.get('/api/setup/document-types').catch(() => ({ data: [] }))
      ]);
      setRegions(regionsRes.data);
      setYears(yearsRes.data);
      setQuarters(quartersRes.data);
      setCurrencies(currenciesRes.data);
      setCategories(categoriesRes.data);
      setDocumentTypes(docTypesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'regions', label: 'Regions', data: regions },
    { id: 'years', label: 'Years', data: years },
    { id: 'quarters', label: 'Quarters', data: quarters },
    { id: 'currencies', label: 'Currencies', data: currencies },
    { id: 'categories', label: 'Categories', data: categories },
    { id: 'documentTypes', label: 'Document Types', data: documentTypes }
  ];

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
          {renderTable()}
        </div>
      </div>

      {showModal && renderForm()}
    </div>
  );
}

export default SystemSetup;
