import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("This email address does not exist");
        if (!user.password) throw new Error("This account uses Google sign-in");

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isPasswordValid) throw new Error("Incorrect password");

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider !== "google") return true;

      if (!user?.email) return false;

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name || "",
            avatar: user.image || "",
            googleId: user.id,
            authProvider: "google",
            isVerified: true,
            password: null,
            phoneNumber: "",
            gender: "",
            dateOfBirth: "",
            country: "",
            city: "",
            connectionStyles: "",
            communicationStyles: "",
            socialStyles: "",
            healthAndFitness: "",
            family: "",
            spirituality: "",
            politicalNews: "",
            incorrectHumor: "",
            kindOfPeople: [],
          },
        });
      } else {
        if (!existingUser.googleId) {
          await prisma.user.update({
            where: { email: user.email },
            data: { googleId: user.id, authProvider: "google" },
          });
        }
      }

      return true;
    },

    async jwt({ token, user }: any) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true },
        });

        token.id = dbUser?.id;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }: any) {
      session.user.id = token.id;
      session.user.email = token.email;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
