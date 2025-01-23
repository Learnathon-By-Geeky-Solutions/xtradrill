"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ADMIN_IDS from "@/lib/config/admins";
import EmployerRegistrationsReview from "../components/EmployerRegistrationsReview";

export default function AdminPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (isSignedIn === false) {
      router.push("/sign-in");
      return;
    }

    const userId = user?.id;
    console.log("User ID:", userId);
    
    // Check if user is admin using Clerk ID
    const isAdmin = Array.isArray(ADMIN_IDS) && userId && ADMIN_IDS.includes(userId);
    console.log("Is Admin:", isAdmin);

    if (!isAdmin) {
      setHasPermission(false);
      return;
    }

    setHasPermission(true);
  }, [isSignedIn, user, router]);

  if (hasPermission === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            Sorry, you don't have permission to access the admin dashboard.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome {user?.firstName || "Admin"}!
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'dashboard'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('registrations')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'registrations'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Employer Registrations
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'dashboard' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800">Total Users</h3>
                  <p className="mt-2 text-3xl font-semibold text-blue-600">150</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-green-800">Active Jobs</h3>
                  <p className="mt-2 text-3xl font-semibold text-green-600">45</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-800">Applications</h3>
                  <p className="mt-2 text-3xl font-semibold text-purple-600">328</p>
                </div>
              </div>
            ) : (
              <EmployerRegistrationsReview />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
