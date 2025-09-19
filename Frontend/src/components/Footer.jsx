import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-100">
        © {new Date().getFullYear()} <span className="font-semibold">BlogApp</span>. All rights reserved.
      </div>
    </footer>
  );
}
