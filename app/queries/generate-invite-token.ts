"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const generateInviteToken = async(data: {
    eventId: string;
    inviterId: string;
}) => {
    try {
        const res = await axios.post("/api/generate-invite-token", data);
        return res.data;
    } catch (error) {
        console.error(error);
    }
}

export const useGenerateInviteToken = () => {
    return useMutation({
        mutationFn: generateInviteToken
    });
}