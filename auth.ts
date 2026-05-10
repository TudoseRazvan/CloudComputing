import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.picture = (profile as { picture?: string }).picture ?? token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.image = (token.picture as string | undefined) ?? session.user.image;
      }
      return session;
    },
  },
});
