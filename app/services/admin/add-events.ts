import axios, { AxiosError } from "axios";

interface ApiError {
  error: string;
}

export async function addEvents(data: {
  date: string;
  city: string;
  country: string;
  cafeId?: string;
}) {
  try {
    const token = localStorage.getItem("admin_token");
    if (!token) throw new Error("No admin token found");

    const res = await axios.post("/api/event", data, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    });

    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;
    throw new Error(axiosErr.response?.data?.error || "Something went wrong");
  }
}
