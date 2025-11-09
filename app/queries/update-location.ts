'use client';

import { useMutation } from "@tanstack/react-query";
import { updateUserLocation } from "../services/update-location";

export function useUpdateUserLocation(userId: string) {
    return useMutation({
        mutationFn: (data: any) => updateUserLocation(data, userId)
    });
}