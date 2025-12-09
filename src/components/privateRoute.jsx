// In PrivateRoute.js
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { useEffect } from "react";

export const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isExamRoute = location.pathname.includes("/take-exam/");

  useEffect(() => {
    if (isExamRoute) {
      // Initial history stack filling
      for (let i = 0; i < 5; i++) {
        window.history.pushState({ exam: true }, "", location.pathname);
      }

      // Prevent back navigation
      const handlePopState = () => {
        window.history.pushState({ exam: true }, "", location.pathname);
      };

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [isExamRoute, location.pathname]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to={`/${user.role}`} replace />;

  return children;
};
