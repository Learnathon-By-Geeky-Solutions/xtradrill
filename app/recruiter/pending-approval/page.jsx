export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Application Under Review
          </h1>
          <div className="animate-pulse mb-6">
            <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in joining our platform! Your application is currently under review by our team.
            We will notify you via email once a decision has been made.
          </p>
          <div className="text-sm text-gray-500">
            <p>This usually takes 1-2 business days.</p>
            <p>Please check your email for updates.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
