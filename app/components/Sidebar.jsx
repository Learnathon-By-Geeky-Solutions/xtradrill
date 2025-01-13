"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaCodepen,
  FaComments,
  FaQuestionCircle,
} from "react-icons/fa";
import { MdAddBox, MdNotifications } from "react-icons/md";
import { SiGoogleclassroom } from "react-icons/si";
import {
  TbLayoutDashboardFilled,
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarLeftExpandFilled,
} from "react-icons/tb";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  const handleOutsideClick = (e) => {
    if (isMobile && isOpen && !e.target.closest('.sidebar-content')) {
      setIsOpen(false);
    }
  };

  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  return (
    <>      
      {/* Blur overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={handleOutsideClick}
        />
      )}      
      
      <div className={`sidebar-content fixed top-20 left-0 h-full bg-sky-50 transition-all duration-300 z-50 shadow-2xl ${
        isOpen ? "translate-x-0" : isMobile ? "-translate-x-[85%]" : ""
      }`}>
        <nav className="flex flex-col w-56 p-4 pr-12 space-y-4">
          <Link
            href="/dashboard"
            className="flex items-center text-gray-900 hover:text-indigo-600 text-lg p-2"
          >
            <TbLayoutDashboardFilled className="mr-2" />
           Dashboard
          </Link>
          <Link
            href="/page2"
            className="flex items-center text-gray-900 hover:text-indigo-600 text-lg p-2"
          >
            <SiGoogleclassroom className="mr-2" />
            Menu Item 2
          </Link>
          <Link
            href="/page3"
            className="flex items-center text-gray-900 hover:text-indigo-600 text-lg p-2"
          >
            <FaCodepen className="mr-2" />
            Menu Item 3
          </Link>
          <Link
            href="/page4"
            className="flex items-center text-gray-900 hover:text-indigo-600 text-lg p-2"
          >
            <FaComments className="mr-2" />
            Menu Item 4
          </Link>
          <Link
            href="/page5"
            className="flex items-center text-gray-900 hover:text-indigo-600 text-lg p-2"
          >
            <MdNotifications className="mr-2" />
            Menu Item 5
          </Link>
          <Link
            href="/page6"
            className="flex items-center text-gray-900 hover:text-indigo-600 text-lg p-2"
          >
            <FaQuestionCircle className="mr-2" />
            Menu Item 6
          </Link>
        </nav>
        {isMobile && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2 top-2 text-indigo-600 hover:text-indigo-700"
          >
            {isOpen ? (
              <TbLayoutSidebarLeftCollapseFilled className="w-6 h-6" />
            ) : (
              <TbLayoutSidebarLeftExpandFilled className="w-6 h-6" />
            )}
          </button>
        )}
      </div>
    </>
  );
};

export default Sidebar;
