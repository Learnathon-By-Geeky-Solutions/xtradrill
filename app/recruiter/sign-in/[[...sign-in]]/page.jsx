"use client";

import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SignIn 
        path="/recruiter/sign-in" 
        routing="path" 
        signUpUrl="/recruiter/sign-up"
        afterSignInUrl="/recruiter/dashboard"
      />
    </div>
  );
}
