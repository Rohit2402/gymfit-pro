import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="text-xl font-bold text-orange-500 hover:text-orange-400 transition duration-300"
                onClick={closeMobileMenu}>
                GymFit Pro
              </Link>
            </div>
          </div>

          {/* Desktop Navigation Links - HIDDEN ON MOBILE */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">
              Home
            </Link>
            <Link
              to="/contact"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">
              Contact Us
            </Link>

            {/* Desktop Auth Buttons */}
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition duration-300">
                Login
              </Link>
              <Link
                to="/register"
                className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition duration-300">
                Register
              </Link>
            </div>
          </div>

          {/* Mobile menu button - VISIBLE ON MOBILE/TABLET */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white transition duration-300"
              aria-label="Toggle mobile menu">
              {isMobileMenuOpen ? (
                // Close icon
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                // Hamburger icon
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800 rounded-lg mt-2 shadow-lg border border-gray-700">
            {/* Mobile Navigation Links */}
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium transition duration-300">
              Home
            </Link>
            <Link
              to="/contact"
              onClick={closeMobileMenu}
              className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium transition duration-300">
              Contact Us
            </Link>

            {/* Mobile Auth Buttons */}
            <div className="pt-4 pb-2 border-t border-gray-700">
              <div className="space-y-3">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="bg-orange-500 hover:bg-orange-600 text-white block text-center px-4 py-3 rounded-md text-base font-medium transition duration-300 transform hover:scale-105">
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white block text-center px-4 py-3 rounded-md text-base font-medium transition duration-300">
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[-1]"
          onClick={closeMobileMenu}
        />
      )}
    </nav>
  );
};

export default Navbar;
