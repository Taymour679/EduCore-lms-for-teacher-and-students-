import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  cookies: {
    sessionToken: {
      name: "educore.session",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
        token.schoolId = user.schoolId;
        token.schoolStatus = user.schoolStatus;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.uid ?? "";
      session.user.role = token.role ?? "";
      session.user.schoolId = token.schoolId ?? null;
      session.user.schoolStatus = token.schoolStatus ?? null;
      return session;
    },
  },
} satisfies NextAuthConfig;
