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
                setUser(response.data)
            } catch (error) {
                console.error('Failed to initialize authentication', error);
                // Only force-logout on 401 (bad/expired token).
                // Network errors, 500s, and backend cold-start timeouts must NOT
                // log the user out — the token is still valid, the server was just unavailable.
                if (error?.response?.status === 401) {
                    logout();
                }
            }
        }
        initializeAuth();
    }, [accessToken]);
}

export default useAuthInitialization;
