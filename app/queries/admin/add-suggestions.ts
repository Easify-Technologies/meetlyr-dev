'use client';

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

const addSuggestions = async(data: {
    userId: string;
    day: string;
    time: string;
}) => {
    const res = await axios.post("/api/admin/suggestions", data);
    return res.data;
}

export const useAddSuggestions = () => {
    return useMutation({
        mutationFn: addSuggestions
    });
}