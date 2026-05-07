import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return children;

  // Check if there is an explicit redirect path saved
  const redirectPath = localStorage.getItem("redirectAfterLogin");
  if (redirectPath) {
    localStorage.removeItem("redirectAfterLogin");
    return <Navigate to={redirectPath} replace />;
  }

  // Redirect based on role after login
  if (user?.role === "SUBSCRIBER") return <Navigate to="/dashboard" replace />;
  if (user?.role === "ADMIN") return <Navigate to="/portal/admin" replace />;
  if (user?.role === "TUTOR") return <Navigate to="/portal/review" replace />;
  if (user?.role === "EMPLOYEE")
    return <Navigate to="/portal/dashboard" replace />;

  return children;
};

export default PublicOnlyRoute;
