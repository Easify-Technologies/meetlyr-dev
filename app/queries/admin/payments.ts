'use client';

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchPayments = async() => {
    try {
        const res = await axios.get("/api/admin/payments");
        return res.data.payments;
    } catch (error) {
        console.error("Error fetching payments: ", error);
    }
}

export function useFetchAllPayments() {
    return useQuery({
        queryKey: ['all-payments'],
        queryFn: fetchPayments,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: false,
        staleTime: 5000
    });
}