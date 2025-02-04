"use client";

import { useEffect, useState } from "react";

const getStatusStyle = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
      return "bg-green-100 text-green-800";
    default:
      return "bg-red-100 text-red-800";
  }
};

export default function AdminDashboard() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/admin/organizations");
      if (!response.ok) throw new Error("Failed to fetch organizations");
      const data = await response.json();
      setOrganizations(data.organizations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (organizationId, action) => {
    try {
      const response = await fetch("/api/admin/organizations/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId,
          action,
        }),
      });

      if (!response.ok) throw new Error("Failed to process action");
      
      // Refresh the organizations list
      fetchOrganizations();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-xl font-semibold text-gray-900">Organization Requests</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-100 border-b text-left">Company Name</th>
                  <th className="px-6 py-3 bg-gray-100 border-b text-left">Email</th>
                  <th className="px-6 py-3 bg-gray-100 border-b text-left">Size</th>
                  <th className="px-6 py-3 bg-gray-100 border-b text-left">Industry</th>
                  <th className="px-6 py-3 bg-gray-100 border-b text-left">Status</th>
                  <th className="px-6 py-3 bg-gray-100 border-b text-left">Created At</th>
                  <th className="px-6 py-3 bg-gray-100 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-b">{org.name}</td>
                    <td className="px-6 py-4 border-b">{org.userEmail}</td>
                    <td className="px-6 py-4 border-b">{org.companySize}</td>
                    <td className="px-6 py-4 border-b">{org.industry}</td>
                    <td className="px-6 py-4 border-b">
                      <span className={`px-2 py-1 rounded ${getStatusStyle(org.status)}`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 border-b">
                      {org.status === "pending" && (
                        <div className="space-x-2">
                          <button
                            onClick={() => handleAction(org._id, "approve")}
                            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                            disabled={loading}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(org._id, "reject")}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                            disabled={loading}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {org.status !== "pending" && (
                        <span className="text-gray-500">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
