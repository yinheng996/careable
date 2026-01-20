import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes: Landing page, Authentication, and Webhooks
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhooks(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // 1. If not logged in and trying to access a protected route, redirect to Sign-In
  if (!userId && !isPublicRoute(req)) {
    return (await auth()).redirectToSignIn();
  }

  // 2. Handle logic for authenticated users
  if (userId) {
    const role = (sessionClaims?.metadata as any)?.role || (sessionClaims as any)?.app_role;

    // A. Force Onboarding if no role is assigned
    if (!role && !isOnboardingRoute(req)) {
      const onboardingUrl = new URL("/onboarding", req.url);
      return NextResponse.redirect(onboardingUrl);
    }

    // B. Redirect to appropriate dashboard based on role
    if (role) {
      const dashboardPath = `/${role}/dashboard`;
      
      // Redirect from landing, auth, or onboarding pages to the correct dashboard
      const shouldRedirectToDashboard = 
        req.nextUrl.pathname === "/" || 
        isPublicRoute(req) || 
        isOnboardingRoute(req);

      if (shouldRedirectToDashboard) {
        return NextResponse.redirect(new URL(dashboardPath, req.url));
      }

      // C. Cross-role protection: Ensure user only accesses their own route group
      const roles = ['admin', 'staff', 'volunteer', 'caregiver', 'participant'];
      const currentPathRole = roles.find(r => req.nextUrl.pathname.startsWith(`/${r}`));
      
      if (currentPathRole && currentPathRole !== role) {
        return NextResponse.redirect(new URL(dashboardPath, req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
