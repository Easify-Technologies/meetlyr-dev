import axios, { AxiosError } from "axios";

interface ApiError {
  error: string;
}

export async function updateUserLocation(data: {
    city: string;
    country: string;
}, userId: string) {
    try {
        const res = await axios.post("/api/update-location", { data, userId });
        return res.data;
    } catch (error) {
        const axiosErr = error as AxiosError<ApiError>;
        throw new Error(axiosErr.response?.data?.error || "Something went wrong");
    }
}