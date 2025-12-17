'use client';

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

type ApiError = {
    error: string;
}

const manageSubscription = async(data: {
    subscriptionId: string;
    userId: string;
}) => {
    try {
        const res = await axios.post("/api/stripe/manage-subscription", data);
        toast.success(res.data.message);

        return res.data;
    } catch (error) {
        const axiosErr = error as AxiosError<ApiError>;
        const errorMessage = axiosErr.response?.data?.error || "Something went wrong";

        toast.error(errorMessage);
    }
}

export const useManageSubscription = () => {
    return useMutation({
        mutationFn: manageSubscription
    });
}