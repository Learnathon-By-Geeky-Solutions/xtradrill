"use client";

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";

export default function EmployerRegistrationsReview() {
  const { user } = useUser();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/employer-registrations');
      const data = await response.json();
      
      if (data.success) {
        setRegistrations(data.registrations);
      } else {
        setError(data.message || 'Failed to fetch registrations');
      }
    } catch (err) {
      setError('Failed to fetch registrations. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (registrationId, status) => {
    try {
      setError(null);
      setUpdateLoading(true);
      
      const response = await fetch('/api/admin/employer-registrations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId,
          status
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRegistrations(prevRegistrations =>
          prevRegistrations.map(reg =>
            reg._id === registrationId ? data.registration : reg
          )
        );
        setSelectedRegistration(null);
      } else {
        setError(data.message || 'Failed to update status');
        console.error('Update error:', data.error);
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update registration status. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleViewDetails = (registration) => {
    setSelectedRegistration(registration);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchRegistrations}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Registration List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Employer Registration Requests
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {registrations.filter(r => r.status === 'pending').length} pending requests
            </p>
          </div>
          <button 
            onClick={fetchRegistrations}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Refresh
          </button>
        </div>
        
        <div className="border-t border-gray-200">
          {registrations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No registrations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.map((registration) => (
                    <tr key={registration._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {registration.companyName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {registration.location}
                            </div>
                            <div className="text-xs text-gray-500">
                              {registration.industry}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{registration.contactPersonName}</div>
                        <div className="text-sm text-gray-500">{registration.contactEmail}</div>
                        <div className="text-xs text-gray-500">{registration.contactPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${registration.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            registration.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {registration.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>{new Date(registration.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs">
                          {new Date(registration.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="space-x-2">
                          <button
                            onClick={() => handleViewDetails(registration)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </button>
                          {registration.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(registration._id, 'approved')}
                                disabled={updateLoading}
                                className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(registration._id, 'rejected')}
                                disabled={updateLoading}
                                className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Registration Details Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center pb-3">
              <h3 className="text-xl font-semibold">{selectedRegistration.companyName}</h3>
              <button
                onClick={() => setSelectedRegistration(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Company Details</h4>
                <p className="mt-1">{selectedRegistration.companyDetails}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Industry</h4>
                  <p>{selectedRegistration.industry}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Company Size</h4>
                  <p>{selectedRegistration.companySize}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Website</h4>
                <p>{selectedRegistration.website || 'Not provided'}</p>
              </div>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                <div className="mt-2 space-y-2">
                  <p>Name: {selectedRegistration.contactPersonName}</p>
                  <p>Email: {selectedRegistration.contactEmail}</p>
                  <p>Phone: {selectedRegistration.contactPhone}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedRegistration(null)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
              {selectedRegistration.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedRegistration._id, 'approved');
                    }}
                    disabled={updateLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedRegistration._id, 'rejected');
                    }}
                    disabled={updateLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
