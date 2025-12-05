import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiFile, FiDownload, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Documentation() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProjects();
    loadDocumentTypes();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadDocuments();
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

  const loadDocumentTypes = async () => {
    try {
      const res = await axios.get('/api/setup/document-types');
      setDocumentTypes(res.data);
    } catch (error) {
      console.error('Error loading document types:', error);
    }
  };

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/documents/project/${selectedProject}`);
      setDocuments(res.data);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const getTypeStats = () => {
    const stats = {};
    documents.forEach(doc => {
      const type = doc.documentType?.documentType || t('common.unknown');
      stats[type] = (stats[type] || 0) + 1;
    });
    return stats;
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('documentation.title')}</h2>
        <div className="d-flex gap-3">
          <select className="form-select" value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ width: '250px' }}>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus className="me-2" /> {t('documentation.upload')}
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <FiFile size={32} className="me-3" />
                <div>
                  <h6>{t('documentation.totalDocuments')}</h6>
                  <h3>{documents.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        {Object.entries(getTypeStats()).slice(0, 3).map(([type, count], index) => (
          <div className="col-md-3" key={type}>
            <div className={`card bg-${['success', 'info', 'warning'][index]} text-white`}>
              <div className="card-body">
                <h6>{type}</h6>
                <h3>{count}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>{t('documentation.documentLibrary')}</h5>
          <div className="btn-group">
            <button className="btn btn-sm btn-outline-secondary active">{t('common.all')}</button>
            {documentTypes.slice(0, 4).map(type => (
              <button key={type.id} className="btn btn-sm btn-outline-secondary">{type.documentType}</button>
            ))}
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>{t('documentation.documentType')}</th>
                    <th>{t('common.description')}</th>
                    <th>{t('documentation.documentDate')}</th>
                    <th>{t('common.dateCreated')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-muted">{t('table.noData')}</td></tr>
                  ) : (
                    documents.map((doc, index) => (
                      <tr key={index}>
                        <td>{doc.id}</td>
                        <td><span className="badge bg-primary">{doc.documentType?.documentType || t('common.unknown')}</span></td>
                        <td>{doc.description}</td>
                        <td>{formatDate(doc.documentDate)}</td>
                        <td>{formatDate(doc.dateCreated)}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-info me-1" title={t('common.view')}><FiEye /></button>
                          <button className="btn btn-sm btn-outline-success me-1" title={t('common.download')}><FiDownload /></button>
                          <button className="btn btn-sm btn-outline-primary me-1" title={t('common.edit')}><FiEdit2 /></button>
                          <button className="btn btn-sm btn-outline-danger" title={t('common.delete')}><FiTrash2 /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t('documentation.uploadNewDocument')}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">{t('documentation.documentType')}</label>
                  <select className="form-select">
                    <option value="">{t('common.select')}</option>
                    {documentTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.documentType}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">{t('common.description')}</label>
                  <textarea className="form-control" rows={3}></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">{t('documentation.file')}</label>
                  <input type="file" className="form-control" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                  {t('common.cancel')}
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setShowModal(false)}>
                  {t('documentation.upload')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documentation;
