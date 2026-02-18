import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiFile, FiUpload, FiCamera, FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Documentation() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    loadProjects();
    loadDocumentTypes();
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
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
      const isAll = selectedProject === 'all' || !selectedProject;
      const res = isAll
        ? await axios.get('/api/documents')
        : await axios.get(`/api/documents/project/${selectedProject}`);
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

  const getTypeStats = useMemo(() => {
    const stats = {};
    documents.forEach(doc => {
      const type = doc.documentType?.documentType || t('common.unknown');
      stats[type] = (stats[type] || 0) + 1;
    });
    return stats;
  }, [documents, t]);

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('socialEnvironmental.fileTooLarge'));
      return;
    }

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await axios.post('/api/uploads', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, attachment: res.data.url }));
      toast.success(t('documentation.fileUploaded'));
    } catch (err) {
      toast.error(err.response?.data?.error || t('socialEnvironmental.uploadFailed'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  }, [t]);

  const handleRemoveAttachment = useCallback(() => {
    setFormData(prev => ({ ...prev, attachment: null }));
  }, []);

  const handleOpenModal = useCallback((item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        projectId: item.project?.projectId || '',
        documentTypeId: item.documentType?.id || '',
        description: item.description || '',
        documentDate: item.documentDate || '',
        attachment: item.attachment || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        projectId: selectedProject !== 'all' ? selectedProject : '',
        documentTypeId: '',
        description: '',
        documentDate: '',
        attachment: ''
      });
    }
    setShowModal(true);
  }, [selectedProject]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      project: formData.projectId ? { projectId: formData.projectId } : null,
      documentType: formData.documentTypeId ? { id: parseInt(formData.documentTypeId) } : null,
      description: formData.description || null,
      documentDate: formData.documentDate || null,
      attachment: formData.attachment || null
    };

    try {
      if (editingItem) {
        await axios.put(`/api/documents/${editingItem.id}`, payload);
        toast.success(t('documentation.documentUpdated'));
      } else {
        await axios.post('/api/documents', payload);
        toast.success(t('documentation.documentCreated'));
      }
      handleCloseModal();
      loadDocuments();
    } catch (error) {
      console.error('Error saving document:', error);
      const msg = error.response?.data?.message || t('common.error');
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      await axios.delete(`/api/documents/${id}`);
      toast.success(t('documentation.documentDeleted'));
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      const msg = error.response?.data?.message || t('common.error');
      toast.error(msg);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('documentation.title')}</h2>
        <div className="d-flex gap-3">
          <select className="form-select" value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ width: '250px' }}>
            <option value="all">{t('common.allProjects')}</option>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <FiPlus className="me-2" /> {t('documentation.addDocument')}
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
        {Object.entries(getTypeStats).slice(0, 3).map(([type, count], index) => (
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
          <h5 className="mb-0">{t('documentation.documentLibrary')}</h5>
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
                    <th>{t('common.project')}</th>
                    <th>{t('documentation.documentType')}</th>
                    <th>{t('common.description')}</th>
                    <th>{t('documentation.documentDate')}</th>
                    <th>{t('documentation.file')}</th>
                    <th>{t('common.dateCreated')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr><td colSpan="8" className="text-center text-muted">{t('table.noData')}</td></tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id}>
                        <td><strong>{doc.id}</strong></td>
                        <td>{doc.project?.project || '-'}</td>
                        <td><span className="badge bg-primary">{doc.documentType?.documentType || '-'}</span></td>
                        <td>{doc.description || '-'}</td>
                        <td>{formatDate(doc.documentDate)}</td>
                        <td>
                          {doc.attachment ? (
                            <a href={doc.attachment} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-success p-1">
                              <FiFile size={14} />
                            </a>
                          ) : '-'}
                        </td>
                        <td>{formatDate(doc.dateCreated)}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleOpenModal(doc)} title={t('common.edit')}><FiEdit2 /></button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(doc.id)} title={t('common.delete')}><FiTrash2 /></button>
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
          <div className="modal-dialog modal-lg modal-fullscreen-md-down modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header py-2">
                <h6 className="modal-title mb-0">{editingItem ? t('documentation.editDocument') : t('documentation.addDocument')}</h6>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">{t('common.description')} *</label>
                    <textarea className="form-control" name="description" rows="4" value={formData.description || ''} onChange={handleChange} placeholder={t('documentation.descriptionPlaceholder')} required></textarea>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">{t('common.project')} *</label>
                      <select className="form-select" name="projectId" value={formData.projectId || ''} onChange={handleChange} required>
                        <option value="">---------</option>
                        {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.project}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">{t('documentation.documentType')} *</label>
                      <select className="form-select" name="documentTypeId" value={formData.documentTypeId || ''} onChange={handleChange} required>
                        <option value="">---------</option>
                        {documentTypes.map(dt => <option key={dt.id} value={dt.id}>{dt.documentType}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">{t('documentation.documentDate')} *</label>
                    <input type="date" className="form-control" name="documentDate" value={formData.documentDate || ''} onChange={handleChange} required />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">{t('documentation.file')}</label>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="d-none" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png" />
                    <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleFileUpload} className="d-none" />
                    {formData.attachment ? (
                      <div className="d-flex align-items-center gap-2 p-2 border rounded bg-light">
                        <FiFile size={18} className="text-primary" />
                        <a href={formData.attachment} target="_blank" rel="noopener noreferrer" className="text-truncate" style={{maxWidth: '300px'}}>{formData.attachment.split('/').pop()}</a>
                        <span className="text-success small"><FiImage className="me-1" />{t('documentation.fileUploaded')}</span>
                        <button type="button" className="btn btn-sm btn-outline-danger ms-auto" onClick={handleRemoveAttachment}><FiX size={14} /></button>
                      </div>
                    ) : (
                      <div>
                        <div className="d-flex gap-2">
                          <button type="button" className="btn btn-outline-secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                            {uploading ? t('socialEnvironmental.uploadingPhoto') : t('socialEnvironmental.browseFiles')}
                          </button>
                          <button type="button" className="btn btn-outline-success" onClick={() => cameraInputRef.current?.click()} disabled={uploading}>
                            <FiCamera size={15} className="me-1" />{t('socialEnvironmental.takePhoto')}
                          </button>
                        </div>
                        <small className="text-muted mt-1 d-block">Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, JPEG, PNG</small>
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <button type="button" className="btn btn-outline-secondary" onClick={handleCloseModal}>
                      {t('common.cancel')}
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingItem ? t('common.update') : t('common.save')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documentation;
