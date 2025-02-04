"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function Page() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // After sign up, always redirect to onboarding
    if (isLoaded && user) {
      router.push("/recruiter/onboarding");
    }
  }, [isLoaded, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SignUp 
        path="/recruiter/sign-up" 
        routing="path" 
        signInUrl="/recruiter/sign-in"
        redirectUrl="/recruiter/onboarding"
      />
    </div>
  );
}
