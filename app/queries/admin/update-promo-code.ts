"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type UpdatePromoPayload = {
  couponId: string;
  code: string;
  discount: number;
  stripeCouponId: string;
};

type ApiError = {
  error: string;
};

const updatePromoCode = async (data: UpdatePromoPayload) => {
  try {
    const res = await axios.post("/api/admin/update-promo-code", data);
    return res.data;
  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;

    throw new Error(
      axiosErr.response?.data?.error || "Failed to update promo code",
    );
  }
};

export function useUpdatePromoCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePromoCode,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["promo-codes"],
      });
    },
  });
}
