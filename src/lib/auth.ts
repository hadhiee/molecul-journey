import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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
    debug: true, // Always enable debug to catch production errors
    session: {
        strategy: "jwt",
    },
    // Ensure NextAuth trusts the host header (critical for Vercel + custom domains)
    // This is often needed if NEXTAUTH_URL isn't explicitly set in some environments
    // trustHost: true,
    callbacks: {
        async signIn({ account, profile }: any) {
            if (account?.provider === "google") {
                // Allow temporarily all emails for testing, or check restricted domain
                // const domain = process.env.SCHOOL_GOOGLE_DOMAIN || "smktelkom-mlg.sch.id";
                // return profile.email_verified && profile.email.endsWith(`@${domain}`);
                // Log Login Activity
                try {
                    const { supabase } = await import("@/lib/supabase");
                    await supabase.from("user_progress").insert({
                        user_email: profile.email,
                        mission_id: "SYSTEM_LOGIN",
                        score: 0,
                        choice_label: "LOGIN_ON_" + new Date().toISOString().split('T')[0]
                    });
                } catch (e) { console.error("Login log failed", e); }

                return !!profile.email_verified;
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
