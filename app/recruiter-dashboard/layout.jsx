"use client";

import RoleGuard from "@/components/RoleGuard";
import PropTypes from 'prop-types';

export default function RecruiterDashboardLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["org_employer", "org_recruiter"]}>
      {children}
    </RoleGuard>
  );
}

RecruiterDashboardLayout.propTypes = {
  children: PropTypes.node.isRequired
};
