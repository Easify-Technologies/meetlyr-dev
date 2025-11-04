import { useMutation } from "@tanstack/react-query";
import { joinEvent } from "@/app/services/join-event";

export const useJoinEvent = () => {
  return useMutation({
    mutationFn: joinEvent,
  });
};
