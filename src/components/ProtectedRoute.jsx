import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {

  const token = localStorage.getItem("token");

  // ❌ No token → redirect to login
  if (!token) {
    return <Navigate to="/auth" />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userRole = payload.role;

    // ❌ Role not allowed
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/" />;
    }

    // ✅ Allowed
    return children;

  } catch (error) {
    console.error("Invalid token");
    return <Navigate to="/auth" />;
  }
}