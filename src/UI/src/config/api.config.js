const API_BASE_URL = 'https://localhost:7001';

export const API_URL = API_BASE_URL;

export const API_ENDPOINTS = {
    BASE_URL: API_BASE_URL,
    AUTH: `${API_BASE_URL}/api/Auth`,
    REGISTER: '/api/users/register',
    LOGIN: '/api/auth/login',
    GOOGLE_LOGIN: `${API_BASE_URL}/api/Auth/google`,
    CHANGE_PASSWORD: (id) => `/api/users/${id}/change-password`,
    
    USERS: `${API_BASE_URL}/api/Users`,
    CREATE_EMPLOYEE: `${API_BASE_URL}/api/Users/create-employee`,
    UPDATE_USER: (id) => `${API_BASE_URL}/api/Users/${id}`,
    DELETE_USER: (id) => `${API_BASE_URL}/api/Users/${id}`,
    DELETE_ACCOUNT: (id) => `${API_BASE_URL}/api/Users/${id}/delete-account`,
    CURRENT_USER: `${API_BASE_URL}/api/Users/current`,
    ASSIGN_ROLE: `${API_BASE_URL}/api/Users/assign-role`,

    SERVICES: `${API_BASE_URL}/api/services`,
    SERVICE_BY_ID: (id) => `${API_BASE_URL}/api/services/${id}`,

    APPOINTMENTS: `${API_BASE_URL}/api/Appointments`,
    USER_APPOINTMENTS: `${API_BASE_URL}/api/Appointments/user`,

    EMPLOYEES: `${API_BASE_URL}/api/Employees`,
};

export default API_ENDPOINTS;
