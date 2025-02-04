import { authMiddleware, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/", "sign-in", "sign-up", "/api/webhooks(.*)"],
  ignoredRoutes: ["/api/webhooks(.*)"],
  async afterAuth(auth, req) {
    // Handle authenticated requests
    const path = req.nextUrl.pathname;
    
    // If user is signing up through recruiter path, always redirect to onboarding
    if (auth.userId && path.startsWith("/recruiter/sign-up")) {
      return NextResponse.redirect(new URL("/recruiter/onboarding", req.url));
    }

    // Handle sign-in redirects
    if (auth.userId && path === "/recruiter/sign-in") {
      try {
        const orgs = await clerkClient.users.getOrganizationMembershipList({ userId: auth.userId });

        if (orgs.length > 0) {
          // Fetch organization status from your API
          const response = await fetch(`${req.nextUrl.origin}/api/organizations/status?clerkOrgId=${orgs[0].organization.id}`);
          
          if (response.ok) {
            const { status } = await response.json();

            // Redirect based on status
            if (status === "approved") {
              return NextResponse.redirect(new URL("/recruiter/dashboard", req.url));
            } else if (status === "pending") {
              return NextResponse.redirect(new URL("/recruiter/pending-approval", req.url));
            } else if (status === "rejected") {
              return NextResponse.redirect(new URL("/dashboard?status=rejected", req.url));
            }
          }
        }
        // If no organization or status check failed, redirect to onboarding
        return NextResponse.redirect(new URL("/recruiter/onboarding", req.url));
      } catch (error) {
        console.error("Error in middleware:", error);
      }
    }

    // Prevent access to recruiter dashboard without approval
    if (auth.userId && path.startsWith("/recruiter/dashboard")) {
      try {
        const orgs = await clerkClient.users.getOrganizationMembershipList({ userId: auth.userId });
        
        if (orgs.length > 0) {
          const response = await fetch(`${req.nextUrl.origin}/api/organizations/status?clerkOrgId=${orgs[0].organization.id}`);
          
          if (response.ok) {
            const { status } = await response.json();
            
            if (status !== "approved") {
              return NextResponse.redirect(new URL("/recruiter/pending-approval", req.url));
            }
          }
        } else {
          return NextResponse.redirect(new URL("/recruiter/onboarding", req.url));
        }
      } catch (error) {
        console.error("Error checking dashboard access:", error);
      }
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
