import { useEffect } from "react";
import useAuthStore from "../store/authStore";
import { getCurrentUser } from "../api/auth";

function useAuthInitialization() {

    const accessToken = useAuthStore((state) => state.accessToken)
    const setUser = useAuthStore((state) => state.setUser)
    const logout = useAuthStore((state) => state.logout)

    useEffect(() => {

        const initializeAuth = async () => {
            if (!accessToken) {
                return;
            }
            try {
                const response = await getCurrentUser();
                // console.log(response.data);

                setUser(response.data)
            } catch (error) {
                console.error('Failed to initialize authentication', error)
                logout();
            }
        }
        initializeAuth();
    }, [accessToken]);
}

export default useAuthInitialization;