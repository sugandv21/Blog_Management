import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const navLinkClasses = ({ isActive }) =>
    isActive
      ? "text-white bg-indigo-600 px-3 py-2 rounded-md"
      : "text-gray-100 hover:text-white hover:bg-indigo-500 px-3 py-2 rounded-md";

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand name on the left */}
        <Link to="/" className="font-bold text-2xl text-white">
          BlogApp
        </Link>

        {/* Links on the right */}
        <div className="hidden md:flex items-center gap-4">
          <NavLink to="/" className={navLinkClasses}>
            Home
          </NavLink>
          <NavLink to="/create" className={navLinkClasses}>
            Create
          </NavLink>

          {user ? (
            <>
              <span className="text-sm text-white">Hi, {user.username}</span>
              <button
                onClick={handleLogout}
                className="bg-white text-indigo-600 hover:bg-gray-200 px-3 py-2 rounded-md"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-100 hover:text-white hover:bg-indigo-500 px-3 py-2 rounded-md"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-indigo-600 hover:bg-gray-200 px-3 py-2 rounded-md"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setOpen((o) => !o)}
            className="p-2 rounded-md text-white border border-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          <div className="px-4 py-3 space-y-2">
            <NavLink
              to="/"
              onClick={() => setOpen(false)}
              className={navLinkClasses}
            >
              Home
            </NavLink>
            <NavLink
              to="/create"
              onClick={() => setOpen(false)}
              className={navLinkClasses}
            >
              Create
            </NavLink>
            {user ? (
              <>
                <div className="text-sm text-white">Hi, {user.username}</div>
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="bg-white text-indigo-600 hover:bg-gray-200 w-full px-3 py-2 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="text-gray-100 hover:text-white hover:bg-indigo-500 block px-3 py-2 rounded-md"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="bg-white text-indigo-600 hover:bg-gray-200 block px-3 py-2 rounded-md"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
