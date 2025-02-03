"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";

const SignUpPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex justify-center w-full mt-6">
      <SignUp 
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
        redirectUrl="/dashboard"
      />
    </div>
  );
};

export default SignUpPage;
