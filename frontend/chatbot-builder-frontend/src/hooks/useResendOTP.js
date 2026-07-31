import { useMutation } from "@tanstack/react-query";
import { resendOTP } from "../api/otp";

export function useResendOTP() {
    return useMutation({
        mutationFn: (email) => resendOTP(email),
    });
}