import React from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";

export default function NotFound() {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          Oops! This page seems to have wandered off...
        </p>
        <p className="text-sm text-gray-500 mb-8">
          The page <code className="bg-white px-2 py-1 rounded">{location}</code> doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

