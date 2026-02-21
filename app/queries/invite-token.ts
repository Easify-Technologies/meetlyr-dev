"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchInviteToken = async (token: string) => {
  const res = await axios.get(`/api/invite-token/${token}`);
  return res.data;
};

export function useGetEventByInviteToken(token: string) {
  return useQuery({
    queryKey: ["invite-token", token],
    queryFn: () => fetchInviteToken(token),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });
}