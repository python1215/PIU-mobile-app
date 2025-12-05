import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import LanguageSelector from '../components/LanguageSelector';
import toast from 'react-hot-toast';
import { FiUserPlus } from 'react-icons/fi';

function Register() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      const { token, username, email } = response.data;
      login(token, { username, email });
      toast.success(t('auth.registerSuccess'));
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center py-4 px-3"
      style={{ 
        background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 50%, #084298 100%)'
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="text-center mb-4">
              <LanguageSelector variant="buttons" />
            </div>
            
            <div 
              className="card border-0 shadow-lg"
              style={{ 
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.98)'
              }}
            >
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div 
                    className="d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ 
                      width: '70px', 
                      height: '70px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                      boxShadow: '0 8px 20px rgba(13, 110, 253, 0.3)'
                    }}
                  >
                    <FiUserPlus size={30} className="text-white" />
                  </div>
                  <h3 className="fw-bold text-dark mb-2">{t('auth.createAccount')}</h3>
                  <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>{t('auth.joinPlatform')}</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                        {t('auth.firstName')}
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="form-control border-2"
                        placeholder={t('auth.firstName')}
                        style={{ 
                          borderRadius: '12px',
                          padding: '0.75rem 1rem',
                          fontSize: '0.95rem',
                          borderColor: '#e9ecef'
                        }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                        {t('auth.lastName')}
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="form-control border-2"
                        placeholder={t('auth.lastName')}
                        style={{ 
                          borderRadius: '12px',
                          padding: '0.75rem 1rem',
                          fontSize: '0.95rem',
                          borderColor: '#e9ecef'
                        }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                      {t('auth.username')} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="form-control border-2"
                      placeholder={t('auth.enterUsername')}
                      required
                      style={{ 
                        borderRadius: '12px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.95rem',
                        borderColor: '#e9ecef'
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                      {t('auth.email')} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-control border-2"
                      placeholder={t('auth.enterEmail')}
                      required
                      style={{ 
                        borderRadius: '12px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.95rem',
                        borderColor: '#e9ecef'
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                      {t('auth.password')} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="form-control border-2"
                      placeholder={t('auth.enterPassword')}
                      required
                      minLength={6}
                      style={{ 
                        borderRadius: '12px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.95rem',
                        borderColor: '#e9ecef'
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                      {t('auth.department')}
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="form-control border-2"
                      placeholder={t('auth.departmentPlaceholder')}
                      style={{ 
                        borderRadius: '12px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.95rem',
                        borderColor: '#e9ecef'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-lg w-100 d-flex align-items-center justify-content-center gap-2 text-white fw-semibold"
                    style={{ 
                      borderRadius: '12px',
                      padding: '0.875rem',
                      background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                      border: 'none',
                      boxShadow: '0 4px 15px rgba(13, 110, 253, 0.3)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">{t('common.loading')}</span>
                        </div>
                        <span>{t('auth.creatingAccount')}</span>
                      </>
                    ) : (
                      <>
                        <FiUserPlus size={20} />
                        <span>{t('auth.createAccount')}</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                    {t('auth.haveAccount')}{' '}
                    <Link 
                      to="/login" 
                      className="text-primary fw-semibold text-decoration-none"
                      style={{ transition: 'color 0.2s' }}
                    >
                      {t('auth.signIn')}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-white text-opacity-75 mb-0" style={{ fontSize: '0.85rem' }}>
                PIU Project Management System
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
