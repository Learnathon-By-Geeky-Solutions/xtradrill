"use client";

import Link from 'next/link';

export default function RegistrationSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Registration Submitted!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for registering. Your application is now under review by our admin team.
            We will contact you via email once your registration is approved.
          </p>
        </div>
        <div className="mt-4">
          <Link href="/">
            <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
              Return to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
