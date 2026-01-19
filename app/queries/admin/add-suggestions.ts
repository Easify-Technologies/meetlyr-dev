"use client";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type ApiError = {
  error: string;
};

const addSuggestions = async (data: {
  userId: string;
  day: string;
  time: string;
}) => {
  try {
    const res = await axios.post("/api/admin/suggestions", data);
    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;
    throw new Error(axiosErr.response?.data?.error || "Something went wrong");
  }
};

export const useAddSuggestions = () => {
  return useMutation({
    mutationFn: addSuggestions,
  });
};
