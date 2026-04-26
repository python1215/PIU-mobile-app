import axios from 'axios';
import { useAuthStore } from '../store/authStore';

/**
 * Backend API base URL.
 * Points to the live Replit backend (Spring Boot on port 5000).
 * Update this value if the repl domain changes or for local development.
 * Local device example: 'http://192.168.1.100:5000/api'
 */
export const BASE_URL = 'https://015c982b-d594-4648-8d79-6ca8b9c81baa-00-3f6k25yw209xw.pike.replit.dev/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const projectAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const donorAPI = {
  getAll: () => api.get('/donors'),
  getById: (id) => api.get(`/donors/${id}`),
  create: (data) => api.post('/donors', data),
  update: (id, data) => api.put(`/donors/${id}`, data),
  delete: (id) => api.delete(`/donors/${id}`),
};

export const setupAPI = {
  getYears: () => api.get('/setup/years'),
  getQuarters: () => api.get('/setup/quarters'),
  getMonitoringTypes: () => api.get('/setup/monitoring-types'),
  getRegions: () => api.get('/setup/regions'),
  getLGAs: () => api.get('/setup/lgas'),
  getDistricts: () => api.get('/setup/districts'),
  getWards: () => api.get('/setup/wards'),
  getSettlements: () => api.get('/setup/settlements'),
  getCurrencies: () => api.get('/setup/currencies'),
  getContributors: () => api.get('/setup/contributors'),
  getProjectCategories: () => api.get('/setup/project-categories'),
  getIndicatorTypes: () => api.get('/setup/indicator-types'),
  getMeasurementUnits: () => api.get('/setup/measurement-units'),
  getImpactTypes: () => api.get('/setup/impact-types'),
};

export const issueAPI = {
  getAll: () => api.get('/issues'),
  getById: (id) => api.get(`/issues/${id}`),
  getByProject: (projectId) => api.get(`/issues/project/${projectId}`),
  getByStatus: (status) => api.get(`/issues/status/${status}`),
  create: (data) => api.post('/issues', data),
  update: (id, data) => api.put(`/issues/${id}`, data),
  delete: (id) => api.delete(`/issues/${id}`),
};

export const issueActionSourceAPI = {
  getAll: () => api.get('/issue-action-sources'),
  getById: (id) => api.get(`/issue-action-sources/${id}`),
  create: (data) => api.post('/issue-action-sources', data),
  update: (id, data) => api.put(`/issue-action-sources/${id}`, data),
  delete: (id) => api.delete(`/issue-action-sources/${id}`),
};

export const monitoringAPI = {
  getByProject: (projectId) => api.get(`/monitoring/project/${projectId}`),
  create: (data) => api.post('/monitoring', data),
  update: (id, data) => api.put(`/monitoring/${id}`, data),
  delete: (id) => api.delete(`/monitoring/${id}`),
};

export const kpiAPI = {
  getAll: () => api.get('/kpi'),
  getByProject: (projectId) => api.get(`/kpi/project/${projectId}`),
  create: (data) => api.post('/kpi', data),
  update: (id, data) => api.put(`/kpi/${id}`, data),
  delete: (id) => api.delete(`/kpi/${id}`),
};

export const financialAPI = {
  getAll: () => api.get('/financial'),
  getByProject: (projectId) => api.get(`/financial/project/${projectId}`),
  create: (data) => api.post('/financial', data),
  update: (id, data) => api.put(`/financial/${id}`, data),
};

export const socialEnvAPI = {
  getESIA: (projectId) => api.get(`/social-environmental/esia/project/${projectId}`),
  getOHS: (projectId) => api.get(`/social-environmental/ohs/project/${projectId}`),
  getGrievances: (projectId) => api.get(`/social-environmental/grievances/project/${projectId}`),
  getPAPs: (projectId) => api.get(`/social-environmental/paps/project/${projectId}`),
};

export const documentationAPI = {
  getByProject: (projectId) => api.get(`/documentation/project/${projectId}`),
  upload: (projectId, formData) =>
    api.post(`/documentation/project/${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/documentation/${id}`),
};

export const administrationAPI = {
  getRoles: () => api.get('/administration/roles'),
  getUsers: () => api.get('/administration/users'),
  createRole: (data) => api.post('/administration/roles', data),
  updateRole: (id, data) => api.put(`/administration/roles/${id}`, data),
  assignRole: (data) => api.post('/administration/users/assign-role', data),
  getConnectedUsers: () => api.get('/administration/connected-users'),
};

export const riskAPI = {
  getByProject: (projectId) => api.get(`/risk-assessment/project/${projectId}`),
  create: (data) => api.post('/risk-assessment', data),
  update: (id, data) => api.put(`/risk-assessment/${id}`, data),
  delete: (id) => api.delete(`/risk-assessment/${id}`),
};

export const userAPI = {
  changePassword: (data) => api.put('/users/change-password', data),
};

export const projectActionsAPI = {
  getWorks:          (projectId) => api.get(`/project-actions/works/project/${projectId}`),
  createWorks:       (data)      => api.post('/project-actions/works', data),
  getGoods:          (projectId) => api.get(`/project-actions/goods/project/${projectId}`),
  createGoods:       (data)      => api.post('/project-actions/goods', data),
  getDesignWork:     (projectId) => api.get(`/project-actions/design-work-progress/project/${projectId}`),
  createDesignWork:  (data)      => api.post('/project-actions/design-work-progress', data),
  getBOQ:            (projectId) => api.get(`/project-actions/boq/project/${projectId}`),
  createBOQ:         (data)      => api.post('/project-actions/boq', data),
  getSupplyProgress: (projectId) => api.get(`/project-actions/supply-progress/project/${projectId}`),
  createSupply:      (data)      => api.post('/project-actions/supply-progress', data),
  getInstallation:   (projectId) => api.get(`/project-actions/installation/project/${projectId}`),
  createInstallation:(data)      => api.post('/project-actions/installation', data),
  getJMC:            (projectId) => api.get(`/project-actions/jmc/project/${projectId}`),
  createJMC:         (data)      => api.post('/project-actions/jmc', data),
};

export default api;
