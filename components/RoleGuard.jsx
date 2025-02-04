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
    const handleEmployerAuthorization = async (orgs) => {
      if (orgs.length === 0) {
        router.push("/recruiter/onboarding");
        return false;
      }

      const orgId = orgs[0].organization.id;
      const response = await fetch(`/api/organizations/status?clerkOrgId=${orgId}`);
      
      if (!response.ok) {
        console.error("Failed to fetch organization status");
        return false;
      }

      const { status } = await response.json();
      if (status === "pending" || status === "rejected") {
        router.push(`/dashboard?status=${status}`);
        return false;
      }

      return true;
    };

    const redirectBasedOnRole = (role) => {
      const redirectPaths = {
        employer: "/recruiter/dashboard",
        candidate: "/dashboard",
        default: "/"
      };
      router.push(redirectPaths[role] || redirectPaths.default);
    };

    const checkAuthorization = async () => {
      if (!isLoaded || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const userRole = user.publicMetadata.organizationRole;
        const isAdmin = user.publicMetadata.role === "admin";

        if (isAdmin) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        if (userRole === "employer") {
          const orgs = await user.getOrganizationMemberships();
          const isEmployerAuthorized = await handleEmployerAuthorization(orgs);
          if (!isEmployerAuthorized) {
            setIsLoading(false);
            return;
          }
        }

        if (allowedRoles.includes(userRole)) {
          setIsAuthorized(true);
        } else {
          redirectBasedOnRole(userRole);
        }
      } catch (error) {
        console.error("Authorization check failed:", error);
      } finally {
        setIsLoading(false);
      }
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
