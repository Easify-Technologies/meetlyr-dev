"use client";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type ApiError = { error: string };

const editPersonalDetails = async(data: {
    phoneNumber: string
    dateOfBirth: string
    gender: string
}) => {
    try {
        const res = await axios.post("/api/user/personal-details", data);
        return res.data;
    } catch (error) {
        const axiosErr = error as AxiosError<ApiError>;
        throw new Error(axiosErr.response?.data?.error || "Something went wrong");
    }
}

export const useEditPersonalDetails = () => {
    return useMutation({
        mutationFn: editPersonalDetails
    });
}
