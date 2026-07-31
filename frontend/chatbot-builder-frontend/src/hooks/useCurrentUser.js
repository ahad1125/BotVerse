import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/api/auth";



function useCurrentUser() {
    return useQuery({
        queryKey: ['current-user'],
        queryFn: getCurrentUser
    })
}

export default useCurrentUser;