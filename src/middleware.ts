import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/auth/signin",
        error: "/auth/signin",
    },
});

export const config = {
    matcher: [
        "/journey/:path*",
        "/profile/:path*",
        "/leaderboard/:path*",
        "/dashboard/:path*",
        "/simulation/:path*",
    ],
};
