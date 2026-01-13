"use client";

import { useMutation } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import axios, { AxiosError } from "axios";

type ApiError = { error: string };

const updateAvatar = async (data: { avatar: File | null, userId: string; }) => {
  try {
    if (!data.avatar) {
      throw new Error("Avatar file is required");
    }

    const formData = new FormData();
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(data.avatar, options);
    formData.append("avatar", compressedFile);
    formData.append("userId", data.userId);

    const res = await axios.post("/api/user/update-avatar", formData);
    return res.data;

  } catch (error) {
    const axiosErr = error as AxiosError<ApiError>;
    throw new Error(axiosErr.response?.data?.error || "Something went wrong");
  }
};

export function useUpdateAvatar() {
    return useMutation({
        mutationFn: updateAvatar
    })
}