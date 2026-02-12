"use client";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type ApiError = {
    error: string;
}

const specialEventPass = async(data: {
    userId: string;
    eventId: string;
}) => {
    try {
        const res = await axios.post("/api/event/special-pass", data);
        return res.data;
    } catch (error) {
        const axiosErr = error as AxiosError<ApiError>;
        throw new Error(axiosErr.response?.data?.error || "Something went wrong");
    }
}

export function useSpecialEventPass() {
    return useMutation({
        mutationFn: specialEventPass
    })
}
