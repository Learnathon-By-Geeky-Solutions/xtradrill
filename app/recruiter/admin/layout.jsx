"use client";

import RoleGuard from "@/components/RoleGuard";
import PropTypes from 'prop-types';

export default function RecruiterAdminLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["org_employer"]}>
      {children}
    </RoleGuard>
  );
}

RecruiterAdminLayout.propTypes = {
  children: PropTypes.node.isRequired
};
