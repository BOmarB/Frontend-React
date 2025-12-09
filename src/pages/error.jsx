import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/themeContext";
import { useAuth } from "../contexts/authContext";

function Error() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      } py-12 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4 animate-fadeIn">
          <h1
            className={`text-9xl font-extrabold ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            }`}
          >
            404
          </h1>
          <h2
            className={`mt-6 text-3xl font-bold ${
              isDarkMode ? "text-gray-100" : "text-gray-900"
            }`}
          >
            Page not found
          </h2>
          <p
            className={`mt-2 text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className="mt-6">
            <Link
              to={`${user ? `/${user.role}` : "/"}`}
              className={`font-medium ${
                isDarkMode
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-800"
              }`}
            >
              ← Back to home
            </Link>
          </div>
          <div className="mt-6 animate-bounce">
            <svg
              className={`mx-auto h-16 w-16 ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Error;
