"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center -mt-20">
      <div className="text-center space-y-6 p-8 bg-white max-w-md">
        <h1 className="text-6xl font-bold text-indigo-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800">Page Not Found</h2>
        <p className="text-gray-600">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-block bg-indigo-600 text-white px-8 py-2.5 rounded-md hover:bg-indigo-700 transition-colors font-medium text-sm"
            >
              ← Back to Home
            </Link>
            <Link
              href="/dashboard"
              className="inline-block border border-indigo-600 text-indigo-600 px-8 py-2.5 rounded-md hover:bg-indigo-50 transition-colors font-medium text-sm"
            >
              View Dashboard
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            If you believe this is a mistake, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
