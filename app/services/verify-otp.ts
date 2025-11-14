import axios, { AxiosError } from "axios";

interface ApiError {
  error: string;
}

export async function verifyOTP(data: { otp: string }) {
    try {
        const res = await axios.post("/api/verify-otp", data);
        if (res.data.success) {
            window.location.href = "/bookings";
        }
        return res.data;
    } catch (error) {
        const axiosErr = error as AxiosError<ApiError>;
        throw new Error(axiosErr.response?.data?.error || "Something went wrong");
    }
}