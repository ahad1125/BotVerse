import { logout } from "../api/auth";
import api from "../api/axios";
import { useMutation } from "@tanstack/react-query";

function useLogout() {
    return useMutation({
        mutationFn: logout
    })

}

export default useLogout;