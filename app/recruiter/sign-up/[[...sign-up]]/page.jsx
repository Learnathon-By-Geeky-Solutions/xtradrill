import { SignUp } from "@clerk/nextjs";
 
export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SignUp 
        path="/recruiter/sign-up" 
        routing="path" 
        signInUrl="/recruiter/sign-in"
        afterSignUpUrl="/recruiter/onboarding"
      />
    </div>
  );
}
