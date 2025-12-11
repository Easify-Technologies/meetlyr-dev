'use client';

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";

const openCustomerPortal = async(data: {
    customerId: string;
}) => {
    try {
        const res = await axios.post("/api/stripe/customer-portal", data);
        return res.data;
    } catch (error) {
        console.log(error);
    }
}

export function useOpenCustomerPortal() {
    const router = useRouter();
    return useMutation({
        mutationFn: openCustomerPortal,
        onSuccess: (data) => {
            if(data.success) {
                router.push(data.url);
            }
            else {
                alert("Unable to open customer portal");
            }
        }
    });
}