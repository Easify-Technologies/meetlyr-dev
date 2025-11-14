'use client';

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type ApiError = { error: string };

const cancelMyEvent = async(data: {
    userId: string;
    eventId: string;
    mode: string;
}) => {
    try {
        const res = await axios.post("/api/cancel-event", data);
        return res.data;
    } catch (error) {
        const axiosErr = error as AxiosError<ApiError>;
        throw new Error(axiosErr.response?.data?.error || "Something went wrong");
    }
}

export const useCancelMyEvent = () => {
    return useMutation({
        mutationFn: cancelMyEvent,
    });
}