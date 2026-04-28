import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";

type LoginProps = {
  email: string;
  password: string;
};

type LoginResponse = {
  message: string;
};

async function loginUser(data: LoginProps): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error);
  }

  await signIn("credentials", {
    redirect: false,
    email: data.email,
    password: data.password,
  });

  return { message: "Logged in successfully!" };
}

export function useLoginDetails() {
  return useMutation<LoginResponse, Error, LoginProps>({
    mutationFn: loginUser,
  });
}
