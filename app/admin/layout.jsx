"use client";

import RoleGuard from "@/components/RoleGuard";

export default function AdminLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      {children}
    </RoleGuard>
  );
}
