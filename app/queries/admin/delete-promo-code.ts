"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const deletePromoCode = async (data: {
  id: string;
  stripeCouponId: string;
}) => {
  try {
    const res = await axios.post("/api/admin/delete-promo-code", data);
    return res.data;
  } catch (error) {
    console.error("Error deleting the promo code:", error);
  }
};

export const useDeletePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["promo-codes"],
      });
    },
  });
};
