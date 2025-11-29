import axios, { AxiosError } from "axios";

interface ApiError {
  error: string;
}

export async function verifyOTP(data: {
  otp: string;
  email: string;
  password: string;
}) {
  try {
    const res = await axios.post("/api/verify-otp", data);
    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;
    throw new Error(axiosErr.response?.data?.error || "Something went wrong");
  }
}
