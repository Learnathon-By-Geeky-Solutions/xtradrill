// Add this directive to make Header a Client Component
"use client";

import { UserButton } from "@clerk/nextjs";
import { Terminal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-8 py-4 bg-gray-900">
      {/* Logo Section - Replaced with Terminal icon and text */}
      <Link href="/" className="flex items-center">
        <Terminal className="h-10 w-10 text-indigo-600" />
        <span className="text-3xl font-bold text-white"> Inherit</span>
      </Link>

      {/* Optional: Add navigation links or user-related buttons */}
      <div className="flex items-center space-x-4">
        {/* Example: User Button */}
        <UserButton
          afterSignOutUrl="/"
          signOutCallback={() => {
            router.push("/");
          }}
        />
      </div>
    </nav>
  );
};

export default Header;
