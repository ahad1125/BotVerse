import { create } from "zustand";


const useAuthStore = create((set) => ({


    // States
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
    user: null,


    //Actions
    setTokens: (accessToken, refreshToken) => {

        if (!accessToken || !refreshToken) {
            console.error('Attemped to store invalid tokens'), {
                accessToken,
                refreshToken
            }
            return;
        }

        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)

        set({
            accessToken,
            refreshToken,
        })
    },
    setUser: (user) => set({ user }),

    // setAccessToken: (access) => {
    //     localStorage.setItem('accessToken', access);

    //     set({
    //         accessToken: access,
    //     });
    // },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        set({
            accessToken: null,
            refreshToken: null,
            user: null
        })
    },


}))


export default useAuthStore;