import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            authorization: {
                params: {
                    prompt: "select_account",
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
                try {
                    const email = profile?.email;
                    if (email) {
                        const { supabase: s } = await import("@/lib/supabase");
                        const { SYSTEM_IDS } = await import("@/lib/ids");
                        await s.from("user_progress").insert({
                            user_email: email,
                            mission_id: SYSTEM_IDS.LOGIN,
                            score: 0,
                            choice_label: `LOGIN_${new Date().toISOString()}`
                        });
                    }
                } catch (e) { console.error("Login log err:", e); }
                return !!profile?.email_verified;
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
