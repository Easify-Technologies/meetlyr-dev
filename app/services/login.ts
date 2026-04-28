import { signIn } from "next-auth/react";

export async function userLogin(data: {
  email: string;
  password: string;
}) {
  try {
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message || "Something went wrong");
  }
}