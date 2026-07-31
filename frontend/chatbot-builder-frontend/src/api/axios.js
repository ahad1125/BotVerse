import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
})


// REQUEST INTERCEPTOR

api.interceptors.request.use((config) => {

    const token = useAuthStore.getState().accessToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;

},
    (error) => Promise.reject(error));


// RESPONSE INTERCEPTOR

api.interceptors.response.use(
    (response) => response,

    async (error) => {

        console.log(error.response?.data)
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/token/refresh/')
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken = useAuthStore.getState().refreshToken;

                if (!refreshToken) {
                    throw new Error('No refresh token');
                }
                const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/token/refresh/', {
                    refresh: refreshToken,
                });

                const { access, refresh } = response.data;

                useAuthStore.getState().setTokens(access, refresh);
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${access}`;

                return api(originalRequest);
            }
            catch (refreshError) {

                useAuthStore.getState().logout();
                return Promise.reject(refreshError);

            }


        }
        return Promise.reject(error);

    }

)

export default api;
