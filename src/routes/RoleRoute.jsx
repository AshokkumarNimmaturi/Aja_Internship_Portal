import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, hasAnyRole } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasAnyRole(allowedRoles)) return <Navigate to="/unauthorized" replace />;

  return children;
};

export default RoleRoute;
