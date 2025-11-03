import api from './api';
import dayjs from 'dayjs';

const mapPage = (pageData) => {
  const data = pageData?.content ?? pageData?.data ?? pageData?.items ?? [];
  const total = pageData?.totalElements ?? pageData?.total ?? data.length;
  const size = pageData?.size ?? pageData?.pageSize ?? 10;
  const number = pageData?.page ?? pageData?.pageNumber ?? pageData?.number ?? 0;

  return { data, total, page: number + 1, pageSize: size };
};

const SORT_FIELD_MAP = {
  idEmployee: 'idEmployee',
  employeeName: 'employeeName',
  hireDate: 'hireDate',
  username: 'user.username',
  email: 'user.email',
  isActive: 'user.isActive',
  createdAt: 'user.createdAt',
  updatedAt: 'user.updatedAt',
};

const toBackendDate = (val) => {
  if (!val) return null;
  // Hỗ trợ cả dayjs object hoặc string ISO
  const d = dayjs(val);
  return d.isValid() ? d.format('DD/MM/YYYY') : val;
};

const normalizeEmployeePayload = (data) => {
  const payload = { ...data };
  if (Object.prototype.hasOwnProperty.call(payload, 'hireDate')) {
    payload.hireDate = toBackendDate(payload.hireDate);
  }
  return payload;
};

export const employeesService = {
  getEmployees: async (params = {}) => {
    const { page = 1, pageSize = 10, sortBy = 'idEmployee', sortDirection = 'DESC' } = params;
    const backendSortBy = SORT_FIELD_MAP[sortBy] || 'idEmployee';
    const dir = (sortDirection || 'DESC').toString().toUpperCase();

    const pageable = {
      page: Math.max(0, (page || 1) - 1),
      size: pageSize,
      sort: `${backendSortBy},${dir}`,
    };

    console.log('Calling getEmployees with params:', pageable);
    const response = await api.get('/employees/paginated', { params: pageable });
    console.log('API Response getEmployees:', response.data);
    return mapPage(response.data);
  },

  getEmployeeById: async (id) => {
    console.log('Calling getEmployeeById with id:', id);
    const response = await api.get(`/employees/${id}`);
    console.log('API Response getEmployeeById:', response.data);
    return response.data;
  },

  createEmployee: async (employeeData) => {
    const body = normalizeEmployeePayload(employeeData);
    console.log('Calling createEmployee with data:', body);
    const response = await api.post('/employees', body);
    console.log('API Response createEmployee:', response.data);
    return response.data;
  },

  updateEmployee: async (id, employeeData) => {
    const body = normalizeEmployeePayload(employeeData);
    console.log('Calling updateEmployee with id:', id, 'data:', body);
    const response = await api.put(`/employees/${id}`, body);
    console.log('API Response updateEmployee:', response.data);
    return response.data;
  },

  deleteEmployee: async (id) => {
    console.log('Calling deleteEmployee with id:', id);
    const response = await api.delete(`/employees/${id}`);
    console.log('API Response deleteEmployee:', response.data);
    return response.data;
  },

  getDepartments: async () => [],
  getPositions: async () => [],
  updateEmployeeRole: async () => null,
  getEmployeeActivities: async () => [],
};


