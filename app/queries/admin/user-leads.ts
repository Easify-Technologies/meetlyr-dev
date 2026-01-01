'use client';

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchUserLeads = async() => {
    try {
        const res = await axios.get("/api/admin/user-leads");
        return res.data.leads;
    } catch (error) {
        console.error("Error fetching user leads:", error);
    }
}

export function useFetchUserLeads() {
    return useQuery({
        queryKey: ["user-leads"],
        queryFn: fetchUserLeads,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: false,
        staleTime: 5000
    });
}
