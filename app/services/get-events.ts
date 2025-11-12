import axios, { AxiosError } from "axios";

type ApiError = { error: string };

export async function getEvents(city?: string, filterDays?: string) {
  try {
    const params = new URLSearchParams();

    if (city) params.append("city", city);
    if (filterDays) params.append("filterDays", filterDays);

    const res = await axios.get(`/api/event?${params.toString()}`);
    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;
    throw new Error(axiosErr.response?.data?.error || "Something went wrong");
  }
}

export async function fetchEvents() {
  try {
    const res = await axios.get("/api/event/fetch-events");
    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;
    throw new Error(axiosErr.response?.data?.error || "Something went wrong");
  }
}