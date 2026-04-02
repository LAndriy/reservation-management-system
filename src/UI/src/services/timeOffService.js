import axios from '../config/axios';

const timeOffService = {
    // Pobieranie urlopów pracownika
    getEmployeeTimeOffs: async (employeeId) => {
        const response = await axios.get(`/time-off/employee/${employeeId}`);
        return response.data;
    },

    // Dodawanie nowego urlopu
    createTimeOff: async (timeOffData) => {
        const response = await axios.post('/time-off', timeOffData);
        return response.data;
    },

    // Aktualizacja urlopu
    updateTimeOff: async (id, timeOffData) => {
        const response = await axios.put(`/time-off/${id}`, timeOffData);
        return response.data;
    },

    // Zatwierdzanie urlopu
    approveTimeOff: async (id) => {
        const response = await axios.put(`/time-off/${id}/approve`);
        return response.data;
    },

    // Odrzucanie urlopu
    rejectTimeOff: async (id) => {
        const response = await axios.put(`/time-off/${id}/reject`);
        return response.data;
    },

    // Usuwanie urlopu
    deleteTimeOff: async (id) => {
        const response = await axios.delete(`/time-off/${id}`);
        return response.data;
    }
};

export default timeOffService;
