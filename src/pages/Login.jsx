import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import { changeLanguage, languages } from '../i18n';
import toast from 'react-hot-toast';
import { FiLogIn, FiGlobe, FiChevronDown } from 'react-icons/fi';

function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="position-relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-light d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-sm"
        style={{ fontSize: '0.9rem' }}
      >
        <FiGlobe size={16} />
        <span>{currentLang.flag}</span>
        <span className="d-none d-sm-inline">{currentLang.name}</span>
        <FiChevronDown size={14} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="position-fixed top-0 start-0 w-100 h-100" 
            style={{ zIndex: 1000 }}
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border-0 overflow-hidden"
            style={{ zIndex: 1001, minWidth: '160px' }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-100 d-flex align-items-center gap-2 px-3 py-2 border-0 text-start ${
                  i18n.language === lang.code ? 'bg-primary text-white' : 'bg-white text-dark'
                }`}
                style={{ 
                  fontSize: '0.9rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (i18n.language !== lang.code) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseOut={(e) => {
                  if (i18n.language !== lang.code) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
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
    <div className="min-vh-100 d-flex flex-column bg-primary">
      <div className="d-flex justify-content-end p-3 p-md-4">
        <LanguageSelector />
      </div>
      
      <div className="flex-grow-1 d-flex align-items-center justify-content-center pb-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
              <div className="card shadow-lg border-0 rounded-4">
                <div className="card-body p-4 p-md-5">
                  <div className="text-center mb-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                      <FiLogIn size={28} className="text-primary" />
                    </div>
                    <h2 className="fw-bold text-dark mb-1">{t('auth.welcomeBack')}</h2>
                    <p className="text-muted">{t('auth.signInTo')}</p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-medium">{t('auth.username')}</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="form-control form-control-lg"
                        placeholder={t('auth.enterUsername')}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-medium">{t('auth.password')}</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="form-control form-control-lg"
                        placeholder={t('auth.enterPassword')}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="spinner-border spinner-border-sm text-light" role="status">
                            <span className="visually-hidden">{t('common.loading')}</span>
                          </div>
                          {t('auth.signingIn')}
                        </>
                      ) : (
                        <>
                          <FiLogIn />
                          {t('auth.signIn')}
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-center mt-4 mb-0 text-muted">
                    {t('auth.noAccount')}{' '}
                    <Link to="/register" className="text-primary fw-medium text-decoration-none">
                      {t('auth.signUp')}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
