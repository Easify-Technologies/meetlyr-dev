'use client';

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type ApiError = {
    error: string;
}

const manageSubscription = async(data: {
    subscriptionId: string;
}) => {
    try {
        const res = await axios.post("/api/stripe/manage-subscription", data);
        return res.data;
    } catch (error) {
        const axiosErr = error as AxiosError<ApiError>;
        throw new Error(axiosErr.response?.data?.error || "Something went wrong");
    }
}

export const useManageSubscription = () => {
    return useMutation({
        mutationFn: manageSubscription
    });
}