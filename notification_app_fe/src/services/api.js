import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
});

export const fetchNotifications = async () => {
    try {
        const response = await api.get('/notifications');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return [];
    }
};
