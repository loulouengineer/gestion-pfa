import { Navigate } from "react-router-dom";

const ROLE_ROUTES = {
  CHEF_DEPT: "/dashboard-chef",
  ENSEIGNANT: "/prof",
  ETUDIANT: "/dashboard-etudiant",
};

/**
 * Protects a route by checking the token and role stored in localStorage.
 * - No token → redirect to /login
 * - Wrong role → redirect to the correct dashboard for the user's actual role
 * - Correct role → render children
 */
export default function RoleGuard({ allowedRole, children }) {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    const redirect = ROLE_ROUTES[role] || "/login";
    return <Navigate to={redirect} replace />;
  }

  return children;
}
