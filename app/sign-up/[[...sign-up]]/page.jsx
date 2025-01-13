"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";

const SignUpPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="flex justify-center w-full mt-6">
        <SignUp afterSignUpUrl="dashboard" />
      </div>
    </>
  );
};

export default SignUpPage;
