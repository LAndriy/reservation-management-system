export const API_CONFIG = {
    BASE_URL: 'http://localhost:3001/api',
    ENDPOINTS: {
        RESERVATIONS: '/reservations',
        EMPLOYEES: '/employees',
        AVAILABILITY: '/availability',
        SERVICES: '/services'
    }
};

export const formatDate = (date) => {
    return date.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(',', '');
};

export const parseDate = (dateString) => {
    const [date, time] = dateString.split(' ');
    const [day, month, year] = date.split('.');
    const [hour, minute] = time.split(':');
    return new Date(year, month - 1, day, hour, minute);
};
