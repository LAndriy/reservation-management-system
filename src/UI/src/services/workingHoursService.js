import axios from '../config/axios';

const workingHoursService = {
    // Pobieranie godzin pracy pracownika
    getEmployeeWorkingHours: async (employeeId) => {
        const response = await axios.get(`/working-hours/employee/${employeeId}`);
        return response.data;
    },

    // Ustawianie godzin pracy
    setWorkingHours: async (workingHoursData) => {
        try {
            // Konwertujemy czasy na format TimeSpan
            const convertedData = {
                ...workingHoursData,
                startTime: workingHoursData.startTime || '00:00',
                endTime: workingHoursData.endTime || '00:00',
                breakStartTime: workingHoursData.breakStartTime || null,
                breakEndTime: workingHoursData.breakEndTime || null
            };

            console.log('Sending working hours data:', convertedData);
            const response = await axios.post('/working-hours', convertedData);
            return response.data;
        } catch (error) {
            if (error.response) {
                // Serwer zwrócił błąd ze statusem
                throw new Error(error.response.data || 'Nie udało się zapisać harmonogramu');
            }
            throw error;
        }
    },

    // Aktualizacja godzin pracy
    updateWorkingHours: async (id, workingHoursData) => {
        const response = await axios.put(`/working-hours/${id}`, workingHoursData);
        return response.data;
    },

    // Usuwanie godzin pracy
    deleteWorkingHours: async (id) => {
        const response = await axios.delete(`/working-hours/${id}`);
        return response.data;
    }
};

export default workingHoursService;
