import axios from '../config/axios';
import { API_URL } from '../config/api.config';

const bookingService = {
    getReservations: async () => {
        try {
            const response = await axios.get(`${API_URL}/api/appointments`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    createReservation: async (reservationData) => {
        try {
            console.log('Wysyłanie danych rezerwacji:', reservationData);
            const response = await axios.post(
                `${API_URL}/api/appointments`,
                reservationData
            );
            console.log('Odpowiedź z serwera:', response.data);
            return response.data;
        } catch (error) {
            console.error('Błąd z serwera:', error.response?.data);
            if (error.response?.data) {
                throw error.response.data;
            }
            throw new Error('Wystąpił błąd podczas tworzenia rezerwacji');
        }
    },

    updateReservation: async (id, reservationData) => {
        try {
            const response = await axios.put(`${API_URL}/api/appointments/${id}`, reservationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteReservation: async (id) => {
        try {
            await axios.delete(`${API_URL}/api/appointments/${id}`);
        } catch (error) {
            console.error('Błąd podczas usuwania rezerwacji:', error);
            throw error.response?.data || error.message;
        }
    },

    getEmployeeSchedule: async (employeeId) => {
        try {
            const response = await axios.get(`${API_URL}/api/appointments/employee/${employeeId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getEmployees: async () => {
        try {
            const response = await axios.get(`${API_URL}/api/employees`);
            return response.data;
        } catch (error) {
            console.error('Błąd podczas pobierania pracowników:', error);
            throw error.response?.data || error.message;
        }
    },

    getAvailability: async (employeeId, date, serviceId) => {
        try {
            console.log('Pobieranie dostępności:', { employeeId, date, serviceId });
            const response = await axios.get(
                `${API_URL}/api/appointments/available-slots`, {
                    params: {
                        employeeId,
                        date,
                        serviceId
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Błąd podczas pobierania dostępności:', error);
            if (error.response?.data) {
                throw error.response.data;
            }
            throw new Error('Nie udało się pobrać dostępnych terminów');
        }
    },

    getServices: async () => {
        try {
            const response = await axios.get(`${API_URL}/api/services`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getUserAppointments: async () => {
        try {
            const response = await axios.get(`${API_URL}/api/appointments/user`);
            return response.data;
        } catch (error) {
            console.error('Błąd podczas pobierania wizyt użytkownika:', error);
            throw error.response?.data || error.message;
        }
    },

    getEmployeeWorkingHours: async (employeeId) => {
        try {
            const response = await axios.get(`${API_URL}/api/working-hours/employee/${employeeId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getEmployeeWorkingHours: async (employeeId) => {
        try {
            const response = await axios.get(`${API_URL}/api/working-hours/employee/${employeeId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    
    initializeWorkingHours: async (employeeId) => {
        try {
            // Najpierw sprawdź czy pracownik ma już godziny pracy
            const existingHours = await bookingService.getEmployeeWorkingHours(employeeId);
            
            // Jeśli pracownik ma już jakieś godziny pracy, zwróć je
            if (existingHours && existingHours.length > 0) {
                return existingHours;
            }
    
            // Jeśli nie ma godzin pracy, utwórz domyślne
            const defaultWorkingHours = [
                { startTime: '08:00', endTime: '18:00', dayOfWeek: 1 }, // Poniedziałek
                { startTime: '08:00', endTime: '18:00', dayOfWeek: 2 }, // Wtorek
                { startTime: '08:00', endTime: '18:00', dayOfWeek: 3 }, // Środa
                { startTime: '08:00', endTime: '18:00', dayOfWeek: 4 }, // Czwartek
                { startTime: '08:00', endTime: '18:00', dayOfWeek: 5 }, // Piątek
                { startTime: '09:00', endTime: '18:00', dayOfWeek: 6 }  // Sobota
            ];
    
            // Inicjalizacja godzin pracy dla każdego dnia
            const promises = defaultWorkingHours.map(hours => {
                const workingHoursDto = {
                    employeeId: employeeId,
                    startTime: hours.startTime,
                    endTime: hours.endTime,
                    dayOfWeek: hours.dayOfWeek
                };
    
                return axios.post(`${API_URL}/api/working-hours`, workingHoursDto);
            });
    
            await Promise.all(promises);
            
            // Pobierz i zwróć utworzone godziny pracy
            return await bookingService.getEmployeeWorkingHours(employeeId);
        } catch (error) {
            console.error('Błąd podczas inicjalizacji godzin pracy:', error);
            throw error;
        }
    }
};

export { bookingService };
