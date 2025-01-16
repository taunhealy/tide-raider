import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log("Middleware token:", req.nextauth.token);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log("Authorization check:", {
          token,
          path: req.nextUrl.pathname,
        });
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    "/api/logbook/:path*",
    "/api/subscription-status/:path*",
    "/api/user/filters/:path*",
    "/api/bookings/safari/:path*",
  ],
};
