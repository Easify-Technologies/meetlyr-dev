'use client';

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchSuggestions = async() => {
    try {
        const res = await axios.get("/api/admin/fetch-suggestions");
        return res.data.suggestions;
    } catch (error) {
        console.error("Error fetching suggestions: ", error);
    }
}

export const useFetchSuggestions = () => {
    return useQuery({
        queryKey: ['suggestions'],
        queryFn: fetchSuggestions,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: false,
        staleTime: 5000
    });
}