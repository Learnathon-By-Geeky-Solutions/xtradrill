"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react"; 
import Header from "./Header"; 
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false); 
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Normalize the pathname to handle trailing slashes
  const normalizedPath = pathname.replace(/\/+$/, "");
  const isHomePage = normalizedPath === "" || normalizedPath === "/";

  // Define paths where Sidebar should not be rendered
  const excludedPaths = ["/sign-in", "/sign-up"];
  const isExcludedPath =
    excludedPaths.includes(normalizedPath) || pathname === "/not-found";

  const shouldRenderSidebar = !isHomePage && !isExcludedPath;

  return (
    <>
      {/* Conditionally render Header */}
      {!isHomePage && <Header />}

      {/* Conditionally render Sidebar */}
      {shouldRenderSidebar && <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />}

      <main
        className={`w-full transition-all duration-300 ${
          !isHomePage ? "pt-20" : ""
        } ${shouldRenderSidebar && !isMobile ? "pl-56" : ""}`}
      >
        <div className="flex items-start justify-center min-h-screen w-full">
          <div className="w-full">{children}</div>
        </div>
      </main>
    </>
  );
}
