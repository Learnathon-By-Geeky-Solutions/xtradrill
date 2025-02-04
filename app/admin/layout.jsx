"use client";

import RoleGuard from "@/components/RoleGuard";
import PropTypes from 'prop-types';

export default function AdminLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      {children}
    </RoleGuard>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired
};
