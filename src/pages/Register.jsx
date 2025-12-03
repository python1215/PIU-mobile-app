import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiUserPlus } from 'react-icons/fi';

function Register() {
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
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-primary py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                    <FiUserPlus size={28} className="text-primary" />
                  </div>
                  <h2 className="fw-bold text-dark mb-1">Create Account</h2>
                  <p className="text-muted">Join PIU Project Management</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-medium">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="form-control"
                        placeholder="First name"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-medium">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="form-control"
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="form-control"
                      placeholder="Choose a username"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-control"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="form-control"
                      placeholder="Create a password"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="form-control"
                      placeholder="Your department (optional)"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                  >
                    {loading ? (
                      <div className="spinner-border spinner-border-sm text-light" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <FiUserPlus />
                        Create Account
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center mt-4 mb-0 text-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary fw-medium text-decoration-none">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
