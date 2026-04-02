import axios from '../config/axios';
import { API_URL } from '../config/config';

// Interceptor do dodawania tokenu do każdego żądania
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Stałe dla statusów
export const AppointmentStatus = {
    SCHEDULED: 'Scheduled',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'NoShow'
};

const appointmentService = {
    // Pobieranie dostępnych terminów
    getAvailableSlots: async (employeeId, date, serviceId) => {
        const response = await axios.get('/appointments/available-slots', {
            params: {
                employeeId,
                date: date.toISOString(),
                serviceId
            }
        });
        return response.data;
    },

    // Pobieranie rezerwacji pracownika
    getEmployeeAppointments: async (employeeId) => {
        const response = await axios.get(`/appointments/employee/${employeeId}`);
        return response.data;
    },

    // Pobieranie rezerwacji klienta
    getClientAppointments: async () => {
        const response = await axios.get('/appointments/user');
        return response.data;
    },

    // Tworzenie nowej rezerwacji
    createAppointment: async (appointmentData) => {
        const response = await axios.post('/appointments', appointmentData);
        return response.data;
    },

    // Anulowanie rezerwacji
    cancelAppointment: async (appointmentId) => {
        const response = await axios.put(`/appointments/${appointmentId}/cancel`);
        return response.data;
    },

    // Oznaczanie wizyty jako zakończonej
    completeAppointment: async (appointmentId) => {
        const response = await axios.put(`/appointments/${appointmentId}/complete`);
        return response.data;
    },

    // Oznaczanie nieobecności klienta
    markNoShow: async (appointmentId) => {
        const response = await axios.put(`/appointments/${appointmentId}/noshow`);
        return response.data;
    }
};

export default appointmentService;
