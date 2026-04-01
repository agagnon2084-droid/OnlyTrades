import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Adapter, AdapterUser } from "next-auth/adapters";

// Wrap PrismaAdapter to map NextAuth's `image` field to our `avatar` column
const basePrismaAdapter = PrismaAdapter(prisma) as Adapter;
const adapter: Adapter = {
  ...basePrismaAdapter,
  createUser: async (data: Omit<AdapterUser, "id">) => {
    const { image, ...rest } = data;
    const user = await prisma.user.create({
      data: { ...rest, avatar: image },
    });
    return { ...user, image: user.avatar } as AdapterUser;
  },
  getUser: async (id: string) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return { ...user, image: user.avatar } as AdapterUser;
  },
  getUserByEmail: async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return { ...user, image: user.avatar } as AdapterUser;
  },
  getUserByAccount: async (providerAccountId) => {
    const account = await prisma.account.findUnique({
      where: { provider_providerAccountId: providerAccountId },
      include: { user: true },
    });
    if (!account?.user) return null;
    return { ...account.user, image: account.user.avatar } as AdapterUser;
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
