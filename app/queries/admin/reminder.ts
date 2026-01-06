"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const sendReminder = async() => {
    try {
        
    } catch (error) {
        console.log(error);
    }
}

export const useSendReminder = () => {
    return useMutation({
        mutationFn: sendReminder
    });
}