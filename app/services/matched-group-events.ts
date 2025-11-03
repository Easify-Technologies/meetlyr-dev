import axios, { AxiosError } from "axios";

type ApiError = { error: string };

export async function matchedGroupEvents() {
  try {
    const res = await axios.get("/api/event/matchGroup");
    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;
    throw new Error(axiosErr.response?.data?.error || "Something went wrong");
  }
}