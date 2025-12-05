import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import { changeLanguage, languages } from '../i18n';
import toast from 'react-hot-toast';
import { FiLogIn, FiGlobe, FiCheck } from 'react-icons/fi';

function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <div className="d-flex justify-content-center mb-4">
      <div className="btn-group" role="group" aria-label={t('common.selectLanguage')}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => changeLanguage(lang.code)}
            className={`btn ${
              i18n.language === lang.code 
                ? 'btn-primary' 
                : 'btn-outline-primary bg-white'
            } d-flex align-items-center gap-2 px-3 py-2`}
            style={{ 
              minWidth: '110px',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
            <span className="fw-medium" style={{ fontSize: '0.85rem' }}>{lang.name}</span>
            {i18n.language === lang.code && <FiCheck size={14} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function Login() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { token, username, email } = response.data;
      login(token, { username, email });
      toast.success(t('auth.loginSuccess'));
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.loginFailed'));
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
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            <div className="text-center mb-4">
              <LanguageSelector />
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
                    <FiLogIn size={30} className="text-white" />
                  </div>
                  <h3 className="fw-bold text-dark mb-2">{t('auth.welcomeBack')}</h3>
                  <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>{t('auth.signInTo')}</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                      {t('auth.username')}
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="form-control form-control-lg border-2"
                      placeholder={t('auth.enterUsername')}
                      required
                      style={{ 
                        borderRadius: '12px',
                        padding: '0.875rem 1rem',
                        fontSize: '0.95rem',
                        borderColor: '#e9ecef'
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                      {t('auth.password')}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="form-control form-control-lg border-2"
                      placeholder={t('auth.enterPassword')}
                      required
                      style={{ 
                        borderRadius: '12px',
                        padding: '0.875rem 1rem',
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
                        <span>{t('auth.signingIn')}</span>
                      </>
                    ) : (
                      <>
                        <FiLogIn size={20} />
                        <span>{t('auth.signIn')}</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                    {t('auth.noAccount')}{' '}
                    <Link 
                      to="/register" 
                      className="text-primary fw-semibold text-decoration-none"
                      style={{ transition: 'color 0.2s' }}
                    >
                      {t('auth.signUp')}
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

export default Login;
