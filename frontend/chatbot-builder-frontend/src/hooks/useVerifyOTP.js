import { useMutation } from "@tanstack/react-query";
import { verifyOTP } from "../api/otp";

export function useVerifyOTP() {
    return useMutation({
        mutationFn: ({ email, code }) => verifyOTP(email, code),
    });
}