import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiSearch, FiChevronDown, FiMenu } from 'react-icons/fi';
import toast from 'react-hot-toast';

const GenericModal = memo(function GenericModal({ title, fields, item, onClose, onSave, relatedData }) {
  const [formData, setFormData] = useState(() => {
    if (item) {
      const initial = { ...item };
      fields.forEach(f => {
        if (f.type === 'select' && f.relationField && item[f.relationField]) {
          initial[f.name] = item[f.relationField][f.valueField] || '';
        }
      });
      return initial;
    }
    const initial = {};
    fields.forEach(f => { initial[f.name] = ''; });
    return initial;
  });

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const submitData = { ...formData };
    fields.forEach(f => {
      if (f.type === 'select' && f.relationField) {
        const selectedItem = relatedData[f.dataKey]?.find(
          d => String(d[f.valueField]) === String(formData[f.name])
        );
        if (selectedItem) {
          submitData[f.relationField] = selectedItem;
        }
      }
    });
    onSave(submitData);
  }, [formData, onSave, fields, relatedData]);

  const handleChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">{item ? `Edit ${title}` : `Add New ${title}`}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {fields.map(field => (
                <div className="mb-3" key={field.name}>
                  <label className="form-label fw-medium">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="form-select"
                      required={field.required !== false}
                      disabled={field.disableOnEdit && !!item}
                    >
                      <option value="">-- Select {field.label} --</option>
                      {(relatedData[field.dataKey] || []).map(opt => (
                        <option key={opt[field.valueField]} value={opt[field.valueField]}>
                          {opt[field.displayField]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="form-control"
                      placeholder={field.placeholder || ''}
                      required={field.required !== false}
                      disabled={field.disableOnEdit && !!item}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" onClick={onClose} className="btn btn-outline-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">{item ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

const DataTable = memo(function DataTable({ columns, data, onEdit, onDelete, idField }) {
  if (data.length === 0) {
    return <p className="text-center text-muted py-5">No data available</p>;
  }

  const getCellValue = (item, col) => {
    if (col.nested) {
      return item[col.key]?.[col.nested] || '-';
    }
    return item[col.key] || '-';
  };

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            {columns.map(col => <th key={col.key + (col.nested || '')}>{col.label}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item[idField] || index}>
              {columns.map(col => <td key={col.key + (col.nested || '')}>{getCellValue(item, col)}</td>)}
              <td>
                {onEdit && <button onClick={() => onEdit(item)} className="btn btn-sm btn-outline-primary me-1"><FiEdit2 /></button>}
                {onDelete && <button onClick={() => onDelete(item)} className="btn btn-sm btn-outline-danger"><FiTrash2 /></button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

const CardGrid = memo(function CardGrid({ data, idField, nameField, onEdit, onDelete, bgClass = 'bg-primary' }) {
  if (data.length === 0) {
    return <p className="text-center text-muted py-5">No data available</p>;
  }

  return (
    <div className="row g-4">
      {data.map((item) => (
        <div key={item[idField]} className="col-12 col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div className={`rounded-circle ${bgClass} bg-opacity-10 d-flex align-items-center justify-content-center`} style={{ width: '48px', height: '48px', minWidth: '48px' }}>
                  <FiUsers className={bgClass.replace('bg-', 'text-')} size={20} />
                </div>
                <div>
                  <h6 className="mb-0 fw-semibold text-dark">{item[nameField]}</h6>
                  <small className="text-muted">ID: {item[idField]}</small>
                </div>
              </div>
              <div className="btn-group">
                {onEdit && <button onClick={() => onEdit(item)} className="btn btn-sm btn-outline-secondary"><FiEdit2 size={16} /></button>}
                {onDelete && <button onClick={() => onDelete(item)} className="btn btn-sm btn-outline-danger"><FiTrash2 size={16} /></button>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

function SystemSetup() {
  const [activeTab, setActiveTab] = useState('donors');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const tabConfig = useMemo(() => ({
    donors: { endpoint: '/api/donors', idField: 'donorId', nameField: 'name', label: 'Donors', cardView: true, bgClass: 'bg-primary',
      fields: [{ name: 'name', label: 'Donor Name', placeholder: 'Enter donor name' }] },
    contributors: { endpoint: '/api/setup/contributors', idField: 'id', nameField: 'name', label: 'Contributors', cardView: true, bgClass: 'bg-success',
      fields: [{ name: 'name', label: 'Contributor Name', placeholder: 'Enter contributor name' }] },
    regions: { endpoint: '/api/setup/regions', idField: 'regionCode', label: 'Regions',
      columns: [{ key: 'regionCode', label: 'Code' }, { key: 'regionName', label: 'Name' }, { key: 'description', label: 'Description' }],
      fields: [{ name: 'regionCode', label: 'Region Code', disableOnEdit: true }, { name: 'regionName', label: 'Region Name' }, { name: 'description', label: 'Description', required: false }] },
    lgas: { endpoint: '/api/setup/lgas', idField: 'lgaCode', label: 'LGAs',
      columns: [{ key: 'lgaCode', label: 'Code' }, { key: 'lgaName', label: 'Name' }, { key: 'region', label: 'Region', nested: 'regionName' }],
      fields: [
        { name: 'lgaCode', label: 'LGA Code', disableOnEdit: true },
        { name: 'lgaName', label: 'LGA Name' },
        { name: 'regionCode', label: 'Region', type: 'select', dataKey: 'regions', valueField: 'regionCode', displayField: 'regionName', relationField: 'region' }
      ] },
    districts: { endpoint: '/api/setup/districts', idField: 'districtCode', label: 'Districts',
      columns: [{ key: 'districtCode', label: 'Code' }, { key: 'districtName', label: 'Name' }, { key: 'lga', label: 'LGA', nested: 'lgaName' }],
      fields: [
        { name: 'districtCode', label: 'District Code', disableOnEdit: true },
        { name: 'districtName', label: 'District Name' },
        { name: 'lgaCode', label: 'LGA', type: 'select', dataKey: 'lgas', valueField: 'lgaCode', displayField: 'lgaName', relationField: 'lga' }
      ] },
    wards: { endpoint: '/api/setup/wards', idField: 'wardCode', label: 'Wards',
      columns: [{ key: 'wardCode', label: 'Code' }, { key: 'wardName', label: 'Name' }, { key: 'district', label: 'District', nested: 'districtName' }],
      fields: [
        { name: 'wardCode', label: 'Ward Code', disableOnEdit: true },
        { name: 'wardName', label: 'Ward Name' },
        { name: 'districtCode', label: 'District', type: 'select', dataKey: 'districts', valueField: 'districtCode', displayField: 'districtName', relationField: 'district' }
      ] },
    settlements: { endpoint: '/api/setup/settlements', idField: 'settlementCode', label: 'Settlements',
      columns: [{ key: 'settlementCode', label: 'Code' }, { key: 'settlementName', label: 'Name' }, { key: 'ward', label: 'Ward', nested: 'wardName' }],
      fields: [
        { name: 'settlementCode', label: 'Settlement Code', disableOnEdit: true },
        { name: 'settlementName', label: 'Settlement Name' },
        { name: 'wardCode', label: 'Ward', type: 'select', dataKey: 'wards', valueField: 'wardCode', displayField: 'wardName', relationField: 'ward' }
      ] },
    years: { endpoint: '/api/setup/years', idField: 'id', label: 'Years',
      columns: [{ key: 'id', label: 'ID' }, { key: 'profileYear', label: 'Profile Year' }],
      fields: [{ name: 'profileYear', label: 'Profile Year', placeholder: 'e.g., 2025' }] },
    quarters: { endpoint: '/api/setup/quarters', idField: 'id', label: 'Quarters',
      columns: [{ key: 'id', label: 'ID' }, { key: 'quarter', label: 'Quarter' }],
      fields: [{ name: 'quarter', label: 'Quarter', placeholder: 'e.g., Q1' }] },
    currencies: { endpoint: '/api/setup/currencies', idField: 'id', label: 'Currencies',
      columns: [{ key: 'id', label: 'ID' }, { key: 'currency', label: 'Currency' }],
      fields: [{ name: 'currency', label: 'Currency', placeholder: 'e.g., USD' }] },
    categories: { endpoint: '/api/setup/categories', idField: 'categoryId', label: 'Project Categories',
      columns: [{ key: 'categoryId', label: 'ID' }, { key: 'category', label: 'Category' }, { key: 'categoryDescription', label: 'Description' }],
      fields: [{ name: 'category', label: 'Category Name' }, { name: 'categoryDescription', label: 'Description', required: false }] },
    documentTypes: { endpoint: '/api/setup/document-types', idField: 'id', label: 'Document Types',
      columns: [{ key: 'id', label: 'ID' }, { key: 'documentType', label: 'Document Type' }],
      fields: [{ name: 'documentType', label: 'Document Type' }] },
    monitoringTypes: { endpoint: '/api/setup/monitoring-types', idField: 'monitoringTypeCode', label: 'Monitoring Types',
      columns: [{ key: 'monitoringTypeCode', label: 'Code' }, { key: 'monitoringType', label: 'Monitoring Type' }],
      fields: [{ name: 'monitoringTypeCode', label: 'Type Code', disableOnEdit: true }, { name: 'monitoringType', label: 'Monitoring Type' }] },
    papTypes: { endpoint: '/api/setup/pap-types', idField: 'id', label: 'Type of PAP',
      columns: [{ key: 'id', label: 'ID' }, { key: 'typeOfPap', label: 'Type of PAP' }],
      fields: [{ name: 'typeOfPap', label: 'Type of PAP' }] },
    papCategories: { endpoint: '/api/setup/pap-categories', idField: 'id', label: 'PAP Categories',
      columns: [{ key: 'id', label: 'ID' }, { key: 'papCategory', label: 'PAP Category' }],
      fields: [{ name: 'papCategory', label: 'PAP Category' }] },
    impactTypes: { endpoint: '/api/setup/impact-types', idField: 'id', label: 'Type of Impact',
      columns: [{ key: 'id', label: 'ID' }, { key: 'impact', label: 'Impact' }],
      fields: [{ name: 'impact', label: 'Type of Impact' }] },
    settlementNatures: { endpoint: '/api/setup/settlement-natures', idField: 'id', label: 'Nature of Settlement',
      columns: [{ key: 'id', label: 'ID' }, { key: 'natureOfSettlement', label: 'Nature of Settlement' }],
      fields: [{ name: 'natureOfSettlement', label: 'Nature of Settlement' }] },
    decisionOutcomes: { endpoint: '/api/setup/decision-outcomes', idField: 'id', label: 'Decision Outcomes',
      columns: [{ key: 'id', label: 'ID' }, { key: 'outcome', label: 'Outcome' }],
      fields: [{ name: 'outcome', label: 'Decision Outcome' }] },
    stakeholderEngagements: { endpoint: '/api/setup/stakeholder-engagements', idField: 'id', label: 'Stakeholder Engagement',
      columns: [{ key: 'id', label: 'ID' }, { key: 'engagementType', label: 'Engagement Type' }],
      fields: [{ name: 'engagementType', label: 'Stakeholder Engagement Type' }] },
    accessTypes: { endpoint: '/api/setup/access-types', idField: 'id', label: 'Access Types',
      columns: [{ key: 'id', label: 'ID' }, { key: 'accessType', label: 'Access Type' }],
      fields: [{ name: 'accessType', label: 'Access Type' }] },
    dataFrequencies: { endpoint: '/api/setup/data-frequencies', idField: 'id', label: 'Data Collection Frequency',
      columns: [{ key: 'id', label: 'ID' }, { key: 'frequency', label: 'Frequency' }],
      fields: [{ name: 'frequency', label: 'Data Collection Frequency' }] },
    investmentTypes: { endpoint: '/api/setup/investment-types', idField: 'id', label: 'Type of Investment',
      columns: [{ key: 'id', label: 'ID' }, { key: 'nameOfInvestment', label: 'Investment Type' }],
      fields: [{ name: 'nameOfInvestment', label: 'Type of Investment' }] },
    indicatorTypes: { endpoint: '/api/setup/indicator-types', idField: 'id', label: 'Indicator Types',
      columns: [{ key: 'id', label: 'ID' }, { key: 'indicatorType', label: 'Indicator Type' }],
      fields: [{ name: 'indicatorType', label: 'Indicator Type' }] },
    physicalProgress: { endpoint: '/api/setup/physical-progress', idField: 'id', label: 'Physical Progress',
      columns: [{ key: 'id', label: 'ID' }, { key: 'progressScale', label: 'Progress Scale' }],
      fields: [{ name: 'progressScale', label: 'Physical Progress Scale' }] },
    measurementUnits: { endpoint: '/api/setup/measurement-units', idField: 'id', label: 'Measurement Units',
      columns: [{ key: 'id', label: 'ID' }, { key: 'unit', label: 'Unit' }],
      fields: [{ name: 'unit', label: 'Measurement Unit' }] },
    vulnerabilityCategories: { endpoint: '/api/setup/vulnerability-categories', idField: 'id', label: 'Vulnerability Categories',
      columns: [{ key: 'id', label: 'ID' }, { key: 'vulnerability', label: 'Vulnerability' }],
      fields: [{ name: 'vulnerability', label: 'Vulnerability Category' }] },
    kpiContracts: { endpoint: '/api/setup/kpi-contracts', idField: 'id', label: 'KPI Contracts',
      columns: [{ key: 'id', label: 'ID' }, { key: 'kpiCode', label: 'KPI Code' }, { key: 'kpiName', label: 'KPI Name' }],
      fields: [{ name: 'kpiCode', label: 'KPI Code' }, { name: 'kpiName', label: 'KPI Name' }] },
    pdos: { endpoint: '/api/setup/pdos', idField: 'id', label: 'PDO Setup',
      columns: [{ key: 'id', label: 'ID' }, { key: 'pdoStatement', label: 'PDO Statement' }],
      fields: [{ name: 'pdoStatement', label: 'PDO Statement' }] },
    outcomes: { endpoint: '/api/setup/outcomes', idField: 'id', label: 'Project Outcomes',
      columns: [{ key: 'id', label: 'ID' }, { key: 'projectOutcome', label: 'Project Outcome' }],
      fields: [{ name: 'projectOutcome', label: 'Project Outcome' }] },
    results: { endpoint: '/api/setup/results', idField: 'id', label: 'Project Results',
      columns: [{ key: 'id', label: 'ID' }, { key: 'projectResult', label: 'Project Result' }],
      fields: [{ name: 'projectResult', label: 'Project Result' }] },
  }), []);

  const menuGroups = useMemo(() => [
    { 
      label: 'Stakeholders', 
      items: [
        { id: 'donors', label: 'Donors' },
        { id: 'contributors', label: 'Contributors' },
      ]
    },
    { 
      label: 'Geography', 
      items: [
        { id: 'regions', label: 'Regions' },
        { id: 'lgas', label: 'LGAs' },
        { id: 'districts', label: 'Districts' },
        { id: 'wards', label: 'Wards' },
        { id: 'settlements', label: 'Settlements' },
      ]
    },
    { 
      label: 'Time & Finance', 
      items: [
        { id: 'years', label: 'Years' },
        { id: 'quarters', label: 'Quarters' },
        { id: 'currencies', label: 'Currencies' },
        { id: 'investmentTypes', label: 'Investment Types' },
      ]
    },
    { 
      label: 'Project Setup', 
      items: [
        { id: 'categories', label: 'Categories' },
        { id: 'documentTypes', label: 'Document Types' },
        { id: 'monitoringTypes', label: 'Monitoring Types' },
        { id: 'indicatorTypes', label: 'Indicator Types' },
        { id: 'measurementUnits', label: 'Measurement Units' },
        { id: 'physicalProgress', label: 'Physical Progress' },
        { id: 'dataFrequencies', label: 'Data Frequency' },
      ]
    },
    { 
      label: 'Social & PAP', 
      items: [
        { id: 'papTypes', label: 'PAP Types' },
        { id: 'papCategories', label: 'PAP Categories' },
        { id: 'impactTypes', label: 'Impact Types' },
        { id: 'settlementNatures', label: 'Settlement Nature' },
        { id: 'vulnerabilityCategories', label: 'Vulnerability' },
        { id: 'stakeholderEngagements', label: 'Stakeholder Eng.' },
        { id: 'accessTypes', label: 'Access Types' },
        { id: 'decisionOutcomes', label: 'Decision Outcomes' },
      ]
    },
    { 
      label: 'Results Framework', 
      items: [
        { id: 'pdos', label: 'PDO Setup' },
        { id: 'outcomes', label: 'Outcomes' },
        { id: 'results', label: 'Results' },
        { id: 'kpiContracts', label: 'KPI Contracts' },
      ]
    },
  ], []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        Object.entries(tabConfig).map(async ([key, config]) => {
          try {
            const res = await axios.get(config.endpoint);
            return [key, res.data];
          } catch {
            return [key, []];
          }
        })
      );
      const newData = {};
      results.forEach(([key, value]) => { newData[key] = value; });
      setData(newData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [tabConfig]);

  useEffect(() => { loadData(); }, [loadData]);

  const currentConfig = useMemo(() => tabConfig[activeTab], [tabConfig, activeTab]);
  const currentData = useMemo(() => data[activeTab] || [], [data, activeTab]);

  const filteredData = useMemo(() => {
    if (!search) return currentData;
    const searchLower = search.toLowerCase();
    return currentData.filter(item =>
      Object.values(item).some(val => {
        if (typeof val === 'object' && val !== null) {
          return Object.values(val).some(v => String(v).toLowerCase().includes(searchLower));
        }
        return String(val).toLowerCase().includes(searchLower);
      })
    );
  }, [currentData, search]);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (item) => {
    if (!confirm(`Are you sure you want to delete this ${currentConfig.label}?`)) return;
    try {
      await axios.delete(`${currentConfig.endpoint}/${item[currentConfig.idField]}`);
      toast.success('Deleted successfully');
      loadData();
    } catch {
      toast.error('Failed to delete');
    }
  }, [currentConfig, loadData]);

  const handleSave = useCallback(async (formData) => {
    try {
      if (editingItem) {
        await axios.put(`${currentConfig.endpoint}/${editingItem[currentConfig.idField]}`, formData);
        toast.success('Updated successfully');
      } else {
        await axios.post(currentConfig.endpoint, formData);
        toast.success('Created successfully');
      }
      setShowModal(false);
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save');
    }
  }, [currentConfig, editingItem, loadData]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingItem(null);
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setSearch('');
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const toggleDropdown = useCallback((groupLabel) => {
    setActiveDropdown(prev => prev === groupLabel ? null : groupLabel);
  }, []);

  const getActiveGroupLabel = useMemo(() => {
    for (const group of menuGroups) {
      if (group.items.some(item => item.id === activeTab)) {
        return group.label;
      }
    }
    return '';
  }, [menuGroups, activeTab]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">System Setup</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FiPlus className="me-2" /> Add New
        </button>
      </div>

      <nav className="navbar navbar-expand-lg navbar-light bg-white rounded shadow-sm mb-4 p-0">
        <div className="container-fluid p-0">
          <button 
            className="navbar-toggler w-100 d-lg-none border-0 py-3 px-4 d-flex justify-content-between align-items-center"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="fw-medium text-primary">
              {getActiveGroupLabel} / {currentConfig.label}
            </span>
            <FiMenu size={20} />
          </button>
          
          <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav w-100 flex-wrap">
              {menuGroups.map((group) => (
                <li className="nav-item dropdown" key={group.label}>
                  <button
                    className={`nav-link dropdown-toggle px-3 py-3 border-0 bg-transparent ${
                      group.items.some(item => item.id === activeTab) ? 'text-primary fw-semibold' : 'text-dark'
                    }`}
                    onClick={() => toggleDropdown(group.label)}
                    style={{ cursor: 'pointer' }}
                  >
                    {group.label}
                    <FiChevronDown size={14} className="ms-1" />
                  </button>
                  <ul className={`dropdown-menu shadow border-0 ${activeDropdown === group.label ? 'show' : ''}`}>
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <button
                          className={`dropdown-item py-2 ${activeTab === item.id ? 'active bg-primary text-white' : ''}`}
                          onClick={() => handleTabChange(item.id)}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <h5 className="mb-0 text-primary fw-semibold">{currentConfig.label}</h5>
            <div className="input-group" style={{ maxWidth: '300px' }}>
              <span className="input-group-text bg-white border-end-0">
                <FiSearch className="text-muted" />
              </span>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="form-control border-start-0"
              />
            </div>
          </div>
        </div>
        <div className="card-body">
          {currentConfig.cardView ? (
            <CardGrid
              data={filteredData}
              idField={currentConfig.idField}
              nameField={currentConfig.nameField}
              bgClass={currentConfig.bgClass}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <DataTable
              columns={currentConfig.columns}
              data={filteredData}
              idField={currentConfig.idField}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {showModal && (
        <GenericModal
          title={currentConfig.label}
          fields={currentConfig.fields}
          item={editingItem}
          onClose={handleCloseModal}
          onSave={handleSave}
          relatedData={data}
        />
      )}
    </div>
  );
}

export default SystemSetup;
