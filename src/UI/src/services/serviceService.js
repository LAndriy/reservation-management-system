import axios from '../config/axios';
import { API_URL } from '../config/api.config';

const serviceService = {
    getAllServices: async () => {
        try {
            const response = await axios.get(`${API_URL}/api/services`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getServiceById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/api/services/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createService: async (serviceData) => {
        try {
            const response = await axios.post(`${API_URL}/api/services`, serviceData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateService: async (id, serviceData) => {
        try {
            const response = await axios.put(`${API_URL}/api/services/${id}`, serviceData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteService: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/api/services/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default serviceService;
