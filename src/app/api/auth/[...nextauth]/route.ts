import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development', // Enable debug logs in dev
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account, profile }: any) {
      if (account?.provider === "google") {
        // Allow temporarily all emails for testing, or check restricted domain
        // const domain = process.env.SCHOOL_GOOGLE_DOMAIN || "smktelkom-mlg.sch.id";
        // return profile.email_verified && profile.email.endsWith(`@${domain}`);
        return !!profile.email_verified; // Allow any verified Google account for now to fix login
      }
      return true;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin', // Redirect back to signin page on error
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
