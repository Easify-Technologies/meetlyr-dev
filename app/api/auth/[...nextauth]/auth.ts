import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user }: any) {
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
        // link google if not already linked
        if (!existingUser.googleId) {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              googleId: user.id,
              authProvider: "google",
            },
          });
        }
      }

      return true;
    },

    async jwt({ token, user }: any) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }: any) {
      session.user.email = token.email;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};