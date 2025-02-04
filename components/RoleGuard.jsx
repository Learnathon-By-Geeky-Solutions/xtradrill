import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import PropTypes from 'prop-types';

const RoleGuard = ({ children, allowedRoles }) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!isLoaded || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const userRole = user.publicMetadata.organizationRole;

        // If user is an admin, they're always authorized
        if (user.publicMetadata.role === "admin") {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // For employers, check if they have an approved organization
        if (userRole === "employer") {
          // Get all organizations the user is a member of
          const orgs = await user.getOrganizationMemberships();
          
          if (orgs.length === 0) {
            // No organizations, redirect to onboarding
            router.push("/recruiter/onboarding");
            setIsLoading(false);
            return;
          }

          // Check if any of their organizations are approved
          const orgId = orgs[0].organization.id;
          const response = await fetch(`/api/organizations/status?clerkOrgId=${orgId}`);
          
          if (!response.ok) {
            console.error("Failed to fetch organization status");
            setIsLoading(false);
            return;
          }

          const { status } = await response.json();

          if (status === "pending") {
            router.push("/dashboard?status=pending");
            setIsLoading(false);
            return;
          }

          if (status === "rejected") {
            router.push("/dashboard?status=rejected");
            setIsLoading(false);
            return;
          }
        }

        // Check if user's role is in allowed roles
        if (allowedRoles.includes(userRole)) {
          setIsAuthorized(true);
        } else {
          // Redirect based on role
          if (userRole === "employer") {
            router.push("/recruiter/dashboard");
          } else if (userRole === "candidate") {
            router.push("/dashboard");
          } else {
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Authorization check failed:", error);
      }

      setIsLoading(false);
    };

    checkAuthorization();
  }, [isLoaded, user, router, allowedRoles]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? children : null;
};

RoleGuard.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default RoleGuard;
