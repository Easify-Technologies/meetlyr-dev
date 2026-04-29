"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const generateInviteToken = async (data: {
  eventId: string;
  inviterId: string;
}) => {
  const res = await axios.post("/api/generate-invite-token", data);
  return res.data;
};

export const useGenerateInviteToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateInviteToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileDetails"] });
    },
  });
};
