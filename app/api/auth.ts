import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    // 🔵 GOOGLE LOGIN
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 🔐 EMAIL/PASSWORD LOGIN (KEEP EXISTING USERS SAFE)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // 🔵 GOOGLE AUTO USER CREATE / LINK
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;

        if (!email) return false;

        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        // 🟢 NEW USER → CREATE
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email,
              name: user.name || "",
              avatar: user.image || "",
              googleId: account.providerAccountId,
              authProvider: "google",

              // ⚠️ safe defaults (IMPORTANT for your schema)
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
              password: "", // IMPORTANT: keep empty string, NOT null
              isVerified: false,
            },
          });
        }

        // 🟡 EXISTING USER → LINK GOOGLE
        else if (!existingUser.googleId) {
          await prisma.user.update({
            where: { email },
            data: {
              googleId: account.providerAccountId,
              authProvider: "google",
            },
          });
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  // IMPORTANT (fix your redirect issue)
  pages: {
    signIn: "/api/auth/signin",
  },
};