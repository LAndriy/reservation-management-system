import axios from '../config/axios';
import { API_URL } from '../config/api.config';

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const handleError = (error, defaultMessage) => {
    console.error('API error:', error.response?.data);
    if (error.response?.data?.message) {
        throw { message: error.response.data.message };
    } else if (error.response?.data) {
        const errorMessage = typeof error.response.data === 'string' 
            ? error.response.data 
            : Object.values(error.response.data).join(', ');
        throw { message: errorMessage };
    }
    throw { message: defaultMessage };
};

export const authService = {
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/api/Auth/register`, userData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            handleError(error, 'Błąd podczas rejestracji');
        }
    },

    login: async (credentials) => {
        try {
            const response = await axios.post(`${API_URL}/api/Auth/login`, credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            handleError(error, 'Błąd podczas logowania');
        }
    },

    googleLogin: async (token) => {
        try {
            const response = await axios.post(`${API_URL}/api/Auth/google`, { 
                credential: token 
            });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            handleError(error, 'Błąd podczas logowania przez Google');
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    getCurrentUser: async () => {
        try {
            const response = await axios.get(`${API_URL}/api/Users/current`);
            return response.data;
        } catch (error) {
            handleError(error, 'Błąd podczas pobierania danych użytkownika');
        }
    },

    updateUser: async (userData) => {
        try {
            // Jeśli mamy avatar, używamy FormData
            if (userData.avatar instanceof File) {
                const formData = new FormData();
                Object.keys(userData).forEach(key => {
                    if (userData[key] !== null && userData[key] !== undefined) {
                        formData.append(key, userData[key]);
                    }
                });
                
                const response = await axios.put(`${API_URL}/api/Users/${userData.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return response.data;
            }
            
            // W przeciwnym razie wysyłamy jako JSON
            const response = await axios.put(`${API_URL}/api/Users/${userData.id}`, userData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            handleError(error, 'Błąd podczas aktualizacji danych użytkownika');
        }
    },

    changePassword: async (userId, passwordData) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/Users/${userId}/change-password`,
                passwordData
            );
            return response.data;
        } catch (error) {
            if (error.response?.status === 400) {
                throw { message: 'Nieprawidłowe aktualne hasło' };
            }
            handleError(error, 'Błąd podczas zmiany hasła');
        }
    },

    deleteAccount: async () => {
        try {
            const response = await axios.delete(`${API_URL}/api/Users/delete-account`);
            localStorage.removeItem('token');
            return response.data;
        } catch (error) {
            handleError(error, 'Błąd podczas usuwania konta');
        }
    },

    getUsers: async () => {
        try {
            const response = await axios.get(`${API_URL}/api/Users`);
            return response.data;
        } catch (error) {
            handleError(error, 'Błąd podczas pobierania użytkowników');
        }
    },

    assignRole: async (data) => {
        try {
            const response = await axios.post(`${API_URL}/api/Users/assign-role`, data);
            return response.data;
        } catch (error) {
            handleError(error, 'Błąd podczas przypisywania roli');
        }
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

export default authService;
