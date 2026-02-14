import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiSearch, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const GenericModal = memo(function GenericModal({ title, fields, item, onClose, onSave, relatedData, t, infoBox }) {
  const [formData, setFormData] = useState(() => {
    if (item) {
      const initial = { ...item };
      fields.forEach(f => {
        if (f.type === 'select' && f.relationField && item[f.relationField]) {
          initial[f.name] = item[f.relationField][f.valueField] || '';
        }
        if (f.type === 'cascadeParent' && f.childField) {
          const childField = fields.find(cf => cf.name === f.childField);
          if (childField && item[childField.relationField]) {
            const childItem = item[childField.relationField];
            if (childItem && childItem[f.parentRelation]) {
              initial[f.name] = childItem[f.parentRelation][f.valueField] || '';
            }
          }
        }
      });
      return initial;
    }
    const initial = {};
    fields.forEach(f => { initial[f.name] = ''; });
    return initial;
  });
  const [saving, setSaving] = useState(false);

  const getFilteredOptions = useCallback((field) => {
    if (!field.filterBy) return relatedData[field.dataKey] || [];
    const parentValue = formData[field.filterBy];
    if (!parentValue) return relatedData[field.dataKey] || [];
    return (relatedData[field.dataKey] || []).filter(opt => {
      const parentObj = opt[field.filterField];
      return parentObj && parentObj[field.filterValue] === parentValue;
    });
  }, [formData, relatedData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    
    const submitData = { ...formData };
    fields.forEach(f => {
      if (f.type === 'select' && f.relationField) {
        const options = getFilteredOptions(f);
        const selectedItem = options.find(
          d => String(d[f.valueField]) === String(formData[f.name])
        );
        if (selectedItem) {
          submitData[f.relationField] = selectedItem;
        }
      }
      if (f.type === 'cascadeParent') {
        delete submitData[f.name];
      }
    });
    
    try {
      await onSave(submitData);
    } finally {
      setSaving(false);
    }
  }, [formData, onSave, fields, getFilteredOptions, saving]);

  const handleChange = useCallback((name, value, field) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (field && field.clearsField) {
        newData[field.clearsField] = '';
      }
      return newData;
    });
  }, []);

  const isLargeForm = fields.length > 3;
  
  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div 
        className="modal-dialog modal-dialog-centered modal-dialog-scrollable" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: isLargeForm ? '700px' : '500px',
          width: '95%',
          margin: '1rem auto'
        }}
      >
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden', maxHeight: '90vh' }}>
          <div className="modal-header border-0 py-2 py-md-3 px-3 px-md-4" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }}>
            <div className="d-flex align-items-center">
              <div className="rounded-circle bg-white bg-opacity-25 p-1 p-md-2 me-2 me-md-3">
                <FiEdit2 className="text-white" size={16} />
              </div>
              <div>
                <h6 className="modal-title fw-bold text-white mb-0" style={{ fontSize: '1rem' }}>
                  {item ? `${t('common.edit')} ${title}` : `${t('common.addNew')} ${title}`}
                </h6>
              </div>
            </div>
            <button type="button" className="btn btn-link text-white p-0" onClick={onClose} disabled={saving}>
              <FiX size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-3 p-md-4" style={{ overflowY: 'auto', background: '#f8f9fa', maxHeight: 'calc(90vh - 140px)' }}>
              <div className="row g-3">
                {fields.map((field, index) => (
                  <div className={`col-12 ${field.halfWidth ? 'col-sm-6' : ''}`} key={field.name}>
                    <label className="form-label fw-medium text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                      {field.label}
                      {field.required !== false && <span className="text-danger ms-1">*</span>}
                    </label>
                    {field.type === 'select' || field.type === 'cascadeParent' ? (
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value, field)}
                        className="form-select"
                        required={field.required !== false && field.type !== 'cascadeParent'}
                        disabled={(field.disableOnEdit && !!item) || saving}
                        style={{ borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                      >
                        <option value="">{field.placeholder || `Select ${field.label}...`}</option>
                        {(field.type === 'cascadeParent' 
                          ? (relatedData[field.dataKey] || [])
                          : getFilteredOptions(field)
                        ).map(opt => (
                          <option key={opt[field.valueField]} value={opt[field.valueField]}>
                            {opt[field.displayField]}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className="form-control"
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                        required={field.required !== false}
                        disabled={(field.disableOnEdit && !!item) || saving}
                        rows={2}
                        style={{ borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.9rem', resize: 'vertical' }}
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className="form-control"
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                        required={field.required !== false}
                        disabled={(field.disableOnEdit && !!item) || saving}
                        style={{ borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                      />
                    )}
                    {field.helpText && (
                      <small className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>{field.helpText}</small>
                    )}
                  </div>
                ))}
              </div>
              {infoBox && (
                <div className="mt-3 p-3 rounded-3" style={{ background: '#e0f2fe', border: '1px solid #bae6fd' }}>
                  <div className="d-flex align-items-center mb-2">
                    <span className="me-2" style={{ color: '#0284c7' }}>&#9432;</span>
                    <strong style={{ color: '#0c4a6e', fontSize: '0.9rem' }}>{infoBox.title}</strong>
                  </div>
                  <ul className="mb-0 ps-3" style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>
                    {infoBox.items.map((item, i) => (
                      <li key={i} className="mb-1">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="modal-footer border-top py-2 px-3 px-md-4 bg-white">
              <div className="d-flex gap-2 w-100 justify-content-end">
                <button type="button" onClick={onClose} className="btn btn-outline-secondary px-3 py-2" disabled={saving} style={{ borderRadius: '8px', fontSize: '0.9rem' }}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary px-3 py-2 d-flex align-items-center gap-2" disabled={saving} style={{ borderRadius: '8px', fontSize: '0.9rem' }}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <FiPlus size={16} />
                      {item ? t('common.update') : t('common.create')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

const DataTable = memo(function DataTable({ columns, data, onEdit, onDelete, idField, t }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted mb-3">
          <FiUsers size={48} className="opacity-25" />
        </div>
        <p className="text-muted mb-0">{t('common.noData')}</p>
      </div>
    );
  }

  const getCellValue = (item, col) => {
    if (col.nested) {
      return item[col.key]?.[col.nested] || '-';
    }
    if (col.key.includes('.')) {
      const parts = col.key.split('.');
      let val = item;
      for (const p of parts) {
        val = val?.[p];
      }
      return val || '-';
    }
    return item[col.key] || '-';
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="bg-light">
          <tr>
            {columns.map(col => (
              <th key={col.key + (col.nested || '')} className="fw-semibold text-dark border-0 py-3">
                {col.label}
              </th>
            ))}
            <th className="fw-semibold text-dark border-0 py-3" style={{ width: '120px' }}>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item[idField] || index} className="border-bottom">
              {columns.map(col => (
                <td key={col.key + (col.nested || '')} className="py-3">
                  {getCellValue(item, col)}
                </td>
              ))}
              <td className="py-3">
                <div className="btn-group btn-group-sm">
                  {onEdit && (
                    <button onClick={() => onEdit(item)} className="btn btn-outline-primary border-0">
                      <FiEdit2 size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(item)} className="btn btn-outline-danger border-0">
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

const CardGrid = memo(function CardGrid({ data, idField, nameField, onEdit, onDelete, bgClass = 'bg-primary', t }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted mb-3">
          <FiUsers size={48} className="opacity-25" />
        </div>
        <p className="text-muted mb-0">{t('common.noData')}</p>
      </div>
    );
  }

  return (
    <div className="row g-4">
      {data.map((item) => (
        <div key={item[idField]} className="col-12 col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm h-100 rounded-3">
            <div className="card-body d-flex align-items-center justify-content-between p-3">
              <div className="d-flex align-items-center gap-3">
                <div className={`rounded-circle ${bgClass} bg-opacity-10 d-flex align-items-center justify-content-center`} style={{ width: '52px', height: '52px', minWidth: '52px' }}>
                  <FiUsers className={bgClass.replace('bg-', 'text-')} size={22} />
                </div>
                <div>
                  <h6 className="mb-1 fw-semibold text-dark">{item[nameField]}</h6>
                  <small className="text-muted">ID: {item[idField]}</small>
                </div>
              </div>
              <div className="btn-group btn-group-sm">
                {onEdit && (
                  <button onClick={() => onEdit(item)} className="btn btn-outline-secondary border-0">
                    <FiEdit2 size={16} />
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(item)} className="btn btn-outline-danger border-0">
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

function SystemSetup() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('donors');
  const [data, setData] = useState({});
  const [loadedTabs, setLoadedTabs] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const initialLoadDone = useRef(false);

  const tabConfig = useMemo(() => ({
    donors: { endpoint: '/api/donors', idField: 'donorId', nameField: 'name', label: 'Donors', cardView: true, bgClass: 'bg-primary',
      fields: [{ name: 'name', label: 'Donor Name', placeholder: 'Enter donor name' }] },
    contributors: { endpoint: '/api/setup/contributors', idField: 'id', nameField: 'name', label: 'Contributors', cardView: true, bgClass: 'bg-success',
      fields: [{ name: 'name', label: 'Contributor Name', placeholder: 'Enter contributor name' }] },
    regions: { endpoint: '/api/setup/regions', idField: 'regionCode', label: 'Regions',
      columns: [{ key: 'regionCode', label: 'Code' }, { key: 'regionName', label: 'Name' }, { key: 'description', label: 'Description' }],
      fields: [
        { name: 'regionCode', label: 'Region Code', disableOnEdit: true, halfWidth: true },
        { name: 'regionName', label: 'Region Name', halfWidth: true },
        { name: 'description', label: 'Description', required: false }
      ] },
    lgas: { endpoint: '/api/setup/lgas', idField: 'lgaCode', label: 'LGAs',
      columns: [{ key: 'lgaCode', label: 'Code' }, { key: 'lgaName', label: 'Name' }, { key: 'region', label: 'Region', nested: 'regionName' }],
      fields: [
        { name: 'lgaCode', label: 'LGA Code', disableOnEdit: true, halfWidth: true },
        { name: 'lgaName', label: 'LGA Name', halfWidth: true },
        { name: 'regionCode', label: 'Region', type: 'select', dataKey: 'regions', valueField: 'regionCode', displayField: 'regionName', relationField: 'region' }
      ] },
    districts: { endpoint: '/api/setup/districts', idField: 'districtCode', label: 'Districts',
      columns: [{ key: 'districtCode', label: 'Code' }, { key: 'districtName', label: 'Name' }, { key: 'lga', label: 'LGA', nested: 'lgaName' }],
      fields: [
        { name: 'districtCode', label: 'District Code', disableOnEdit: true, halfWidth: true },
        { name: 'districtName', label: 'District Name', halfWidth: true },
        { name: 'regionFilter', label: 'Region', type: 'cascadeParent', dataKey: 'regions', valueField: 'regionCode', displayField: 'regionName', childField: 'lgaCode', parentRelation: 'region', clearsField: 'lgaCode', required: false, helpText: 'Filter LGAs by region' },
        { name: 'lgaCode', label: 'LGA', type: 'select', dataKey: 'lgas', valueField: 'lgaCode', displayField: 'lgaName', relationField: 'lga', filterBy: 'regionFilter', filterField: 'region', filterValue: 'regionCode' }
      ] },
    wards: { endpoint: '/api/setup/wards', idField: 'wardCode', label: 'Wards',
      columns: [{ key: 'wardCode', label: 'Code' }, { key: 'wardName', label: 'Name' }, { key: 'district', label: 'District', nested: 'districtName' }],
      fields: [
        { name: 'wardCode', label: 'Ward Code', disableOnEdit: true, halfWidth: true },
        { name: 'wardName', label: 'Ward Name', halfWidth: true },
        { name: 'districtCode', label: 'District', type: 'select', dataKey: 'districts', valueField: 'districtCode', displayField: 'districtName', relationField: 'district' }
      ] },
    settlements: { endpoint: '/api/setup/settlements', idField: 'settlementCode', label: 'Settlements',
      columns: [{ key: 'settlementCode', label: 'Code' }, { key: 'settlementName', label: 'Name' }, { key: 'ward', label: 'Ward', nested: 'wardName' }],
      fields: [
        { name: 'settlementCode', label: 'Settlement Code', disableOnEdit: true, halfWidth: true },
        { name: 'settlementName', label: 'Settlement Name', halfWidth: true },
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
      fields: [
        { name: 'monitoringTypeCode', label: 'Type Code', disableOnEdit: true, halfWidth: true },
        { name: 'monitoringType', label: 'Monitoring Type', halfWidth: true }
      ] },
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
      columns: [
        { key: 'id', label: 'ID' }, 
        { key: 'kpiCode', label: 'KPI Code' }, 
        { key: 'project', label: 'Project', nested: 'project' }, 
        { key: 'monitoringType', label: 'Monitoring Type', nested: 'monitoringType' },
        { key: 'typeOfInvestment', label: 'Investment Type' },
        { key: 'kpiDescription', label: 'Description' }
      ],
      fields: [
        { name: 'kpiCode', label: 'KPI Code', halfWidth: true },
        { name: 'project', label: 'Project', type: 'select', dataKey: 'projects', valueField: 'projectId', displayField: 'project', relationField: 'project', halfWidth: true },
        { name: 'typeOfInvestment', label: 'Type of Investment', type: 'textarea' },
        { name: 'kpiDescription', label: 'KPI Description', type: 'textarea' },
        { name: 'monitoringType', label: 'Monitoring Type', type: 'select', dataKey: 'monitoringTypes', valueField: 'monitoringTypeCode', displayField: 'monitoringType', relationField: 'monitoringType' }
      ],
      relatedDataKeys: ['projects', 'monitoringTypes'] },
    pdos: { endpoint: '/api/setup/pdos', idField: 'id', label: 'PDO Setup',
      columns: [{ key: 'id', label: 'ID' }, { key: 'pdoStatement', label: 'PDO Statement' }],
      fields: [{ name: 'pdoStatement', label: 'PDO Statement' }] },
    outcomes: { endpoint: '/api/setup/outcomes', idField: 'id', label: 'Project Outcomes',
      columns: [{ key: 'id', label: 'ID' }, { key: 'pdo.pdoStatement', label: 'Related PDO' }, { key: 'projectOutcome', label: 'Project Outcome' }],
      fields: [
        { name: 'pdoId', label: 'PDO', type: 'select', dataKey: 'pdos', valueField: 'id', displayField: 'pdoStatement', relationField: 'pdo', placeholder: '----------' },
        { name: 'projectOutcome', label: 'Project Outcome', placeholder: 'Enter project outcome description', helpText: 'Enter a clear and measurable project outcome' }
      ],
      infoBox: {
        title: 'Project Outcome Guidelines',
        items: [
          'Select the PDO that this outcome supports',
          'Describe a specific, measurable outcome',
          'Outcomes should be achievable and time-bound',
          'Use clear, actionable language'
        ]
      },
      relatedDataKeys: ['pdos'] },
    results: { endpoint: '/api/setup/results', idField: 'id', label: 'Project Results',
      columns: [{ key: 'id', label: 'ID' }, { key: 'projectResult', label: 'Project Result' }],
      fields: [{ name: 'projectResult', label: 'Project Result' }] },
  }), []);

  const menuGroups = useMemo(() => [
    { label: 'Stakeholders', items: [{ id: 'donors', label: 'Donors' }, { id: 'contributors', label: 'Contributors' }] },
    { label: 'Geography', items: [{ id: 'regions', label: 'Regions' }, { id: 'lgas', label: 'LGAs' }, { id: 'districts', label: 'Districts' }, { id: 'wards', label: 'Wards' }, { id: 'settlements', label: 'Settlements' }] },
    { label: 'Time & Finance', items: [{ id: 'years', label: 'Years' }, { id: 'quarters', label: 'Quarters' }, { id: 'currencies', label: 'Currencies' }, { id: 'investmentTypes', label: 'Investment Types' }] },
    { label: 'Project Setup', items: [{ id: 'categories', label: 'Categories' }, { id: 'documentTypes', label: 'Document Types' }, { id: 'monitoringTypes', label: 'Monitoring Types' }, { id: 'indicatorTypes', label: 'Indicator Types' }, { id: 'measurementUnits', label: 'Measurement Units' }, { id: 'physicalProgress', label: 'Physical Progress' }, { id: 'dataFrequencies', label: 'Data Frequency' }] },
    { label: 'Social & PAP', items: [{ id: 'papTypes', label: 'PAP Types' }, { id: 'papCategories', label: 'PAP Categories' }, { id: 'impactTypes', label: 'Impact Types' }, { id: 'settlementNatures', label: 'Settlement Nature' }, { id: 'vulnerabilityCategories', label: 'Vulnerability' }, { id: 'stakeholderEngagements', label: 'Stakeholder Eng.' }, { id: 'accessTypes', label: 'Access Types' }, { id: 'decisionOutcomes', label: 'Decision Outcomes' }] },
    { label: 'Results Framework', items: [{ id: 'pdos', label: 'PDO Setup' }, { id: 'outcomes', label: 'Outcomes' }, { id: 'results', label: 'Results' }, { id: 'kpiContracts', label: 'KPI Contracts' }] },
  ], []);

  const loadTabData = useCallback(async (tabKey) => {
    const config = tabConfig[tabKey];
    if (!config) return;
    
    try {
      const res = await axios.get(config.endpoint);
      setData(prev => ({ ...prev, [tabKey]: res.data }));
      setLoadedTabs(prev => ({ ...prev, [tabKey]: true }));
    } catch {
      setData(prev => ({ ...prev, [tabKey]: [] }));
      setLoadedTabs(prev => ({ ...prev, [tabKey]: true }));
    }
  }, [tabConfig]);

  const loadRelatedData = useCallback(async () => {
    const relatedTabs = ['regions', 'lgas', 'districts', 'wards', 'monitoringTypes', 'pdos'];
    const promises = relatedTabs.map(async (tabKey) => {
      if (loadedTabs[tabKey]) return;
      const config = tabConfig[tabKey];
      try {
        const res = await axios.get(config.endpoint);
        return { key: tabKey, data: res.data };
      } catch {
        return { key: tabKey, data: [] };
      }
    });
    
    // Also load projects separately for KPI contracts
    promises.push(
      axios.get('/api/projects').then(res => ({ key: 'projects', data: res.data })).catch(() => ({ key: 'projects', data: [] }))
    );
    
    const results = await Promise.all(promises);
    const newData = {};
    const newLoaded = {};
    results.forEach(result => {
      if (result) {
        newData[result.key] = result.data;
        newLoaded[result.key] = true;
      }
    });
    
    if (Object.keys(newData).length > 0) {
      setData(prev => ({ ...prev, ...newData }));
      setLoadedTabs(prev => ({ ...prev, ...newLoaded }));
    }
  }, [tabConfig, loadedTabs]);

  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      setLoading(true);
      loadTabData(activeTab).then(() => {
        loadRelatedData().finally(() => setLoading(false));
      });
    }
  }, []);

  useEffect(() => {
    if (initialLoadDone.current && !loadedTabs[activeTab]) {
      loadTabData(activeTab);
    }
  }, [activeTab, loadedTabs, loadTabData]);

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
    
    const idField = currentConfig.idField;
    const itemId = item[idField];
    
    setData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(i => i[idField] !== itemId)
    }));
    
    try {
      await axios.delete(`${currentConfig.endpoint}/${itemId}`);
      toast.success('Deleted successfully');
    } catch {
      loadTabData(activeTab);
      toast.error('Failed to delete');
    }
  }, [currentConfig, activeTab, loadTabData]);

  const handleSave = useCallback(async (formData) => {
    const idField = currentConfig.idField;
    
    try {
      if (editingItem) {
        const res = await axios.put(`${currentConfig.endpoint}/${editingItem[idField]}`, formData);
        const updatedItem = res.data;
        
        setData(prev => ({
          ...prev,
          [activeTab]: prev[activeTab].map(item => 
            item[idField] === editingItem[idField] ? updatedItem : item
          )
        }));
        toast.success('Updated successfully');
      } else {
        const res = await axios.post(currentConfig.endpoint, formData);
        const newItem = res.data;
        
        setData(prev => ({
          ...prev,
          [activeTab]: [...(prev[activeTab] || []), newItem]
        }));
        toast.success('Created successfully');
      }
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save');
      throw error;
    }
  }, [currentConfig, editingItem, activeTab]);

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

  const stableRelatedData = useMemo(() => data, [data]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">{t('common.loading')}</span>
          </div>
          <p className="text-muted mb-0">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <h2 className="mb-0 fw-bold text-dark">{t('setup.title')}</h2>
        <button className="btn btn-primary btn-lg px-4 rounded-pill shadow-sm" onClick={handleAdd}>
          <FiPlus className="me-2" /> {t('common.addNew')}
        </button>
      </div>

      <nav className="navbar navbar-expand-lg navbar-light bg-white rounded-3 shadow-sm mb-4 p-0">
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
                  <ul className={`dropdown-menu shadow-lg border-0 rounded-3 ${activeDropdown === group.label ? 'show' : ''}`}>
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <button
                          className={`dropdown-item py-2 px-4 ${activeTab === item.id ? 'active bg-primary text-white rounded' : ''}`}
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

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header bg-white border-bottom py-3 px-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <h5 className="mb-0 text-primary fw-bold">{currentConfig.label}</h5>
            <div className="input-group" style={{ maxWidth: '320px' }}>
              <span className="input-group-text bg-white border-end-0 rounded-start-pill">
                <FiSearch className="text-muted" />
              </span>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder={t('table.search')}
                className="form-control border-start-0 rounded-end-pill"
              />
            </div>
          </div>
        </div>
        <div className="card-body p-4">
          {currentConfig.cardView ? (
            <CardGrid
              data={filteredData}
              idField={currentConfig.idField}
              nameField={currentConfig.nameField}
              bgClass={currentConfig.bgClass}
              onEdit={handleEdit}
              onDelete={handleDelete}
              t={t}
            />
          ) : (
            <DataTable
              columns={currentConfig.columns}
              data={filteredData}
              idField={currentConfig.idField}
              onEdit={handleEdit}
              onDelete={handleDelete}
              t={t}
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
          relatedData={stableRelatedData}
          t={t}
          infoBox={currentConfig.infoBox}
        />
      )}
    </div>
  );
}

export default SystemSetup;
