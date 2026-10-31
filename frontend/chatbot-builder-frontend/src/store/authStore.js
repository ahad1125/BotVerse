import { create } from "zustand";
import queryClient from "../lib/queryClient";

const useAuthStore = create((set) => ({
    // States
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
    user: null,

    // Actions
    setTokens: (accessToken, refreshToken) => {
        if (!accessToken || !refreshToken) {
            console.error('Attempted to store invalid tokens', {
                accessToken,
                refreshToken
            });
            return;
        }

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        set({
            accessToken,
            refreshToken,
        });
    },

    setUser: (user) => set({ user }),

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        // Clear all cached queries immediately so no user data lingers in memory
        queryClient.clear();

        set({
            accessToken: null,
            refreshToken: null,
            user: null
        });
    },
}));

export default useAuthStore;
