import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiLock, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

export default function ChangePassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const passwordsMatch = form.newPassword && form.confirmPassword && form.newPassword === form.confirmPassword;
  const passwordsMismatch = form.confirmPassword && form.newPassword !== form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error(t('changePassword.mismatch'));
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error(t('changePassword.minLength'));
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/user/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      toast.success(t('changePassword.success'));
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || t('changePassword.error');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-9">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-2 px-3 border-bottom">
            <h6 className="mb-0 fw-bold d-flex align-items-center gap-1">
              <FiLock size={16} className="text-primary" /> {t('changePassword.title')}
            </h6>
            <button type="button" className="btn btn-sm btn-light rounded-circle p-1" onClick={() => navigate('/')} style={{lineHeight: 1}}>
              <FiX size={16} />
            </button>
          </div>
          <div className="card-body p-3">
            <form onSubmit={handleSubmit}>
              <div className="row g-2">
                <div className="col-md-6">
                  <div className="border rounded p-2 mb-2" style={{backgroundColor: '#fff8f0'}}>
                    <h6 className="text-warning mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                      {t('changePassword.currentSection')}
                    </h6>
                    <div className="row g-2">
                      <div className="col-12">
                        <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('changePassword.currentPassword')} *</label>
                        <input
                          type="password"
                          className="form-control form-control-sm"
                          value={form.currentPassword}
                          onChange={(e) => setForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder={t('changePassword.enterCurrentPassword')}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="border rounded p-2 mb-2" style={{backgroundColor: '#f8f9ff'}}>
                    <h6 className="text-primary mb-2" style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                      {t('changePassword.newSection')}
                    </h6>
                    <div className="row g-2">
                      <div className="col-12">
                        <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('changePassword.newPassword')} *</label>
                        <input
                          type="password"
                          className="form-control form-control-sm"
                          value={form.newPassword}
                          onChange={(e) => setForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder={t('changePassword.enterNewPassword')}
                          required
                          minLength={6}
                        />
                        <small className="text-muted" style={{fontSize: '0.72rem'}}>{t('changePassword.hint')}</small>
                      </div>
                      <div className="col-12">
                        <label className="form-label mb-1" style={{fontSize: '0.78rem'}}>{t('changePassword.confirmNewPassword')} *</label>
                        <input
                          type="password"
                          className={`form-control form-control-sm ${passwordsMismatch ? 'is-invalid' : ''} ${passwordsMatch ? 'is-valid' : ''}`}
                          value={form.confirmPassword}
                          onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder={t('changePassword.enterConfirmNewPassword')}
                          required
                          minLength={6}
                        />
                        {passwordsMismatch && (
                          <div className="invalid-feedback" style={{fontSize: '0.72rem'}}>{t('changePassword.mismatch')}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-2 pt-2 border-top">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/')}>
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={loading || passwordsMismatch} className="btn btn-sm btn-primary d-flex align-items-center gap-1">
                  {loading ? (
                    <><div className="spinner-border spinner-border-sm" role="status"></div><span>{t('changePassword.changing')}</span></>
                  ) : (
                    <><FiCheck size={14} /><span>{t('changePassword.submit')}</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
