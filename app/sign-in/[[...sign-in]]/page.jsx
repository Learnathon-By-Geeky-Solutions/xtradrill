"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect } from "react";

const SignInPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="flex justify-center w-full mt-6">
        <SignIn afterSignInUrl="dashboard" />
      </div>
    </>
  );
};

export default SignInPage;
