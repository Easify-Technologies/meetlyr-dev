'use client';

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type ApiError = {
    error: string;
}

const deleteUser = async(data: {
    userId: string;
}) => {
    try {
        const res = await axios.post("/api/delete-user", data);
        return res.data;
    } catch (error) {
        const axiosErr = error as AxiosError<ApiError>;
        throw new Error(axiosErr.response?.data?.error || "Something went wrong");
    }
}

export function useDeleteUser() {
    return useMutation({
        mutationFn: deleteUser
    });
}