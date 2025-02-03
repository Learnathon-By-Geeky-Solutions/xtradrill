"use client";

import RoleGuard from "@/components/RoleGuard";

export default function RecruiterAdminLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["org_employer"]}>
      {children}
    </RoleGuard>
  );
}
