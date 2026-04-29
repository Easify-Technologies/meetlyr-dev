"use client";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type ApiError = { error: string };

const aboutMeFunc = async (data: {
  connectionStyle: string;
  communicationStyle: string;
  socialStyle: string;
  healthFitnessStyle: string;
  family: string;
  spirituality: string;
  politicsNews: string;
  humor: string;
  peopleType: string[];
}) => {
  try {
    const res = await axios.post("/api/user/about-me", data);
    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;
    throw new Error(axiosErr.response?.data?.error || "Something went wrong");
  }
};

export const useAboutMeFunction = () => {
  return useMutation({
    mutationFn: aboutMeFunc,
  });
};
