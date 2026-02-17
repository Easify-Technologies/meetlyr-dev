"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchPromoCodes = async() => {
    try {
        const res = await axios.get("/api/admin/promo-codes");
        return res.data.codes;
    } catch (error) {
        console.error("Error fetching promo codes:", error);
    }
}

export const useFetchPromoCodes = () => {
    return useQuery({
        queryKey: ["promo-codes"],
        queryFn: fetchPromoCodes,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: false,
        staleTime: 5000
    });
}