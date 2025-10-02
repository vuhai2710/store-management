import api from './api';

export const employeesService = {
  getEmployees: async (params = {}) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  getEmployeeById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  createEmployee: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  updateEmployee: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  getDepartments: async () => {
    const response = await api.get('/employees/departments');
    return response.data;
  },

  getPositions: async () => {
    const response = await api.get('/employees/positions');
    return response.data;
  },

  updateEmployeeRole: async (id, roleData) => {
    const response = await api.patch(`/employees/${id}/role`, roleData);
    return response.data;
  },

  getEmployeeActivities: async (id, params = {}) => {
    const response = await api.get(`/employees/${id}/activities`, { params });
    return response.data;
  },
};


