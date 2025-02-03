"use client";

import RoleGuard from "@/components/RoleGuard";

export default function RecruiterDashboardLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["org_employer", "org_recruiter"]}>
      {children}
    </RoleGuard>
  );
}
