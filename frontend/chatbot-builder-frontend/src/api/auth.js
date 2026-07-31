import useAuthStore from '../store/authStore';
import api from './axios';


export const login = async (credentials) => {
    const { data } = await api.post('/auth/login/', credentials);
    return data;
}

export const register = async (userData) => {
    const { data } = await api.post('/auth/register/', userData);
    return data;
}

export const logout = async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    const { data } = await api.post('/auth/logout/', {
        refresh: refreshToken
    });
    return data;
}

export const getCurrentUser = async () => {
    const { data } = await api.get('/auth/me/');
    return data;
}

export const refreshAccessToken = async (refreshToken) => {
    const { data } = await api.post('/auth/token/refresh/', {
        refresh: refreshToken,
    })
    return data;
}

