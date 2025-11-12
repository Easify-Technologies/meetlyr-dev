import axios, { AxiosError } from "axios";

interface ApiError {
  error: string;
}

export async function adminLogin(data: { email: string; password: string }) {
  try {
    const response = await axios.post("/api/admin/login", data);

    if (response.status === 201) {
      const token = response.data.token;
      localStorage.setItem("admin_token", token);
    }

    return response.data;
  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;
    throw new Error(axiosErr.response?.data?.error || "Something went wrong");
  }
}
