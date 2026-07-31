import api from "./axios";

export async function verifyOTP(email, code) {
    const { data } = await api.post("/auth/verify-otp/", { email, code });
    return data;
}

export async function resendOTP(email) {
    const { data } = await api.post("/auth/resend-otp/", { email });
    return data;
}