"use client";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type ApiError = {
    error: string;
};

const addPromoCode = async(data: {
    code: string;
    discount: number;
}) => {
    try {
        const res = await axios.post("/api/admin/add-promo-code", data);
        return res.data;
    } catch (error) {
        const axiosErr = error as AxiosError<ApiError>;
        throw new Error(axiosErr.response?.data?.error || "Something went wrong");
    }
}

export function useAddPromoCode() {
    return useMutation({
        mutationFn: addPromoCode
    });
}